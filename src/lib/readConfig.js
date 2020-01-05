import fsp from "@absolunet/fsp"
import readFileYaml from "read-file-yaml"

const debug = require("debug")(_PKG_NAME)

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
    ...loadedConfig,
  }
  return config
}