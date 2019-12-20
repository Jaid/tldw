import handlebars from "handlebars"
import justHandlebarsHelpers from "just-handlebars-helpers"

import logoHeader from "./helpers/logoHeader"
import shield from "./helpers/shield"

justHandlebarsHelpers.registerHelpers(handlebars)
handlebars.registerHelper("logoHeader", logoHeader)
handlebars.registerHelper("shield", shield)

export default handlebars