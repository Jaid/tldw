import type {SectionContents} from './base/Section.ts'

import fencen from 'fencen'
import flattenString from 'flatten-string'
import * as path from 'forward-slash-path'

import {HeaderSection} from './base/HeaderSection.ts'

interface DevelopmentScript {
  name: string
  script: string
}

export class DevelopmentSection extends HeaderSection {
  readonly id = 'development'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    return {
      ...contents,
      sections: Object.fromEntries(this.getScripts().map(({name, script}) => [name, {content: [fencen.block(script, {language: 'sh'})]}])),
    }
  }

  override getPriority() {
    return 20
  }

  getScripts(): Array<DevelopmentScript> {
    const {pkg, slug} = this.context
    const repositoryDirectory = path.basename(slug)
    const packageDirectory = typeof pkg.repository === 'object' ? pkg.repository.directory : undefined
    const developmentDirectory = packageDirectory ? path.join(repositoryDirectory, packageDirectory) : repositoryDirectory
    const developmentScripts: Array<DevelopmentScript> = [
      {
        name: 'setting up',
        script: flattenString.lines(
          `git clone git@github.com:${slug}.git`,
          `cd ${developmentDirectory}`,
          'bun install',
        ),
      },
    ]
    if (pkg.scripts?.lint) {
      developmentScripts.push({
        name: 'linting',
        script: 'bun run lint',
      })
    }
    if (pkg.scripts?.typecheck) {
      developmentScripts.push({
        name: 'type checking',
        script: 'bun run typecheck',
      })
    }
    if (pkg.scripts?.test) {
      developmentScripts.push({
        name: 'testing',
        script: 'bun run test',
      })
    }
    if (pkg.scripts?.['test:dev']) {
      developmentScripts.push({
        name: 'testing in development environment',
        script: 'bun run test:dev',
      })
    }
    return developmentScripts
  }
}
