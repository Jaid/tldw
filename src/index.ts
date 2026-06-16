import type {PackageManager} from './lib/packageManagers.ts'
import type {CliArgs, Context, DevelopmentScript, FragmentContent, InstallationCommand, WriteReadmeResult} from './lib/types.ts'

import camelcase from 'camelcase'
import chalk from 'chalk'
import {filesize} from 'filesize'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import fragments from './fragments.ts'
import generateReadme from './generateReadme.ts'
import generateBanner from './lib/generateBanner.ts'
import {applyMaxBlankLines, getDefaultBinName, getFundingLink, getLinkHost, getRepositoryUrl, hasContent, normalizeReadmeText, parseGitHubSlug, readOptionalCodeFragment, readOptionalCodeFragmentWithMetadata, readOptionalText, readOptionalYaml, sortRecord, toArray} from './lib/helpers.ts'
import readConfig from './lib/readConfig.ts'
import readExampleResults from './lib/readExampleResults.ts'
import {readOwnPackageMetadata} from './lib/readOwnPackageMetadata.ts'
import readPkg from './lib/readPkg.ts'
import readUsageOptions from './lib/readUsageOptions.ts'
import {renderConfiguredShield} from './lib/renderShield.ts'

const getGithubPackagesInstallFlag = (installation: Context['config']['installation']) => {
  if (installation === 'dev') {
    return '--save-dev '
  }
  if (installation === 'global') {
    return '--global '
  }
  return '--save '
}

type ActiveInstallationMode = Exclude<Context['config']['installation'], false>

const appendVersionToPackageSpec = (packageSpec: string, version: string, versionInInstallation: boolean) => {
  if (!versionInInstallation) {
    return packageSpec
  }
  return `${packageSpec}@^${version}`
}
const installationCommandFactories = {
  bun: {
    prod: (packageSpec: string) => `bun add ${packageSpec}`,
    dev: (packageSpec: string) => `bun add --development ${packageSpec}`,
    global: (packageSpec: string) => `bun add --global ${packageSpec}`,
  },
  npm: {
    prod: (packageSpec: string) => `npm install --save ${packageSpec}`,
    dev: (packageSpec: string) => `npm install --save-dev ${packageSpec}`,
    global: (packageSpec: string) => `npm install --global ${packageSpec}`,
  },
  pnpm: {
    prod: (packageSpec: string) => `pnpm add ${packageSpec}`,
    dev: (packageSpec: string) => `pnpm add --save-dev ${packageSpec}`,
    global: (packageSpec: string) => `pnpm add --global ${packageSpec}`,
  },
  yarn: {
    prod: (packageSpec: string) => `yarn add ${packageSpec}`,
    dev: (packageSpec: string) => `yarn add --dev ${packageSpec}`,
    global: (packageSpec: string) => `yarn global add ${packageSpec}`,
  },
  deno: {
    prod: (packageSpec: string) => `deno add npm:${packageSpec}`,
    dev: (packageSpec: string) => `deno add --dev npm:${packageSpec}`,
    global: (packageSpec: string) => `deno install --global npm:${packageSpec}`,
  },
} satisfies Record<PackageManager, Record<ActiveInstallationMode, (packageSpec: string) => string>>
const createInstallationCommands = (context: Pick<Context, 'config' | 'pkg' | 'slug'>): Array<InstallationCommand> => {
  const commands: Array<InstallationCommand> = []
  const packageSpec = appendVersionToPackageSpec(context.pkg.name, context.pkg.version, context.config.versionInInstallation)
  const githubPackagesBonusText = '(if [configured properly](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages))'
  if (context.config.installation) {
    for (const packageManager of toArray(context.config.packageManagers)) {
      commands.push({
        header: packageManager,
        headerArgument: context.pkg.name,
        command: installationCommandFactories[packageManager][context.config.installation](packageSpec),
      })
    }
  }
  if (context.config.githubPackage && context.config.installation) {
    commands.push({
      header: 'githubPackages',
      headerArgument: context.slug,
      bonusText: githubPackagesBonusText,
      command: `npm install ${getGithubPackagesInstallFlag(context.config.installation)}${appendVersionToPackageSpec(`@${context.slug}`, context.pkg.version, context.config.versionInInstallation)}`,
    })
  }
  return commands
}
const createBannerSvg = (context: Pick<Context, 'config' | 'title'>) => {
  if (context.config.banner === false) {
    return null
  }
  if (context.config.banner === true) {
    return generateBanner({
      text: context.title,
    })
  }
  if (typeof context.config.banner === 'string') {
    return generateBanner({
      text: context.config.banner,
    })
  }
  return generateBanner({
    bottomColor: context.config.banner.bottomColor,
    font: context.config.banner.font,
    text: context.config.banner.text || context.title,
    topColor: context.config.banner.topColor,
  })
}
const bunProjectFiles = ['bun.lock', 'bun.toml', 'bunfig.toml'] as const
const isBunProject = async (projectDirectory: string) => {
  const results = await Promise.all(bunProjectFiles.map(file => fs.pathExists(path.join(projectDirectory, file))))
  return results.some(Boolean)
}
const createDefaultShieldLines = (context: Pick<Context, 'isBunProject' | 'pkg'>) => {
  return [
    [
      'npmLatest',
      ...hasContent(context.pkg.license) ? ['license'] : [],
      ...context.isBunProject ? ['bun'] : [],
    ],
  ]
}
const createShieldLines = (context: Pick<Context, 'config' | 'fundingLink' | 'installationCommands' | 'isBunProject' | 'pkg' | 'slug' | 'tag'>) => {
  const configuredLines = context.config.shields ?? createDefaultShieldLines(context)
  return configuredLines
    .map(line => {
      const lineEntries = Array.isArray(line) ? line : [line]
      return lineEntries
        .map(entry => renderConfiguredShield(entry, context))
        .filter(Boolean)
        .join(' ')
        .trim()
    })
    .filter(Boolean)
}
const createDevelopmentScripts = (pkg: Context['pkg'], slug: string): Array<DevelopmentScript> => {
  const developmentScripts: Array<DevelopmentScript> = [
    {
      name: 'setting up',
      script: `git clone git@github.com:${slug}.git\ncd ${pkg.name}\nbun install`,
    },
  ]
  if (pkg.scripts?.lint) {
    developmentScripts.push({
      name: 'linting',
      script: 'bun run lint',
    })
  }
  if (pkg.scripts?.typecheck) {
    developmentScripts.push({
      name: 'type checking',
      script: 'bun run typecheck',
    })
  }
  if (pkg.scripts?.test) {
    developmentScripts.push({
      name: 'testing',
      script: 'bun run test',
    })
  }
  if (pkg.scripts?.['test:dev']) {
    developmentScripts.push({
      name: 'testing in development environment',
      script: 'bun run test:dev',
    })
  }
  return developmentScripts
}
const createReadmeContext = async (args: CliArgs): Promise<Context | null> => {
  const packageJsonExists = await fs.pathExists(args.packageFile)
  if (!packageJsonExists) {
    throw new Error(`No package.json found at ${args.packageFile}.`)
  }
  const projectDirectory = path.dirname(args.packageFile)
  const fragmentJobs = Object.entries(fragments).map(async ([fragmentId, fragmentTitle]) => {
    const file = path.join(args.configDirectory, `${fragmentId}.md`)
    const loadedFragment = await readOptionalText(file)
    if (loadedFragment === null) {
      return [fragmentId, null] as const
    }
    if (fragmentId === 'usage') {
      return [fragmentId, loadedFragment] as const
    }
    if (typeof fragmentTitle === 'string') {
      return [fragmentId, `## ${fragmentTitle}\n\n${loadedFragment}`] as const
    }
    return [fragmentId, loadedFragment] as const
  })
  const [pkg, config, usageOptions, example, usageCodeFragment, usageResultFragment, exampleResults, license, envVars, ownPackageMetadata, detectedBunProject, ...loadedFragmentEntries] = await Promise.all([
    readPkg(args.packageFile),
    readConfig(path.join(args.configDirectory, 'config.yml'), projectDirectory),
    readUsageOptions(path.join(args.configDirectory, 'usageOptions.yml'), projectDirectory),
    readOptionalCodeFragment(path.join(args.configDirectory, 'example')),
    readOptionalCodeFragmentWithMetadata(path.join(args.configDirectory, 'usage')),
    readOptionalCodeFragmentWithMetadata(path.join(args.configDirectory, 'result')),
    readExampleResults(args),
    readOptionalText(args.licenseFile),
    readOptionalYaml<Record<string, string>>(path.join(args.configDirectory, 'envVars.yml')),
    readOwnPackageMetadata(),
    isBunProject(projectDirectory),
    ...fragmentJobs,
  ])
  const repositoryUrl = getRepositoryUrl(pkg.repository)
  const slug = repositoryUrl ? parseGitHubSlug(repositoryUrl) : null
  if (!slug) {
    return null
  }
  const mergedEnvironmentVariables = {
    ...config.environmentVariables,
    ...envVars,
  }
  if (config.link === null && pkg.domain) {
    config.link = `https://${pkg.domain}`
  }
  if (config.link && config.linkName === null) {
    config.linkName = getLinkHost(config.link)
  }
  const worksAsScriptTag = !config.needsNodeRuntime
  if (config.tryInBrowser === null) {
    config.tryInBrowser = worksAsScriptTag
  }
  let binName: Context['binName'] = false
  if (config.binName === true) {
    binName = getDefaultBinName(pkg)
  } else if (typeof config.binName === 'string') {
    binName = config.binName
  }
  const binExample = config.binExample || (binName || null)
  const fragmentEntries = loadedFragmentEntries.filter((entry): entry is readonly [string, string] => entry[1] !== null)
  const loadedFragments = Object.fromEntries(fragmentEntries) as FragmentContent
  const usage = loadedFragments.usage ?? null
  const usageCode = usageCodeFragment?.content ?? null
  const usageResult = usageResultFragment?.content ?? null
  let normalizedLicense = license
  let isMitLicense = false
  if (normalizedLicense?.startsWith('MIT License')) {
    const mitLicenseLines = normalizedLicense.split(/\r?\n/u)
    const copyrightLine = mitLicenseLines.find(line => line.startsWith('Copyright'))
    if (copyrightLine) {
      normalizedLicense = copyrightLine
    }
    isMitLicense = true
  }
  const sortedEnvironmentVariables = hasContent(mergedEnvironmentVariables) ? sortRecord(mergedEnvironmentVariables) : {}
  const installationCommands = createInstallationCommands({
    config,
    pkg,
    slug,
  })
  const developmentScripts = createDevelopmentScripts(pkg, slug)
  const hasUsageOptions = usageOptions !== null
  const title = pkg.displayName || pkg.title || pkg.domain || pkg.name
  const bannerSvg = createBannerSvg({
    config,
    title,
  })
  const shieldLines = createShieldLines({
    config,
    fundingLink: getFundingLink(pkg.funding),
    installationCommands,
    isBunProject: detectedBunProject,
    pkg,
    slug,
    tag: `v${pkg.version}`,
  })
  const fundingLink = getFundingLink(pkg.funding)
  return {
    args,
    bannerSvg,
    binExample,
    binName,
    camelCaseName: camelcase(pkg.name),
    config: {
      ...config,
      environmentVariables: sortedEnvironmentVariables,
    },
    description: pkg.description ?? null,
    developmentScripts,
    example,
    exampleResults,
    fragments: loadedFragments,
    fundingLink,
    globalName: pkg.webpackConfigJaid?.endsWith('Class') ? camelcase(pkg.name, {pascalCase: true}) : camelcase(pkg.name),
    hasDevelopmentSection: Boolean(loadedFragments.development) || developmentScripts.length > 0,
    hasEnvironmentVariables: hasContent(sortedEnvironmentVariables),
    hasExampleSection: Boolean(example || Object.keys(exampleResults).length > 0 || loadedFragments.example),
    hasOptionsSection: hasUsageOptions || Boolean(loadedFragments.options),
    hasUsageOptions,
    hasUsageSection: Boolean(usage || usageCode || usageResult),
    installationCommands,
    isBunProject: detectedBunProject,
    isMitLicense,
    license: normalizedLicense,
    pascalCaseName: camelcase(pkg.name, {pascalCase: true}),
    pkg,
    shieldLines,
    slug,
    tag: `v${pkg.version}`,
    title,
    tldwVersion: ownPackageMetadata.version,
    usage,
    usageCode,
    usageCodeLanguage: usageCodeFragment?.extension ?? 'ts',
    usageOptions,
    usageResult,
    usageResultLanguage: usageResultFragment?.extension ?? 'ts',
    worksAsScriptTag,
  }
}

export const writeReadme = async (args: CliArgs): Promise<WriteReadmeResult> => {
  const context = await createReadmeContext(args)
  if (!context) {
    return {
      status: 'skipped',
      outputFile: args.outputFile,
      reason: 'tldw is made for GitHub repositories, but package.json#repository is not set. Doing nothing.',
    }
  }
  const readmeText = applyMaxBlankLines(normalizeReadmeText(await generateReadme(context)), context.config.maxBlankLines)
  const previousReadme = await fs.pathExists(args.outputFile) ? await Bun.file(args.outputFile).text() : null
  const bytes = Buffer.byteLength(readmeText)
  if (previousReadme === readmeText) {
    return {
      status: 'unchanged',
      outputFile: args.outputFile,
      readmeText,
      bytes,
    }
  }
  await fs.outputFile(args.outputFile, readmeText)
  return {
    status: previousReadme === null ? 'created' : 'overwritten',
    outputFile: args.outputFile,
    readmeText,
    bytes,
  }
}

export const logWriteReadmeResult = (result: WriteReadmeResult, cwd = process.cwd()) => {
  if (result.status === 'skipped') {
    if (result.reason) {
      console.warn(result.reason)
    }
    return
  }
  const fileName = path.relative(cwd, result.outputFile) || path.basename(result.outputFile)
  let verb = 'Left unchanged'
  if (result.status === 'created') {
    verb = 'Created'
  } else if (result.status === 'overwritten') {
    verb = 'Overwrote'
  }
  console.log(`${chalk.green(verb)} ${chalk.yellow(fileName)} ${chalk.green('with')} ${chalk.yellow(filesize(result.bytes ?? 0))}`)
}

export {createReadmeContext}
export type {PackageManager} from './lib/packageManagers.ts'
export type {Arrayable, BannerConfig, BannerDefinition, CliArgs, Config, ConfiguredShield, Context, CustomShieldDefinition, PackageData, ShieldsConfig, UsageOptionEntry, UsageOptions, WriteReadmeResult} from './lib/types.ts'

export default writeReadme
