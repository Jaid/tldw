import type {CliArgs} from '../lib/types.ts'

import {defineCommand} from 'clerc'
import * as path from 'forward-slash-path'

import {logWriteReadmeResult, writeReadme} from '../index.ts'

const cwd = process.cwd()
const toLongFlagName = (flagName: string) => {
  return `--${flagName.replaceAll(/[A-Z]/gu, letter => `-${letter.toLowerCase()}`)}`
}
const hasExplicitFlag = (rawArgs: Array<string>, flagName: string, shortFlagName: string) => {
  const longFlagName = toLongFlagName(flagName)
  const shortFlag = `-${shortFlagName}`
  return rawArgs.some(rawArg => rawArg === longFlagName || rawArg.startsWith(`${longFlagName}=`) || rawArg === shortFlag || rawArg.startsWith(`${shortFlag}=`) || rawArg.startsWith(shortFlag) && rawArg.length > shortFlag.length)
}
const mainCommand = defineCommand({
  name: '',
  description: 'Generate a README file from package metadata and configurable fragments.',
  flags: {
    outputFile: {
      type: String,
      short: 'o',
      default: path.join(cwd, 'readme.md'),
      description: 'output file',
    },
    configDirectory: {
      type: String,
      short: 'c',
      default: path.join(cwd, 'docs', 'tldw'),
      description: 'directory containing tldw fragment and config files',
    },
    packageFile: {
      type: String,
      short: 'p',
      default: path.join(cwd, 'package.json'),
      description: 'path to a package.json file',
    },
    licenseFile: {
      type: String,
      short: 'l',
      default: path.join(cwd, 'license.txt'),
      description: 'path to the license file',
    },
  },
  // eslint-disable-next-line typescript/no-misused-promises
}, async context => {
  const packageFile = path.resolve(context.flags.packageFile)
  const packageDirectory = path.dirname(packageFile)
  const args: CliArgs = {
    outputFile: path.resolve(context.flags.outputFile),
    configDirectory: hasExplicitFlag(context.rawParsed.raw, 'configDirectory', 'c') ? path.resolve(context.flags.configDirectory) : path.join(packageDirectory, 'docs', 'tldw'),
    packageFile,
    licenseFile: hasExplicitFlag(context.rawParsed.raw, 'licenseFile', 'l') ? path.resolve(context.flags.licenseFile) : path.join(packageDirectory, 'license.txt'),
  }
  const result = await writeReadme(args)
  logWriteReadmeResult(result)
})

export default mainCommand
