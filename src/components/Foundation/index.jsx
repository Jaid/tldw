import React from "react"
import Component from "components/Component"
import Section from "components/Section"
import PropTypes from "prop-types"

const debug = require("debug")(_PKG_NAME)

export default class Content extends Component {

  static propTypes = {
    children: PropTypes.node,
  }

  render() {
    debug("Render Foundation", this.props)
    const content = this.props.children && <Section title="Content">{this.props.children}</Section>
    return <Section>hi{content}</Section>
  }

}