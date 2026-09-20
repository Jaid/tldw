import zod from 'zod'

import {defaultValueSchema} from './lib/defaultValue.ts'
import {supportedPackageManagers} from './lib/packageManagers.ts'
import {propertyIdSchema} from './lib/propertyId.ts'

const nonemptyString = zod.string().trim().min(1)
const stringList = zod.union([nonemptyString, zod.array(nonemptyString)]).transform(value => [...new Set(typeof value === 'string' ? [value] : value)])
const section = <Schema extends zod.ZodType>(schema: Schema) => zod.union([
  zod.literal(false),
  zod.literal(true).transform(() => schema.parse({})),
  schema,
])
const basicSection = section(zod.strictObject({})).prefault({})
const optInBasicSection = section(zod.strictObject({})).default(false)

export const bannerDefinitionSchema = zod.strictObject({
  text: zod.string().optional(),
  font: nonemptyString.optional(),
  topColor: nonemptyString.optional(),
  bottomColor: nonemptyString.optional(),
})
export const customShieldSchema = zod.strictObject({
  id: nonemptyString.optional(),
  altText: zod.string().optional(),
  baseUrl: zod.url().optional(),
  color: zod.string().optional(),
  colorSchemeAware: zod.boolean().optional(),
  label: zod.string().optional(),
  leftText: zod.string().optional(),
  link: zod.string().optional(),
  logo: zod.string().optional(),
  logoColor: zod.string().optional(),
  path: zod.union([nonemptyString, zod.array(nonemptyString).min(1)]).optional(),
  query: zod.record(zod.string(), zod.string()).optional(),
  rightText: zod.string().optional(),
  style: zod.string().optional(),
  variant: zod.string().optional(),
})
export const configuredShieldSchema = zod.union([
  zod.enum(['actions', 'bun', 'commitsSince', 'deno', 'dependents', 'githubPackages', 'issues', 'jsdelivr', 'lastCommit', 'license', 'npm', 'npmDownloads', 'npmLatest', 'npmx', 'pnpm', 'sponsor', 'types', 'unpkg', 'web', 'yarn']),
  customShieldSchema,
])
export const shieldsListSchema = zod.array(zod.union([configuredShieldSchema, zod.array(configuredShieldSchema)])).transform(lines => {
  if (!lines.length) {
    return []
  }
  if (!lines.some(Array.isArray)) {
    return [lines as Array<zod.output<typeof configuredShieldSchema>>]
  }
  return lines.map(line => {
    return Array.isArray(line) ? line : [line]
  })
})
export const installationTypeSchema = zod.enum(['production', 'development', 'global'])
export const typedOptionDefinitionSchema = defaultValueSchema.safeExtend({
  type: zod.string().optional(),
  info: zod.string().optional(),
  required: zod.boolean().optional(),
})
export const typedOptionSchema = typedOptionDefinitionSchema.safeExtend({
  id: propertyIdSchema,
})
export const optionsStyleSchema = zod.enum(['list', 'table'])
export const propsOrderSchema = zod.enum(['original', 'alphabetical', 'jaid'])
export const propsEntriesSchema = zod.union([
  zod.record(nonemptyString, typedOptionDefinitionSchema),
  zod.array(typedOptionSchema),
])
export const propsObjectsSchema = zod.record(nonemptyString, propsEntriesSchema)

const installationSchema = zod.strictObject({
  type: installationTypeSchema.default('production'),
  packageManagers: zod.union([zod.enum(supportedPackageManagers), zod.array(zod.enum(supportedPackageManagers))]).transform(value => [...new Set(typeof value === 'string' ? [value] : value)]).default(['npm']),
  version: zod.boolean().default(false),
  githubPackage: zod.boolean().default(false),
})

// These keys also identify the built-in sections that can be disabled before loading.
export const sectionSchemas = {
  advancedUsage: basicSection,
  api: basicSection,
  architecture: basicSection,
  banner: zod.union([section(bannerDefinitionSchema), zod.string().transform(text => bannerDefinitionSchema.parse({text}))]).default(false),
  cliUsage: section(zod.strictObject({
    binName: zod.union([zod.boolean(), nonemptyString]).optional(),
    example: zod.string().optional(),
  })).prefault({}),
  description: section(zod.strictObject({
    personal: zod.boolean().default(false),
    link: zod.string().nullable().default(null),
    linkName: zod.string().nullable().default(null),
  })).prefault({}),
  development: optInBasicSection,
  environmentVariables: section(zod.strictObject({
    values: zod.record(zod.string(), zod.string()).default({}),
  })).prefault({}),
  example: section(zod.strictObject({
    resultMayVary: zod.boolean().default(false),
  })).prefault({}),
  faq: basicSection,
  features: section(zod.strictObject({
    items: zod.array(zod.union([zod.string(), zod.strictObject({
      title: zod.string(),
      description: zod.unknown().optional(),
    })])).optional(),
  })).prefault({}),
  generationComment: basicSection,
  installation: section(installationSchema).optional(),
  intro: basicSection,
  legal: basicSection,
  license: basicSection,
  minimalExample: basicSection,
  notes: basicSection,
  options: section(zod.strictObject({
    style: optionsStyleSchema.default('table'),
  })).prefault({}),
  props: section(zod.strictObject({
    entries: propsEntriesSchema.default({}),
    objects: propsObjectsSchema.default({}),
    order: propsOrderSchema.default('jaid'),
    style: optionsStyleSchema.default('list'),
  })).prefault({}),
  related: basicSection,
  result: basicSection,
  screenshots: basicSection,
  shields: section(zod.strictObject({
    items: shieldsListSchema.nullable().default(null),
    exclude: stringList.default([]),
    githubActions: zod.boolean().optional(),
  })).prefault({}),
  tryInBrowser: section(zod.strictObject({})).optional(),
  usage: section(zod.strictObject({
    resultMayVary: zod.boolean().default(false),
  })).prefault({}),
  usageResult: basicSection,
}

export const tldwSchema = zod.strictObject({
  maxBlankLines: zod.int().nonnegative().default(1),
  // Shared by installation and the browser section.
  needsNodeRuntime: zod.boolean().default(true),
})

const knownConfigKeys = new Set([...Object.keys(sectionSchemas), 'sections', 'tldw'])

export const configSchema = zod.object({
  ...sectionSchemas,
  sections: zod.record(nonemptyString, nonemptyString).default({}),
  tldw: tldwSchema.prefault({}),
}).catchall(zod.unknown()).superRefine((config, context) => {
  for (const [key, value] of Object.entries(config)) {
    if (knownConfigKeys.has(key)) {
      continue
    }
    if (typeof value !== 'string' || !value.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'File-backed section values must be nonempty file paths.',
        path: [key],
      })
    }
  }
})

/** Configuration accepted in config.ts and config.yml, before defaults are applied. */
export type Config = zod.input<typeof configSchema>
/** Validated configuration consumed by sections. */
export type ResolvedConfig = zod.output<typeof configSchema>
export type InstallationType = zod.output<typeof installationTypeSchema>
export type TypedOption = zod.output<typeof typedOptionSchema>

export default configSchema
