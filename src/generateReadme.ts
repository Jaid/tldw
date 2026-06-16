import type {Context} from './lib/types.ts'

import handlebars from './lib/handlebars/index.ts'
import templateText from './template.hbs' assert {type: 'text'}

let templatePromise: Promise<HandlebarsTemplateDelegate<Context>> | undefined
const getTemplate = () => {
  templatePromise ??= (async () => {
    return handlebars.compile<Context>(templateText)
  })()
  return templatePromise
}

export default async (context: Context) => {
  const template = await getTemplate()
  return template(context)
}
