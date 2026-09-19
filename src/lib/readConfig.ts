import type {ResolvedConfig} from '../config.schema.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {createJiti} from 'jiti'
import zod from 'zod'

import configSchema, {sectionSchemas} from '../config.schema.ts'
import {readOptionalYaml} from './helpers.ts'

const isRecord = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  const prototype: unknown = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
const knownConfigKeys = new Set([...Object.keys(sectionSchemas), 'sections', 'tldw'])
const canonicalizeFileSections = (input: unknown): unknown => {
  if (!isRecord(input)) {
    return input
  }
  const config = {...input}
  const sections = isRecord(config.sections) ? {...config.sections} : {}
  for (const [key, value] of Object.entries(config)) {
    if (knownConfigKeys.has(key)) {
      continue
    }
    sections[key] = value
    delete config[key]
  }
  return {
    ...config,
    sections,
  }
}
/** Objects merge recursively; arrays, booleans and other values are replaced by the override. */
const mergeConfig = (base: unknown, override: unknown): unknown => {
  if (override === undefined) {
    return base
  }
  if (!isRecord(base) || !isRecord(override)) {
    return override
  }
  const keys = new Set([...Object.keys(base), ...Object.keys(override)])
  return Object.fromEntries([...keys].map(key => [key, mergeConfig(
    Object.hasOwn(base, key) ? base[key] : undefined,
    Object.hasOwn(override, key) ? override[key] : undefined,
  )]))
}
const validateConfig = (input: unknown, source: string): ResolvedConfig => {
  const result = configSchema.safeParse(input)
  if (!result.success) {
    throw new Error(`Invalid tldw configuration in ${source}:\n${zod.prettifyError(result.error)}`, {cause: result.error})
  }
  return result.data
}
const readYamlConfig = async (file: string): Promise<unknown> => {
  try {
    return await readOptionalYaml<unknown>(file) ?? {}
  } catch (error) {
    throw new Error(`Failed to parse tldw configuration from ${file}: ${Error.isError(error) ? error.message : String(error)}`, {cause: error})
  }
}
const readTypeScriptConfig = async (file: string): Promise<unknown> => {
  if (!await fs.pathExists(file)) {
    return {}
  }
  const jiti = createJiti(import.meta.url, {
    fsCache: false,
    moduleCache: false,
    tryNative: false,
    interopDefault: false,
  })
  try {
    const module = await jiti.import<{default?: unknown}>(file)
    if (!Object.hasOwn(module, 'default')) {
      throw new TypeError('config.ts must default-export a configuration object.')
    }
    return module.default
  } catch (error) {
    throw new Error(`Failed to load tldw configuration from ${file}: ${Error.isError(error) ? error.message : String(error)}`, {cause: error})
  }
}

export default async (configDirectory: string, projectDirectory: string): Promise<ResolvedConfig> => {
  const yamlFile = path.join(configDirectory, 'config.yml')
  const typescriptFile = path.join(configDirectory, 'config.ts')
  const [yamlConfig, typescriptConfig, hasGithubActions] = await Promise.all([
    readYamlConfig(yamlFile),
    readTypeScriptConfig(typescriptFile),
    fs.pathExists(path.join(projectDirectory, '.github', 'workflows')),
  ])
  // Validate sources without merging their defaults into each other, then canonicalize top-level file sections before source precedence is applied.
  validateConfig(yamlConfig ?? {}, yamlFile)
  validateConfig(typescriptConfig, typescriptFile)
  const canonicalYamlConfig = canonicalizeFileSections(yamlConfig ?? {})
  const canonicalTypeScriptConfig = canonicalizeFileSections(typescriptConfig)
  const config = validateConfig(mergeConfig(canonicalYamlConfig, canonicalTypeScriptConfig), `${yamlFile} and ${typescriptFile}`)
  if (config.shields !== false) {
    config.shields.githubActions ??= hasGithubActions
  }
  return config
}
