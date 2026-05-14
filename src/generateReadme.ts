import type {Context} from './lib/types.ts'

import handlebars from './lib/handlebars/index.ts'

let templatePromise: Promise<HandlebarsTemplateDelegate<Context>> | undefined
const getTemplate = () => {
  templatePromise ??= (async () => {
    const templateText = await Bun.file(new URL('template.hbs', import.meta.url)).text()
    return handlebars.compile<Context>(templateText)
  })()
  return templatePromise
}

export default async (context: Context) => {
  const template = await getTemplate()
  return template(context)
}
