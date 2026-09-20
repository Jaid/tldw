import zod from 'zod'

const rootPropertySchema = zod.string().trim().min(1)
const propertyPathSegmentSchema = zod.union([
  zod.string(),
  zod.int(),
])

export const propertyIdSchema = zod.union([
  rootPropertySchema,
  zod.tuple([rootPropertySchema]).rest(propertyPathSegmentSchema),
])

export type PropertyId = zod.output<typeof propertyIdSchema>

const identifierPattern = /^[\p{ID_Start}$_][\p{ID_Continue}$\u{200C}\u{200D}]*$/u
const quoteProperty = (value: string) => {
  return `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", String.raw`\'`)
    .replaceAll('\n', String.raw`\n`)
    .replaceAll('\r', String.raw`\r`)
    .replaceAll('\t', String.raw`\t`)}'`
}

export const formatPropertyId = (id: PropertyId): string => {
  if (typeof id === 'string') {
    return id
  }
  const [first, ...segments] = id
  return segments.reduce<string>((result, segment) => {
    if (typeof segment === 'number') {
      return `${result}[${segment}]`
    }
    if (identifierPattern.test(segment)) {
      return `${result}.${segment}`
    }
    return `${result}[${quoteProperty(segment)}]`
  }, first)
}
