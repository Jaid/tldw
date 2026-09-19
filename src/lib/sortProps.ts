import type {ResolvedConfig, TypedOption} from '../config.schema.ts'

type PropsConfig = Exclude<ResolvedConfig['props'], false>
type PropsEntries = PropsConfig['entries']
type PropsOrder = PropsConfig['order']

const alphabeticalCollator = new Intl.Collator(undefined)
const naturalCollator = new Intl.Collator(undefined, {numeric: true})
const normalizeEntries = (entries: PropsEntries): Array<TypedOption> => {
  if (Array.isArray(entries)) {
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
  const groupDifference = getJaidGroup(a.id) - getJaidGroup(b.id)
  if (groupDifference) {
    return groupDifference
  }
  return naturalCollator.compare(a.id, b.id)
}

export default (entries: PropsEntries, order: PropsOrder): Array<TypedOption> => {
  const normalized = normalizeEntries(entries)
  if (order === 'original') {
    return normalized
  }
  if (order === 'alphabetical') {
    return normalized.toSorted((a, b) => alphabeticalCollator.compare(a.id, b.id))
  }
  return normalized.toSorted(compareJaid)
}
