import React from "react"
import reconciler from "react-reconciler"

import createElement from "../src/react/createElement"
import debugHostConfig from "../src/react/debugHostConfig"

const debug = require("debug")(_PKG_NAME)

it("example", async () => {
  // const element = <Content>
  //   <React.StrictMode>
  //     <section>ayy</section>
  //   </React.StrictMode>
  // </Content>

  const renderer = reconciler(debugHostConfig)

  const element = "a"

  const root = createElement("root", {
    children: element?.$$typeof ? element : <element/>,
  })
  const rootContainer = renderer.createContainer(root)
  renderer.updateContainer(element, rootContainer, null)

  const result = root.render()
  debugger
  debug.extend("result")("Result: %j", result)
})