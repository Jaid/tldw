import * as hostConfig from "./hostConfig"

const debug = require("debug")(_PKG_NAME).extend("reconciler")

const stringify = arg => {
  if (typeof arg === "object") {
    const name = arg.name || arg.displayName || arg.__proto__.constructor.name || "object"
    return `${name}{${Object.keys(arg).join(", ")}}`
  } else {
    return JSON.stringify(arg)
  }
}

export default Object.keys(hostConfig).reduce((result, key) => {
  const value = hostConfig[key]
  if (typeof value === "function") {
    result[key] = (...args) => {
      const returnValue = value(...args)
      let logLine = `${key}(${args.map(x => stringify(x)).join(", ")})`
      if (returnValue !== undefined) {
        logLine += ` -> ${stringify(returnValue)}`
      }
      debug(logLine)
      return returnValue
    }
  } else {
    result[key] = value
  }
  return result
}, {})