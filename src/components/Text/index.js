import React from "react"
import Component from "components/Component"
import PropTypes from "prop-types"


const debug = require("debug")(_PKG_NAME)

export default class Text {

  constructor(props, context) {
    this.text = props.text
  }

  render() {
    debug("Render text")
    return toString()
  }

  toString() {
    debug("toString text")
    return this.text
  }

}