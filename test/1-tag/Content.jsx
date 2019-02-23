import React from "react"
import PropTypes from "prop-types"

const debug = require("debug")(_PKG_NAME)

export default class Content extends React.Component {

  static propTypes = {
  }

  render() {
    return "hello!"
  }

}