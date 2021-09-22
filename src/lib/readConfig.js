import fsp from "@absolunet/fsp"
import createDebug from "debug"

import readFileYaml from "./esm/read-file-yaml.js"

const debug = createDebug(process.env.REPLACE_PKG_NAME)

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
    githubPackage: false,
    ...loadedConfig,
  }
  return config
}