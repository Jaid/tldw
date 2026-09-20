import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import flattenString from 'flatten-string'
import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {globby} from 'globby'

import markdownElements from '#src/lib/markdownElements.ts'

import {supportedCodeExtensions} from '../lib/helpers.ts'
import {Section} from './base/Section.ts'

const directSourcePatterns = [
  '*.md',
  'config.yml',
  'config.ts',
  'envVars.yml',
  'usageOptions.yml',
  ...supportedCodeExtensions.flatMap(extension => [
    `example.${extension}`,
    `minimalExample.${extension}`,
    `result.${extension}`,
    `result*.${extension}`,
    `usage.${extension}`,
  ]),
] as const
const nestedSourcePatterns = [
  'screenshots/**/*.*',
  'usage/*.*',
] as const
const formatSourceDirectory = (projectDirectory: string, directory: string) => {
  const relative = path.relative(projectDirectory, directory)
  if (!relative) {
    return '.'
  }
  return relative.startsWith('..') ? relative : `./${relative}`
}

export class GenerationCommentSection extends Section {
  readonly id = 'generationComment'
  #sourceDirectories: Array<string> = []

  override collectContents(): SectionContents {
    const sourceDirectories = flattenString.with(' and ', this.#sourceDirectories)
    const sourceSuffix = sourceDirectories ? ` from ${sourceDirectories}` : ''
    return {
      content: this.context.config.generationComment !== false ? [markdownElements.comment(
        `Readme generated with tldw v${this.context.tldwVersion}${sourceSuffix}`,
        'https://github.com/Jaid/tldw',
      )] : [],
    }
  }

  override async load(): Promise<SectionLoadResult> {
    if (this.context.config.generationComment === false) {
      return false
    }
    this.#sourceDirectories = await this.findSourceDirectories()
    return true
  }

  private async findSourceDirectories() {
    const directories: Array<string> = []
    for (const directory of this.getContentDirectories()) {
      if (!await fs.pathExists(directory)) {
        continue
      }
      const files = await globby([...directSourcePatterns, ...nestedSourcePatterns], {
        caseSensitiveMatch: true,
        cwd: directory,
        onlyFiles: true,
      })
      if (files.length) {
        directories.push(formatSourceDirectory(this.context.projectDirectory, directory))
      }
    }
    for (const file of Object.values(this.context.config.sections)) {
      const absoluteFile = path.resolve(this.context.args.configDirectory, file)
      if (!await fs.pathExists(absoluteFile)) {
        continue
      }
      const contentDirectory = this.getContentDirectories().findLast(directory => {
        const relative = path.relative(directory, absoluteFile)
        return relative !== '..' && !relative.startsWith('../') && !path.isAbsolute(relative)
      })
      const directory = formatSourceDirectory(this.context.projectDirectory, contentDirectory ?? path.dirname(absoluteFile))
      if (!directories.includes(directory)) {
        directories.push(directory)
      }
    }
    return directories
  }
}
