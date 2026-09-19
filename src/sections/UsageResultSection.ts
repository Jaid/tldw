import type {CodeFragment} from '../lib/helpers.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'

import {readOptionalCodeFragmentWithMetadata} from '../lib/helpers.ts'
import {Section} from './base/Section.ts'

export class UsageResultSection extends Section {
  readonly id = 'usageResult'
  #result: CodeFragment | null = null

  override collectContents(): SectionContents {
    const result = this.#result
    return {
      content: result ? [
        this.context.config.usage !== false && this.context.config.usage.resultMayVary ? 'The result will be something like:' : 'The result will be:',
        fencen.block(result.content, {language: result.extension}),
      ] : [],
    }
  }

  override async load(): Promise<SectionLoadResult> {
    this.#result = await readOptionalCodeFragmentWithMetadata(path.join(this.context.args.configDirectory, 'result'))
    return this.#result !== null
  }
}
