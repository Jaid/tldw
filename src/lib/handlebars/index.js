import handlebars from "handlebars"
import justHandlebarsHelpers from "just-handlebars-helpers"

import shield from "./helpers/shield"

justHandlebarsHelpers.registerHelpers(handlebars)
handlebars.registerHelper("shield", shield)

export default handlebars