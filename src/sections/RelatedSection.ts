import {HeaderSection} from './base/HeaderSection.ts'

export class RelatedSection extends HeaderSection {
  readonly id = 'related'

  override getPriority() {
    return 90
  }
}
