import type {TypedOption} from '../config.schema.ts'
import type {UsageOptionEntry, UsageOptions} from '../lib/types.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import * as path from 'forward-slash-path'

import markdownElements from '#src/lib/markdownElements.ts'

import readUsageOptions from '../lib/readUsageOptions.ts'
import {HeaderSection} from './base/HeaderSection.ts'

const formatDefault = (value: unknown) => {
  if (typeof value === 'string') {
    return value || '""'
  }
  if (value === undefined) {
    return
  }
  return JSON.stringify(value)
}
const toTypedOption = (entry: UsageOptionEntry): TypedOption => {
  return {
    id: entry.name,
    ...entry.type === undefined ? {} : {type: entry.type},
    ...Object.hasOwn(entry, 'default') ? {default: formatDefault(entry.default)} : {},
    ...entry.info === undefined ? {} : {info: entry.info},
    ...entry.required === undefined ? {} : {required: entry.required},
  }
}

export class OptionsSection extends HeaderSection {
  readonly id = 'options'
  #options: UsageOptions | null = null

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const options = this.#options
    const config = this.context.config.options
    if (!options || config === false) {
      return contents
    }
    const entries = options.entries.map(toTypedOption)
    const rendered = config.style === 'list' ? markdownElements.optionsList(entries) : markdownElements.optionsTable(entries)
    return {
      ...contents,
      content: [...contents.content ?? [], ...rendered.content ?? []],
      sections: {
        ...contents.sections,
        ...rendered.sections,
      },
    }
  }

  override getPriority() {
    return 150
  }

  override async load(): Promise<SectionLoadResult> {
    const [, options] = await Promise.all([
      super.load?.(),
      readUsageOptions(path.join(this.context.args.configDirectory, 'usageOptions.yml'), this.context.projectDirectory),
    ])
    this.#options = options
    return true
  }
}
