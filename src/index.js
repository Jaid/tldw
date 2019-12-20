import fsp from "@absolunet/fsp"
import path from "path"
import readFileString from "read-file-string"
import yargs from "yargs"

import generateJsdocMarkdown from "lib/generateJsdocMarkdown"
import guessRuntime from "lib/guessRuntime"
import readConfig from "lib/readConfig"
import readPkg from "lib/readPkg"

import generateReadme from "./generateReadme"

const debug = require("debug")(_PKG_NAME)

/**
 * @typedef {Object} Config
 * @prop {"global"|"prod"|"dev"|false} installation
 * @prop {boolean} tryInBrowser
 * @prop {"node"|"web"|"hybrid"} runtime
 */

/**
 * @typedef {Object} Args
 * @prop {string} outputFile
 * @prop {string} configDirectory
 * @prop {string} packageFile
 * @prop {string} sourceGlob
 * @prop {string} licenseFile
 */

/**
 * @typedef {Object} Context
 * @prop {Object} pkg
 * @prop {Object[]} installationCommands
 * @prop {string} camelCaseName
 * @prop {string} pascalCaseName
 * @prop {string} title
 * @prop {string} globalName
 * @prop {string} description
 * @prop {string} configFile
 * @prop {Config} config
 * @prop {string} example
 * @prop {Args} args
 * @prop {"node"|"web"|"hybrid"} runtime
 * @prop {string} apiMarkdown
 * @prop {string} license
 * @prop {string} slug
 * @prop {string} tag
 * @prop {boolean} webCompatible
 */

/**
 * @param {Args} args
 * @return {Promise<void>}
 */
const job = async args => {
  const packageJsonExists = await fsp.pathExists(args.packageFile)
  if (!packageJsonExists) {
    console.warn("No pkg data found, stopping")
    process.exit(1)
  }
  const [pkg, config, example, license, apiMarkdown] = await Promise.all([
    readPkg(args.packageFile),
    readConfig(path.join(args.configDirectory, "config.yml")),
    readFileString(path.join(args.configDirectory, "example.js")),
    readFileString(args.licenseFile),
    generateJsdocMarkdown(args.sourceGlob),
  ])
  /**
   * @type {Context}
   */
  const context = {
    pkg,
    args,
    config,
    example,
    license,
    apiMarkdown,
    title: pkg.title || pkg.domain || pkg.name,
    tag: `v${pkg.version}`,
    slug: `Jaid/${pkg.name}`,
  }
  if (!context.runtime) {
    context.runtime = config.runtime || guessRuntime(context)
  }
  const readmeText = await generateReadme(context)
  await fsp.outputFile(args.outputFile, readmeText)
}

const main = async () => {
  const cwd = process.cwd()
  /**
   * @type {import("yargs").CommandBuilder}
   */
  const builder = {
    "output-file": {
      alias: "o",
      type: "string",
      default: path.join(cwd, "readme.md"),
      description: "Output file.",
    },
    "config-directory": {
      alias: "c",
      type: "string",
      default: path.join(cwd, "readme"),
      description: "Directory where config files for customizing readme output are stored in.",
    },
    "package-file": {
      alias: "p",
      type: "string",
      default: path.join(cwd, "package.json"),
      description: "Path to a package.json file.",
    },
    "source-glob": {
      alias: "s",
      type: "string",
      default: "src/**",
      description: "Glob for source files that will be read for JSDoc comments.",
    },
    "license-file": {
      alias: "l",
      type: "string",
      default: "license.txt",
      description: "Path to license file.",
    },
  }

  yargs
    .scriptName(_PKG_NAME)
    .version(_PKG_VERSION)
    .command("$0", _PKG_DESCRIPTION, builder, job).argv
}

main()