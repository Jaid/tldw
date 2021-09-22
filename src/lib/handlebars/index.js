import handlebars from "handlebars"
import justHandlebarsHelpers from "just-handlebars-helpers"

import escapeMarkdown from "./helpers/escapeMarkdown.js"
import shield from "./helpers/shield.js"

justHandlebarsHelpers.registerHelpers(handlebars)
handlebars.registerHelper("shield", shield)
handlebars.registerHelper("escapeMarkdown", escapeMarkdown)

export default handlebars