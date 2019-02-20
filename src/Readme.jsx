import React from "react"

export default class Readme extends React.Component {

  render() {
    return this.props?.children || "AKK"
  }

}