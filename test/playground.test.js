import {inspect} from "util"

import React from "react"
import reconciler from "react-reconciler"
import fs from "fs-extra"
import reactTestRenderer from "react-test-renderer"
import Div from "components/Div"

import createElement from "../src/react/createElement"
import debugHostConfig from "../src/react/debugHostConfig"

it("example", () => {
  const renderer = reconciler(debugHostConfig)
  const element = <div><div>a</div></div>
  const root = createElement("root", {
    children: element?.$$typeof ? element : <element/>,
  })
  const rootContainer = renderer.createContainer(root)
  renderer.updateContainer(element, rootContainer, null)
  fs.appendFileSync("./dist/playground-log.txt", `${inspect({
    result: root.render(),
    testResult: reactTestRenderer.create(element).toJSON(),
  }, {
    colors: true,
    maxArrayLength: 5,
    depth: 3,
  })}\n`)
})