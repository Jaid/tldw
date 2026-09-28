import {HeaderSection} from './base/HeaderSection.ts'

export class RequirementsSection extends HeaderSection {
  readonly id = 'requirements'

  override getPriority() {
    return 196
  }
}
