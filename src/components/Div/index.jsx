import React from "react"
import PropTypes from "prop-types"
import Component from "components/Component"

export default class Div extends Component {

  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    return this.props.children
  }

}