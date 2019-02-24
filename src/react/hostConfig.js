import React from "react"
import {noop, isObject} from "lodash"

import createElement from "./createElement"

const debug = require("debug")(_PKG_NAME)

const append = (parent, child) => {
  if (isObject(child)) {
    child.parent = parent
  }
  if (parent.append) {
    parent.append(child)
  } else {
    debug(`${parent?.name || parent?.displayName || parent?.__proto__?.constructor?.name}.append ? :/`)
  }
}

export const now = noop

export const prepareUpdate = () => true

export const getRootHostContext = () => {
  return {context: "GOOD"}
}

export const getChildHostContext = () => {
  return {a: "BAD"}
}

export const shouldSetTextContent = (type, props) => {
  return typeof props.children === "string"
}

export const createInstance = (type, props, rootContainer) => {
  return createElement(type, props, rootContainer)
}

export const createTextInstance = text => {
  return createElement("text", {text}, 0)
}

export const prepareForCommit = noop

export const resetAfterCommit = noop

export const appendInitialChild = append

export const finalizeInitialChildren = () => {
  return false
}

export const insertInContainerBefore = noop

export const unhideInstance = noop

export const useSyncScheduling = true

export const supportsMutation = true

export const appendChild = noop

export const appendChildToContainer = append

export const getPublicInstance = instance => {
  return instance
}

export const removeChild = noop

export const removeChildFromContainer = noop

export const insertBefore = noop

export const commitUpdate = noop

export const commitMount = noop

export const commitTextUpdate = noop