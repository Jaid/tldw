import {expect, test} from 'bun:test'

import {formatPropertyId, propertyIdSchema} from '#src/lib/propertyId.ts'

test('property paths flatten to JavaScript-style access notation', () => {
  expect(formatPropertyId(['myvariable'])).toBe('myvariable')
  expect(formatPropertyId(['myvariable', 'sub'])).toBe('myvariable.sub')
  expect(formatPropertyId(['myvariable', 1])).toBe('myvariable[1]')
  expect(formatPropertyId(['myvariable', 'sub', 2])).toBe('myvariable.sub[2]')
  expect(formatPropertyId(['myvariable', 'example.com'])).toBe("myvariable['example.com']")
})
test('property path schema requires a string root', () => {
  expect(propertyIdSchema.safeParse(['myvariable', 'sub', 2]).success).toBeTrue()
  expect(propertyIdSchema.safeParse([]).success).toBeFalse()
  expect(propertyIdSchema.safeParse([1, 'sub']).success).toBeFalse()
})
