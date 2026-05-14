import type {CliArgs} from '../lib/types.ts'

import {defineCommand} from 'clerc'
import * as path from 'forward-slash-path'

import {logWriteReadmeResult, writeReadme} from '../index.ts'

const cwd = process.cwd()
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
      default: path.join(cwd, 'readme'),
      description: 'directory containing README fragment and config files',
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
  const args: CliArgs = {
    outputFile: path.resolve(context.flags.outputFile),
    configDirectory: path.resolve(context.flags.configDirectory),
    packageFile: path.resolve(context.flags.packageFile),
    licenseFile: path.resolve(context.flags.licenseFile),
  }
  const result = await writeReadme(args)
  logWriteReadmeResult(result)
})

export default mainCommand
