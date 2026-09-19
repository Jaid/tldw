import type {SectionContents} from './base/Section.ts'

import camelcase from 'camelcase'
import fencen from 'fencen'
import flattenString from 'flatten-string'

import {renderBuiltinShield} from '../lib/renderShield.ts'
import {HeaderSection} from './base/HeaderSection.ts'

export class TryInBrowserSection extends HeaderSection {
  readonly id = 'tryInBrowser'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const {config, pkg, title} = this.context
    if (config.tryInBrowser === false || config.tryInBrowser === undefined && config.tldw.needsNodeRuntime) {
      return contents
    }
    const globalName = camelcase(pkg.name, {pascalCase: pkg.webpackConfigJaid?.endsWith('Class') ?? false})
    const script = flattenString.lines(
      'const scriptElement = document.createElement("script");',
      'scriptElement.setAttribute("type", "text/javascript");',
      `scriptElement.setAttribute("src", ${JSON.stringify(`https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/index.js`)});`,
      'document.querySelector("head").appendChild(scriptElement);',
    )
    const shield = renderBuiltinShield('web', this.context)
    return {
      ...contents,
      content: [
        ...contents.content ?? [],
        ...shield ? [shield] : [],
        'Open a browser’s JavaScript console and execute:',
        fencen.block(script, {language: 'javascript'}),
        `${title} is now stored in the global variable ${fencen.inline(globalName)}. The following console expression should return something other than ${fencen.inline('"undefined"')}.`,
        fencen.block(`typeof ${globalName}.default`, {language: 'javascript'}),
      ],
    }
  }

  override getPriority() {
    return 140
  }
}
