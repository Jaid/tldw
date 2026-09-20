import type {ResolvedConfig, TypedOption} from '../config.schema.ts'
import type {OptionsEntries} from './markdownElements.ts'

import {formatPropertyId} from './propertyId.ts'

type PropsConfig = Exclude<ResolvedConfig['props'], false>
type PropsOrder = PropsConfig['order']

const alphabeticalCollator = new Intl.Collator(undefined)
const naturalCollator = new Intl.Collator(undefined, {numeric: true})
const isTypedOptionArray = (entries: OptionsEntries): entries is ReadonlyArray<TypedOption> => Array.isArray(entries)
const normalizeEntries = (entries: OptionsEntries): Array<TypedOption> => {
  if (isTypedOptionArray(entries)) {
    return entries.map(entry => ({...entry}))
  }
  return Object.entries(entries).map(([id, entry]) => ({
    id,
    ...entry,
  }))
}
const getJaidGroup = (id: string) => {
  if (id === 'key') {
    return 0
  }
  if (id === 'id') {
    return 1
  }
  if (id === 'className') {
    return 2
  }
  if (id === 'ref') {
    return 4
  }
  if (/^on[A-Z]/u.test(id)) {
    return 5
  }
  if (id === 'children') {
    return 6
  }
  return 3
}
const compareJaid = (a: TypedOption, b: TypedOption) => {
  const idA = formatPropertyId(a.id)
  const idB = formatPropertyId(b.id)
  const groupDifference = getJaidGroup(idA) - getJaidGroup(idB)
  if (groupDifference) {
    return groupDifference
  }
  return naturalCollator.compare(idA, idB)
}

export default (entries: OptionsEntries, order: PropsOrder): Array<TypedOption> => {
  const normalized = normalizeEntries(entries)
  if (order === 'original') {
    return normalized
  }
  if (order === 'alphabetical') {
    return normalized.toSorted((a, b) => alphabeticalCollator.compare(formatPropertyId(a.id), formatPropertyId(b.id)))
  }
  return normalized.toSorted(compareJaid)
}
