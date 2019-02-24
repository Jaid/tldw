import React from "react"
import Component from "components/Component"
import Text from "components/Text"
import PropTypes from "prop-types"
import {isString, isArray} from "lodash"

const debug = require("debug")(_PKG_NAME)

const renderChild = child => {
  debugger
  if (isString(child)) {
    return child
  }
  if (child instanceof Text) {
    return child.text
  }
  if (child instanceof React.Component) {
    return child
  }
  return "?"
}

export default class Readme extends Component {

  depth = 0

  constructor(props, root) {
    super(props)
    debug("Render Readme")
    this.props = props
    this.renderedChildren = []
  }

  append(child) {
    debug("Append Readme")
    this.renderedChildren.push(child)
  }

  render() {
    debug("Render Readme")
    if (isArray(this.renderedChildren)) {
      return this.renderedChildren.map(child => renderChild(child)).join("\n\n")
    } else {
      return renderChild(this.renderedChildren)
    }
  }

}