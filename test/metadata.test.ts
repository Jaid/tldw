import {expect, test} from 'bun:test'
import os from 'node:os'
import {pathToFileURL} from 'node:url'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {readOwnPackageMetadata} from '../src/lib/readOwnPackageMetadata.ts'

test('bundled package metadata works outside the source directory', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'tldw-metadata-'))
  try {
    const build = await Bun.build({
      entrypoints: [path.join(import.meta.dir, '..', 'src', 'lib', 'readOwnPackageMetadata.ts')],
      outdir: directory,
      target: 'bun',
    })
    expect(build.success).toBeTrue()
    const module = await import(pathToFileURL(build.outputs[0].path).href) as typeof import('../src/lib/readOwnPackageMetadata.ts')
    expect(await module.readOwnPackageMetadata()).toEqual(await readOwnPackageMetadata())
  } finally {
    await fs.remove(directory)
  }
})
