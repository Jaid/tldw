import Readme from "components/Readme"

const debug = require("debug")(_PKG_NAME)


export default (type, props, rootContainer) => {
  const components = {
    root: () => new Readme(props),
  }

  return components[type]?.() || undefined
}