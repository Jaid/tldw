import React from "react"
import PropTypes from "prop-types"

class R {

  render(props) {
    return `X${props.children}`
  }

}

export default class Readme extends React.Component {

  static propTypes = {
  }

  render() {
    return <R>test</R>
  }

}