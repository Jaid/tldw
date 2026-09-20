import {HeaderSection} from './base/HeaderSection.ts'

export class ArchitectureSection extends HeaderSection {
  readonly id = 'architecture'

  override getPriority() {
    return 30
  }
}
