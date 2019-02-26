import React from "react"

const debug = require("debug")(_PKG_NAME).extend("component")

export default class Component extends React.Component {

  constructor(props) {
    super(props)
    const name = this.name || this.displayName || this.__proto__.constructor.name
    debug(`Construct ${name} {${Object.keys(props).join(", ")}}`)
  }

}