import type {TypedOption} from '../config.schema.ts'
import type {UsageOptionEntry, UsageOptions} from '../lib/types.ts'
import type {PropertiesData} from './base/PropertiesSection.ts'
import type {SectionLoadResult} from './base/Section.ts'

import * as path from 'forward-slash-path'

import readUsageOptions from '../lib/readUsageOptions.ts'
import {PropertiesSection} from './base/PropertiesSection.ts'

const toTypedOption = (entry: UsageOptionEntry): TypedOption => {
  const {name, ...definition} = entry
  return {
    id: name,
    ...definition,
  }
}

export class OptionsSection extends PropertiesSection {
  readonly id = 'options'
  #options: UsageOptions | null = null

  override getPriority() {
    return 150
  }

  protected override getProperties(): PropertiesData | null {
    const options = this.#options
    const config = this.context.config.options
    if (!options || config === false) {
      return null
    }
    return {
      entries: options.entries.map(toTypedOption),
      style: config.style,
    }
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
