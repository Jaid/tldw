import type {Context} from '../lib/types.ts'
import type {Section, SectionContents, SectionLoadResult} from './base/Section.ts'

import flattenString from 'flatten-string'
import MarkdownMap from 'markdown-map'

import {BannerSection} from './BannerSection.ts'
import {HeaderSection} from './base/HeaderSection.ts'
import {hasSectionContents, normalizeSectionContentHeadings, sortSectionsByPriority} from './base/Section.ts'
import {DescriptionSection} from './DescriptionSection.ts'
import {GenerationCommentSection} from './GenerationCommentSection.ts'
import {createSections} from './index.ts'
import {ShieldsSection} from './ShieldsSection.ts'

export class ReadmeSection extends HeaderSection {
  override readonly children: ReadonlyArray<Section>
  readonly headerSections: ReadonlyArray<HeaderSection>
  readonly id = 'readme'
  readonly inlineSections: ReadonlyArray<Section>
  readonly #banner = new BannerSection(this.context)
  readonly #comment = new GenerationCommentSection(this.context)
  readonly #description = new DescriptionSection(this.context)
  readonly #shields = new ShieldsSection(this.context)

  constructor(context: Context, sections: ReadonlyArray<Section> = createSections(context)) {
    super(context)
    this.headerSections = sections.filter(section => section instanceof HeaderSection)
    this.inlineSections = [this.#description, ...sections.filter(section => !(section instanceof HeaderSection))]
    this.children = [this.#banner, this.#comment, this.#shields, ...this.inlineSections, ...this.headerSections]
  }

  override collectContents(): SectionContents {
    const inlineContent = sortSectionsByPriority(this.inlineSections.filter(section => section.active))
      .map(section => {
        const contents = section.collectContents()
        return hasSectionContents(contents) ? section.renderContents(contents, 2) : null
      })
      .filter((content): content is string => content !== null)
    const entries = this.headerSections.filter(section => section.active).map(section => {
      const contents = normalizeSectionContentHeadings(section.collectContents(), 2)
      return [section.getTitle(), {
        ...contents,
        priority: section.getPriority(),
      }] as const
    })
    const titles = entries.map(([title]) => title)
    const uniqueTitles = new Set(titles)
    if (uniqueTitles.size !== titles.length) {
      throw new Error('README sections must have unique titles.')
    }
    return {
      content: inlineContent,
      sections: Object.fromEntries(entries.filter(([, contents]) => hasSectionContents(contents))),
    }
  }

  override getTitle() {
    return this.context.title
  }

  override async load(): Promise<SectionLoadResult> {
    return true
  }

  override render(): string {
    const contents = this.collectContents()
    const banner = this.#banner.active ? this.#banner.render() : null
    const shields = this.#shields.active ? this.#shields.render() : null
    const comment = this.#comment.active ? this.#comment.render() : null
    const markdown = new MarkdownMap({
      [this.getTitle()]: contents,
    })
    const body = markdown.render() || markdown.render({omitEmpty: false})
    return flattenString.paragraphs(banner, shields, body, comment)
  }
}
