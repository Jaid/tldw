import type {OptionsEntries} from '#src/lib/markdownElements.ts'
import type {PropertiesData} from './base/PropertiesSection.ts'

import sortProps from '#src/lib/sortProps.ts'

import {PropertiesSection} from './base/PropertiesSection.ts'

export class PropsSection extends PropertiesSection {
  readonly id = 'props'

  override getPriority() {
    return 145
  }

  protected override getProperties(): PropertiesData | null {
    const props = this.context.config.props
    if (props === false) {
      return null
    }
    return {
      entries: props.entries,
      objects: props.objects,
      style: props.style,
    }
  }

  protected override normalizeEntries(entries: OptionsEntries) {
    const props = this.context.config.props
    return props === false ? entries : sortProps(entries, props.order)
  }
}
