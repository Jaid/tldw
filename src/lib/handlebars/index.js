import handlebars from "handlebars"
import justHandlebarsHelpers from "just-handlebars-helpers"

import shield from "./helpers/shield"
import escapeMarkdown from "./helpers/escapeMarkdown"

justHandlebarsHelpers.registerHelpers(handlebars)
handlebars.registerHelper("shield", shield)
handlebars.registerHelper("escapeMarkdown", escapeMarkdown)

export default handlebars