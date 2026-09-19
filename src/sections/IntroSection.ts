import {HeaderSection} from './base/HeaderSection.ts'

export class IntroSection extends HeaderSection {
  readonly id = 'intro'

  override getPriority() {
    return 220
  }
}
