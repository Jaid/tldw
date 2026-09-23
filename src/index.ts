import type {CliArgs, WriteReadmeResult} from './lib/types.ts'

import chalk from 'chalk'
import {filesize} from 'filesize'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import generateReadme from './generateReadme.ts'
import {createReadmeContext} from './lib/createReadmeContext.ts'
import {applyMaxBlankLines, normalizeReadmeText} from './lib/helpers.ts'

export const writeReadme = async (args: CliArgs): Promise<WriteReadmeResult> => {
  const context = await createReadmeContext(args)
  if (!context) {
    return {
      status: 'skipped',
      outputFile: args.outputFile,
      reason: 'tldw is made for GitHub repositories, but package.json#repository is not set. Doing nothing.',
    }
  }
  const readmeText = applyMaxBlankLines(normalizeReadmeText(await generateReadme(context)), context.config.tldw.maxBlankLines)
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

export {configSchema} from './config.schema.ts'
export type {InstallationType, ResolvedConfig, SvgStrategy, TypedOption} from './config.schema.ts'
export {createReadmeContext} from './lib/createReadmeContext.ts'
export {defaultValueSchema} from './lib/defaultValue.ts'
export type {DefaultValue} from './lib/defaultValue.ts'
export type {PackageManager} from './lib/packageManagers.ts'
export {formatPropertyId, propertyIdSchema} from './lib/propertyId.ts'
export type {PropertyId} from './lib/propertyId.ts'
export type {Arrayable, BannerConfig, BannerDefinition, CliArgs, Config, ConfiguredShield, Context, CustomShieldDefinition, PackageData, ShieldsConfig, UsageOptionEntry, UsageOptions, WriteReadmeResult} from './lib/types.ts'
export * from './sections/index.ts'

export {ReadmeSection} from './sections/ReadmeSection.ts'

export default writeReadme
