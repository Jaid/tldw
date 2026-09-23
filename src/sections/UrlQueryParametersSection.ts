import {HeaderSection} from './base/HeaderSection.ts'

export class UrlQueryParametersSection extends HeaderSection {
  readonly id = 'urlQueryParameters'

  override getPriority() {
    return 125
  }

  override getTitle() {
    return 'URL query parameters'
  }
}
