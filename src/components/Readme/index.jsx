import React from "react"
import Component from "components/Component"

const debug = require("debug")(_PKG_NAME)

export default class Readme extends Component {

  render() {
    debug("Render Readme", ...arguments, this.props?.children)
    return this.children.join("+")
  }

}