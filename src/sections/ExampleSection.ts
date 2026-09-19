import type {CodeFragment} from '../lib/helpers.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import flattenString from 'flatten-string'
import * as path from 'forward-slash-path'

import {readOptionalCodeFragmentWithMetadata} from '../lib/helpers.ts'
import readExampleResults from '../lib/readExampleResults.ts'
import {HeaderSection} from './base/HeaderSection.ts'
import {sortSectionsByPriority} from './base/Section.ts'
import {ResultSection} from './ResultSection.ts'

export class ExampleSection extends HeaderSection {
  readonly #result = new ResultSection(this.context)
  override readonly children = [this.#result]
  readonly id = 'example'
  #example: CodeFragment | null = null
  #results: Record<string, string> = {}

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const example = this.#example
    const results = this.#results
    const inlineContents = sortSectionsByPriority(this.children.filter(section => section.active)).flatMap(section => section.collectContents().content ?? [])
    const resultVerb = this.context.config.example !== false && this.context.config.example.resultMayVary ? 'will be something like' : 'will be'
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...example ? [fencen.block(example.content, {language: example.extension})] : [],
        ...Object.entries(results).map(([name, content]) => flattenString.paragraphs(
          `Variable ${fencen.inline(name)} ${resultVerb}:`,
          fencen.block(content, {language: 'ts'}),
        )),
        ...inlineContents,
      ],
    }
  }

  override getPriority() {
    return 180
  }

  override async load(): Promise<SectionLoadResult> {
    const [, example, results] = await Promise.all([
      super.load?.(),
      readOptionalCodeFragmentWithMetadata(path.join(this.context.args.configDirectory, 'example')),
      readExampleResults(this.context.args),
    ])
    this.#example = example
    this.#results = results
    return true
  }
}
