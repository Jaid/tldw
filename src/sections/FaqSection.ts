import {HeaderSection} from './base/HeaderSection.ts'

export class FaqSection extends HeaderSection {
  readonly id = 'faq'
  override getPriority() {
    return 80
  }

  override getTitle() {
    return 'questions & answers'
  }
}
