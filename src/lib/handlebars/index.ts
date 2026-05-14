import Handlebars from 'handlebars'

import escapeMarkdown from './helpers/escapeMarkdown.ts'
import shield from './helpers/shield.ts'

const handlebars = Handlebars.create()
handlebars.registerHelper('shield', shield)
handlebars.registerHelper('escapeMarkdown', escapeMarkdown)

export default handlebars
