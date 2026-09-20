import {expect, test} from 'bun:test'

import {formatDefaultValue} from '#src/lib/defaultValue.ts'

test('structured defaults use serialize-javascript', () => {
  expect(formatDefaultValue({default: {enabled: true}})).toBe('{"enabled":true}')
  expect(formatDefaultValue({default: {path: 'v1/logs'}})).toBe('{"path":"v1/logs"}')
  expect(formatDefaultValue({default: /abc/giu})).toBe('new RegExp("abc", "giu")')
  expect(formatDefaultValue({default: new Date('2024-01-02T03:04:05.000Z')})).toBe('new Date("2024-01-02T03:04:05.000Z")')
})
test('string and raw defaults retain their existing behavior', () => {
  expect(formatDefaultValue({default: 'value'})).toBe('value')
  expect(formatDefaultValue({default: ''})).toBe('""')
  expect(formatDefaultValue({defaultRaw: 'createDefault()'})).toBe('createDefault()')
})
