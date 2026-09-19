import {HeaderSection} from './base/HeaderSection.ts'

export class WarningSection extends HeaderSection {
  readonly id = 'warning'

  override getPriority() {
    return 190
  }
}
