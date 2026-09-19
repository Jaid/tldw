import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import generateBanner from '../lib/generateBanner.ts'
import {Section} from './base/Section.ts'

export class BannerSection extends Section {
  readonly id = 'banner'

  override collectContents(): SectionContents {
    const svg = this.getSvg()
    return {content: svg ? [svg] : []}
  }

  getSvg() {
    const context = this.context
    if (context.config.banner === false) {
      return null
    }
    return generateBanner({
      bottomColor: context.config.banner.bottomColor,
      font: context.config.banner.font,
      text: context.config.banner.text || context.title,
      topColor: context.config.banner.topColor,
    })
  }

  override async load(): Promise<SectionLoadResult> {
    return this.context.config.banner !== false
  }
}
