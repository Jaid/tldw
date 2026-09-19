import type {SectionContents, SectionLoadResult} from './base/Section.ts'

import flattenString from 'flatten-string'
import * as path from 'forward-slash-path'

import {readOptionalYaml, sortRecord} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'

const escapeCell = (value: string) => value.replaceAll('|', String.raw`\|`).replaceAll(/\r?\n/gu, '<br>')

export class EnvironmentVariablesSection extends HeaderSection {
  readonly id = 'environmentVariables'
  #variables: Record<string, string> | null = null

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const variables = this.#variables
    const entries = Object.entries(sortRecord({
      ...this.context.config.environmentVariables === false ? {} : this.context.config.environmentVariables.values,
      ...variables,
    }))
    const table = entries.length ? flattenString.paragraphs(
      `The following environment variables are read by ${this.context.title}:`,
      flattenString.lines('name|description', '---|---', entries.map(([name, info]) => `${escapeCell(name)}|${escapeCell(info)}`)),
    ) : ''
    return {
      ...contents,
      content: [...contents.content ?? [], ...table ? [table] : []],
    }
  }

  override getPriority() {
    return 120
  }

  override async load(): Promise<SectionLoadResult> {
    const [, variables] = await Promise.all([
      super.load?.(),
      readOptionalYaml<Record<string, string>>(path.join(this.context.args.configDirectory, 'envVars.yml')),
    ])
    this.#variables = variables
    return true
  }
}
