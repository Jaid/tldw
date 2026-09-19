import {HeaderSection} from './base/HeaderSection.ts'

export class LegalSection extends HeaderSection {
  readonly id = 'legal'

  override getPriority() {
    return 70
  }
}
