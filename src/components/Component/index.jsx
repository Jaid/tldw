import React from "react"

export default class Component extends React.Component {

  constructor(props) {
    super(props)
    this.children = []
  }

  append(child) {
    this.children.push(child)
  }

  render() {
    return this.children || this.props?.children || ""
  }

}