import type {Context} from '../lib/types.ts'
import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import fencen from 'fencen'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {globby} from 'globby'

import collator from '../lib/collator.ts'
import {readOptionalTerminalScreenshot, readOptionalText, supportedCodeExtensions} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'
import {sortSectionsByPriority} from './base/Section.ts'
import {UsageResultSection} from './UsageResultSection.ts'

interface UsageFile {
  content: string
  extension: string
  screenshot: string | null
}
const supportedCodeExtensionSet = new Set<string>(supportedCodeExtensions)
const readUsageFile = async (context: Context, file: string): Promise<UsageFile | null> => {
  const content = await readOptionalText(file)
  if (content === null) {
    return null
  }
  const extension = path.extname(file).slice(1)
  const stem = file.slice(0, -(extension.length + 1))
  return {
    content,
    extension,
    screenshot: supportedCodeExtensionSet.has(extension) ? await readOptionalTerminalScreenshot(context, stem) : null,
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
        ...this.#files.flatMap(file => {
          if (file.extension === 'md') {
            return [file.content]
          }
          return [
            fencen.block(file.content, {language: file.extension || undefined}),
            ...file.screenshot ? [file.screenshot] : [],
          ]
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
      return files
        .filter(file => !file.endsWith('.ansi.log') && !file.endsWith('.ansi.svg'))
        .toSorted((fileA, fileB) => collator.compare(path.basename(fileA), path.basename(fileB)))
    }))
    const files = await Promise.all([...directFiles, ...nestedFiles.flat()].map(file => readUsageFile(this.context, file)))
    return files.filter((file): file is UsageFile => file !== null)
  }
}
