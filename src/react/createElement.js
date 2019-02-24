import Readme from "components/Readme"
import Text from "components/Text"
import Section from "components/Section"
import Foundation from "components/Foundation"
import Header from "components/Header"
import Div from "components/Div"

const debug = require("debug")(`${_PKG_NAME}:render`)

export default (type, props, context) => {
  debug("createElement %s %j", type, context)

  const components = {
    root: Readme,
    text: Text,
    section: Section,
    foundation: Foundation,
    header: Header,
    div: Div,
  }

  const TypeClass = components[type]
  if (TypeClass?.constructor) {
    return new TypeClass(props, context)
  }

  throw new Error(`No native tldw component "${type}"`)
}