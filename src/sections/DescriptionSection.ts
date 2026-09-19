import type {SectionContents} from './base/Section.ts'

import flattenString from 'flatten-string'

import markdownElements from '#src/lib/markdownElements.ts'

import {getLinkHost} from '../lib/helpers.ts'
import {Section} from './base/Section.ts'

export class DescriptionSection extends Section {
  readonly id = 'description'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const {pkg} = this.context
    const config = this.context.config.description
    if (config === false) {
      return {}
    }
    const link = config.link ?? (pkg.domain ? `https://${pkg.domain}` : null)
    const introduction = flattenString.paragraphs(
      pkg.description,
      config.personal && markdownElements.note(
        'This project is tailored to my personal environments and preferences and therefore highly opinionated.',
        'Feel free to use it or get inspired by it, but please do not get frustrated if you come across weird features or difficulties integrating it into your own ecosystem.',
      ),
    )
    const onlineLink = link ? `View online at ${markdownElements.link(config.linkName ?? getLinkHost(link) ?? link, link)}.` : ''
    return {
      ...contents,
      content: [introduction, ...contents.content ?? [], onlineLink].filter(Boolean),
    }
  }
}
