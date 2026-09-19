import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import flattenString from 'flatten-string'

import {hasContent} from '../lib/helpers.ts'
import {renderConfiguredShield} from '../lib/renderShield.ts'
import {Section} from './base/Section.ts'

export class ShieldsSection extends Section {
  readonly id = 'shields'
  override collectContents(): SectionContents {
    const {config, isBunProject, pkg} = this.context
    if (config.shields === false) {
      return {}
    }
    const lines = config.shields.items ?? [[
      'npmLatest',
      ...hasContent(pkg.license) ? ['license'] : [],
      ...isBunProject ? ['bun'] : [],
    ]]
    const content = lines.map(line => {
      const entries = Array.isArray(line) ? line : [line]
      const shields = flattenString.spaced(entries.map(entry => renderConfiguredShield(entry, this.context)))
      return shields ? `<center>${shields}</center>` : ''
    }).filter(Boolean)
    return {content}
  }

  override async load(): Promise<SectionLoadResult> {
    return true
  }
}
