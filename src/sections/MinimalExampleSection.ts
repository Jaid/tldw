import type {CodeFragment} from '../lib/helpers.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'

import {readOptionalCodeFragmentWithMetadata} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'

export class MinimalExampleSection extends HeaderSection {
  readonly id = 'minimalExample'
  #example: CodeFragment | null = null

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const example = this.#example
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...example ? [fencen.block(example.content, {language: example.extension})] : [],
      ],
    }
  }

  override getPriority() {
    return 181
  }

  override async load(): Promise<SectionLoadResult> {
    const [, example] = await Promise.all([
      super.load?.(),
      readOptionalCodeFragmentWithMetadata(path.join(this.context.args.configDirectory, this.id)),
    ])
    this.#example = example
    return true
  }
}
