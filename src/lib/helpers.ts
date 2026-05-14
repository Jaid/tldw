import type {PackageData} from './types.ts'

import * as path from 'forward-slash-path'
import fs from 'fs-extra'
import {parse as parseYaml} from 'yaml'

import collator from './collator.ts'

export const supportedCodeExtensions = ['ts', 'js'] as const

export const readOptionalText = async (file: string) => {
  if (!await fs.pathExists(file)) {
    return null
  }
  const stat = await fs.stat(file)
  if (!stat.isFile()) {
    return null
  }
  return Bun.file(file).text()
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

export const readOptionalCodeFragment = async (stem: string) => {
  for (const extension of supportedCodeExtensions) {
    const content = await readOptionalText(`${stem}.${extension}`)
    if (content !== null) {
      return content
    }
  }
  return null
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

export const getFileStem = (file: string) => {
  return path.basename(file, path.extname(file))
}
