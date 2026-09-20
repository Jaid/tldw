import {HeaderSection} from './base/HeaderSection.ts'

export class ApiSection extends HeaderSection {
  readonly id = 'api'

  override getPriority() {
    return 149
  }

  override getTitle() {
    return 'API'
  }
}
