import type {CliArgs} from './types.ts'

import * as path from 'forward-slash-path'
import {globby} from 'globby'

import collator from './collator.ts'
import {getFileStem, readOptionalText, supportedCodeExtensions} from './helpers.ts'

export default async ({configDirectory}: Pick<CliArgs, 'configDirectory'>) => {
  const relevantFiles = await globby(supportedCodeExtensions.map(extension => `result*.${extension}`), {
    cwd: configDirectory,
    onlyFiles: true,
    caseSensitiveMatch: true,
  })
  const ids = [...new Set(relevantFiles.map(getFileStem).filter(id => id !== 'result'))].toSorted((idA, idB) => collator.compare(idA, idB))
  const entries = await Promise.all(ids.map(async id => {
    for (const extension of supportedCodeExtensions) {
      const file = path.join(configDirectory, `${id}.${extension}`)
      const content = await readOptionalText(file)
      if (content !== null) {
        return [id, content] as const
      }
    }
    return null
  }))
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry !== null))
}
