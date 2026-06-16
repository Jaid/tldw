import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {writeReadme} from '../src/index.ts'

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
  expect(output).toContain(`Readme generated with tldw v${packageJson.version}`)
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\n')
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
test('automatically includes Bun shield for Bun projects and supports types shield', async () => {
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
  expect(secondReadmeText).toContain('shieldcn.dev/badge/Bun-fbf0df.svg')
  expect(secondReadmeText).toContain('variant=outline')
  expect(secondReadmeText).toContain('logo=bun')
  expect(secondReadmeText).toContain('mode=dark')
  expect(secondReadmeText).toContain('mode=light')
  expect(secondReadmeText).toContain('https://bun.sh')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\nshields:\n  - types\n')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\n')
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
  expect(readmeText).toContain('## Usage\n\nInstall it, then run this:\n```ts\nconst element: string = "fixture"\n```\nThe result will be:\n\n```js\n\"fixture\"\n```')
  expect(readmeText).not.toContain('<strong>fixture</strong>')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\nexcludeShields: license\n')
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\nexcludeShields:\n  - license\n  - issues\n')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\ninstallation: prod\nversionInInstallation: true\npackageManagers: pnpm\n')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), [
    'renderComment: false',
    'installation: dev',
    'versionInInstallation: true',
    'packageManagers:',
    '  - yarn',
    '  - bun',
  ].join('\n'))
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\ninstallation: global\n')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), 'renderComment: false\ninstallation: global\nversionInInstallation: true\n')
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).toContain('npm install --global fixture-project@^1.2.3')
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
  await fs.outputFile(path.join(configDirectory, 'config.yml'), [
    'banner: false',
    'renderComment: false',
    'maxBlankLines: 0',
    'shields:',
    '  - - license',
    '    - issues',
    '  - - leftText: custom',
    '      rightText: wow',
    '      color: blue',
    '      link: https://example.com',
  ].join('\n'))
  const firstResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(firstResult.readmeText?.startsWith('# fixture-project\n')).toBeTrue()
  expect(firstResult.readmeText).toContain('shieldcn.dev/github/license/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).toContain('shieldcn.dev/github/issues/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).toContain('shieldcn.dev/badge/custom-wow-blue.svg')
  expect(firstResult.readmeText).not.toContain('shieldcn.dev/github/last-commit/Jaid/fixture-project.svg')
  expect(firstResult.readmeText).not.toContain('\n\n\n')
  await fs.outputFile(path.join(configDirectory, 'config.yml'), [
    'banner: Custom Banner',
    'renderComment: false',
    'shields:',
    '  - license',
  ].join('\n'))
  const secondResult = await writeReadme({
    outputFile,
    configDirectory,
    packageFile: path.join(projectDirectory, 'package.json'),
    licenseFile: path.join(projectDirectory, 'license.txt'),
  })
  expect(secondResult.readmeText).toContain('>Custom Banner</text>')
})
