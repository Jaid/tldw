import Handlebars from 'handlebars'

import escapeMarkdown from './helpers/escapeMarkdown.ts'
import fence from './helpers/fence.ts'
import shield from './helpers/shield.ts'

const handlebars = Handlebars.create()
handlebars.registerHelper('shield', shield)
handlebars.registerHelper('escapeMarkdown', escapeMarkdown)
handlebars.registerHelper('fence', fence)

export default handlebars
