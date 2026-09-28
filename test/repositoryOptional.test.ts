import type {PackageData} from '../src/lib/types.ts'

import {afterAll, expect, test} from 'bun:test'
import os from 'node:os'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {stringify} from 'yaml'

import {createReadmeContext, writeReadme} from '../src/index.ts'
import {DevelopmentSection} from '../src/sections/DevelopmentSection.ts'
import {loadSections} from '../src/sections/loadSections.ts'

const directories: Array<string> = []
const getRejectedError = async (promise: Promise<unknown>) => {
  try {
    await promise
  } catch (error) {
    return error
  }
  throw new Error('Expected promise to reject.')
}
const makeProject = async (pkg: Partial<PackageData> = {}, config: Record<string, unknown> = {}) => {
  const projectDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-repository-'))
  directories.push(projectDirectory)
  const configDirectory = path.join(projectDirectory, 'docs', 'tldw')
  const args = {
    configDirectory,
    licenseFile: path.join(projectDirectory, 'license.txt'),
    outputFile: path.join(projectDirectory, 'README.md'),
    packageFile: path.join(projectDirectory, 'package.json'),
  }
  await fs.ensureDir(configDirectory)
  await fs.writeJson(args.packageFile, {
    name: 'repository-optional-fixture',
    version: '1.2.3',
    description: 'Repository-optional fixture.',
    ...pkg,
  })
  await fs.outputFile(path.join(configDirectory, 'config.yml'), stringify({
    generationComment: false,
    ...config,
  }))
  return {
    args,
    projectDirectory,
  }
}
afterAll(async () => {
  await Promise.all(directories.map(directory => fs.remove(directory)))
})
test('generates a README without package.json#repository', async () => {
  const project = await makeProject({license: 'MIT'})
  const context = await createReadmeContext(project.args)
  expect(context.slug).toBeNull()
  expect(context.licenseUrl).toBeNull()
  const result = await writeReadme(project.args)
  expect(result.status).toBe('created')
  expect(result.readmeText).toContain('shieldcn.dev/npm/v/repository-optional-fixture.svg')
  expect(result.readmeText).not.toContain('shieldcn.dev/github/license/')
  expect(await fs.pathExists(project.args.outputFile)).toBeTrue()
})
test('non-GitHub shields keep working without a GitHub repository', async () => {
  const project = await makeProject({}, {
    shields: {
      items: ['dependents'],
    },
  })
  const result = await writeReadme(project.args)
  expect(result.readmeText).toContain('shieldcn.dev/npm/dependents/repository-optional-fixture.svg')
  expect(result.readmeText).not.toContain('github.com/null')
})
test('explicit GitHub shields fail with a targeted error without a GitHub repository', async () => {
  const project = await makeProject({}, {
    shields: {
      items: ['issues'],
    },
  })
  const error = await getRejectedError(writeReadme(project.args))
  expect(Error.isError(error) ? error.message : String(error)).toBe('Built-in shield "issues" requires package.json#repository to point to a GitHub repository.')
})
test('GitHub Packages installation fails with a targeted error without a GitHub repository', async () => {
  const project = await makeProject({}, {
    installation: {
      githubPackage: true,
    },
  })
  const error = await getRejectedError(writeReadme(project.args))
  expect(Error.isError(error) ? error.message : String(error)).toBe('GitHub Packages installation requires package.json#repository to point to a GitHub repository.')
})
test('Development omits repository setup but keeps local scripts without a GitHub repository', async () => {
  const project = await makeProject({
    scripts: {
      lint: 'eslint .',
      test: 'bun test',
    },
  }, {
    development: true,
  })
  const section = new DevelopmentSection(await createReadmeContext(project.args))
  await loadSections([section])
  const contents = section.collectContents()
  expect(Object.keys(contents.sections ?? {})).toEqual(['linting', 'testing'])
  expect(section.render()).toContain('bun run lint')
  expect(section.render()).not.toContain('git clone')
})
