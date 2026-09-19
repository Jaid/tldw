import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {globby} from 'globby'

import markdownElements from '../lib/markdownElements.ts'
import {HeaderSection} from './base/HeaderSection.ts'

const supportedScreenshotExtensions = ['avif', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'] as const
const screenshotCollator = new Intl.Collator(undefined, {numeric: true})
interface Screenshot {
  alt: string
  source: string
}
const getAltText = (file: string) => {
  return path.basename(file, path.extname(file)).replaceAll(/[-_]+/gu, ' ')
}
const getMarkdownSource = (projectDirectory: string, file: string) => {
  return path.relative(projectDirectory, file).split('/').map(part => encodeURIComponent(part)).join('/')
}

export class ScreenshotsSection extends HeaderSection {
  readonly id = 'screenshots'
  #screenshots: Array<Screenshot> = []

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...this.#screenshots.map(screenshot => markdownElements.image(screenshot.alt, screenshot.source)),
      ],
    }
  }

  override getPriority() {
    return 215
  }

  override async load(): Promise<SectionLoadResult> {
    const [, screenshots] = await Promise.all([
      super.load?.(),
      this.loadScreenshots(),
    ])
    this.#screenshots = screenshots
    return true
  }

  private async loadScreenshots(): Promise<Array<Screenshot>> {
    const screenshots: Array<Screenshot> = []
    for (const contentDirectory of this.getContentDirectories()) {
      const screenshotDirectory = path.join(contentDirectory, 'screenshots')
      if (!await fs.pathExists(screenshotDirectory)) {
        continue
      }
      const files = await globby(`**/*.{${supportedScreenshotExtensions.join(',')}}`, {
        absolute: true,
        caseSensitiveMatch: false,
        cwd: screenshotDirectory,
        onlyFiles: true,
      })
      for (const file of files.toSorted((fileA, fileB) => screenshotCollator.compare(
        path.relative(screenshotDirectory, fileA),
        path.relative(screenshotDirectory, fileB),
      ))) {
        screenshots.push({
          alt: getAltText(file),
          source: getMarkdownSource(this.context.projectDirectory, file),
        })
      }
    }
    return screenshots
  }
}
