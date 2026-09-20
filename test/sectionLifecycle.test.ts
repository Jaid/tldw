import type {Config, Context} from '../src/lib/types.ts'
import type {SectionContents, SectionLoadResult} from '../src/sections/base/Section.ts'

import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {stringify} from 'yaml'

import {createReadmeContext} from '../src/index.ts'
import {HeaderSection} from '../src/sections/base/HeaderSection.ts'
import {Section} from '../src/sections/base/Section.ts'
import {ExampleSection} from '../src/sections/ExampleSection.ts'
import {loadSections} from '../src/sections/loadSections.ts'
import {NotesSection} from '../src/sections/NotesSection.ts'
import {ReadmeSection} from '../src/sections/ReadmeSection.ts'
import {UsageSection} from '../src/sections/UsageSection.ts'

const directories: Array<string> = []
const makeContext = async (config: Partial<Config> = {}): Promise<Context> => {
  const projectDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-lifecycle-'))
  directories.push(projectDirectory)
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const args = {
    configDirectory,
    licenseFile: path.join(projectDirectory, 'license.txt'),
    outputFile: path.join(projectDirectory, 'readme.md'),
    packageFile: path.join(projectDirectory, 'package.json'),
  }
  await fs.writeJson(args.packageFile, {
    name: 'lifecycle-fixture',
    version: '1.0.0',
    description: 'Lifecycle fixture.',
    repository: 'github:example/lifecycle-fixture',
  })
  await fs.outputFile(path.join(configDirectory, 'config.yml'), stringify({
    generationComment: false,
    ...config,
  }))
  const context = await createReadmeContext(args)
  if (!context) {
    throw new Error('Fixture context was skipped.')
  }
  return context
}
afterAll(async () => {
  await Promise.all(directories.map(directory => fs.remove(directory)))
})
test('render and collectContents are synchronous after loading Markdown', async () => {
  const context = await makeContext()
  const file = path.join(context.args.configDirectory, 'notes.md')
  await fs.outputFile(file, 'Loaded notes.')
  const section = new NotesSection(context)
  await loadSections([section])
  await fs.remove(file)
  const contents: SectionContents = section.collectContents()
  const output: string | null = section.render()
  expect(contents).toEqual({content: ['Loaded notes.']})
  expect(output).toBe('## notes\n\nLoaded notes.')
  expect(section.render()).toBe(output)
})
test('a full document renders from cached files without any project-folder reads', async () => {
  const context = await makeContext({
    banner: true,
    installation: {type: 'development'},
    generationComment: true,
  })
  const files = {
    'description.md': 'Loaded introduction.',
    'usage.md': 'Usage introduction.',
    'usage.ts': 'const usage = 1',
    'usage/extra.json': '{"usage":true}',
    'example.ts': 'const example = 2',
    'result.js': '3',
    'resultAlpha.ts': '4',
    'result.md': 'Example result notes.',
    'usageOptions.yml': 'enabled:\n  default: false',
    'envVars.yml': 'TOKEN: Loaded environment variable.',
  }
  await Promise.all(Object.entries(files).map(([file, text]) => fs.outputFile(path.join(context.args.configDirectory, file), text)))
  await fs.outputFile(context.args.licenseFile, 'Custom loaded license.')
  const readme = new ReadmeSection(context)
  await loadSections([readme])
  const firstOutput = readme.render()
  await fs.remove(context.projectDirectory)
  const secondOutput: string = readme.render()
  expect(secondOutput).toBe(firstOutput)
  for (const text of ['Loaded introduction.', 'const usage = 1', '{"usage":true}', 'const example = 2', 'Example result notes.', 'The result will be:', '`enabled` | `false`', 'Loaded environment variable.', 'Custom loaded license.', 'readme generated with tldw v']) {
    expect(secondOutput).toContain(text)
  }
})
test('top-level and nested load hooks start in parallel before collection or priorities', async () => {
  const gate = Promise.withResolvers<void>()
  const started: Array<string> = []
  const finished = new Set<string>
  const collected: Array<string> = []
  class GatedSection extends HeaderSection {
    override readonly children: ReadonlyArray<Section>
    readonly id: string

    constructor(context: Context, id: string, children: ReadonlyArray<Section> = []) {
      super(context)
      this.id = id
      this.children = children
    }

    override collectContents(): SectionContents {
      expect(finished.size).toBe(3)
      collected.push(this.id)
      return {content: [this.id, ...this.children.filter(section => section.active).map(section => section.render() ?? '')]}
    }

    override getPriority() {
      expect(finished.size).toBe(3)
      return 100
    }

    override async load(): Promise<SectionLoadResult> {
      started.push(this.id)
      await gate.promise
      finished.add(this.id)
      return true
    }
  }
  const context = await makeContext()
  const leaf = new GatedSection(context, 'leaf')
  const parent = new GatedSection(context, 'parent', [leaf])
  const sibling = new GatedSection(context, 'sibling')
  const readme = new ReadmeSection(context, [parent, sibling])
  const loading = loadSections([readme])
  try {
    expect(started).toEqual(['parent', 'leaf', 'sibling'])
    expect(collected).toEqual([])
  } finally {
    gate.resolve()
  }
  await loading
  expect(collected).toEqual([])
  const output = readme.render()
  expect(output).toContain('## parent')
  expect(output).toContain('## sibling')
  expect(collected).toEqual(['parent', 'leaf', 'sibling'])
})
test('missing hooks, undefined and true all keep sections active', async () => {
  class StaticSection extends HeaderSection {
    readonly id = 'static'
    override load = undefined

    override collectContents(): SectionContents {
      return {content: ['No loading needed.']}
    }

    override getTitle() {
      return 'Static'
    }
  }
  class UndefinedSection extends HeaderSection {
    readonly id = 'undefined'

    override collectContents(): SectionContents {
      return {content: ['Undefined keeps this active.']}
    }

    override getTitle() {
      return 'Undefined'
    }

    override async load(): Promise<undefined> {}
  }
  class TrueSection extends HeaderSection {
    readonly id = 'true'

    override collectContents(): SectionContents {
      return {content: ['True keeps this active.']}
    }

    override getTitle() {
      return 'True'
    }

    override async load() {
      return true
    }
  }
  const context = await makeContext()
  const sections = [new StaticSection(context), new UndefinedSection(context), new TrueSection(context)]
  const active = await loadSections(sections)
  expect(active).toEqual(sections)
  const readme = new ReadmeSection(context, sections)
  await loadSections([readme])
  const output = readme.render()
  expect(output).toContain('## Static')
  expect(output).toContain('## Undefined')
  expect(output).toContain('## True')
})
test('false prevents every later method and title lookup on the section', async () => {
  const calls: Array<string> = []
  class DisabledSection extends HeaderSection {
    readonly id = 'disabled'

    override collectContents(): SectionContents {
      throw new Error('Contents must not be collected.')
    }

    override getPriority(): number {
      throw new Error('Priority must not be read.')
    }

    override getTitle(): string {
      throw new Error('Title must not be read.')
    }

    override async load() {
      calls.push('load')
      return false
    }

    override render(): string {
      throw new Error('Section must not render.')
    }

    override renderContents(): string {
      throw new Error('Contents must not render.')
    }
  }
  const context = await makeContext()
  await fs.outputFile(path.join(context.args.configDirectory, 'notes.md'), 'Still active.')
  const disabled = new DisabledSection(context)
  const readme = new ReadmeSection(context, [disabled, new NotesSection(context)])
  await loadSections([readme])
  expect(disabled.active).toBeFalse()
  expect(readme.render()).toContain('## notes\n\nStill active.')
  await loadSections([readme])
  expect(readme.render()).toContain('Still active.')
  expect(calls).toEqual(['load'])
})
test('disabled roots are filtered before callers render them', async () => {
  class DisabledReadme extends ReadmeSection {
    override async load() {
      return false
    }

    override render(): string {
      throw new Error('Disabled root must not render.')
    }
  }
  const readme = new DisabledReadme(await makeContext())
  const active = await loadSections([readme])
  expect(active.map(section => section.render())).toEqual([])
  expect(readme.active).toBeFalse()
})
test('disabled inline and result children never collect or render', async () => {
  const context = await makeContext({
    banner: true,
    generationComment: true,
  })
  await fs.outputFile(path.join(context.args.configDirectory, 'usage.md'), 'Usage remains.')
  await fs.outputFile(path.join(context.args.configDirectory, 'example.md'), 'Example remains.')
  const usage = new UsageSection(context)
  const example = new ExampleSection(context)
  const readme = new ReadmeSection(context, [usage, example])
  const inline = readme.children.filter(section => !(section instanceof HeaderSection))
  const children = [...inline, ...usage.children, ...example.children]
  for (const child of children) {
    child.load = async () => false
    child.collectContents = () => {
      throw new Error('Disabled inline content was collected.')
    }
    child.render = () => {
      throw new Error('Disabled inline block was rendered.')
    }
  }
  await loadSections([readme])
  const output = readme.render()
  expect(output).toBe('# lifecycle-fixture\n\n## example\n\nExample remains.\n\n## usage\n\nUsage remains.')
  expect(children.every(section => !section.active)).toBeTrue()
})
test('shared section instances load once per batch', async () => {
  let calls = 0
  class SharedSection extends Section {
    readonly id = 'shared'

    override async load() {
      calls++
      return true
    }
  }
  class ParentSection extends Section {
    override readonly children: ReadonlyArray<Section>
    readonly id = 'parent'
    override load = undefined

    constructor(context: Context, child: Section) {
      super(context)
      this.children = [child]
    }
  }
  const context = await makeContext()
  const shared = new SharedSection(context)
  await loadSections<Section>([new ParentSection(context, shared), new ParentSection(context, shared), shared])
  expect(calls).toBe(1)
})
test('load rejection propagates without beginning rendering', async () => {
  const error = new Error('Loading failed.')
  const calls: Array<string> = []
  class FailedSection extends HeaderSection {
    readonly id = 'failed'

    override collectContents(): SectionContents {
      throw new Error('Rendering started after a rejected load.')
    }

    override getTitle() {
      return 'Failed'
    }

    override async load(): Promise<SectionLoadResult> {
      calls.push('failed')
      throw error
    }
  }
  class SiblingSection extends FailedSection {
    override async load() {
      calls.push('sibling')
      return true
    }
  }
  const context = await makeContext()
  const readme = new ReadmeSection(context, [new FailedSection(context), new SiblingSection(context)])
  const results = await Promise.allSettled([loadSections([readme])])
  expect(results).toEqual([{
    status: 'rejected',
    reason: error,
  }])
  expect(calls).toEqual(['failed', 'sibling'])
})
test('a synchronously throwing hook does not prevent sibling hooks from starting', async () => {
  const error = new Error('Synchronous loading failure.')
  const calls: Array<string> = []
  class ThrowsSection extends Section {
    readonly id = 'throws'

    override load(): Promise<SectionLoadResult> {
      calls.push('throws')
      throw error
    }
  }
  class SiblingSection extends Section {
    readonly id = 'sibling'

    override async load() {
      calls.push('sibling')
      return true
    }
  }
  const context = await makeContext()
  const results = await Promise.allSettled([loadSections<Section>([new ThrowsSection(context), new SiblingSection(context)])])
  expect(results).toEqual([{
    status: 'rejected',
    reason: error,
  }])
  expect(calls).toEqual(['throws', 'sibling'])
})
test('reloading active sections refreshes their cached Markdown without duplication', async () => {
  const context = await makeContext()
  const file = path.join(context.args.configDirectory, 'notes.md')
  await fs.outputFile(file, 'Before.')
  const section = new NotesSection(context)
  await loadSections([section])
  await fs.outputFile(file, 'After.')
  expect(section.render()).toBe('## notes\n\nBefore.')
  await loadSections([section])
  expect(section.render()).toBe('## notes\n\nAfter.')
})
