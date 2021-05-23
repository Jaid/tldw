import fsp from "@absolunet/fsp"
import readFileYaml from "read-file-yaml"

const debug = require("debug")(process.env.REPLACE_PKG_NAME)

/**
 * @param {string} file
 * @return {Promise<import("..").Config>}
 */
export default async file => {
  debug(`Reading config from ${file}`)
  /**
   * @type {import("..").Config}
   */
  const loadedConfig = await readFileYaml(file) || {}
  const hasGithubActions = await fsp.pathExists(".github/workflows")
  const config = {
    binName: loadedConfig.installation === "global",
    githubActions: hasGithubActions,
    personal: false,
    jsdoc: false,
    link: null,
    linkName: null,
    installation: false,
    environmentVariables: {},
    needsNodeRuntime: true,
    tryInBrowser: null,
    exampleResultMayVary: false,
    renderComment: true,
    ...loadedConfig,
  }
  return config
}