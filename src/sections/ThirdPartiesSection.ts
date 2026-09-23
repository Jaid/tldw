import {HeaderSection} from './base/HeaderSection.ts'

export class ThirdPartiesSection extends HeaderSection {
  readonly id = 'thirdParties'

  override getPriority() {
    return 0
  }
}
