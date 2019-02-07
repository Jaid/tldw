import path from "path"

import resolvePkgOption from "resolve-pkg-option"
import {xml2js} from "xml-js"

export default async options => {
  options = {
    xml: "",
    plugins: [],
    pkg: {},
    ...options,
  }

  const loadedPackage = await resolvePkgOption(options.pkg)

  const dom = xml2js(`<tldw>${options.xml}</tldw>`, {nativeTypeAttributes: true})

  return {
    dom,
    text: options.xml,
  }
}