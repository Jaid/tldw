import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {createReadmeContext, writeReadme} from '../src/index.ts'
import {loadSections} from '../src/sections/loadSections.ts'
import {UsageSection} from '../src/sections/UsageSection.ts'

const root = path.join(import.meta.dir, '..')
const cliFile = path.join(root, 'src', 'cli.ts')
const tempDirectories: Array<string> = []
const createTempDirectory = async () => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-'))
  tempDirectories.push(tempDirectory)
  return tempDirectory
}
const runCli = async (args: Array<string>, cwd = root) => {
  const subprocess = Bun.spawn(['bun', cliFile, ...args], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(subprocess.stdout).text(),
    new Response(subprocess.stderr).text(),
    subprocess.exited,
  ])
  return {
    exitCode,
    stderr,
    stdout,
  }
}
afterAll(async () => {
  await Promise.all(tempDirectories.map(tempDirectory => fs.remove(tempDirectory)))
})
test('prints the package version', async () => {
  const packageJson = await Bun.file(path.join(root, 'package.json')).json() as {version: string}
  const result = await runCli(['--version'])
  expect(result.exitCode).toBe(0)
  expect(result.stdout).toBe(`v${packageJson.version}\n`)
  expect(result.stderr).toBe('')
})
test('generates a README for this repository through the CLI', async () => {
  const packageJson = await Bun.file(path.join(root, 'package.json')).json() as {version: string}
  const tempDirectory = await createTempDirectory()
  const outputFile = path.join(tempDirectory, 'readme.md')
  const result = await runCli(['--output-file', outputFile])
  expect(result.exitCode).toBe(0)
  const output = await Bun.file(outputFile).text()
  const expectedOutput = await Bun.file(path.join(root, 'readme.md')).text()
  expect(output).toBe(expectedOutput)
  expect(output).toContain(`readme generated with tldw v${packageJson.version}`)
})
test('resolves default config and license paths relative to the package file', async () => {
  const tempDirectory = await createTempDirectory()
  const callerDirectory = path.join(tempDirectory, 'caller')
  const projectDirectory = path.join(callerDirectory, 'fixture')
  const outputFile = path.join(callerDirectory, 'out', 'readme.md')
  await fs.ensureDir(path.join(callerDirectory, 'docs', 'tldw'))
  await fs.ensureDir(projectDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(callerDirectory, 'docs', 'tldw', 'usage.md'), 'This must not be loaded.')
  await fs.outputFile(path.join(callerDirectory, 'license.txt'), 'Wrong License Text')
  const result = await runCli(['--package-file', 'fixture/package.json', '--output-file', 'out/readme.md'], callerDirectory)
  expect(result.exitCode).toBe(0)
  const output = await Bun.file(outputFile).text()
  expect(output).not.toContain('This must not be loaded.')
  expect(output).not.toContain('Wrong License Text')
})
test('UsageSection collects its Markdown, code and usage directory content', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const docsDirectory = path.join(projectDirectory, 'docs')
  const configDirectory = path.join(docsDirectory, 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(path.join(docsDirectory, 'usage'))
  await fs.ensureDir(path.join(configDirectory, 'usage'))
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(docsDirectory, 'usage.md'), 'Project-level usage.')
  await fs.outputFile(path.join(configDirectory, 'usage.md'), 'tldw-specific usage.')
  await fs.outputFile(path.join(docsDirectory, 'usage.ts'), 'const projectTs = true')
  await fs.outputFile(path.join(docsDirectory, 'usage.jsx'), 'const projectJsx = <div />')
  await fs.outputFile(path.join(configDirectory, 'usage.tsx'), 'const tldwTsx = <div />')
  await fs.outputFile(path.join(configDirectory, 'usage.js'), 'const tldwJs = true')
  await fs.outputFile(path.join(docsDirectory, 'usage', 'a.json'), '{"project":true}')
  await fs.outputFile(path.join(docsDirectory, 'usage', 'b.md'), 'Project usage directory Markdown.')
  await fs.outputFile(path.join(configDirectory, 'usage', 'a.css'), 'body { display: block }')
  await fs.outputFile(path.join(configDirectory, 'usage', 'z.txt'), 'Plain usage text.')
  const context = await createReadmeContext({
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
    outputFile,
  })
  if (!context) {
    throw new Error('Fixture context was skipped.')
  }
  const usageSection = new UsageSection(context)
  await loadSections([usageSection])
  expect(usageSection.collectContents()).toEqual({
    content: [
      'Project-level usage.',
      'tldw-specific usage.',
      '```ts\nconst projectTs = true\n```',
      '```jsx\nconst projectJsx = <div />\n```',
      '```tsx\nconst tldwTsx = <div />\n```',
      '```js\nconst tldwJs = true\n```',
      '```json\n{"project":true}\n```',
      'Project usage directory Markdown.',
      '```css\nbody { display: block }\n```',
      '```txt\nPlain usage text.\n```',
    ],
  })
  const result = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const readmeText = result.readmeText ?? ''
  expect(readmeText).toContain('## usage\n\nProject-level usage.\n\ntldw-specific usage.')
  expect(readmeText).toContain('```ts\nconst projectTs = true\n```')
  expect(readmeText).toContain('Project usage directory Markdown.')
  expect(readmeText).toContain('```css\nbody { display: block }\n```')
})
test('prefers TypeScript fragments and reports unchanged output on repeat runs', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(projectDirectory, 'license.txt'), 'Fixture License')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'generationComment: false\n')
  await fs.outputFile(path.join(configDirectory, 'example.ts'), 'const preferred: number = 1')
  await fs.outputFile(path.join(configDirectory, 'example.js'), 'const fallback = true')
  await fs.outputFile(path.join(configDirectory, 'resultAlpha.ts'), 'const alpha = 1')
  await fs.outputFile(path.join(configDirectory, 'resultBeta.js'), 'const beta = 2')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.status).toBe('created')
  expect(firstResult.readmeText).toContain('const preferred: number = 1')
  expect(firstResult.readmeText).not.toContain('const fallback = true')
  expect(firstResult.readmeText).toContain('const alpha = 1')
  expect(firstResult.readmeText).toContain('const beta = 2')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.status).toBe('unchanged')
})
test('uses minimal default shield lines', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    license: 'MIT',
    funding: 'https://github.com/sponsors/Jaid',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).toContain('shieldcn.dev/npm/v/fixture-project.svg')
  expect(firstResult.readmeText).toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/last-commit/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/issues/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/npm/dm/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/npm/dependents/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
  expect(firstResult.readmeText).not.toContain('Sponsor')
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).toContain('shieldcn.dev/npm/v/fixture-project.svg')
  expect(secondResult.readmeText).not.toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  expect(secondResult.readmeText).not.toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
})
test('does not automatically include Bun shield and supports explicit Bun and types shields', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
  await fs.outputFile(path.join(projectDirectory, 'bun.lock'), '')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const secondReadmeText = secondResult.readmeText ?? ''
  expect(secondReadmeText).not.toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'shields:\n  items:\n    - bun\ngenerationComment: false\n')
  const explicitBunResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const explicitBunReadmeText = explicitBunResult.readmeText ?? ''
  expect(explicitBunReadmeText).toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
  expect(explicitBunReadmeText).toContain('variant=outline')
  expect(explicitBunReadmeText).toContain('logo=bun')
  expect(explicitBunReadmeText).toContain('mode=dark')
  expect(explicitBunReadmeText).toContain('mode=light')
  expect(explicitBunReadmeText).toContain('https://bun.sh')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'shields:\n  items:\n    - types\ngenerationComment: false\n')
  const thirdResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const thirdReadmeText = thirdResult.readmeText ?? ''
  expect(thirdReadmeText).toContain('shieldcn.dev/badge/types-included-377cc8.svg')
  expect(thirdReadmeText).toContain('logo=typescript')
  expect(thirdReadmeText).toContain('mode=dark')
  expect(thirdReadmeText).toContain('mode=light')
})
test('renders usage code fragments and exact result below usage', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'generationComment: false\n')
  await fs.outputFile(path.join(configDirectory, 'usage.md'), 'Install it, then run this:')
  await fs.outputFile(path.join(configDirectory, 'usage.tsx'), 'const element = <strong>fixture</strong>')
  await fs.outputFile(path.join(configDirectory, 'usage.ts'), 'const element: string = "fixture"')
  await fs.outputFile(path.join(configDirectory, 'result.js'), '\"fixture\"')
  await fs.outputFile(path.join(configDirectory, 'resultAlpha.jsx'), 'const alpha = <span />')
  const result = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const readmeText = result.readmeText ?? ''
  expect(readmeText).toContain('## usage\n\nInstall it, then run this:\n\n```ts\nconst element: string = "fixture"\n```\n\n```tsx\nconst element = <strong>fixture</strong>\n```\n\nThe result will be:\n\n```js\n\"fixture\"\n```')
  expect(readmeText).toContain('<strong>fixture</strong>')
  expect(readmeText).toContain('Variable `resultAlpha` will be:')
  expect(readmeText).toContain('const alpha = <span />')
  expect(readmeText).not.toContain('Variable `result` will be:')
})
test('supports excludeShields as an Arrayable string config value', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(projectDirectory, 'license.txt'), 'Fixture License')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'shields:\n  exclude: license\ngenerationComment: false\n')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'shields:\n  exclude:\n    - license\n    - issues\ngenerationComment: false\n')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).not.toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  expect(secondResult.readmeText).not.toContain('shieldcn.dev/github/issues/Jaid/fixture-project.svg')
})
test('supports packageManagers as an Arrayable string config value', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(projectDirectory, 'license.txt'), 'Fixture License')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'installation:\n  type: production\n  packageManagers: pnpm\n  version: true\ngenerationComment: false\n')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).toContain('pnpm add fixture-project@^1.2.3')
  expect(firstResult.readmeText).toContain('shieldcn.dev/badge/pnpm-fixture--project-F69220.svg')
  expect(firstResult.readmeText).not.toContain('bun add fixture-project@^1.2.3')
  expect(firstResult.readmeText).not.toContain('npm install --save fixture-project@^1.2.3')
  expect(firstResult.readmeText).not.toContain('yarn add fixture-project@^1.2.3')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'installation:\n  type: development\n  packageManagers:\n    - yarn\n    - bun\n  version: true\ngenerationComment: false\n')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const secondReadmeText = secondResult.readmeText ?? ''
  expect(secondReadmeText).toContain('yarn add --dev fixture-project@^1.2.3')
  expect(secondReadmeText).toContain('bun add --development fixture-project@^1.2.3')
  expect(secondReadmeText).not.toContain('pnpm add --save-dev fixture-project@^1.2.3')
  expect(secondReadmeText).not.toContain('npm install --save-dev fixture-project@^1.2.3')
  expect(secondReadmeText.indexOf('yarn add --dev fixture-project@^1.2.3')).toBeLessThan(secondReadmeText.indexOf('bun add --development fixture-project@^1.2.3'))
})
test('omits installation versions by default and includes them when enabled', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(projectDirectory, 'license.txt'), 'Fixture License')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'installation:\n  type: global\ngenerationComment: false\n')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).toContain('npm install --global fixture-project')
  expect(firstResult.readmeText).not.toContain('npm install --global fixture-project@^1.2.3')
  expect(firstResult.readmeText).not.toContain('bun add --global fixture-project')
  expect(firstResult.readmeText).not.toContain('pnpm add --global fixture-project')
  expect(firstResult.readmeText).not.toContain('yarn global add fixture-project')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'installation:\n  type: global\n  version: true\ngenerationComment: false\n')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).toContain('npm install --global fixture-project@^1.2.3')
})
test('uses the cloned repository directory for development setup', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'development: true\n')
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: '@scope/package',
    version: '1.2.3',
    description: 'Fixture project',
    repository: {
      type: 'git',
      url: 'https://github.com/Jaid/fixture-repository.git',
      directory: 'packages/package',
    },
  }, {spaces: 2})
  const result = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const readmeText = result.readmeText ?? ''
  expect(readmeText).toContain('git clone git@github.com:Jaid/fixture-repository.git\ncd fixture-repository/packages/package\nbun install')
  expect(readmeText).not.toContain('cd @scope/package')
})
test('uses the configured license filename in repository links', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  const licenseFile = path.join(projectDirectory, 'LICENSE.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    license: 'MIT',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(licenseFile, 'MIT License\n\nCopyright © 2026 Jaid')
  const result = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile,
  })
  const readmeText = result.readmeText ?? ''
  const licenseUrl = 'https://github.com/Jaid/fixture-project/raw/HEAD/LICENSE.md'
  expect(readmeText.split(licenseUrl)).toHaveLength(3)
  expect(readmeText).not.toContain('/HEAD/license.txt')
})
test('uses safe fences for code fragments and renders titled fragments', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(configDirectory, 'example.ts'), 'before\n```\nafter')
  await fs.outputFile(path.join(configDirectory, 'notes.md'), 'A note.')
  const result = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  const readmeText = result.readmeText ?? ''
  expect(readmeText).toContain('````ts\nbefore\n```\nafter\n````')
  expect(readmeText).toContain('## notes\n\nA note.')
})
test('supports banner fallback, custom shields and maxBlankLines', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const outputFile = path.join(projectDirectory, 'README.md')
  await fs.ensureDir(configDirectory)
  await fs.writeJson(path.join(projectDirectory, 'package.json'), {
    name: 'fixture-project',
    version: '1.2.3',
    description: 'Fixture project',
    repository: 'https://github.com/Jaid/fixture-project.git',
  }, {spaces: 2})
  await fs.outputFile(path.join(projectDirectory, 'license.txt'), 'Fixture License')
  await fs.outputFile(path.join(configDirectory, 'description.md'), 'First paragraph\n\n\n\nSecond paragraph')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'banner: false\ntldw:\n  maxBlankLines: 0\nshields:\n  items:\n    - - license\n      - issues\n    - - leftText: custom\n        rightText: wow\n        color: blue\n        link: https://example.com\ngenerationComment: false\n')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText?.startsWith('<center>')).toBeTrue()
  expect(firstResult.readmeText?.indexOf('<center>')).toBeLessThan(firstResult.readmeText?.indexOf('# fixture-project') ?? 0)
  expect(firstResult.readmeText?.match(/^# fixture-project$/gmu) ?? []).toHaveLength(1)
  expect(firstResult.readmeText).toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).toContain('shieldcn.dev/github/issues/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).toContain('shieldcn.dev/badge/custom-wow-blue.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/last-commit/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('\n\n\n')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'banner: Custom Banner\nshields:\n  items:\n    - license\ngenerationComment: false\n')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).toContain('![Banner](docs/tldw/banner.svg)')
  expect(await Bun.file(path.join(configDirectory, 'banner.svg')).text()).toContain('>Custom Banner</text>')
})
