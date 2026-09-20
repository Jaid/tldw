import type {SectionContents} from './base/Section.ts'

import fencen from 'fencen'

import {getDefaultBinName} from '../lib/helpers.ts'
import {HeaderSection} from './base/HeaderSection.ts'

export class CliUsageSection extends HeaderSection {
  readonly id = 'cliUsage'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const {pkg} = this.context
    const config = this.context.config.cliUsage
    if (config === false) {
      return {}
    }
    const installation = this.context.config.installation
    const configuredBinName = config.binName ?? (installation && installation.type === 'global')
    const binName = configuredBinName === true ? getDefaultBinName(pkg) : configuredBinName
    if (!binName) {
      return contents
    }
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        `After installing package ${fencen.inline(pkg.name)} globally, you can use its command line interface.`,
        fencen.block(config.example || binName, {language: 'sh'}),
        'Or run it without installing it globally:',
        fencen.block(`bunx ${pkg.name}`, {language: 'sh'}),
        'For usage instructions:',
        fencen.block(`${binName} --help`, {language: 'sh'}),
      ],
    }
  }

  override getPriority() {
    return 130
  }

  override getTitle() {
    return 'CLI usage'
  }
}
