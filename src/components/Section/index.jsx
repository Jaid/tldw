import React from "react"
import Component from "components/Component"
import PropTypes from "prop-types"

const debug = require("debug")(_PKG_NAME)

export default class Section extends Component {

  propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
  }

  defaultProps = {
    title: "Section",
  }

  render() {
    const content = this.props.children || ""
    return `## ${this.props.title}\n\n${content}`
  }

}