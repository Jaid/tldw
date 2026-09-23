import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import * as path from 'forward-slash-path'

import generateBanner from '../lib/generateBanner.ts'
import {renderSvg} from '../lib/helpers.ts'
import {Section} from './base/Section.ts'

export class BannerSection extends Section {
  readonly id = 'banner'
  #banner: string | null = null

  override collectContents(): SectionContents {
    return {content: this.#banner ? [this.#banner] : []}
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
    const svg = this.getSvg()
    if (!svg) {
      this.#banner = null
      return false
    }
    this.#banner = await renderSvg(this.context, svg, {
      alt: 'Banner',
      file: path.join(this.context.args.configDirectory, 'banner.svg'),
    })
    return true
  }
}
