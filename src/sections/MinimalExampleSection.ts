import type {CodeFragment} from '../lib/helpers.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'

import {readOptionalCodeFragmentWithMetadata, readOptionalTerminalScreenshot} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'

export class MinimalExampleSection extends HeaderSection {
  readonly id = 'minimalExample'
  #example: CodeFragment | null = null
  #screenshot: string | null = null

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const example = this.#example
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...example ? [
          fencen.block(example.content, {language: example.extension}),
          ...this.#screenshot ? [this.#screenshot] : [],
        ] : [],
      ],
    }
  }

  override getPriority() {
    return 211
  }

  override async load(): Promise<SectionLoadResult> {
    const stem = path.join(this.context.args.configDirectory, this.id)
    const [, example] = await Promise.all([
      super.load?.(),
      readOptionalCodeFragmentWithMetadata(stem),
    ])
    this.#example = example
    this.#screenshot = example ? await readOptionalTerminalScreenshot(this.context, stem) : null
    return true
  }
}
