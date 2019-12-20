import readFileYaml from "read-file-yaml"

const debug = require("debug")(_PKG_NAME)

export default async file => {
  debug(`Reading config from ${file}`)
  const config = await readFileYaml(file)
  return config || {}
}