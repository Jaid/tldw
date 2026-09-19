import type {SectionContents} from './Section.ts'

import MarkdownMap from 'markdown-map'

import {normalizeSectionContentHeadings, Section} from './Section.ts'

export abstract class HeaderSection extends Section {
  getTitle() {
    return this.id.replaceAll(/(?<=[\da-z])(?=[A-Z])/gu, ' ').toLowerCase()
  }

  override renderContents(contents: SectionContents, startDepth = 2) {
    const normalizedContents = normalizeSectionContentHeadings(contents, startDepth)
    return MarkdownMap.render({
      [this.getTitle()]: {
        ...normalizedContents,
        priority: this.getPriority(),
      },
    }, {startDepth})
  }
}
