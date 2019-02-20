import reactReconciler from "react-reconciler"

import Readme from "./Readme"

const debug = require("debug")("tldw:renderer")

const renderer = reactReconciler({
  now: Date.now,
  supportsMutation: false,
  getRootHostContext: () => {
  },
  getChildHostContext: () => {},
  shouldSetTextContent(type, props) {
    debug("AKK")
    return typeof props.children === "string"
  },
  createInstance(type, props) {
    debug("createInstance", ...arguments)
    return "HOST"
  },
  createTextInstance(text) {
    debug("createTextInstance", ...arguments)
    return text
  },
  appendInitialChild(parent, child) {
    debug(1)
  },
  finalizeInitialChildren: () => false,
  prepareForCommit() {},
  resetAfterCommit() {},
  appendChildToContainer: (parent, child) => {
    debug("appendChildToContainer", ...arguments)
    parent.append(child)
  },
})

export default element => {
  const readme = new Readme
  const container = renderer.createContainer(readme, false) // Creates root fiber node.
  renderer.updateContainer(element, container, null)
  return readme.render()
}