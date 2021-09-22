import path from "node:path"

import createDebug from "debug"

import readFileJson from "./esm/read-file-json.js"

const debug = createDebug(process.env.REPLACE_PKG_NAME)

export default async file => {
  debug(`Reading pkg from ${file}`)
  const pkg = await readFileJson(file) || {}
  if (!pkg.name) {
    const value = path.basename(path.resolve(file, ".."))
    debug(`Setting pkg.name to ${value}`)
    pkg.name = value
  }
  if (!pkg.version) {
    const value = "1.0.0"
    debug(`Setting pkg.version to ${value}`)
    pkg.version = value
  }
  return pkg
}