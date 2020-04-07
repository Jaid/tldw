import ensureObject from "ensure-object"
import hasContent, {isEmpty} from "has-content"
import readFileYaml from "read-file-yaml"

import collator from "lib/collator"

const debug = require("debug")(_PKG_NAME)

function sortEntries(entry1, entry2) {
  if (entry1.required && !entry2.required) {
    return -1
  }
  if (entry2.required && !entry1.required) {
    return 1
  }
  return collator.compare(entry1.name, entry2.name)
}

/**
 * @param {string} file
 * @return {Object}
 */
export default async file => {
  debug(`Reading config from ${file}`)
  const options = await readFileYaml(file) || {}
  if (isEmpty(options)) {
    return null
  }
  const optionEntries = Object.entries(options).map(([name, values]) => {
    return {
      name,
      ...ensureObject(values, "default"),
    }
  })
  optionEntries.sort(sortEntries)
  const optionEntriesValues = Object.values(optionEntries)
  const anyEntryHasType = Boolean(optionEntriesValues.find(option => hasContent(option.type)))
  const anyEntryHasInfo = Boolean(optionEntriesValues.find(option => hasContent(option.info)))
  const anyEntryHasRequired = Boolean(optionEntriesValues.find(option => option.required))
  const anyEntryHasDefault = Boolean(optionEntriesValues.find(option => hasContent(option.default)))
  const usageOptions = {
    entries: optionEntries,
    anyEntryHasType,
    anyEntryHasInfo,
    anyEntryHasRequired,
    anyEntryHasDefault,
  }
  return usageOptions
}