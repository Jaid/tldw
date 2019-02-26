import {inspect} from "util"

import React from "react"
import reconciler from "react-reconciler"
import fs from "fs-extra"
import reactTestRenderer from "react-test-renderer"

import debugHostConfig from "../src/react/debugHostConfig"

const debug = require("debug")(_PKG_NAME)

it("example", () => {
  const renderer = reconciler(debugHostConfig)
  const element = <div nested={1}>
    <div nested={2}>
      <div nested={3}>
        moin
      </div>
    </div>
  </div>
  const root = debugHostConfig.createInstance("root", {
    children: element?.$$typeof ? element : <element/>,
  })
  const rootContainer = renderer.createContainer(root)
  renderer.updateContainer(element, rootContainer, null)
  const data = {
    result: root.render(),
    testResult: reactTestRenderer.create(element).toJSON(),
  }
  debug(data)
  fs.appendFileSync("./dist/playground-log.txt", `${inspect(data, {
    colors: true,
    maxArrayLength: 10,
    depth: 8,
    breakLength: 80,
  })}\n`)
})