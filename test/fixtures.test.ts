import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {writeReadme} from '../src/index.ts'

const root = path.join(import.meta.dir, '..')
const tempDirectories: Array<string> = []
const createTempDirectory = async () => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-fixture-'))
  tempDirectories.push(tempDirectory)
  return tempDirectory
}
const getFixtureArgs = (name: string, outputFile: string) => {
  const fixtureDirectory = path.join(root, 'test', 'fixture', name)
  return {
    configDirectory: path.join(fixtureDirectory, 'docs', 'tldw'),
    licenseFile: path.join(fixtureDirectory, 'license.txt'),
    outputFile,
    packageFile: path.join(fixtureDirectory, 'package.json'),
  }
}
afterAll(async () => {
  await Promise.all(tempDirectories.map(directory => fs.remove(directory)))
})
test('basic fixture remains generatable after nesting', async () => {
  const tempDirectory = await createTempDirectory()
  const result = await writeReadme(getFixtureArgs('basic', path.join(tempDirectory, 'readme.md')))
  expect(result.status).toBe('created')
  expect(result.readmeText).toContain('# remote-target')
  expect(result.readmeText).toContain('## installation')
  expect(result.readmeText).toContain('npm install --save remote-target')
  expect(result.readmeText).toContain('## usage')
  expect(result.readmeText).toContain("const remoteTarget = new RemoteTarget('vps')")
})
test('large fixture exercises every built-in headed section and stays byte-for-byte stable', async () => {
  const tempDirectory = await createTempDirectory()
  const fixtureDirectory = path.join(root, 'test', 'fixture', 'large')
  const result = await writeReadme(getFixtureArgs('large', path.join(tempDirectory, 'readme.md')))
  const expected = await Bun.file(path.join(fixtureDirectory, 'readme.md')).text()
  const readme = result.readmeText ?? ''
  expect(readme).toBe(expected)
  expect(readme.match(/^## .+$/gmu)).toEqual([
    '## intro',
    '## screenshots',
    '## features',
    '## installation',
    '## warning',
    '## minimal example',
    '## example',
    '## usage',
    '## advanced usage',
    '## options',
    '## API',
    '## props',
    '## try in browser',
    '## cli usage',
    '## environment variables',
    '## notes',
    '## configuration guide',
    '## automation script',
    '## related',
    '## questions & answers',
    '## legal',
    '## architecture',
    '## development',
    '## license',
  ])
  for (const content of [
    'Project-level description content',
    'This introductory section uses the standard HeaderSection Markdown loading behavior',
    '![01 dashboard](docs/screenshots/01-dashboard.svg)',
    '![02 settings view](docs/tldw/screenshots/details/02-settings%20view.svg)',
    'tldw-specific description content',
    'Feature metadata comes from `package.json#features`',
    '### automatic section composition',
    '### multiline descriptions',
    'multiple lines<br>and forces the whole list into headed form',
    '#### details',
    'bun add --development @fixture/large@^9.8.7',
    'npm install --save-dev @fixture/large@^9.8.7',
    'deno add --dev npm:@fixture/large@^9.8.7',
    'GitHub Packages',
    'TypeScript types included',
    'Build status',
    'Custom fixture shield',
    '### configuration sources',
    'TypeScript configuration overrides the YAML installation version setting',
    'Custom file sections are documentation, not scripts to execute.',
    'const minimalFixture = true',
    'Fixture API notes.',
    'Fixture architecture notes.',
    'Project-level usage guidance',
    'tldw-specific usage guidance',
    'tsx usage',
    'usage directory shell example',
    'Variable `resultAlpha` will be something like:',
    'Variable `resultBeta` will be something like:',
    '`fromAction` |  |  | `action-default` | This option exists only in action.yml.',
    '### * `query`',
    "- default `'*'`",
    '### `readOnly`',
    'Useful for preview-only integrations.',
    'MULTILINE_VALUE',
    'large-fixture inspect --verbose',
    'document.createElement("script")',
    '### testing in development environment',
    '[MIT License]',
    'readme generated with tldw v',
  ]) {
    expect(readme).toContain(content)
  }
  expect(readme).not.toContain('last-commit')
})
