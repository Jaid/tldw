import React from "react"
import reconciler from "react-reconciler"

import createElement from "./createElement"
import debugHostConfig from "./debugHostConfig"

const renderer = reconciler(debugHostConfig)

export default element => {
  const root = createElement("root", {
    children: element?.$$typeof ? element : <element/>,
  })
  const rootContainer = renderer.createContainer(root)
  renderer.updateContainer(element, rootContainer, null)
  return root.render()
}