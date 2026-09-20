import type {OptionsEntries} from '#src/lib/markdownElements.ts'
import type {SectionContents} from './Section.ts'

import markdownElements from '#src/lib/markdownElements.ts'

import {HeaderSection} from './HeaderSection.ts'

export interface PropertiesData {
  entries: OptionsEntries
  objects?: Readonly<Record<string, OptionsEntries>>
  style: 'list' | 'table'
}

export abstract class PropertiesSection extends HeaderSection {
  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const properties = this.getProperties()
    if (!properties) {
      return contents
    }
    const rendered = this.renderEntries(properties.entries, properties.style)
    const sections = {
      ...contents.sections,
      ...rendered.sections,
      ...Object.fromEntries(Object.entries(properties.objects ?? {}).map(([title, entries]) => [
        title,
        this.renderEntries(entries, properties.style),
      ])),
    }
    return {
      ...contents,
      content: [...contents.content ?? [], ...rendered.content ?? []],
      sections,
    }
  }

  protected abstract getProperties(): PropertiesData | null

  protected normalizeEntries(entries: OptionsEntries): OptionsEntries {
    return entries
  }

  private renderEntries(entries: OptionsEntries, style: PropertiesData['style']) {
    const normalizedEntries = this.normalizeEntries(entries)
    return style === 'table' ? markdownElements.optionsTable(normalizedEntries) : markdownElements.optionsList(normalizedEntries)
  }
}
