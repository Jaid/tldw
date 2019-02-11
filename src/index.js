import resolvePkgOption from "resolve-pkg-option"

import render from "./render"

export default async (component, options) => {
  options = {
    pkg: {},
    ...options,
  }

  const loadedPackage = await resolvePkgOption(options.pkg)

  const text = render(component)

  return {
    text: options.xml,
  }
}