import resolvePkgOption from "resolve-pkg-option"
import React from "react"

import render from "./react/render"

const debug = require("debug")(_PKG_NAME)

export default async component => {
  // const loadedPackage = await resolvePkgOption(options.pkg)

  const text = render(component)

  return {
    text,
  }
}