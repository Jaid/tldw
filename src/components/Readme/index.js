import React from "react"
import Component from "components/Component"
import Text from "components/Text"
import PropTypes from "prop-types"
import {isString, isArray} from "lodash"

const debug = require("debug")(_PKG_NAME)

const renderChild = child => {
  if (isString(child)) {
    return child
  }
  if (child instanceof Text) {
    return child.text
  }
  if (child instanceof React.Component && child.props.children) {
    return child.props.children
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
    return this.renderedChildren.map(child => renderChild(child)).join("\n\n")
  }

}