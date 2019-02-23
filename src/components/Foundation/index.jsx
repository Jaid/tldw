import React from "react"
import Component from "components/Component"

const debug = require("debug")(_PKG_NAME)

export default class Foundation extends Component {

  render() {
    debug("Render Foundation", this.props)
    return `akki${this.props?.children || "AKK2"}`
  }

}