import {inspect} from "util"

import React from "react"
import reconciler from "react-reconciler"
import fs from "fs-extra"
import reactTestRenderer from "react-test-renderer"

import debugHostConfig from "../src/react/debugHostConfig"

const debug = require("debug")(_PKG_NAME)

it("example", () => {
  const renderer = reconciler(debugHostConfig)
  const element = <span><span>moin</span><span>bro</span></span>
  const root = debugHostConfig.createInstance("root", {
    children: element?.$$typeof ? element : <element/>,
  })
  const rootContainer = renderer.createContainer(root)
  renderer.updateContainer(element, rootContainer, null)

  const realResult = root.render()
  const testResult = reactTestRenderer.create(element).toJSON()

  debug(realResult)
  debug(testResult)

  fs.appendFileSync("./dist/playground-log.txt", `${inspect({
    realResult,
    testResult,
  }, {
    colors: true,
    maxArrayLength: 10,
    depth: 8,
    breakLength: 80,
  })}\n`)
})