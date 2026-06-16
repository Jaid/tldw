import type {PackageManager} from './packageManagers.ts'
import type {Arrayable, ConfiguredShield, CustomShieldDefinition, PackageData, ShieldsConfig} from './types.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import trimAround from 'trim-around'
import {parse as parseYaml} from 'yaml'

import collator from './collator.ts'
import {defaultPackageManagers, supportedPackageManagers} from './packageManagers.ts'

export const supportedCodeExtensions = ['ts', 'tsx', 'js', 'jsx'] as const
export type SupportedCodeExtension = typeof supportedCodeExtensions[number]

export interface CodeFragment {
  content: string
  extension: SupportedCodeExtension
}

export const readOptionalText = async (file: string) => {
  if (!await fs.pathExists(file)) {
    return null
  }
  const stat = await fs.stat(file)
  if (!stat.isFile()) {
    return null
  }
  const text = await Bun.file(file).text()
  return trimAround(text)
}

export const readOptionalJson = async <Type>(file: string) => {
  const content = await readOptionalText(file)
  if (content === null) {
    return null
  }
  return JSON.parse(content) as Type
}

export const readOptionalYaml = async <Type>(file: string) => {
  const content = await readOptionalText(file)
  if (content === null) {
    return null
  }
  const parsed = parseYaml(content) as Type | null
  return parsed ?? null
}

export const readOptionalCodeFragmentWithMetadata = async (stem: string): Promise<CodeFragment | null> => {
  for (const extension of supportedCodeExtensions) {
    const content = await readOptionalText(`${stem}.${extension}`)
    if (content !== null) {
      return {
        content,
        extension,
      }
    }
  }
  return null
}

export const readOptionalCodeFragment = async (stem: string) => {
  const fragment = await readOptionalCodeFragmentWithMetadata(stem)
  return fragment?.content ?? null
}

export const hasContent = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }
  return true
}

export const toArray = <Type>(input: Arrayable<Type> | null | undefined): Array<Type> => {
  if (input === null || input === undefined) {
    return []
  }
  if (Array.isArray(input)) {
    return [...input]
  }
  return [input]
}

export const normalizeStringArray = (input: unknown) => {
  let rawValues: Array<unknown> = []
  if (Array.isArray(input)) {
    rawValues = input
  } else if (input !== null && input !== undefined) {
    rawValues = [input]
  }
  const values = rawValues
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean)
  return [...new Set(values)]
}

export const normalizePackageManagers = (input: unknown, fallback: Array<PackageManager> = defaultPackageManagers) => {
  const rawValues = input === null || input === undefined ? fallback : normalizeStringArray(input)
  const packageManagers: Array<PackageManager> = []
  for (const rawValue of rawValues) {
    const normalizedValue = rawValue.toLowerCase()
    const packageManager = supportedPackageManagers.find(candidate => candidate === normalizedValue)
    if (!packageManager || packageManagers.includes(packageManager)) {
      continue
    }
    packageManagers.push(packageManager)
  }
  return packageManagers
}

export const normalizeMaxBlankLines = (input: unknown, fallback = 1) => {
  if (typeof input !== 'number' || !Number.isFinite(input)) {
    return fallback
  }
  return Math.max(0, Math.floor(input))
}

const isCustomShieldDefinition = (input: unknown): input is CustomShieldDefinition => {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

export const normalizeConfiguredShield = (input: unknown): ConfiguredShield | null => {
  if (typeof input === 'string') {
    const value = input.trim()
    if (value) {
      return value
    }
    return null
  }
  if (isCustomShieldDefinition(input)) {
    return input
  }
  return null
}

export const normalizeShieldsConfig = (input: unknown): Array<Array<ConfiguredShield>> | null => {
  if (!Array.isArray(input)) {
    return null
  }
  if (input.length === 0) {
    return []
  }
  const hasNestedArrays = input.some(Array.isArray)
  if (!hasNestedArrays) {
    return [input.map(normalizeConfiguredShield).filter((shield): shield is ConfiguredShield => shield !== null)]
  }
  return input
    .map(line => {
      const lineEntries = Array.isArray(line) ? line : [line]
      return lineEntries.map(normalizeConfiguredShield).filter((shield): shield is ConfiguredShield => shield !== null)
    })
}

export const normalizeBannerConfig = (input: unknown) => {
  if (input === false || input === null || input === undefined) {
    return false
  }
  if (input === true) {
    return true
  }
  if (typeof input === 'string') {
    const value = input.trim()
    return value || true
  }
  if (typeof input === 'object' && !Array.isArray(input)) {
    return input
  }
  return false
}

export const isExcludedShield = (excludedShields: Arrayable<string> | null | undefined, shieldId: string) => {
  const normalizedShieldId = shieldId.trim().toLowerCase()
  return normalizeStringArray(excludedShields).some(excludedShield => excludedShield.toLowerCase() === normalizedShieldId)
}

export const escapeXml = (input: string) => {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export const sortRecord = <Type>(input: Record<string, Type>) => {
  return Object.fromEntries(Object.entries(input).toSorted(([keyA], [keyB]) => collator.compare(keyA, keyB)))
}

export const getRepositoryUrl = (repository: PackageData['repository']) => {
  if (typeof repository === 'string') {
    return repository
  }
  if (repository?.url) {
    return repository.url
  }
  return null
}

export const parseGitHubSlug = (input: string) => {
  const sanitized = input
    .trim()
    .replace(/^git\+/u, '')
    .replace(/[#?].*$/u, '')
    .replace(/\.git$/u, '')
    .replace(/\/$/u, '')
  const patterns = [
    /^github:(?<owner>[^/]+)\/(?<repo>[^/]+)$/u,
    /github\.com[/:](?<owner>[^/]+)\/(?<repo>[^/]+)$/iu,
    /^(?<owner>[^/]+)\/(?<repo>[^/]+)$/u,
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(sanitized)
    if (match?.groups?.owner && match.groups.repo) {
      return `${match.groups.owner}/${match.groups.repo}`
    }
  }
  return null
}

export const getFundingLink = (funding: PackageData['funding']): string | null => {
  if (typeof funding === 'string') {
    return funding
  }
  if (Array.isArray(funding)) {
    for (const entry of funding) {
      const link = getFundingLink(entry)
      if (link) {
        return link
      }
    }
    return null
  }
  if (funding?.url) {
    return funding.url
  }
  return null
}

export const getDefaultBinName = (pkg: PackageData) => {
  if (pkg.bin && typeof pkg.bin === 'object' && !Array.isArray(pkg.bin)) {
    const [commandName] = Object.keys(pkg.bin)
    if (commandName) {
      return commandName
    }
  }
  if (pkg.name.startsWith('@')) {
    const [, commandName = pkg.name] = pkg.name.split('/')
    return commandName
  }
  return pkg.name
}

export const getLinkHost = (link: string) => {
  try {
    return new URL(link).host
  } catch {
    return null
  }
}

export const normalizeReadmeText = (input: string) => {
  return `${input.replaceAll(/\r\n?/gu, '\n').trim()}\n`
}

export const applyMaxBlankLines = (input: string, maxBlankLines: number) => {
  const normalizedInput = input.replaceAll(/\r\n?/gu, '\n')
  const lines = normalizedInput.split('\n')
  const outputLines: Array<string> = []
  let blankLines = 0
  let activeFenceMarker: string | null = null
  for (const line of lines) {
    const fenceMarker = /^(?<indent>\s*)(?<marker>`{3,}|~{3,})/u.exec(line)?.groups?.marker ?? null
    if (fenceMarker) {
      if (activeFenceMarker === fenceMarker) {
        activeFenceMarker = null
      } else if (activeFenceMarker === null) {
        activeFenceMarker = fenceMarker
      }
    }
    const isBlankLine = line.trim().length === 0
    if (activeFenceMarker === null && isBlankLine) {
      blankLines++
      if (blankLines > maxBlankLines) {
        continue
      }
    } else {
      blankLines = 0
    }
    outputLines.push(line)
  }
  return `${outputLines.join('\n').trim()}\n`
}

export const getFileStem = (file: string) => {
  return path.basename(file, path.extname(file))
}
