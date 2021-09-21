import path from "node:path"

import {parallel as arrayToObjectKeys} from "array-to-object-keys"
import globby from "globby"
import preventEnd from "prevent-end"
import readFileString from "read-file-string"

/**
 * @param {import("src/index").Args} args
 * @return {Promise}
 */
export default async args => {
  const relevantFiles = await globby("result*.js", {
    cwd: args.configDirectory,
    onlyFiles: true,
    caseSensitiveMatch: true,
  })
  const ids = relevantFiles.map(fileName => preventEnd(fileName, ".js"))
  const result = await arrayToObjectKeys(ids, async id => {
    const file = path.join(args.configDirectory, `${id}.js`)
    const text = await readFileString(file)
    return text
  })
  return result
}