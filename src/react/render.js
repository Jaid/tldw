import React from "react"

import createElement from "./createElement"
import renderer from "./tldwRenderer"

const debug = require("debug")(`${_PKG_NAME}:render`)

export default children => {
  debug("Render element %o", children)
  const rootContainer = createElement("root")
  const node = renderer.createContainer(rootContainer, false) // Creates root fiber node.
  renderer.updateContainer(children, node, null)
  return rootContainer.render()
}