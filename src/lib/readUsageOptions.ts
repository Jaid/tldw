import type {UsageOptionEntry, UsageOptions} from './types.ts'

import * as path from 'forward-slash-path'

import collator from './collator.ts'
import {hasContent, readOptionalYaml} from './helpers.ts'

interface ActionInput {
  default?: unknown
  description?: string
  required?: boolean
}
interface ActionInfo {
  inputs?: Record<string, ActionInput>
}
const sortEntries = (entryA: UsageOptionEntry, entryB: UsageOptionEntry) => {
  if (entryA.required && !entryB.required) {
    return -1
  }
  if (entryB.required && !entryA.required) {
    return 1
  }
  return collator.compare(entryA.name, entryB.name)
}
const toUsageOptionEntry = (name: string, value: unknown): UsageOptionEntry => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return {
      name,
      ...(value as Omit<UsageOptionEntry, 'name'>),
    }
  }
  return {
    name,
    default: value,
  }
}

export default async (file: string, projectDirectory: string): Promise<UsageOptions | null> => {
  const [options, actionInfo] = await Promise.all([
    readOptionalYaml<Record<string, unknown>>(file),
    readOptionalYaml<ActionInfo>(path.join(projectDirectory, 'action.yml')),
  ])
  const optionEntries = Object.entries(options ?? {}).map(([name, values]) => toUsageOptionEntry(name, values))
  if (actionInfo?.inputs) {
    for (const [inputId, input] of Object.entries(actionInfo.inputs)) {
      let optionEntry = optionEntries.find(entry => entry.name === inputId)
      if (!optionEntry) {
        optionEntry = {name: inputId}
        optionEntries.push(optionEntry)
      }
      if (optionEntry.info === undefined && typeof input.description === 'string') {
        optionEntry.info = input.description
      }
      if (optionEntry.default === undefined && Object.hasOwn(input, 'default')) {
        optionEntry.default = input.default
      }
      if (optionEntry.required === undefined && typeof input.required === 'boolean') {
        optionEntry.required = input.required
      }
    }
  }
  if (optionEntries.length === 0) {
    return null
  }
  optionEntries.sort(sortEntries)
  return {
    entries: optionEntries,
    anyEntryHasType: optionEntries.some(option => hasContent(option.type)),
    anyEntryHasInfo: optionEntries.some(option => hasContent(option.info)),
    anyEntryHasRequired: optionEntries.some(option => option.required === true),
    anyEntryHasDefault: optionEntries.some(option => hasContent(option.default)),
  }
}
