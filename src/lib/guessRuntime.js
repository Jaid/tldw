const webTypes = [
  "webLib",
  "webClass",
]

const hybridTypes = [
  "universalLib",
  "universalClass",
]

/**
 * @function
 * @param {import("../index.js").Context} context
 * @return {"node"|"web"|"hybrid"}
 */
export default context => {
  const type = context.pkg.webpackConfigJaid
  if (webTypes.includes(type)) {
    return "web"
  }
  if (hybridTypes.includes(type)) {
    return "hybrid"
  }
  return "node"
}