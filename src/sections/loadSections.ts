import type {Section} from './base/Section.ts'

/** Load the entire section graph before any content collection or rendering. */
export const loadSections = async <SectionType extends Section>(roots: ReadonlyArray<SectionType>): Promise<Array<SectionType>> => {
  const sections = new Set<Section>
  const visit = (section: Section) => {
    if (!section.active || sections.has(section)) {
      return
    }
    if (!section.isEnabled()) {
      section.active = false
      return
    }
    sections.add(section)
    for (const child of section.children) {
      visit(child)
    }
  }
  for (const root of roots) {
    visit(root)
  }
  await Promise.all([...sections].map(async section => {
    if (await section.load?.() === false) {
      section.active = false
    }
  }))
  return roots.filter(section => section.active)
}
