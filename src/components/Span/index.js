import React from "react"
import PropTypes from "prop-types"
import Component from "components/Component"

export default class Span extends Component {

  static propTypes = {
    nested: PropTypes.number.isRequired,
    children: PropTypes.node,
  }

  render() {
    return this.props.children
  }

}