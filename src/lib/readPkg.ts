import type {PackageData} from './types.ts'

import * as path from 'forward-slash-path'

import {readOptionalJson} from './helpers.ts'

export default async (file: string): Promise<PackageData> => {
  const pkg = await readOptionalJson<Partial<PackageData>>(file) ?? {}
  const name = typeof pkg.name === 'string' && pkg.name.length > 0 ? pkg.name : path.basename(path.dirname(path.resolve(file)))
  const version = typeof pkg.version === 'string' && pkg.version.length > 0 ? pkg.version : '1.0.0'
  return {
    ...pkg,
    name,
    version,
  }
}
