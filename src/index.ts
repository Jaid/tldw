import type {CliArgs, Context, DevelopmentScript, FragmentContent, InstallationCommand, WriteReadmeResult} from './lib/types.ts'

import camelcase from 'camelcase'
import chalk from 'chalk'
import {filesize} from 'filesize'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import fragments from './fragments.ts'
import generateReadme from './generateReadme.ts'
import {getDefaultBinName, getFundingLink, getLinkHost, getRepositoryUrl, hasContent, normalizeReadmeText, parseGitHubSlug, readOptionalCodeFragment, readOptionalText, readOptionalYaml, sortRecord} from './lib/helpers.ts'
import readConfig from './lib/readConfig.ts'
import readExampleResults from './lib/readExampleResults.ts'
import {readOwnPackageMetadata} from './lib/readOwnPackageMetadata.ts'
import readPkg from './lib/readPkg.ts'
import readUsageOptions from './lib/readUsageOptions.ts'

const getGithubPackagesInstallFlag = (installation: Context['config']['installation']) => {
  if (installation === 'dev') {
    return '--save-dev '
  }
  if (installation === 'global') {
    return '--global '
  }
  return '--save '
}
const createInstallationCommands = (context: Pick<Context, 'config' | 'pkg' | 'slug'>): Array<InstallationCommand> => {
  const commands: Array<InstallationCommand> = []
  const packageSpec = `${context.pkg.name}@^${context.pkg.version}`
  const githubPackagesBonusText = '(if [configured properly](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages))'
  switch (context.config.installation) {
    case 'prod': {
      commands.push({
        header: 'bun',
        headerArgument: context.pkg.name,
        command: `bun add ${packageSpec}`,
      })
      commands.push({
        header: 'npm',
        headerArgument: context.pkg.name,
        command: `npm install --save ${packageSpec}`,
      })
      commands.push({
        header: 'yarn',
        headerArgument: context.pkg.name,
        command: `yarn add ${packageSpec}`,
      })
      break
    }
    case 'dev': {
      commands.push({
        header: 'bun',
        headerArgument: context.pkg.name,
        command: `bun add --development ${packageSpec}`,
      })
      commands.push({
        header: 'npm',
        headerArgument: context.pkg.name,
        command: `npm install --save-dev ${packageSpec}`,
      })
      commands.push({
        header: 'yarn',
        headerArgument: context.pkg.name,
        command: `yarn add --dev ${packageSpec}`,
      })
      break
    }
    case 'global': {
      commands.push({
        header: 'bun',
        headerArgument: context.pkg.name,
        command: `bun add --global ${packageSpec}`,
      })
      commands.push({
        header: 'npm',
        headerArgument: context.pkg.name,
        command: `npm install --global ${packageSpec}`,
      })
      commands.push({
        header: 'yarn',
        headerArgument: context.pkg.name,
        command: `yarn global add ${packageSpec}`,
      })
      break
    }
    default: {
      break
    }
  }
  if (context.config.githubPackage && context.config.installation) {
    commands.push({
      header: 'githubPackages',
      headerArgument: context.slug,
      bonusText: githubPackagesBonusText,
      command: `npm install ${getGithubPackagesInstallFlag(context.config.installation)}@${context.slug}@^${context.pkg.version}`,
    })
  }
  return commands
}
const createDevelopmentScripts = (pkg: Context['pkg'], slug: string): Array<DevelopmentScript> => {
  const developmentScripts: Array<DevelopmentScript> = [
    {
      name: 'Setting up:',
      script: `git clone git@github.com:${slug}.git\ncd ${pkg.name}\nbun install`,
    },
  ]
  if (pkg.scripts?.lint) {
    developmentScripts.push({
      name: 'Linting:',
      script: 'bun run lint',
    })
  }
  if (pkg.scripts?.typecheck) {
    developmentScripts.push({
      name: 'Type checking:',
      script: 'bun run typecheck',
    })
  }
  if (pkg.scripts?.test) {
    developmentScripts.push({
      name: 'Testing:',
      script: 'bun run test',
    })
  }
  if (pkg.scripts?.['test:dev']) {
    developmentScripts.push({
      name: 'Testing in development environment:',
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
    if (typeof fragmentTitle === 'string') {
      return [fragmentId, `## ${fragmentTitle}\n\n${loadedFragment}`] as const
    }
    return [fragmentId, loadedFragment] as const
  })
  const [pkg, config, usageOptions, example, exampleResults, license, envVars, ownPackageMetadata, ...loadedFragmentEntries] = await Promise.all([
    readPkg(args.packageFile),
    readConfig(path.join(args.configDirectory, 'config.yml'), projectDirectory),
    readUsageOptions(path.join(args.configDirectory, 'usageOptions.yml'), projectDirectory),
    readOptionalCodeFragment(path.join(args.configDirectory, 'example')),
    readExampleResults(args),
    readOptionalText(args.licenseFile),
    readOptionalYaml<Record<string, string>>(path.join(args.configDirectory, 'envVars.yml')),
    readOwnPackageMetadata(),
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
  return {
    args,
    binExample,
    binName,
    camelCaseName: camelcase(pkg.name),
    config: {
      ...config,
      environmentVariables: sortedEnvironmentVariables,
    },
    description: pkg.description ?? null,
    developmentScripts,
    esmWarning: pkg.type === 'module' && Boolean(pkg.webpackConfigJaid?.endsWith('Class') || pkg.webpackConfigJaid?.endsWith('Lib')),
    example,
    exampleResults,
    fragments: loadedFragments,
    fundingLink: getFundingLink(pkg.funding),
    globalName: pkg.webpackConfigJaid?.endsWith('Class') ? camelcase(pkg.name, {pascalCase: true}) : camelcase(pkg.name),
    hasDevelopmentSection: Boolean(loadedFragments.development) || developmentScripts.length > 0,
    hasEnvironmentVariables: hasContent(sortedEnvironmentVariables),
    hasExampleSection: Boolean(example || Object.keys(exampleResults).length > 0 || loadedFragments.example),
    hasOptionsSection: hasUsageOptions || Boolean(loadedFragments.options),
    hasUsageOptions,
    installationCommands,
    isMitLicense,
    license: normalizedLicense,
    pascalCaseName: camelcase(pkg.name, {pascalCase: true}),
    pkg,
    slug,
    tag: `v${pkg.version}`,
    title: pkg.displayName || pkg.title || pkg.domain || pkg.name,
    tldwVersion: ownPackageMetadata.version,
    usageOptions,
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
  const readmeText = normalizeReadmeText(await generateReadme(context))
  const previousReadme = await readOptionalText(args.outputFile)
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
export type {CliArgs, Config, Context, PackageData, UsageOptionEntry, UsageOptions, WriteReadmeResult} from './lib/types.ts'

export default writeReadme
