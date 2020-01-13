import fsp from "@absolunet/fsp"
import gitUrlParse from "git-url-parse"
import hasContent from "has-content"
import {isString} from "lodash"
import normalizePackageData from "normalize-package-data"
import path from "path"
import readFileString from "read-file-string"
import readFileYaml from "read-file-yaml"
import urlParse from "url-parse"
import yargs from "yargs"

import generateJsdocMarkdown from "lib/generateJsdocMarkdown"
import guessRuntime from "lib/guessRuntime"
import readConfig from "lib/readConfig"
import readPkg from "lib/readPkg"

import fragments from "./fragments.yml"
import generateReadme from "./generateReadme"

/**
 * @typedef {Object} Config
 * @prop {"global"|"prod"|"dev"|false} installation
 * @prop {boolean} tryInBrowser
 * @prop {"node"|"web"|"hybrid"} runtime
 * @prop {string} binName
 * @prop {string} binExample
 * @prop {boolean} githubActions
 * @prop {boolean} personal
 * @prop {Object} environmentVariables
 * @prop {boolean} jsdoc
 * @prop {string} link
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
 * @prop {string} exampleresult
 * @prop {Args} args
 * @prop {"node"|"web"|"hybrid"} runtime
 * @prop {string} apiMarkdown
 * @prop {string} license
 * @prop {string} slug
 * @prop {string} tag
 * @prop {boolean} webCompatible
 * @prop {string} binName
 * @prop {string} binExample
 * @prop {Object} fragments
 * @prop {Object[]} developmentScripts
 * @prop {boolean} hasDevelopmentSection
 * @prop {boolean} hasEnvironmentVariables
 * @prop {Object} repository
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
  const jobs = [
    readPkg(args.packageFile),
    readConfig(path.join(args.configDirectory, "config.yml")),
    readFileString(path.join(args.configDirectory, "example.js")),
    readFileString(path.join(args.configDirectory, "result.js")),
    readFileString(args.licenseFile),
    readFileYaml(path.join(args.configDirectory, "envVars.yml")),
  ]
  for (const [fragmentId, fragmentTitle] of Object.entries(fragments)) {
    const loadFragmentsJob = async () => {
      const file = path.join(args.configDirectory, `${fragmentId}.md`)
      let content = await readFileString(file)
      if (isString(fragmentTitle) && content) {
        content = `## ${fragmentTitle}\n\n${content}`
      }
      return {
        id: fragmentId,
        content,
      }
    }
    jobs.push(loadFragmentsJob())
  }
  const [pkg, config, example, exampleResult, license, envVars, ...loadedFragments] = await Promise.all(jobs)
  normalizePackageData(pkg)
  if (envVars) {
    Object.assign(config.environmentVariables, envVars)
  }
  /**
   * @type {Context}
   */
  const context = {
    pkg,
    args,
    config,
    example,
    exampleResult,
    license,
    repository: pkg.repository?.url,
    hasEnvironmentVariables: hasContent(config.environmentVariables),
    developmentScripts: [],
    fragments: {},
    title: pkg.title || pkg.domain || pkg.name,
    binName: false,
    tag: `v${pkg.version}`,
  }
  if (!context.repository) {
    console.warn("tldw is made for GitHub repositories, but package.json#repository is not set")
    console.warn("Doing nothing")
    process.exit(0)
  }
  context.slug = gitUrlParse(context.repository).full_name
  if (!config.link === null && pkg.domain) {
    config.link = `https://${pkg.domain}`
  }
  if (config.link && config.linkName === null) {
    config.linkName = urlParse(config.link).host
  }
  if (!context.runtime) {
    context.runtime = config.runtime || guessRuntime(context)
  }
  if (config.binName === true) {
    context.binName = pkg.name
  } else if (config.binName) {
    context.binName = config.binName
  }
  if (!context.binExample) {
    if (config.binExample) {
      context.binExample = config.binExample
    } else if (context.binName) {
      context.binExample = context.binName
    }
  }
  for (const {id, content} of loadedFragments) {
    if (content) {
      context.fragments[id] = content
    }
  }
  context.developmentScripts.push({
    name: "Setting up:",
    script: `git clone git@github.com:${context.slug}.git\ncd ${pkg.name}\nnpm install`,
  })
  if (pkg?.scripts?.["test:dev"]) {
    context.developmentScripts.push({
      name: "Testing:",
      script: "npm run test:dev",
    })
  }
  if (pkg?.scripts?.test) {
    context.developmentScripts.push({
      name: "Testing in production environment:",
      script: "npm run test",
    })
  }
  context.hasDevelopmentSection = Boolean(context.fragments.development) || hasContent(context.developmentScripts)
  if (config.jsdoc) {
    context.apiMarkdown = await generateJsdocMarkdown(context)
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