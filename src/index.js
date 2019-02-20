import resolvePkgOption from "resolve-pkg-option"
import React from "react"

import render from "./render"

class Readme extends React.Component {

  render() {
    return `A${this.props?.children}`
  }

}

export default async component => {
  // const loadedPackage = await resolvePkgOption(options.pkg)

  const text = render(component)
  console.log(text)

  return {
    text,
  }
}