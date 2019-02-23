import reactReconciler from "react-reconciler"
import React from "react"
import {noop} from "lodash"

import createElement from "./createElement"

const debug = require("debug")(`${_PKG_NAME}:render`)

const hostConfig = {
  now: Date.now,
  prepareUpdate() {
    return true
  },
  getRootHostContext() {
    debug("getRootHostContext")
    return {context: "GOOD"}
  },
  getChildHostContext: noop,
  shouldSetTextContent(type, props) {
    debug("shouldSetTextContent")
    debugger
    return typeof props.children === "string"
  },
  createInstance(type, props, rootContainer) {
    debug("createInstance", ...arguments)
    return "HOST"
  },
  createTextInstance(text) {
    debug("createTextInstance", text)
    return text
  },
  prepareForCommit: noop,
  resetAfterCommit: noop,
  supportsMutation: true,
  appendChild(parentInstance, child) {
    debug("appendChild", ...arguments)
  },
  appendChildToContainer(parent, child) {
    debug("appendChildToContainer", ...arguments)
    parent.append(child)
  },
}

export default reactReconciler(hostConfig)