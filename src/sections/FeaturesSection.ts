import type {SectionContents} from './base/Section.ts'

import markdownElements from '#src/lib/markdownElements.ts'

import {HeaderSection} from './base/HeaderSection.ts'

export class FeaturesSection extends HeaderSection {
  readonly id = 'features'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const config = this.context.config.features
    const features = markdownElements.flexibleList((config === false ? undefined : config.items) ?? this.context.pkg.features ?? [])
    return {
      ...contents,
      content: [...contents.content ?? [], ...features.content ?? []],
      sections: {
        ...contents.sections,
        ...features.sections,
      },
    }
  }

  override getPriority() {
    return 210
  }
}
