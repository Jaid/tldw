import React from "react"
import PropTypes from "prop-types"

class A {

  render(props) {
    return `X${props.children}`
  }

}

export default class Readme extends React.Component {

  static propTypes = {
  }

  render() {
    return <A>test</A>
  }

}