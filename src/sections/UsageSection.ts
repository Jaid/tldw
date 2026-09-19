import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {globby} from 'globby'

import collator from '../lib/collator.ts'
import {readOptionalText, supportedCodeExtensions} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'
import {sortSectionsByPriority} from './base/Section.ts'
import {UsageResultSection} from './UsageResultSection.ts'

interface UsageFile {
  content: string
  extension: string
}
const readUsageFile = async (file: string): Promise<UsageFile | null> => {
  const content = await readOptionalText(file)
  return content === null ? null : {
    content,
    extension: path.extname(file).slice(1),
  }
}

export class UsageSection extends HeaderSection {
  readonly #result = new UsageResultSection(this.context)
  override readonly children = [this.#result]
  readonly id = 'usage'
  #files: Array<UsageFile> = []

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const inlineContents = sortSectionsByPriority(this.children.filter(section => section.active)).flatMap(section => section.collectContents().content ?? [])
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...this.#files.map(file => {
          return file.extension === 'md' ? file.content : fencen.block(file.content, {language: file.extension || undefined})
        }),
        ...inlineContents,
      ],
    }
  }

  override getPriority() {
    return 170
  }

  override async load(): Promise<SectionLoadResult> {
    const [, files] = await Promise.all([super.load?.(), this.readFiles()])
    this.#files = files
    return true
  }

  private async readFiles(): Promise<Array<UsageFile>> {
    const directories = this.getContentDirectories()
    const directFiles = directories.flatMap(directory => {
      return supportedCodeExtensions.map(extension => path.join(directory, `usage.${extension}`))
    })
    const nestedFiles = await Promise.all(directories.map(async directory => {
      const usageDirectory = path.join(directory, 'usage')
      if (!await fs.pathExists(usageDirectory)) {
        return []
      }
      const files = await globby('*.*', {
        absolute: true,
        caseSensitiveMatch: true,
        cwd: usageDirectory,
        onlyFiles: true,
      })
      return files.toSorted((fileA, fileB) => collator.compare(path.basename(fileA), path.basename(fileB)))
    }))
    const files = await Promise.all([...directFiles, ...nestedFiles.flat()].map(readUsageFile))
    return files.filter((file): file is UsageFile => file !== null)
  }
}
