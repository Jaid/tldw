import fsp from "@absolunet/fsp"
import execa from "execa"
import {isEmpty} from "has-content"
import path from "path"

const debug = require("debug")(_PKG_NAME)

/**
 * @function
 * @param {string} sourceGlob
 * @return {string}
 */
export default async sourceGlob => {
  try {
    const customPartials = []
    const jsdocToMarkdownArgs = ["jsdoc-to-markdown", "--files", sourceGlob, "--example-lang", "javascript"]
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
    return result.stdout
  } catch (error) {
    console.warn("Could not run jsdoc-to-markdown")
    console.warn(error)
    return null
  }
}