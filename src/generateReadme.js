import camelcase from "camelcase"
import {pascalCase} from "pascal-case"

import handlebars from "lib/handlebars"

import template from "!raw-loader!./template.hbs"

/**
  * @function
  * @param {import("./").Context} context
  * @return {Promise<string>}
  */
export default async context => {

  context.installationCommands = []
  context.description = context.pkg?.description || context.payload.repository?.description
  context.camelCaseName = camelcase(context.pkg.name)
  context.pascalCaseName = pascalCase(context.pkg.name)
  context.globalName = context.pkg?.webpackConfigJaid?.endsWith("Class") ? context.pascalCaseName : context.camelCaseName
  if (context.config.installation === "prod") {
    context.installationCommands.push({
      header: "npm",
      command: `npm install --save ${context.pkg.name}@^${context.pkg.version}`,
    })
    context.installationCommands.push({
      header: "yarn",
      command: `yarn add ${context.pkg.name}@^${context.pkg.version}`,
    })
  }
  if (context.config.installation === "dev") {
    context.installationCommands.push({
      header: "npm",
      command: `npm install --save-dev ${context.pkg.name}@^${context.pkg.version}`,
    })
    context.installationCommands.push({
      header: "yarn",
      command: `yarn add --dev ${context.pkg.name}@^${context.pkg.version}`,
    })
  }
  if (context.config.installation === "global") {
    context.installationCommands.push({
      header: "npm",
      command: `npm install --global ${context.pkg.name}@^${context.pkg.version}`,
    })
    context.installationCommands.push({
      header: "yarn",
      command: `yarn global add ${context.pkg.name}@^${context.pkg.version}`,
    })
  }
  context.webCompatible = context.runtime === "web" || context.runtime === "hybrid"
  const readmeText = handlebars.compile(template)(context)
  return readmeText

}