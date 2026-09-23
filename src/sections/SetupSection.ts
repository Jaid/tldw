import {HeaderSection} from './base/HeaderSection.ts'

export class SetupSection extends HeaderSection {
  readonly id = 'setup'

  override getPriority() {
    return 195
  }
}
