import type {Config} from './types.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'

import {normalizeBannerConfig, normalizeMaxBlankLines, normalizePackageManagers, normalizeShieldsConfig, normalizeStringArray, readOptionalYaml} from './helpers.ts'
import {defaultPackageManagers} from './packageManagers.ts'

export default async (file: string, projectDirectory: string): Promise<Config> => {
  const loadedConfig = await readOptionalYaml<Partial<Config>>(file) ?? {}
  const hasGithubActions = await fs.pathExists(path.join(projectDirectory, '.github', 'workflows'))
  const rawEnvironmentVariables: unknown = loadedConfig.environmentVariables
  let environmentVariables: Record<string, string> = {}
  if (typeof rawEnvironmentVariables === 'object' && rawEnvironmentVariables !== null && !Array.isArray(rawEnvironmentVariables)) {
    environmentVariables = rawEnvironmentVariables as Record<string, string>
  }
  const defaultConfig: Config = {
    banner: false,
    binExample: null,
    binName: loadedConfig.installation === 'global',
    githubActions: hasGithubActions,
    personal: false,
    link: null,
    linkName: null,
    installation: false,
    environmentVariables: {},
    maxBlankLines: 1,
    needsNodeRuntime: true,
    packageManagers: [...defaultPackageManagers],
    tryInBrowser: null,
    versionInInstallation: false,
    exampleResultMayVary: false,
    excludeShields: [],
    renderComment: true,
    shields: null,
    githubPackage: false,
  }
  return {
    ...defaultConfig,
    ...loadedConfig,
    banner: normalizeBannerConfig(loadedConfig.banner),
    environmentVariables,
    excludeShields: normalizeStringArray(loadedConfig.excludeShields),
    maxBlankLines: normalizeMaxBlankLines(loadedConfig.maxBlankLines),
    packageManagers: normalizePackageManagers(loadedConfig.packageManagers, defaultPackageManagers),
    shields: normalizeShieldsConfig(loadedConfig.shields),
    versionInInstallation: loadedConfig.versionInInstallation === true,
  }
}
