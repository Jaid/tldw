import React from "react"
import Component from "components/Component"
import PropTypes from "prop-types"

const debug = require("debug")(_PKG_NAME)

export default class Section extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    title: "Section",
  }

  static increaseDepth = 1

  render() {
    return <Container><header>{this.props.title}</header>{this.props.children}</Container>
  }

}