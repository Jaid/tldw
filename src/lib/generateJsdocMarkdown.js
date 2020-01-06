import fsp from "@absolunet/fsp"
import execa from "execa"
import firstExistingPath from "first-existing-path"
import {isEmpty} from "has-content"
import path from "path"
import tempy from "tempy"

const debug = require("debug")(_PKG_NAME)

async function findModules() {
  const findModulesJobs = [
    "jsdoc-export-default-interop/dist/index.js",
    "jsdoc-babel/lib/index.js",
  ].map(async file => {
    const possiblePaths = [
      path.resolve("node_modules", file),
      path.resolve(__dirname, "node_modules", file),
    ]
    const foundFile = await firstExistingPath(possiblePaths)
    if (!foundFile) {
      throw new Error(`Could not find ${file}. Searched in: ${possiblePaths}`)
    }
    debug("Found file", foundFile)
    return foundFile
  })

  const [jsdocExportDefaultInteropPath, jsdocBabelPath] = await Promise.all(findModulesJobs)

  return {
    jsdocExportDefaultInteropPath,
    jsdocBabelPath,
  }
}

/**
 * @param {import("src").Context} context
 * @return {Promise<string>}
 */
async function getJsdocConfig(context) {
  const modulePaths = await findModules()
  const jsdocConfig = {
    opts: {
      recurse: true,
      encoding: "utf8",
    },
    sourceType: "module",
    plugins: [],
  }
  const babel = true
  if (babel) {
    jsdocConfig.plugins.unshift(modulePaths.jsdocBabelPath)
    jsdocConfig.babel = {
      caller: {
        name: "tldw",
      },
      cwd: process.cwd(),
      root: process.cwd(),
      comments: true,
      envName: "development",
    }
  }
  return jsdocConfig
}

/**
 * @param {import("src").Context} context
 * @return {Promise<string>}
 */
export default async context => {
  try {
    const jsdocConfig = await getJsdocConfig(context)
    const jsdocConfigFile = await tempy.file({extension: "json"})
    debug(`JSDoc config written to: ${jsdocConfigFile}`)
    await fsp.outputJson(jsdocConfigFile, jsdocConfig)
    const customPartials = []
    const jsdocToMarkdownArgs = ["jsdoc-to-markdown", "--files", context.args.sourceGlob, "--example-lang", "javascript", "--configure", jsdocConfigFile]
    for (const customPartial of customPartials) {
      const partialFile = path.join("dist", "partials", `${customPartial}.hbs`)
      await fsp.outputFile(partialFile, require(`!raw-loader!../partials/${customPartial}.hbs`).default)
      jsdocToMarkdownArgs.push("--partial")
      jsdocToMarkdownArgs.push(partialFile)
    }
    const result = await execa("npx", jsdocToMarkdownArgs)
    debug(`Executed: ${result.command}`)
    debug(`= ${result.exitCode}`)
    if (isEmpty(result.stdout)) {
      return null
    }
    const apiMarkdown = result.stdout.replace(/## \S+/s, "## Reference")
    return apiMarkdown
  } catch (error) {
    console.warn("Could not run JSDoc")
    console.warn(error)
    return null
  }
}