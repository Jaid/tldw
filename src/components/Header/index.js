import React from "react"
import PropTypes from "prop-types"
import Component from "components/Component"

const prefixes = {
  0: "#",
  1: "##",
  2: "###",
  3: "#####",
  4: "######",
  5: "#######",
  default: "######",
}

export default class Section extends Component {

  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
  }

  static defaultProps = {
    title: "Section",
  }

  render() {
    const parentDepth = this.parent.depth
    const prefix = prefixes[parentDepth + 1] || prefixes.default
    return `${prefix} ${this.props.children}`
  }

}