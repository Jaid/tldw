import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import flattenString from 'flatten-string'

import markdownElements from '#src/lib/markdownElements.ts'

import {readOptionalText} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'

export class LicenseSection extends HeaderSection {
  readonly id = 'license'
  #license: string | null = null

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const license = this.#license
    if (!license) {
      return contents
    }
    let licenseContent: string
    if (license.startsWith('MIT License')) {
      const copyright = license.split(/\r?\n/u).find(line => line.startsWith('Copyright')) ?? license
      const label = this.context.licenseUrl ? markdownElements.link('MIT License', this.context.licenseUrl) : 'MIT License'
      licenseContent = flattenString.lines(`${label}<br>`, copyright.replaceAll('<', String.raw`\<`))
    } else {
      licenseContent = fencen.block(license, {language: 'text'})
    }
    return {
      ...contents,
      content: [...contents.content ?? [], licenseContent],
    }
  }

  override getPriority() {
    return 10
  }

  override async load(): Promise<SectionLoadResult> {
    const [, license] = await Promise.all([
      super.load?.(),
      readOptionalText(this.context.args.licenseFile),
    ])
    this.#license = license
    return true
  }
}
