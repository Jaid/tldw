import type {SectionContents} from './base/Section.ts'

import markdownElements from '#src/lib/markdownElements.ts'
import sortProps from '#src/lib/sortProps.ts'

import {HeaderSection} from './base/HeaderSection.ts'

export class PropsSection extends HeaderSection {
  readonly id = 'props'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const props = this.context.config.props
    if (props === false) {
      return contents
    }
    const entries = sortProps(props.entries, props.order)
    const rendered = props.style === 'table' ? markdownElements.optionsTable(entries) : markdownElements.optionsList(entries)
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
    return 145
  }
}
