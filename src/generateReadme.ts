import type {Context} from './lib/types.ts'

import {loadSections} from './sections/loadSections.ts'
import {ReadmeSection} from './sections/ReadmeSection.ts'

export default async (context: Context) => {
  const readme = new ReadmeSection(context)
  await loadSections([readme])
  return readme.active ? readme.render() : ''
}
