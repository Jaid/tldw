import type {Context} from '../../lib/types.ts'

import * as path from 'forward-slash-path'
import MarkdownMap from 'markdown-map'

import {sectionSchemas} from '../../config.schema.ts'
import {readOptionalText} from '../../lib/helpers.ts'

export type SectionContents = NonNullable<ReturnType<MarkdownMap['get']>>
export type SectionLoadResult = boolean | undefined

interface MarkdownHeading {
  hashes: string
  indent: string
  lineIndex: number
}

export const hasSectionContents = (contents: SectionContents): boolean => {
  return contents.content?.some(content => content.trim().length > 0) || Object.values(contents.sections ?? {}).some(hasSectionContents)
}

export const sortSectionsByPriority = <SectionType extends Section>(sections: ReadonlyArray<SectionType>): Array<SectionType> => {
  return sections.toSorted((sectionA, sectionB) => sectionB.getPriority() - sectionA.getPriority())
}

const normalizeMarkdownHeadingDepth = (markdown: string, targetDepth: number) => {
  const lines = markdown.replaceAll(/\r\n?/gu, '\n').split('\n')
  const headings: Array<MarkdownHeading> = []
  let fence: {
    character: string
    length: number
  } | undefined
  for (const [lineIndex, line] of lines.entries()) {
    const possibleFence = /^ {0,3}(?<marker>`{3,}|~{3,})/u.exec(line)?.groups?.marker
    if (fence) {
      if (possibleFence?.[0] === fence.character && possibleFence.length >= fence.length && /^ {0,3}(?:`+|~+)[\t ]*$/u.test(line)) {
        fence = undefined
      }
      continue
    }
    if (possibleFence) {
      fence = {
        character: possibleFence[0],
        length: possibleFence.length,
      }
      continue
    }
    const heading = /^(?<indent> {0,3})(?<hashes>#{1,6})[\t ].+/u.exec(line)?.groups
    if (heading?.hashes) {
      headings.push({
        hashes: heading.hashes,
        indent: heading.indent,
        lineIndex,
      })
    }
  }
  if (!headings.length) {
    return markdown
  }
  const minimumDepth = Math.min(...headings.map(heading => heading.hashes.length))
  const maximumDepth = Math.max(...headings.map(heading => heading.hashes.length))
  const depthOffset = targetDepth - minimumDepth
  if (targetDepth < 1 || maximumDepth + depthOffset > 6) {
    throw new TypeError(`Markdown heading hierarchy cannot fit below heading level ${targetDepth - 1}.`)
  }
  for (const heading of headings) {
    const depth = heading.hashes.length + depthOffset
    lines[heading.lineIndex] = lines[heading.lineIndex].replace(
      `${heading.indent}${heading.hashes}`,
      () => `${heading.indent}${'#'.repeat(depth)}`,
    )
  }
  return lines.join('\n')
}

export const normalizeSectionContentHeadings = (contents: SectionContents, sectionDepth: number): SectionContents => {
  return {
    ...contents,
    content: contents.content?.map(content => normalizeMarkdownHeadingDepth(content, sectionDepth + 1)),
    sections: contents.sections && Object.fromEntries(Object.entries(contents.sections).map(([title, childContents]) => {
      return [title, normalizeSectionContentHeadings(childContents, sectionDepth + 1)]
    })),
  }
}

export abstract class Section {
  active = true
  readonly children: ReadonlyArray<Section> = []
  protected readonly context: Context
  abstract readonly id: string
  #markdown: Array<string> = []

  constructor(context: Context) {
    this.context = context
  }

  collectContents(): SectionContents {
    return {content: [...this.#markdown]}
  }

  getContentDirectories() {
    return [...new Set([
      path.resolve(this.context.projectDirectory, 'docs'),
      path.resolve(this.context.args.configDirectory),
    ])]
  }

  getMarkdownFiles() {
    return this.getContentDirectories().map(directory => path.join(directory, `${this.id}.md`))
  }

  /** Higher priorities render first among sibling sections; equal priorities retain registration order. */
  getPriority(): number {
    return 100
  }

  isEnabled(): boolean {
    const config: Record<string, unknown> = this.context.config
    return !Object.hasOwn(sectionSchemas, this.id) || config[this.id] !== false
  }

  async load?(): Promise<SectionLoadResult> {
    const content = await Promise.all(this.getMarkdownFiles().map(readOptionalText))
    this.#markdown = content.filter((entry): entry is string => entry !== null && entry.trim().length > 0)
    return true
  }

  render(): string | null {
    if (!this.active) {
      return null
    }
    const contents = this.collectContents()
    return hasSectionContents(contents) ? this.renderContents(contents) : null
  }

  renderContents(contents: SectionContents, startDepth = 1) {
    const normalizedContents = normalizeSectionContentHeadings(contents, startDepth - 1)
    const markdown = new MarkdownMap({[this.id]: normalizedContents})
    return markdown.renderSection(this.id, {
      header: false,
      startDepth,
    })
  }
}
