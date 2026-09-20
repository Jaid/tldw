import serializeJavaScript from 'serialize-javascript'
import zod from 'zod'

export const defaultValueSchema = zod.strictObject({
  default: zod.unknown().optional(),
  defaultRaw: zod.string().optional(),
}).superRefine((value, context) => {
  if (Object.hasOwn(value, 'default') && Object.hasOwn(value, 'defaultRaw')) {
    context.addIssue({
      code: 'custom',
      message: 'default and defaultRaw are mutually exclusive.',
    })
  }
})

export type DefaultValue = zod.output<typeof defaultValueSchema>

export const formatDefaultValue = (definition: DefaultValue): string | undefined => {
  if (Object.hasOwn(definition, 'defaultRaw')) {
    return definition.defaultRaw
  }
  if (!Object.hasOwn(definition, 'default')) {
    return
  }
  const value = definition.default
  if (typeof value === 'string') {
    return value || '""'
  }
  if (value === undefined) {
    return
  }
  return serializeJavaScript(value, {unsafe: true})
}
