import {HeaderSection} from './base/HeaderSection.ts'

export class AdvancedUsageSection extends HeaderSection {
  readonly id = 'advancedUsage'

  override getPriority() {
    return 160
  }
}
