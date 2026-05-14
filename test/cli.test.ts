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
  expect(output).toContain('# tldw')
  expect(output).toContain(`bun add --global tldw@^${packageJson.version}`)
  expect(output).toContain('Generated readme can be extended with following files in your repository:')
  expect(output).toContain(`Readme generated with tldw v${packageJson.version}`)
})
test('prefers TypeScript fragments and reports unchanged output on repeat runs', async () => {
  const tempDirectory = await createTempDirectory()
  const projectDirectory = path.join(tempDirectory, 'project')
  const configDirectory = path.join(projectDirectory, 'readme')
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
