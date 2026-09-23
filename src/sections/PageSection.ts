import type {SectionContents} from './base/Section.ts'

import {escapeXml, getLinkHost, toArray} from '../lib/helpers.ts'
import {Section} from './base/Section.ts'

export class PageSection extends Section {
  readonly id = 'page'
  override load = undefined

  override collectContents(): SectionContents {
    const config = this.context.config.page
    if (config === false) {
      return {}
    }
    const links = toArray(config.url).map(url => {
      const label = getLinkHost(url) ?? url
      return `<a href="${escapeXml(url)}">${escapeXml(label)}</a>`
    })
    return {content: [`<center>${links.join(' | ')}</center>`]}
  }

  override getPriority() {
    return 110
  }
}
