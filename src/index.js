import resolvePkgOption from "resolve-pkg-option"

import ReactRenderer from "./ReactRenderer"

export default async (component, options) => {
  options = {
    pkg: {},
    ...options,
  }

  const loadedPackage = await resolvePkgOption(options.pkg)

  const text = ReactRenderer.render(component)

  return {
    text: options.xml,
  }
}