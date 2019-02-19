import reactReconciler from "react-reconciler"

const debug = require("debug")("tldw:renderer")

const renderer = reactReconciler({
  now: Date.now,
  supportsMutation: false,
  getRootHostContext: () => {},
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
    return {text}
  },
  appendInitialChild(parent, child) {},
  finalizeInitialChildren: () => false,
  prepareForCommit() {},
  resetAfterCommit() {},
  appendChildToContainer: (parent, child) => {
    parent.append(child)
  },
})

export default {
  render(element, renderDom, callback) {
    // element: This is the react element for App component
    // renderDom: This is the host root element to which the rendered app will be attached.
    // callback: if specified will be called after render is done.

    const container = renderer.createContainer(renderDom, false) // Creates root fiber node.

    const parentComponent = null // Since there is no parent (since this is the root fiber). We set parentComponent to null.
    renderer.updateContainer(element,
      container,
      parentComponent,
      callback) // Start reconcilation and render the result
  },
}