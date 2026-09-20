import type {SectionContents} from './base/Section.ts'

import flattenString from 'flatten-string'

import {hasContent} from '../lib/helpers.ts'
import {renderConfiguredShield} from '../lib/renderShield.ts'
import {Section} from './base/Section.ts'

export class ShieldsSection extends Section {
  readonly id = 'shields'
  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const {config, pkg} = this.context
    if (config.shields === false) {
      return contents
    }
    const lines = config.shields.items ?? [[
      'npmLatest',
      ...hasContent(pkg.license) ? ['license'] : [],
    ]]
    const content = lines.map(line => {
      const entries = Array.isArray(line) ? line : [line]
      const shields = flattenString.spaced(entries.map(entry => renderConfiguredShield(entry, this.context)))
      return shields ? `<center>${shields}</center>` : ''
    }).filter(Boolean)
    return {
      ...contents,
      content: [...content, ...contents.content ?? []],
    }
  }
}
