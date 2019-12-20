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
  const config = {
    binName: loadedConfig.installation === "global",
    ...loadedConfig,
  }
  return config
}