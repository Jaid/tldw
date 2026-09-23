import type {Config} from '../src/config.schema.ts'
import type {SectionLoadResult} from '../src/sections/base/Section.ts'

import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {stringify} from 'yaml'

import configSchema, {sectionSchemas} from '../src/config.schema.ts'
import {createReadmeContext, writeReadme} from '../src/index.ts'
import readConfig from '../src/lib/readConfig.ts'
import {DevelopmentSection} from '../src/sections/DevelopmentSection.ts'
import {ExampleSection} from '../src/sections/ExampleSection.ts'
import {loadSections} from '../src/sections/loadSections.ts'
import {ReadmeSection} from '../src/sections/ReadmeSection.ts'

const expectFailure = async (operation: Promise<unknown>, message = '') => {
  const error: unknown = await operation.then(() => {
    throw new Error('Expected the operation to fail.')
  }, (error_: unknown) => error_)
  expect(error).toBeInstanceOf(Error)
  if (Error.isError(error)) {
    expect(error.message).toContain(message)
  }
}
const directories: Array<string> = []
const makeProject = async (config?: Config) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-config-'))
  directories.push(directory)
  const projectDirectory = path.join(directory, 'project with spaces')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const args = {
    configDirectory,
    licenseFile: path.join(projectDirectory, 'license.txt'),
    outputFile: path.join(projectDirectory, 'readme.md'),
    packageFile: path.join(projectDirectory, 'package.json'),
  }
  await fs.outputJson(args.packageFile, {
    name: 'config-fixture',
    version: '1.2.3',
    description: 'A configuration fixture.',
    repository: 'github:example/config-fixture',
    license: 'MIT',
    scripts: {
      lint: 'eslint .',
      test: 'bun test',
    },
  })
  if (config) {
    await fs.outputFile(path.join(configDirectory, 'config.yml'), stringify(config))
  }
  return {
    args,
    configDirectory,
    projectDirectory,
    read: () => readConfig(configDirectory, projectDirectory),
    context: async () => {
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
test('schema defaults and boolean shorthand produce section-scoped options', () => {
  const config = configSchema.parse({
    installation: true,
    development: false,
  })
  expect(config.installation).toEqual({
    type: 'production',
    packageManagers: ['npm'],
    version: false,
    githubPackage: false,
  })
  expect(config.development).toBeFalse()
  expect(config.description).toEqual({
    personal: false,
    link: null,
    linkName: null,
  })
  expect(config.page).toBeFalse()
  expect(config.example).toEqual({resultMayVary: false})
  expect(config.usage).toEqual({resultMayVary: false})
  expect(config.sections).toEqual({})
  expect(config.options).toEqual({style: 'table'})
  expect(config.props).toEqual({
    entries: {},
    objects: {},
    order: 'jaid',
    style: 'list',
  })
  expect(config.tldw).toEqual({
    maxBlankLines: 1,
    needsNodeRuntime: true,
    svgStrategy: 'file',
    terminal: {
      decoration: false,
      prompt: false,
      width: false,
    },
  })
  expect(configSchema.parse({tldw: {terminal: {prompt: true}}}).tldw.terminal).toEqual({
    decoration: false,
    prompt: true,
    width: false,
  })
  expect(configSchema.parse({tldw: {terminal: {prompt: 'bun ./custom.ts'}}}).tldw.terminal).toEqual({
    decoration: false,
    prompt: 'bun ./custom.ts',
    width: false,
  })
  expect(configSchema.parse({tldw: {terminal: {decoration: 'windowsTerminal'}}}).tldw.terminal).toEqual({
    decoration: 'windowsTerminal',
    prompt: false,
    width: false,
  })
  expect(configSchema.parse({tldw: {terminal: {width: 800}}}).tldw.terminal).toEqual({
    decoration: false,
    prompt: false,
    width: 800,
  })
  expect(configSchema.parse({}).installation).toBeUndefined()
  expect(configSchema.parse({installation: 'development'}).installation).toEqual({
    type: 'development',
    packageManagers: ['npm'],
    version: false,
    githubPackage: false,
  })
  expect(configSchema.parse({page: 'https://example.com/path'}).page).toEqual({url: 'https://example.com/path'})
  expect(configSchema.parse({page: ['https://example.com', 'https://docs.example.com']}).page).toEqual({
    url: ['https://example.com', 'https://docs.example.com'],
  })
  expect(configSchema.parse({}).development).toBeFalse()
})
test('all built-in section keys can explicitly disable their section', () => {
  const disabled = Object.fromEntries(Object.keys(sectionSchemas).map(id => [id, false]))
  const result = configSchema.parse(disabled)
  for (const id of Object.keys(sectionSchemas)) {
    expect(Reflect.get(result, id)).toBeFalse()
  }
})
for (const input of [
  {installation: 'prod'},
  {installation: {type: 'prod'}},
  {installation: {
    type: 'development',
    packageManagers: ['missing-manager'],
  }},
  {installation: {
    type: 'production',
    versionInInstallation: true,
  }},
  {packageManagers: ['npm']},
  {renderComment: false},
  {description: {personal: 'yes'}},
  {page: true},
  {page: {}},
  {page: {url: []}},
  {page: 'not a URL'},
  {page: []},
  {page: {url: 'not a URL'}},
  {sections: {troubleshooting: false}},
  {sections: {troubleshooting: ''}},
  {maxBlankLines: -1},
  {maxBlankLines: 1.5},
  {needsNodeRuntime: false},
  {tldw: {maxBlankLines: -1}},
  {tldw: {maxBlankLines: 1.5}},
  {tldw: {svgStrategy: 'inline'}},
  {tldw: {terminal: {prompt: 1}}},
  {tldw: {terminal: {decoration: true}}},
  {tldw: {terminal: {decoration: 'macTerminal'}}},
  {tldw: {terminal: {width: 0}}},
  {tldw: {terminal: {width: -1}}},
  {tldw: {terminal: {width: 1.5}}},
  {options: {style: 'grid'}},
  {props: {style: 'grid'}},
  {props: {order: 'random'}},
]) {
  test(`schema rejects invalid or misplaced configuration: ${JSON.stringify(input)}`, () => {
    expect(configSchema.safeParse(input).success).toBeFalse()
  })
}
test('missing config files use defaults without creating files', async () => {
  const project = await makeProject()
  expect(await project.read()).toEqual({
    ...configSchema.parse({}),
    shields: {
      items: null,
      exclude: [],
      githubActions: false,
    },
  })
  expect(await fs.pathExists(project.configDirectory)).toBeFalse()
})
test('config.ts can import a sibling TypeScript module and default-export typed configuration', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'settings.ts'), "export const production = 'production' as const\n")
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), [
    "import {production} from './settings.ts'",
    'const title: string = "TypeScript configuration"',
    'export default {banner: {text: title}, installation: {type: production}, development: false}',
  ].join('\n'))
  const config = await project.read()
  expect(config.banner).toEqual({text: 'TypeScript configuration'})
  expect(config.installation).toEqual({
    type: 'production',
    packageManagers: ['npm'],
    version: false,
    githubPackage: false,
  })
  expect(config.development).toBeFalse()
  const result = await writeReadme(project.args)
  expect(result.readmeText).toContain('npm install --save config-fixture')
  expect(result.readmeText).not.toContain('## development')
  expect(result.readmeText).toContain('from ./docs/tldw')
})
test('TypeScript overrides YAML while preserving nested settings and replacing arrays', async () => {
  const project = await makeProject({
    installation: {
      type: 'development',
      packageManagers: ['bun', 'npm'],
      version: true,
    },
    banner: {
      text: 'YAML title',
      font: 'monospace',
    },
    description: {
      personal: true,
      linkName: 'YAML link',
    },
    environmentVariables: {values: {
      ALPHA: 'YAML',
      BETA: 'YAML',
    }},
    shields: {
      items: ['license'],
      exclude: ['actions'],
    },
    sections: {
      yamlOnly: './yaml.md',
      shared: './old.md',
    },
  })
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), [
    'export default {',
    "  installation: {packageManagers: ['pnpm']},",
    "  banner: {text: 'TypeScript title'},",
    "  description: {link: 'https://example.com'},",
    "  environmentVariables: {values: {BETA: 'TypeScript', GAMMA: 'TypeScript'}},",
    "  shields: {items: ['bun']},",
    "  sections: {typescriptOnly: './ts.md', shared: './new.md'},",
    '}',
  ].join('\n'))
  const config = await project.read()
  expect(config.installation).toEqual({
    type: 'development',
    packageManagers: ['pnpm'],
    version: true,
    githubPackage: false,
  })
  expect(config.banner).toEqual({
    text: 'TypeScript title',
    font: 'monospace',
  })
  expect(config.description).toEqual({
    personal: true,
    linkName: 'YAML link',
    link: 'https://example.com',
  })
  expect(config.environmentVariables).toEqual({values: {
    ALPHA: 'YAML',
    BETA: 'TypeScript',
    GAMMA: 'TypeScript',
  }})
  expect(config.shields).toEqual({
    items: [['bun']],
    exclude: ['actions'],
    githubActions: false,
  })
  expect(config.sections).toEqual({
    yamlOnly: './yaml.md',
    shared: './new.md',
    typescriptOnly: './ts.md',
  })
})
test('section false replaces an object and an object can enable a disabled section', async () => {
  const project = await makeProject({
    installation: {
      type: 'development',
      version: true,
    },
    development: false,
  })
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), 'export default {installation: false, development: {}}')
  const config = await project.read()
  expect(config.installation).toBeFalse()
  expect(config.development).toEqual({})
})
test('TypeScript config and imported settings refresh on subsequent reads', async () => {
  const project = await makeProject()
  const settingsFile = path.join(project.configDirectory, 'settings.ts')
  const configFile = path.join(project.configDirectory, 'config.ts')
  await fs.outputFile(settingsFile, 'export default 1')
  await fs.outputFile(configFile, "import value from './settings.ts'\nexport default {tldw: {maxBlankLines: value}}")
  const initial = await project.read()
  expect(initial.tldw.maxBlankLines).toBe(1)
  await fs.outputFile(settingsFile, 'export default 2')
  const updatedSettings = await project.read()
  expect(updatedSettings.tldw.maxBlankLines).toBe(2)
  await fs.outputFile(configFile, 'export default {tldw: {maxBlankLines: 3}}')
  const updatedConfig = await project.read()
  expect(updatedConfig.tldw.maxBlankLines).toBe(3)
})
test('invalid YAML is reported even if TypeScript would replace its value', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.yml'), 'installation:\n  type: typo\n')
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), 'export default {installation: true}')
  await expectFailure(project.read(), 'config.yml')
})
test('invalid TypeScript default exports are rejected with the source filename', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), 'export default {unknownOption: true}')
  await expectFailure(project.read(), 'config.ts')
})
test('TypeScript import errors are not treated as absent configuration', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), "import missing from './not-here.ts'\nexport default missing")
  await expectFailure(project.read(), 'Failed to load tldw configuration')
})
test('config.ts requires a default export', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), 'export const installation = true')
  await expectFailure(project.read(), 'Failed to load tldw configuration')
})
test('disabled sections never load, render or look up priorities, including their children', async () => {
  const project = await makeProject({
    development: false,
    example: false,
    description: false,
  })
  const context = await project.context()
  class DisabledDevelopment extends DevelopmentSection {
    override collectContents(): never {
      throw new Error('Disabled development was collected.')
    }

    override getPriority(): number {
      throw new Error('Disabled development priority was requested.')
    }

    override async load(): Promise<SectionLoadResult> {
      throw new Error('Disabled development was loaded.')
    }
  }
  const development = new DisabledDevelopment(context)
  const example = new ExampleSection(context)
  for (const child of example.children) {
    child.load = async () => {
      throw new Error('Disabled descendant was loaded.')
    }
  }
  const readme = new ReadmeSection(context, [development, example])
  await loadSections([readme])
  expect(development.active).toBeFalse()
  expect(example.active).toBeFalse()
  expect(readme.render()).not.toContain('## development')
  expect(readme.render()).not.toContain('## example')
  expect(readme.render()).not.toContain('A configuration fixture.')
})
test('top-level arbitrary keys are canonicalized as file-backed sections', async () => {
  const project = await makeProject({
    shields: false,
    topLevelGuide: './guide.md',
    sections: {
      explicitGuide: './explicit.md',
      shared: './yaml-shared.md',
    },
  })
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), [
    'export default {',
    "  topLevelCode: './code.ts',",
    "  shared: './typescript-shared.md',",
    '}',
  ].join('\n'))
  await fs.outputFile(path.join(project.configDirectory, 'guide.md'), 'Top-level guide.')
  await fs.outputFile(path.join(project.configDirectory, 'explicit.md'), 'Explicit guide.')
  await fs.outputFile(path.join(project.configDirectory, 'code.ts'), 'export const documented = true')
  await fs.outputFile(path.join(project.configDirectory, 'typescript-shared.md'), 'TypeScript source wins.')
  const config = await project.read()
  expect(config.sections).toEqual({
    explicitGuide: './explicit.md',
    shared: './typescript-shared.md',
    topLevelCode: './code.ts',
    topLevelGuide: './guide.md',
  })
  const result = await writeReadme(project.args)
  expect(result.readmeText).toContain('## top level guide\n\nTop-level guide.')
  expect(result.readmeText).toContain('## explicit guide\n\nExplicit guide.')
  expect(result.readmeText).toContain('## top level code\n\n```ts\nexport const documented = true\n```')
  expect(result.readmeText).toContain('## shared\n\nTypeScript source wins.')
})
test('custom sections load Markdown and fenced code relative to the configured directory', async () => {
  const project = await makeProject({
    shields: false,
    development: false,
    sections: {
      apiReference: './api.md',
      sampleCode: './sample.ts',
      plainText: './message',
    },
  })
  await fs.outputFile(path.join(project.configDirectory, 'api.md'), '# overview\n\nAPI details.\n\n## child\n\nNested details.')
  await fs.outputFile(path.join(project.configDirectory, 'sample.ts'), "throw new Error('This is documentation, not executable configuration.')")
  await fs.outputFile(path.join(project.configDirectory, 'message'), 'A text file without an extension.')
  const result = await writeReadme(project.args)
  expect(result.readmeText).toContain('## api reference\n\n### overview\n\nAPI details.\n\n#### child')
  expect(result.readmeText).toContain("## sample code\n\n```ts\nthrow new Error('This is documentation, not executable configuration.')\n```")
  expect(result.readmeText).toContain('## plain text\n\n```\nA text file without an extension.\n```')
  expect(result.readmeText).not.toContain('## development')
})
test('custom files replace matching built-in headings without duplicating generated content', async () => {
  const project = await makeProject({sections: {development: './building.md'}})
  await fs.outputFile(path.join(project.configDirectory, 'building.md'), '# building\n\nCustom development instructions.')
  const result = await writeReadme(project.args)
  expect(result.readmeText?.match(/^## development$/gmu)).toHaveLength(1)
  expect(result.readmeText).toContain('### building\n\nCustom development instructions.')
  expect(result.readmeText).not.toContain('git clone')
})
test('explicit false wins over a custom file mapped to the same built-in section', async () => {
  const project = await makeProject({
    development: false,
    sections: {development: './missing.md'},
  })
  const result = await writeReadme(project.args)
  expect(result.readmeText).not.toContain('## development')
})
test('missing custom files fail without overwriting the previous README', async () => {
  const project = await makeProject({sections: {missing: './missing.md'}})
  await fs.outputFile(project.args.outputFile, 'Keep this README.')
  await expectFailure(writeReadme(project.args))
  expect(await fs.readFile(project.args.outputFile, 'utf8')).toBe('Keep this README.')
})
test('all sections can be disabled to produce only the title', async () => {
  const config = Object.fromEntries(Object.keys(sectionSchemas).map(id => [id, false])) as Config
  const project = await makeProject(config)
  await fs.outputFile(path.join(project.configDirectory, 'development.md'), 'Must not be rendered.')
  const result = await writeReadme(project.args)
  expect(result.readmeText).toBe('# config-fixture\n')
})
test('configuration files and custom sources are retained in generation provenance', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), "export default {sections: {extra: '../../examples/example.sh'}}")
  await fs.outputFile(path.join(project.projectDirectory, 'examples', 'example.sh'), 'echo example')
  const result = await writeReadme(project.args)
  expect(result.readmeText).toContain('from ./docs/tldw and ./examples')
})
test('config.ts supports top-level await', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.ts'), 'const installation = await Promise.resolve({type: "production"})\nexport default {installation}')
  const config = await project.read()
  expect(config.installation).toEqual({
    type: 'production',
    packageManagers: ['npm'],
    version: false,
    githubPackage: false,
  })
})
test('malformed YAML reports the configuration filename', async () => {
  const project = await makeProject()
  await fs.outputFile(path.join(project.configDirectory, 'config.yml'), 'installation: [broken')
  await expectFailure(project.read(), 'config.yml')
})
test('props entries accept both record and array TypedOption forms', () => {
  const record = configSchema.parse({props: {entries: {
    value: {
      type: 'string',
      default: "'default'",
      info: 'Record form.',
      required: true,
    },
    structured: {
      default: {enabled: true},
    },
    raw: {
      defaultRaw: 'createDefault()',
    },
  }}})
  expect(record.props).toEqual({entries: {value: {
    type: 'string',
    default: "'default'",
    info: 'Record form.',
    required: true,
  }, structured: {
    default: {enabled: true},
  }, raw: {
    defaultRaw: 'createDefault()',
  }}, objects: {}, order: 'jaid', style: 'list'})
  const array = configSchema.parse({props: {entries: [{
    id: 'value',
    type: 'number',
    default: '1',
    info: 'Array form.',
    required: false,
  }]}})
  expect(array.props).toEqual({entries: [{
    id: 'value',
    type: 'number',
    default: '1',
    info: 'Array form.',
    required: false,
  }], objects: {}, order: 'jaid', style: 'list'})
  expect(configSchema.safeParse({props: {entries: [{type: 'string'}]}}).success).toBeFalse()
  expect(configSchema.safeParse({props: {entries: [{
    id: ['value', 'nested', 1],
    type: 'string',
  }]}}).success).toBeTrue()
  expect(configSchema.safeParse({props: {entries: [{
    id: [1, 'nested'],
    type: 'string',
  }]}}).success).toBeFalse()
  expect(configSchema.safeParse({props: {entries: {value: {
    default: 1,
    defaultRaw: '1',
  }}}}).success).toBeFalse()
  const objects = configSchema.parse({props: {objects: {
    SecondaryComponent: {
      value: {type: 'string'},
    },
    AnotherSecondaryComponent: [{
      id: 'enabled',
      type: 'boolean',
    }],
  }}})
  expect(objects.props === false ? undefined : objects.props.objects).toEqual({
    SecondaryComponent: {value: {type: 'string'}},
    AnotherSecondaryComponent: [{
      id: 'enabled',
      type: 'boolean',
    }],
  })
  expect(configSchema.safeParse({props: {objects: {Broken: [{type: 'string'}]}}}).success).toBeFalse()
})
