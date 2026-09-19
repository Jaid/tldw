import type {Context} from '../lib/types.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {HeaderSection} from './base/HeaderSection.ts'

/** An explicitly configured file, never evaluated as executable code. */
export class FileSection extends HeaderSection {
  readonly id: string
  #content = ''
  readonly #file: string
  readonly #original: HeaderSection | undefined

  constructor(context: Context, id: string, file: string, original?: HeaderSection) {
    super(context)
    this.id = id
    this.#file = path.resolve(context.args.configDirectory, file)
    this.#original = original
  }

  override collectContents(): SectionContents {
    return {content: this.#content ? [this.#content] : []}
  }

  override getPriority() {
    return this.#original?.getPriority() ?? super.getPriority()
  }

  override getTitle() {
    return this.#original?.getTitle() ?? super.getTitle()
  }

  override async load(): Promise<SectionLoadResult> {
    const content = await fs.readFile(this.#file, 'utf8')
    const extension = path.extname(this.#file).slice(1).toLowerCase()
    this.#content = extension === 'md' ? content : fencen.block(content, {language: extension || undefined})
    return true
  }
}
