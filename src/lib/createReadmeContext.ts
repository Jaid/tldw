import type {CliArgs, Context} from './types.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {getFundingLink, getRepositoryUrl, parseGitHubSlug} from './helpers.ts'
import readConfig from './readConfig.ts'
import {readOwnPackageMetadata} from './readOwnPackageMetadata.ts'
import readPkg from './readPkg.ts'

const bunProjectFiles = ['bun.lock', 'bun.toml', 'bunfig.toml'] as const

export const createReadmeContext = async (inputArgs: CliArgs): Promise<Context | null> => {
  const args: CliArgs = {
    configDirectory: path.resolve(inputArgs.configDirectory),
    licenseFile: path.resolve(inputArgs.licenseFile),
    outputFile: path.resolve(inputArgs.outputFile),
    packageFile: path.resolve(inputArgs.packageFile),
  }
  if (!await fs.pathExists(args.packageFile)) {
    throw new Error(`No package.json found at ${args.packageFile}.`)
  }
  const projectDirectory = path.dirname(args.packageFile)
  const [pkg, config, metadata, licenseExists, bunFiles] = await Promise.all([
    readPkg(args.packageFile),
    readConfig(args.configDirectory, projectDirectory),
    readOwnPackageMetadata(),
    fs.pathExists(args.licenseFile),
    Promise.all(bunProjectFiles.map(file => fs.pathExists(path.join(projectDirectory, file)))),
  ])
  const repositoryUrl = getRepositoryUrl(pkg.repository)
  const slug = repositoryUrl ? parseGitHubSlug(repositoryUrl) : null
  if (!slug) {
    return null
  }
  const packageDirectory = typeof pkg.repository === 'object' ? pkg.repository.directory ?? '' : ''
  const relativeLicenseFile = path.join(packageDirectory, path.relative(projectDirectory, args.licenseFile))
  const licenseUrl = licenseExists && relativeLicenseFile !== '..' && !relativeLicenseFile.startsWith('../') && !path.isAbsolute(relativeLicenseFile) ? `https://github.com/${slug}/raw/HEAD/${relativeLicenseFile.split('/').map(part => encodeURIComponent(part)).join('/')}` : null
  return {
    args,
    config,
    fundingLink: getFundingLink(pkg.funding),
    isBunProject: bunFiles.some(Boolean),
    licenseUrl,
    pkg,
    projectDirectory,
    slug,
    tag: `v${pkg.version}`,
    title: pkg.displayName || pkg.title || pkg.domain || pkg.name,
    tldwVersion: metadata.version,
  }
}
