import {expect, test} from 'bun:test'

import sortProps from '#src/lib/sortProps.ts'

const entries = [
  {id: 'children'},
  {id: 'onClick'},
  {id: 'ref'},
  {id: 'zeta'},
  {id: 'className'},
  {id: 'id'},
  {id: 'key'},
  {id: 'beta10'},
  {id: 'beta2'},
  {id: 'onBlur'},
  {id: 'alpha'},
]
const ids = (order: 'alphabetical' | 'jaid' | 'original') => sortProps(entries, order).map(entry => entry.id)
test('original prop order preserves declaration order', () => {
  expect(ids('original')).toEqual(entries.map(entry => entry.id))
})
test('alphabetical prop order ignores JSX priority groups', () => {
  expect(ids('alphabetical')).toEqual([
    'alpha',
    'beta10',
    'beta2',
    'children',
    'className',
    'id',
    'key',
    'onBlur',
    'onClick',
    'ref',
    'zeta',
  ])
})
test('jaid prop order mirrors JSX prop sorting priorities with natural sorting', () => {
  expect(ids('jaid')).toEqual([
    'key',
    'id',
    'className',
    'alpha',
    'beta2',
    'beta10',
    'zeta',
    'ref',
    'onBlur',
    'onClick',
    'children',
  ])
})
test('prop sorting also normalizes record entries without mutating them', () => {
  const record = {
    children: {type: 'ReactNode'},
    value: {type: 'string'},
    onChange: {type: '() => void'},
    ref: {type: 'Ref<unknown>'},
    id: {type: 'string'},
  }
  expect(sortProps(record, 'jaid').map(entry => entry.id)).toEqual([
    'id',
    'value',
    'ref',
    'onChange',
    'children',
  ])
  expect(Object.keys(record)).toEqual(['children', 'value', 'onChange', 'ref', 'id'])
})
