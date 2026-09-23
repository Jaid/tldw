import type {Config, Context, PackageData} from '../src/lib/types.ts'
import type {SectionContents} from '../src/sections/base/Section.ts'

import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {stringify} from 'yaml'

import {createReadmeContext, writeReadme} from '../src/index.ts'
import {HeaderSection} from '../src/sections/base/HeaderSection.ts'
import {PropertiesSection} from '../src/sections/base/PropertiesSection.ts'
import {Section} from '../src/sections/base/Section.ts'
import {CliUsageSection} from '../src/sections/CliUsageSection.ts'
import {DescriptionSection} from '../src/sections/DescriptionSection.ts'
import {DevelopmentSection} from '../src/sections/DevelopmentSection.ts'
import {EnvironmentVariablesSection} from '../src/sections/EnvironmentVariablesSection.ts'
import {ExampleSection} from '../src/sections/ExampleSection.ts'
import {FeaturesSection} from '../src/sections/FeaturesSection.ts'
import {createSections, loadSections} from '../src/sections/index.ts'
import {InstallationSection} from '../src/sections/InstallationSection.ts'
import {LicenseSection} from '../src/sections/LicenseSection.ts'
import {MinimalExampleSection} from '../src/sections/MinimalExampleSection.ts'
import {NotesSection} from '../src/sections/NotesSection.ts'
import {OptionsSection} from '../src/sections/OptionsSection.ts'
import {PageSection} from '../src/sections/PageSection.ts'
import {PropsSection} from '../src/sections/PropsSection.ts'
import {ReadmeSection} from '../src/sections/ReadmeSection.ts'
import {ScreenshotsSection} from '../src/sections/ScreenshotsSection.ts'
import {ShieldsSection} from '../src/sections/ShieldsSection.ts'
import {ThirdPartiesSection} from '../src/sections/ThirdPartiesSection.ts'
import {TryInBrowserSection} from '../src/sections/TryInBrowserSection.ts'
import {UsageSection} from '../src/sections/UsageSection.ts'

const directories: Array<string> = []
const makeDirectory = async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-sections-'))
  directories.push(directory)
  return directory
}
const makeProject = async (config: Partial<Config> = {}, pkg: Partial<PackageData> = {}) => {
  const projectDirectory = await makeDirectory()
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const args = {
    configDirectory,
    licenseFile: path.join(projectDirectory, 'license.txt'),
    outputFile: path.join(projectDirectory, 'README.md'),
    packageFile: path.join(projectDirectory, 'package.json'),
  }
  await fs.ensureDir(configDirectory)
  await fs.writeJson(args.packageFile, {
    name: 'test-package',
    version: '1.2.3',
    description: 'Package description.',
    repository: 'https://github.com/example/test-repository.git',
    ...pkg,
  })
  await fs.outputFile(path.join(configDirectory, 'config.yml'), stringify({
    generationComment: false,
    ...config,
  }))
  return {
    args,
    projectDirectory,
    getContext: async (): Promise<Context> => {
      const context = await createReadmeContext(args)
      if (!context) {
        throw new Error('Fixture context was skipped.')
      }
      return context
    },
  }
}
afterAll(async () => {
  await Promise.all(directories.map(directory => fs.remove(directory)))
})
test('Description is an inline block and merges metadata with both Markdown locations', async () => {
  const project = await makeProject({
    description: {
      personal: true,
      link: 'https://example.com/app',
    },
  })
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'description.md'), 'Shared description.')
  await fs.outputFile(path.join(project.args.configDirectory, 'description.md'), 'README description.')
  const section = new DescriptionSection(await project.getContext())
  await loadSections([section])
  expect(section).toBeInstanceOf(Section)
  expect(section).not.toBeInstanceOf(HeaderSection)
  expect(section.getPriority()).toBe(100)
  const output = section.render()
  expect(output).toContain('Package description.')
  expect(output).toContain('> [!NOTE]')
  expect(output).toContain('Shared description.\n\nREADME description.')
  expect(output).toContain('View online at [example.com](https://example.com/app).')
  expect(output).not.toContain('## description')
})
test('PageSection renders one or more centered host links above Description', async () => {
  const project = await makeProject({
    page: {
      url: [
        'https://example.com/path',
        'https://docs.example.org/guide',
      ],
    },
  })
  const context = await project.getContext()
  const section = new PageSection(context)
  await loadSections([section])
  expect(section).toBeInstanceOf(Section)
  expect(section).not.toBeInstanceOf(HeaderSection)
  expect(section.getPriority()).toBe(110)
  expect(section.render()).toBe('<center><a href="https://example.com/path">example.com</a> | <a href="https://docs.example.org/guide">docs.example.org</a></center>')
  const readme = new ReadmeSection(context, [])
  await loadSections([readme])
  const output = readme.render()
  expect(output.indexOf('<center><a href="https://example.com/path">')).toBeLessThan(output.indexOf('Package description.'))
})
test('ThirdPartiesSection renders below License', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'license.md'), 'License content.')
  await fs.outputFile(path.join(project.args.configDirectory, 'thirdParties.md'), 'Third-party content.')
  const context = await project.getContext()
  const license = new LicenseSection(context)
  const thirdParties = new ThirdPartiesSection(context)
  await loadSections([license, thirdParties])
  expect(thirdParties.getPriority()).toBeLessThan(license.getPriority())
  const readme = new ReadmeSection(context, [thirdParties, license])
  await loadSections([readme])
  const output = readme.render()
  expect(output.indexOf('## license')).toBeLessThan(output.indexOf('## third parties'))
})
test('Section defaults to priority 100 and HeaderSection renders one H2', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'notes.md'), 'Notes content.')
  const section = new NotesSection(await project.getContext())
  await loadSections([section])
  expect(section).toBeInstanceOf(HeaderSection)
  expect(section.getPriority()).toBe(100)
  expect(section.render()).toBe('## notes\n\nNotes content.')
})
test('HeaderSection derives a casual space-case title from its id', async () => {
  const project = await makeProject()
  const section = new EnvironmentVariablesSection(await project.getContext())
  expect(section.getTitle()).toBe('environment variables')
})
test('inline sections use Section priorities around Description', async () => {
  class HighInlineSection extends Section {
    readonly id = 'highInline'

    override load = undefined

    override collectContents(): SectionContents {
      return {content: ['High inline.']}
    }

    override getPriority() {
      return 150
    }
  }
  class LowInlineSection extends Section {
    readonly id = 'lowInline'

    override load = undefined

    override collectContents(): SectionContents {
      return {content: ['Low inline.']}
    }

    override getPriority() {
      return 50
    }
  }
  const project = await makeProject()
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [
    new LowInlineSection(context),
    new HighInlineSection(context),
  ])
  await loadSections([readme])
  const output = readme.render()
  expect(output.indexOf('High inline.')).toBeLessThan(output.indexOf('Package description.'))
  expect(output.indexOf('Package description.')).toBeLessThan(output.indexOf('Low inline.'))
})
test('ScreenshotsSection discovers project and tldw screenshots in deterministic order', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'screenshots.md'), 'Screenshot introduction.')
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'screenshots', '10-second_image.PNG'), 'project second')
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'screenshots', '2-first-image.webp'), 'project first')
  await fs.outputFile(path.join(project.args.configDirectory, 'screenshots', 'nested', '3-third image.svg'), 'tldw third')
  await fs.outputFile(path.join(project.args.configDirectory, 'screenshots', 'ignore.txt'), 'not an image')
  const section = new ScreenshotsSection(await project.getContext())
  await loadSections([section])
  expect(section.getPriority()).toBe(215)
  expect(section.render()).toBe([
    '## screenshots',
    '',
    'Screenshot introduction.',
    '',
    '![2 first image](docs/screenshots/2-first-image.webp)',
    '',
    '![10 second image](docs/screenshots/10-second_image.PNG)',
    '',
    '![3 third image](docs/tldw/screenshots/nested/3-third%20image.svg)',
  ].join('\n'))
})
test('ShieldsSection includes conventional Markdown after generated shields', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'shields.md'), 'Additional shield context.')
  const section = new ShieldsSection(await project.getContext())
  await loadSections([section])
  const output = section.render() ?? ''
  expect(output).toContain('shieldcn.dev/npm/v/test-package.svg')
  expect(output).toContain('Additional shield context.')
  expect(output.indexOf('shieldcn.dev/npm/v/test-package.svg')).toBeLessThan(output.indexOf('Additional shield context.'))
})
test('FeaturesSection uses flexibleList for package metadata', async () => {
  const project = await makeProject({}, {
    features: [
      {
        title: 'Fast setup',
        description: 'Starts quickly.',
      },
      'Small API',
    ],
  })
  const section = new FeaturesSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe('## features\n\n- Fast setup – Starts quickly.\n- Small API')
})
test('FeaturesSection promotes complex descriptions to nested headings', async () => {
  const project = await makeProject({}, {
    features: [
      {
        title: 'Simple',
        description: 'One line.',
      },
      'Heading only',
      {
        title: 'Complex',
        description: 'Line one\nLine two',
      },
    ],
  })
  const section = new FeaturesSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toContain('## features\n\n### Simple\n\nOne line.')
  expect(section.render()).toContain('### Heading only')
  expect(section.render()).toContain('### Complex\n\nLine one<br>Line two')
})
test('Markdown fragment heading depth is normalized relative to its section', async () => {
  const standaloneOutputs: Array<string> = []
  const readmeOutputs: Array<string> = []
  for (const localDepth of [1, 2, 3, 4, 5]) {
    const project = await makeProject()
    const heading = '#'.repeat(localDepth)
    const childHeading = '#'.repeat(localDepth + 1)
    await fs.outputFile(path.join(project.args.configDirectory, 'notes.md'), [
      `${heading} build`,
      '',
      'Build body.',
      '',
      `${childHeading} details`,
      '',
      'Details body.',
      '',
      '~~~md',
      '# fenced heading',
      '## fenced child',
      '~~~',
    ].join('\n'))
    const context = await project.getContext()
    const notes = new NotesSection(context)
    await loadSections([notes])
    standaloneOutputs.push(notes.render() ?? '')
    const readme = new ReadmeSection(context, [notes])
    await loadSections([readme])
    readmeOutputs.push(readme.render())
  }
  const uniqueStandaloneOutputs = new Set(standaloneOutputs)
  const uniqueReadmeOutputs = new Set(readmeOutputs)
  expect(uniqueStandaloneOutputs.size).toBe(1)
  expect(uniqueReadmeOutputs.size).toBe(1)
  const standalone = standaloneOutputs[0]
  expect(standalone).toContain('## notes\n\n### build\n\nBuild body.')
  expect(standalone).toContain('#### details\n\nDetails body.')
  expect(standalone).toContain('~~~md\n# fenced heading\n## fenced child\n~~~')
})
test('blank and absent sections are omitted without emitting empty headings', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'notes.md'), '  \n\t\n')
  const context = await project.getContext()
  const notes = new NotesSection(context)
  await loadSections([notes])
  const usage = new UsageSection(context)
  await loadSections([usage])
  const license = new LicenseSection(context)
  await loadSections([license])
  expect(notes.render()).toBeNull()
  expect(usage.render()).toBeNull()
  expect(license.render()).toBeNull()
  const readme = new ReadmeSection(context, [notes, usage, license])
  await loadSections([readme])
  expect(readme.render()).not.toMatch(/^## /mu)
})
test('headed sections render nested MarkdownMap contents at the correct depths', async () => {
  const project = await makeProject()
  const section = new NotesSection(await project.getContext())
  await loadSections([section])
  const contents: SectionContents = {
    content: ['Overview.'],
    sections: {
      Child: {
        content: ['Child content.'],
        sections: {Grandchild: {content: ['Nested content.']}},
      },
    },
  }
  const output = section.renderContents(contents)
  expect(output).toContain('## notes\n\nOverview.')
  expect(output).toContain('### Child\n\nChild content.')
  expect(output).toContain('#### Grandchild\n\nNested content.')
})
test('section priorities preserve the document order when registration order is reversed', async () => {
  const project = await makeProject()
  const context = await project.getContext()
  const sections = createSections(context)
  await Promise.all(sections.map(section => fs.outputFile(path.join(project.args.configDirectory, `${section.id}.md`), `${section.id} content.`)))
  const normal = new ReadmeSection(context, sections)
  await loadSections([normal])
  const reversed = new ReadmeSection(context, sections.toReversed())
  await loadSections([reversed])
  const output = normal.render()
  expect(reversed.render()).toBe(output)
  expect(output.match(/^## .+$/gmu)).toEqual([
    '## intro',
    '## screenshots',
    '## minimal example',
    '## features',
    '## installation',
    '## warning',
    '## example',
    '## usage',
    '## advanced usage',
    '## options',
    '## API',
    '## props',
    '## try in browser',
    '## CLI usage',
    '## environment variables',
    '## notes',
    '## related',
    '## questions & answers',
    '## legal',
    '## architecture',
    '## development',
    '## license',
    '## third parties',
  ])
})
test('API and Architecture use their intended section priorities', async () => {
  const project = await makeProject()
  const context = await project.getContext()
  const sections = createSections(context)
  const priorities = Object.fromEntries(sections.map(section => [section.id, section.getPriority()]))
  expect(priorities.options).toBeGreaterThan(priorities.api)
  expect(priorities.api).toBeGreaterThan(priorities.props)
  expect(priorities.architecture).toBeGreaterThan(priorities.development)
  expect(priorities.development).toBeGreaterThan(priorities.license)
})
test('overriding getPriority repositions a headed section', async () => {
  class LateUsageSection extends UsageSection {
    override getPriority() {
      return 5
    }
  }
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'usage.md'), 'Usage content.')
  await fs.outputFile(project.args.licenseFile, 'License text.')
  const context = await project.getContext()
  const lateUsage = new LateUsageSection(context)
  await loadSections([lateUsage])
  const sections = createSections(context)
  for (const [index, section] of sections.entries()) {
    if (section.id === 'usage') {
      sections[index] = lateUsage
    }
  }
  const readme = new ReadmeSection(context, sections)
  await loadSections([readme])
  const output = readme.render()
  expect(output.indexOf('## usage')).toBeGreaterThan(output.indexOf('## license'))
})
test('equal priorities preserve registration order', async () => {
  class FirstSection extends HeaderSection {
    readonly id = 'first'

    override getTitle() {
      return 'First'
    }
  }
  class SecondSection extends HeaderSection {
    readonly id = 'second'

    override getTitle() {
      return 'Second'
    }
  }
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'first.md'), 'First content.')
  await fs.outputFile(path.join(project.args.configDirectory, 'second.md'), 'Second content.')
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [new SecondSection(context), new FirstSection(context)])
  await loadSections([readme])
  const output = readme.render()
  expect(output.match(/^## .+$/gmu)).toEqual(['## Second', '## First'])
})
test('duplicate headed titles fail instead of silently dropping content', async () => {
  const project = await makeProject()
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [new NotesSection(context), new NotesSection(context)])
  await loadSections([readme])
  expect(() => readme.render()).toThrow('README sections must have unique titles.')
})
test('MIT license formatting uses the configured file in both links', async () => {
  const project = await makeProject({}, {license: 'MIT'})
  project.args.licenseFile = path.join(project.projectDirectory, 'legal', 'LICENSE #1.md')
  await fs.outputFile(project.args.licenseFile, 'MIT License\n\nCopyright © 2026 Example <hello@example.com>\n\nPermission is hereby granted.')
  const context = await project.getContext()
  const section = new LicenseSection(context)
  await loadSections([section])
  const expectedUrl = 'https://github.com/example/test-repository/raw/HEAD/legal/LICENSE%20%231.md'
  const output = section.render()
  expect(output).toContain(`[MIT License](${expectedUrl})<br>`)
  expect(output).toContain('Copyright © 2026 Example')
  expect(output).toContain(String.raw`\<hello@example.com>`)
  expect(output).not.toContain('Permission is hereby granted.')
  const result = await writeReadme(project.args)
  expect(result.readmeText?.split(expectedUrl)).toHaveLength(3)
})
test('external MIT license files render without a fabricated repository link', async () => {
  const project = await makeProject({}, {license: 'MIT'})
  const external = await makeDirectory()
  project.args.licenseFile = path.join(external, 'LICENSE')
  await fs.outputFile(project.args.licenseFile, 'MIT License\n\nCopyright © 2026 Example')
  const context = await project.getContext()
  expect(context.licenseUrl).toBeNull()
  const section = new LicenseSection(context)
  await loadSections([section])
  expect(section.render()).toBe('## license\n\nMIT License<br>\nCopyright © 2026 Example')
})
test('monorepo license links include repository.directory', async () => {
  const project = await makeProject({}, {repository: {
    url: 'github:example/monorepo',
    directory: 'packages/test-package',
  }})
  project.args.licenseFile = path.join(project.projectDirectory, 'LICENSE.md')
  await fs.outputFile(project.args.licenseFile, 'MIT License\n\nCopyright © 2026 Example')
  const context = await project.getContext()
  expect(context.licenseUrl).toBe('https://github.com/example/monorepo/raw/HEAD/packages/test-package/LICENSE.md')
})
test('non-MIT licenses use safe code fences and retain their complete text', async () => {
  const project = await makeProject()
  const license = 'Custom license\n```\nComplete license text.'
  await fs.outputFile(project.args.licenseFile, license)
  const section = new LicenseSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe(`## license\n\n\`\`\`\`text\n${license}\n\`\`\`\``)
})
test('license Markdown fragments also collect through the base class', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'license.md'), 'License notes.')
  const section = new LicenseSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe('## license\n\nLicense notes.')
})
test('Development is opt-in but conventional Markdown activates it', async () => {
  const disabledProject = await makeProject()
  const disabledSection = new DevelopmentSection(await disabledProject.getContext())
  await loadSections([disabledSection])
  expect(disabledSection.active).toBeFalse()
  expect(disabledSection.render()).toBeNull()
  for (const development of [true, {}] as const) {
    const configuredProject = await makeProject({development})
    const configuredSection = new DevelopmentSection(await configuredProject.getContext())
    await loadSections([configuredSection])
    expect(configuredSection.active).toBeTrue()
    expect(configuredSection.render()).toContain('### setting up')
  }
  const markdownProject = await makeProject()
  await fs.outputFile(path.join(markdownProject.args.configDirectory, 'development.md'), 'Project-specific development notes.')
  const markdownSection = new DevelopmentSection(await markdownProject.getContext())
  await loadSections([markdownSection])
  expect(markdownSection.active).toBeTrue()
  expect(markdownSection.render()).toContain('Project-specific development notes.')
  expect(markdownSection.render()).toContain('### setting up')
})
test('Development exposes nested data instead of embedding Markdown headings', async () => {
  const project = await makeProject({development: true}, {
    name: '@scope/package',
    repository: {
      url: 'github:example/repository',
      directory: 'packages/package',
    },
    scripts: {
      lint: 'eslint .',
      typecheck: 'tsc',
      test: 'bun test',
      'test:dev': 'bun test --watch',
    },
  })
  const section = new DevelopmentSection(await project.getContext())
  await loadSections([section])
  const contents = section.collectContents()
  expect(Object.keys(contents.sections ?? {})).toEqual(['setting up', 'linting', 'type checking', 'testing', 'testing in development environment'])
  expect(contents.sections?.['setting up'].content?.[0]).toContain('cd repository/packages/package')
  expect(contents.sections?.linting.content?.[0]).toBe('```sh\nbun run lint\n```')
  expect(section.render()).toContain('### testing\n\n```sh\nbun run test\n```')
})
test('Options renders empty and falsy defaults plus structured values', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'usageOptions.yml'), stringify({
    empty: {default: ''},
    disabled: {default: false},
    zero: {default: 0},
    nothing: {default: null},
    structured: {
      default: {enabled: true},
      type: 'Array<string>',
      info: '<em>Details</em>',
    },
    raw: {
      defaultRaw: 'createDefault()',
      type: 'Factory',
    },
  }))
  const section = new OptionsSection(await project.getContext())
  await loadSections([section])
  const output = section.render()
  expect(output).toContain('option | type | default | info')
  expect(output).toContain('`empty` |  | `""`')
  expect(output).toContain('`disabled` |  | `false`')
  expect(output).toContain('`zero` |  | `0`')
  expect(output).toContain('`nothing` |  | `null`')
  expect(output).toContain('`structured` | `Array<string>` | `{"enabled":true}` | <em>Details</em>')
  expect(output).toContain('`raw` | `Factory` | createDefault()')
})
test('Options merges action inputs and explicit option metadata', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.projectDirectory, 'action.yml'), stringify({inputs: {token: {
    description: 'Action token.',
    required: true,
    default: 'action default',
  }}}))
  await fs.outputFile(path.join(project.args.configDirectory, 'usageOptions.yml'), stringify({token: {
    info: 'Explicit info.',
    defaultRaw: 'getToken()',
  }}))
  const section = new OptionsSection(await project.getContext())
  await loadSections([section])
  const output = section.render()
  expect(output).toContain('option |  | default | info')
  expect(output).toContain('`token` | * | getToken() | Explicit info.')
  expect(output).not.toContain('action default')
})
test('Environment Variables merges and sorts records without mutating configuration', async () => {
  const project = await makeProject({
    environmentVariables: {values: {
      ZED: 'Last.',
      ALPHA: 'Original.',
    }},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'envVars.yml'), stringify({ALPHA: 'New | value\nSecond line.'}))
  const context = await project.getContext()
  const section = new EnvironmentVariablesSection(context)
  await loadSections([section])
  const output = section.render()
  expect(output).toContain('ALPHA|New \\| value<br>Second line.\nZED|Last.')
  expect(context.config.environmentVariables === false ? undefined : context.config.environmentVariables.values.ALPHA).toBe('Original.')
})
test('CLI section renders explicit examples and the selected binary', async () => {
  const project = await makeProject({
    cliUsage: {
      binName: true,
      example: 'tool --input example.txt',
    },
  }, {bin: {tool: './cli.ts'}})
  const section = new CliUsageSection(await project.getContext())
  await loadSections([section])
  const output = section.render()
  expect(output).toContain('## CLI usage')
  expect(output).toContain('```sh\ntool --input example.txt\n```')
  expect(output).toContain('```sh\nbunx test-package\n```')
  expect(output).toContain('```sh\ntool --help\n```')
})
test('CLI and browser sections omit disabled generated content', async () => {
  const project = await makeProject({
    tryInBrowser: false,
    cliUsage: {binName: false},
  })
  const context = await project.getContext()
  const cli = new CliUsageSection(context)
  await loadSections([cli])
  const browser = new TryInBrowserSection(context)
  await loadSections([browser])
  expect(cli.render()).toBeNull()
  expect(browser.render()).toBeNull()
})
test('browser instructions retain automatic and explicit configuration', async () => {
  const project = await makeProject({
    tldw: {needsNodeRuntime: false},
    installation: {type: 'production'},
  })
  const context = await project.getContext()
  const browser = new TryInBrowserSection(context)
  await loadSections([browser])
  const installation = new InstallationSection(context)
  await loadSections([installation])
  expect(browser.render()).toContain('typeof testPackage.default')
  expect(browser.render()).toContain('document.createElement("script")')
  expect(installation.render()).toContain('```html\n<script src="https://cdn.jsdelivr.net/npm/test-package@1.2.3/index.js"></script>\n```')
})
test('GitHub Packages installation preserves its command and explanatory link', async () => {
  const project = await makeProject({
    installation: {
      type: 'development',
      packageManagers: [],
      version: true,
      githubPackage: true,
    },
  })
  const section = new InstallationSection(await project.getContext())
  await loadSections([section])
  const output = section.render()
  expect(output).toContain('npm install --save-dev @example/test-repository@^1.2.3')
  expect(output).toContain('GitHub Packages')
  expect(output).toContain('<br> (if [configured properly]')
})
test('Usage owns result-only output and variable-result phrasing', async () => {
  const project = await makeProject({
    example: {resultMayVary: true},
    usage: {resultMayVary: true},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'result.js'), '42')
  const section = new UsageSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe('## usage\n\nThe result will be something like:\n\n```js\n42\n```')
})
test('matching ANSI logs generate referenced terminal screenshots directly below scripts', async () => {
  const project = await makeProject({tldw: {terminal: {prompt: true}}})
  const usageDirectory = path.join(project.args.configDirectory, 'usage')
  await fs.outputFile(path.join(project.args.configDirectory, 'example.ts'), 'console.log("example")')
  await fs.outputFile(path.join(project.args.configDirectory, 'example.ansi.log'), '\u{1B}[32mexample output\u{1B}[0m\nsecond line')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'console.log("minimal")')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'minimal output')
  await fs.outputFile(path.join(project.args.configDirectory, 'usage.ts'), 'console.log("direct usage")')
  await fs.outputFile(path.join(project.args.configDirectory, 'usage.ansi.log'), 'direct usage output')
  await fs.outputFile(path.join(usageDirectory, 'basic.ts'), 'console.log("basic usage")')
  await fs.outputFile(path.join(usageDirectory, 'basic.ansi.log'), '\u{1B}[36mbasic output\u{1B}[0m')
  await fs.outputFile(path.join(usageDirectory, 'unpaired.ts'), 'console.log("unpaired")')
  await fs.outputFile(path.join(usageDirectory, 'orphan.ansi.log'), 'orphan output')
  const context = await project.getContext()
  const example = new ExampleSection(context)
  const minimalExample = new MinimalExampleSection(context)
  const usage = new UsageSection(context)
  await loadSections([example, minimalExample, usage])
  const exampleOutput = example.render() ?? ''
  const exampleCode = '```ts\nconsole.log("example")\n```'
  expect(exampleOutput).toContain(`${exampleCode}\n\n![Terminal screenshot](docs/tldw/example.ansi.svg)`)
  const exampleSvg = await Bun.file(path.join(project.args.configDirectory, 'example.ansi.svg')).text()
  expect(exampleSvg).toContain('example&#xA0;output')
  expect(exampleSvg).toContain('height="360"')
  expect(exampleSvg).toContain('fill="#13a10e">&gt;&#xA0;</text>')
  expect(exampleSvg).toContain('bun&#xA0;')
  expect(exampleSvg).toContain('fill="#0037da">./example.ts</text>')
  const minimalOutput = minimalExample.render() ?? ''
  const minimalCode = '```ts\nconsole.log("minimal")\n```'
  expect(minimalOutput).toContain(`${minimalCode}\n\n![Terminal screenshot](docs/tldw/minimalExample.ansi.svg)`)
  const usageOutput = usage.render() ?? ''
  const directCode = '```ts\nconsole.log("direct usage")\n```'
  const basicCode = '```ts\nconsole.log("basic usage")\n```'
  expect(usageOutput).toContain(`${directCode}\n\n![Terminal screenshot](docs/tldw/usage.ansi.svg)`)
  expect(usageOutput).toContain(`${basicCode}\n\n![Terminal screenshot](docs/tldw/usage/basic.ansi.svg)`)
  expect(usageOutput).toContain('```ts\nconsole.log("unpaired")\n```')
  expect(usageOutput).not.toContain('orphan output')
  expect(usageOutput).not.toContain('```log')
  expect(await fs.pathExists(path.join(usageDirectory, 'orphan.ansi.svg'))).toBeFalse()
  const nestedSvg = await Bun.file(path.join(usageDirectory, 'basic.ansi.svg')).text()
  expect(nestedSvg).toContain('basic&#xA0;output')
  expect(nestedSvg).toContain('fill="#0037da">./usage/basic.ts</text>')
  await loadSections([usage])
  expect(usage.render()).toBe(usageOutput)
})
for (const svgStrategy of ['bundleSvg', 'bundleImg'] as const) {
  test(`generated SVGs support ${svgStrategy}`, async () => {
    const project = await makeProject({
      banner: true,
      tldw: {
        svgStrategy,
        terminal: {width: 800},
      },
    })
    await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'console.log("minimal")')
    await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'minimal output')
    const context = await project.getContext()
    const minimal = new MinimalExampleSection(context)
    const readme = new ReadmeSection(context, [minimal])
    await loadSections([readme])
    const output = readme.render()
    if (svgStrategy === 'bundleSvg') {
      expect(output.match(/<svg /gu)?.length).toBeGreaterThanOrEqual(3)
      expect(output).toContain('data-terminal="true"')
      expect(output).toContain('width="800" height="34.973" viewBox="0 0 3660 160"')
    } else {
      expect(output.match(/<img src="data:image\/svg\+xml;base64,/gu)).toHaveLength(2)
      expect(output).toContain('alt="Terminal screenshot" width="800"/>')
      expect(output).toContain('alt="Banner"/>')
    }
    expect(await fs.pathExists(path.join(project.args.configDirectory, 'banner.svg'))).toBeFalse()
    expect(await fs.pathExists(path.join(project.args.configDirectory, 'minimalExample.ansi.svg'))).toBeFalse()
  })
}
test('terminal width limits displayed file images without changing SVG geometry', async () => {
  const project = await makeProject({
    tldw: {terminal: {width: 800}},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'console.log("minimal")')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'minimal output')
  const minimalExample = new MinimalExampleSection(await project.getContext())
  await loadSections([minimalExample])
  expect(minimalExample.render()).toContain('<img src="docs/tldw/minimalExample.ansi.svg" alt="Terminal screenshot" width="800"/>')
  const svg = await Bun.file(path.join(project.args.configDirectory, 'minimalExample.ansi.svg')).text()
  expect(svg).toContain('width="3660" height="160"')
})
test('terminal decoration renders Windows Terminal chrome with the package name', async () => {
  const project = await makeProject({
    tldw: {terminal: {decoration: 'windowsTerminal'}},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'console.log("minimal")')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'minimal output')
  const minimalExample = new MinimalExampleSection(await project.getContext())
  await loadSections([minimalExample])
  const svg = await Bun.file(path.join(project.args.configDirectory, 'minimalExample.ansi.svg')).text()
  expect(svg).toContain('data-decoration="windowsTerminal"')
  expect(svg).toContain('>test-package</text>')
  expect(svg).toContain('height="360"')
})
test('terminal prompt accepts a literal string', async () => {
  const project = await makeProject({
    tldw: {terminal: {prompt: 'custom prompt'}},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'console.log("minimal")')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'minimal output')
  const minimalExample = new MinimalExampleSection(await project.getContext())
  await loadSections([minimalExample])
  const svg = await Bun.file(path.join(project.args.configDirectory, 'minimalExample.ansi.svg')).text()
  expect(svg).toContain('custom&#xA0;prompt')
  expect(svg).not.toContain('#0037da')
})
test('orphan top-level ANSI logs do not generate SVG files', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'example.ansi.log'), 'orphan example')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ansi.log'), 'orphan minimal')
  const context = await project.getContext()
  const example = new ExampleSection(context)
  const minimalExample = new MinimalExampleSection(context)
  await loadSections([example, minimalExample])
  expect(await fs.pathExists(path.join(project.args.configDirectory, 'example.ansi.svg'))).toBeFalse()
  expect(await fs.pathExists(path.join(project.args.configDirectory, 'minimalExample.ansi.svg'))).toBeFalse()
})
test('MinimalExampleSection renders code above FeaturesSection', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.md'), 'Minimal introduction.')
  await fs.outputFile(path.join(project.args.configDirectory, 'minimalExample.ts'), 'const minimal = true')
  await fs.outputFile(path.join(project.args.configDirectory, 'features.md'), 'Feature details.')
  const context = await project.getContext()
  const minimal = new MinimalExampleSection(context)
  const features = new FeaturesSection(context)
  const readme = new ReadmeSection(context, [features, minimal])
  await loadSections([readme])
  const output = readme.render()
  expect(minimal.getPriority()).toBeGreaterThan(features.getPriority())
  const screenshots = new ScreenshotsSection(context)
  expect(minimal.getPriority()).toBeLessThan(screenshots.getPriority())
  expect(output).toContain('## minimal example\n\nMinimal introduction.\n\n```ts\nconst minimal = true\n```')
  expect(output.indexOf('## minimal example')).toBeLessThan(output.indexOf('## features'))
})
test('Result Markdown is inline under Example instead of getting a Result heading', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'result.md'), 'The example result.')
  const section = new ExampleSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe('## example\n\nThe example result.')
})
test('generation comment names the tldw source directory', async () => {
  const project = await makeProject({
    generationComment: true,
  })
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [])
  await loadSections([readme])
  expect(readme.render()).toContain([
    '<!--',
    `readme generated with tldw v${context.tldwVersion} from ./docs/tldw`,
    'github.com/Jaid/tldw',
    '-->',
  ].join('\n'))
})
test('generation comment joins multiple tldw source directories with and', async () => {
  const project = await makeProject({
    generationComment: true,
  })
  await fs.outputFile(path.join(project.projectDirectory, 'docs', 'notes.md'), 'Project-level notes.')
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [])
  await loadSections([readme])
  expect(readme.render()).toContain(`readme generated with tldw v${context.tldwVersion} from ./docs and ./docs/tldw`)
})
for (const banner of [false, true]) {
  test(`README keeps a single H1 with banner=${banner}`, async () => {
    const project = await makeProject({
      banner,
      generationComment: true,
    })
    const readme = new ReadmeSection(await project.getContext())
    await loadSections([readme])
    const output = readme.render()
    expect(output.match(/^# test-package$/gmu)).toHaveLength(1)
    expect(output).toContain('readme generated with tldw v')
    expect(output.endsWith('-->')).toBeTrue()
    expect(output.indexOf('<center>')).toBeLessThan(output.indexOf('# test-package'))
    if (banner) {
      expect(output.indexOf('![Banner](docs/tldw/banner.svg)')).toBeLessThan(output.indexOf('<center>'))
      expect(await fs.pathExists(path.join(project.args.configDirectory, 'banner.svg'))).toBeTrue()
    } else {
      expect(output.startsWith('<center>')).toBeTrue()
    }
  })
}
test('fragment content is passed through without interpreting template syntax', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.args.configDirectory, 'notes.md'), 'Literal {{someValue}} and <strong>HTML</strong>.')
  const section = new NotesSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toBe('## notes\n\nLiteral {{someValue}} and <strong>HTML</strong>.')
})
test('overlapping content directories do not load Usage fragments twice', async () => {
  const project = await makeProject()
  project.args.configDirectory = path.join(project.projectDirectory, 'docs')
  await fs.outputFile(path.join(project.args.configDirectory, 'usage.md'), 'Only once.')
  await fs.outputFile(path.join(project.args.configDirectory, 'usage.ts'), 'const unique = true')
  const section = new UsageSection(await project.getContext())
  await loadSections([section])
  const contents = section.collectContents()
  expect(contents.content).toEqual(['Only once.', '```ts\nconst unique = true\n```'])
})
test('document rendering omits empty nested headings', async () => {
  class NestedSection extends HeaderSection {
    readonly id = 'nested'

    override collectContents(): SectionContents {
      return {
        content: ['Parent content.'],
        sections: {
          Empty: {},
          Child: {content: ['Child content.']},
        },
      }
    }

    override getTitle() {
      return 'Nested'
    }
  }
  const project = await makeProject()
  const context = await project.getContext()
  const readme = new ReadmeSection(context, [new NestedSection(context)])
  await loadSections([readme])
  const output = readme.render()
  expect(output).toContain('### Child')
  expect(output).not.toContain('### Empty')
})
test('an otherwise empty document retains its title', async () => {
  const project = await makeProject({
    shields: {items: []},
  }, {description: ''})
  const readme = new ReadmeSection(await project.getContext(), [])
  await loadSections([readme])
  expect(readme.render()).toBe('# test-package')
})
test('PropsSection renders configured typed props below Options', async () => {
  const project = await makeProject({
    props: {entries: {
      optionA: {
        type: 'string',
        default: "'defaultValue'",
        info: 'Description for optionA',
      },
      optionB: {},
      optionC: {
        type: 'number | boolean',
        default: 'true',
      },
      optionD: {
        default: {enabled: true},
      },
      optionE: {
        defaultRaw: 'createDefault()',
      },
    }},
  })
  const section = new PropsSection(await project.getContext())
  await loadSections([section])
  expect(section).toBeInstanceOf(PropertiesSection)
  expect(section.getPriority()).toBe(145)
  expect(section.render()).toBe([
    '## props',
    '',
    "- `optionA: string = 'defaultValue'` – Description for optionA",
    '- `optionB`',
    '- `optionC: number | boolean = true`',
    '- `optionD = {"enabled":true}`',
    '- `optionE` = createDefault()',
  ].join('\n'))
})
test('PropsSection flattens array property IDs', async () => {
  const project = await makeProject({
    props: {
      order: 'original',
      entries: [
        {
          id: ['myvariable'],
          type: 'string',
        },
        {
          id: ['myvariable', 'sub'],
          type: 'number',
        },
        {
          id: ['myvariable', 1],
          type: 'boolean',
        },
        {
          id: ['myvariable', 'sub', 2],
          type: 'string',
        },
        {
          id: ['myvariable', 'example.com'],
          type: 'string',
        },
      ],
    },
  })
  const section = new PropsSection(await project.getContext())
  await loadSections([section])
  const output = section.render() ?? ''
  for (const id of [
    'myvariable',
    'myvariable.sub',
    'myvariable[1]',
    'myvariable.sub[2]',
    "myvariable['example.com']",
  ]) {
    expect(output).toContain(`- \`${id}:`)
  }
})
test('PropsSection renders named objects as nested sections with shared ordering', async () => {
  const project = await makeProject({
    props: {
      entries: {rootValue: {type: 'string'}},
      objects: {
        SecondaryComponent: {
          onChange: {type: '() => void'},
          value: {type: 'string'},
          id: {type: 'string'},
        },
        AnotherSecondaryComponent: [
          {
            id: 'children',
            type: 'ReactNode',
          },
          {
            id: 'disabled',
            type: 'boolean',
            default: 'false',
          },
        ],
      },
    },
  })
  const section = new PropsSection(await project.getContext())
  await loadSections([section])
  const output = section.render() ?? ''
  expect(output).toContain('## props')
  expect(output).toContain('### SecondaryComponent')
  expect(output).toContain('### AnotherSecondaryComponent')
  expect(output.indexOf('- `id: string`')).toBeLessThan(output.indexOf('- `value: string`'))
  expect(output.indexOf('- `value: string`')).toBeLessThan(output.indexOf('- `onChange: () => void`'))
  expect(output.indexOf('- `disabled: boolean = false`')).toBeLessThan(output.indexOf('- `children: ReactNode`'))
})
test('OptionsSection supports list style through the shared options renderer', async () => {
  const project = await makeProject({
    options: {style: 'list'},
  })
  await fs.outputFile(path.join(project.args.configDirectory, 'usageOptions.yml'), stringify({
    token: {
      type: 'string',
      default: 'secret',
      info: 'Authentication token.',
      required: true,
    },
  }))
  const section = new OptionsSection(await project.getContext())
  await loadSections([section])
  expect(section).toBeInstanceOf(PropertiesSection)
  expect(section.render()).toContain('- * `token: string = secret` – Authentication token.')
})
test('PropsSection supports table style through the shared options renderer', async () => {
  const project = await makeProject({
    props: {
      order: 'original',
      style: 'table',
      entries: {
        value: {
          type: 'string',
          required: true,
          info: 'Controlled value.',
        },
        disabled: {
          type: 'boolean',
          default: 'false',
        },
      },
    },
  })
  const section = new PropsSection(await project.getContext())
  await loadSections([section])
  expect(section.render()).toContain([
    'option |  | type | default | info',
    '--- | --- | --- | --- | ---',
    '`value` | * | `string` |  | Controlled value.',
    '`disabled` |  | `boolean` | `false`',
  ].join('\n'))
})
