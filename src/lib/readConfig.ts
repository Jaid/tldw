import type {Config} from './types.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {readOptionalYaml} from './helpers.ts'

export default async (file: string, projectDirectory: string): Promise<Config> => {
  const loadedConfig = await readOptionalYaml<Partial<Config>>(file) ?? {}
  const hasGithubActions = await fs.pathExists(path.join(projectDirectory, '.github', 'workflows'))
  const rawEnvironmentVariables: unknown = loadedConfig.environmentVariables
  let environmentVariables: Record<string, string> = {}
  if (typeof rawEnvironmentVariables === 'object' && rawEnvironmentVariables !== null && !Array.isArray(rawEnvironmentVariables)) {
    environmentVariables = rawEnvironmentVariables as Record<string, string>
  }
  const defaultConfig: Config = {
    binExample: null,
    binName: loadedConfig.installation === 'global',
    githubActions: hasGithubActions,
    personal: false,
    link: null,
    linkName: null,
    installation: false,
    environmentVariables: {},
    needsNodeRuntime: true,
    tryInBrowser: null,
    exampleResultMayVary: false,
    renderComment: true,
    githubPackage: false,
  }
  return {
    ...defaultConfig,
    ...loadedConfig,
    environmentVariables,
  }
}
