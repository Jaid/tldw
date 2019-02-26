import Readme from "components/Readme"
import Text from "components/Text"
import Section from "components/Section"
import Foundation from "components/Foundation"
import Header from "components/Header"
import Div from "components/Div"
import React from "react"
import {noop, isObject} from "lodash"
import isStringArray from "validate.io-string-array"

const debug = require("debug")(_PKG_NAME)

const append = (parent, child) => {
  if (isObject(child)) {
    child.parent = parent
    child.depth = parent.depth + 1
  }
  if (parent.append) {
    parent.append(child)
  } else {
    debug(`${parent?.name || parent?.displayName || parent?.__proto__?.constructor?.name}.append ? :/`)
  }
}

const getComponentByType = type => {
  return {
    root: Readme,
    text: Text,
    section: Section,
    foundation: Foundation,
    header: Header,
    div: Div,
  }[type]
}

export const now = noop

export const prepareUpdate = () => true

export const getRootHostContext = rootContainerInstance => {
  return {depth: 0}
}

export const getChildHostContext = (parentHostContext, type, rootContainerInstance) => {
  const Component = getComponentByType(type)
  return {
    depth: parentHostContext.depth + (Component.increaseDepth || 0),
  }
}

export const shouldSetTextContent = (type, props) => {
  if (["number", "boolean", "string"].includes(typeof props.children)) {
    return true
  }
  if (isStringArray(props.children)) {
    return true
  }
  return false
}

export const createInstance = (type, props, rootContainer, hostContext, fiber) => {
  const TypeClass = getComponentByType(type)

  if (TypeClass?.constructor) {
    return new TypeClass({
      ...props,
      ...hostContext,
    })
  }

  throw new Error(`No native tldw component "${type}"`)
}

export const createTextInstance = text => {
  return createInstance("text", {text}, 0)
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