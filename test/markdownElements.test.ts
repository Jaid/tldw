import {expect, test} from 'bun:test'

import MarkdownMap from 'markdown-map'

import markdownElements from '#src/lib/markdownElements.ts'

test('comment renders single-line comments inline', () => {
  expect(markdownElements.comment('abc')).toBe('<!-- abc -->')
})
test('comment renders multiline comments as a block', () => {
  expect(markdownElements.comment('abc', ['def'])).toBe([
    '<!--',
    'abc',
    'def',
    '-->',
  ].join('\n'))
})
test('note renders GitHub-style multiline callouts', () => {
  expect(markdownElements.note('First paragraph.\n\nSecond paragraph.')).toBe([
    '> [!NOTE]',
    '> First paragraph.',
    '>',
    '> Second paragraph.',
  ].join('\n'))
})
test('note accepts the full flattenString.paragraphs argument list', () => {
  expect(markdownElements.note(
    'First paragraph.',
    false,
    ['Second paragraph.', null],
  )).toBe([
    '> [!NOTE]',
    '> First paragraph.',
    '>',
    '> Second paragraph.',
  ].join('\n'))
})
test('note normalizes Windows line breaks', () => {
  expect(markdownElements.note('First.\r\nSecond.')).toBe('> [!NOTE]\n> First.\n> Second.')
})
test('link renders Markdown links', () => {
  expect(markdownElements.link('Open site', 'https://example.com/path')).toBe('[Open site](https://example.com/path)')
})
test('image renders Markdown images', () => {
  expect(markdownElements.image('Preview', 'https://example.com/image.png')).toBe('![Preview](https://example.com/image.png)')
})
test('flexibleList renders plain strings as a compact bullet list and flattens inputs', () => {
  expect(markdownElements.flexibleList(
    ['Item 1', ['Item 2']],
    'Item 3',
  )).toEqual({
    content: ['- Item 1\n- Item 2\n- Item 3'],
  })
})
test('flexibleList keeps simple one-line descriptions inside bullet items', () => {
  expect(markdownElements.flexibleList([
    {
      title: 'Item 1',
      description: 'This is a simple item',
    },
    {
      title: 'Item 2',
      description: 'This is a more complex item with a longer description, but still one line',
    },
  ])).toEqual({
    content: [
      '- Item 1 – This is a simple item\n- Item 2 – This is a more complex item with a longer description, but still one line',
    ],
  })
})
test('flexibleList expands complex descriptions into correctly nested headings', () => {
  const contents = markdownElements.flexibleList([
    {
      title: 'Item 1',
      description: 'This is a simple item',
    },
    'Item 2',
    {
      title: 'Item 3',
      description: 'This is an even more complex item with a longer description\nthat is multi-line',
    },
  ])
  expect(MarkdownMap.render({features: contents}, {startDepth: 2})).toBe([
    '## features',
    '',
    '### Item 1',
    '',
    'This is a simple item',
    '',
    '### Item 2',
    '',
    '### Item 3',
    '',
    'This is an even more complex item with a longer description<br>that is multi-line',
  ].join('\n'))
})
test('flexibleList accepts MarkdownMap contents as descriptions and preserves inherited depth', () => {
  const contents = markdownElements.flexibleList({
    title: 'Structured item',
    description: {
      content: ['Structured description.'],
      sections: {
        details: {
          content: ['Nested details.'],
        },
      },
    },
  })
  expect(MarkdownMap.render({features: contents}, {startDepth: 3})).toBe([
    '### features',
    '',
    '#### Structured item',
    '',
    'Structured description.',
    '',
    '##### details',
    '',
    'Nested details.',
  ].join('\n'))
})
test('optionsList renders record entries as compact inline-code declarations', () => {
  expect(markdownElements.optionsList({
    optionA: {},
    optionB: {type: 'string'},
    optionC: {type: 'number | boolean'},
  })).toEqual({
    content: ['- `optionA`\n- `optionB: string`\n- `optionC: number | boolean`'],
  })
})
test('optionsList renders defaults and one-line descriptions compactly', () => {
  expect(markdownElements.optionsList([
    {
      id: 'optionA',
      type: 'string',
      default: "'defaultValue'",
      info: 'Description for optionA',
    },
    {
      id: 'optionB',
      info: 'Description for optionB',
    },
    {
      id: 'optionC',
      type: 'number | boolean',
      default: 'true',
    },
  ])).toEqual({
    content: ["- `optionA: string = 'defaultValue'` – Description for optionA\n- `optionB` – Description for optionB\n- `optionC: number | boolean = true`"],
  })
})
test('optionsList expands every entry when one description is multiline', () => {
  const contents = markdownElements.optionsList([
    {
      id: 'optionA',
      type: 'string',
      default: "'defaultValue'",
      info: 'Description for optionA',
    },
    {
      id: 'optionB',
      info: 'Description for optionB\nwith more detail.',
    },
    {
      id: 'optionC',
      type: 'number | boolean',
      default: 'true',
    },
  ])
  expect(MarkdownMap.render({props: contents}, {startDepth: 2})).toBe([
    '## props',
    '',
    '### `optionA`',
    '',
    '- type `string`',
    "- default `'defaultValue'`",
    '',
    'Description for optionA',
    '',
    '### `optionB`',
    '',
    'Description for optionB<br>with more detail.',
    '',
    '### `optionC`',
    '',
    '- type `number | boolean`',
    '- default `true`',
  ].join('\n'))
})
test('optionsTable renders ID-only entries as a compact bullet list', () => {
  expect(markdownElements.optionsTable([
    {id: 'optionA'},
    {id: 'optionB'},
    {id: 'optionC'},
  ])).toEqual({
    content: ['- `optionA`\n- `optionB`\n- `optionC`'],
  })
})
test('optionsTable adds a type column when at least one option has a type', () => {
  expect(markdownElements.optionsTable([
    {
      id: 'optionA',
      type: 'string',
    },
    {id: 'optionB'},
    {
      id: 'optionC',
      type: 'number',
    },
  ])).toEqual({
    content: [[
      'option | type',
      '--- | ---',
      '`optionA` | `string`',
      '`optionB`',
      '`optionC` | `number`',
    ].join('\n')],
  })
})
test('optionsTable adds an info column and preserves empty interior cells', () => {
  expect(markdownElements.optionsTable([
    {
      id: 'optionA',
      type: 'string',
      info: 'Description for optionA',
    },
    {
      id: 'optionB',
      info: 'Description for optionB',
    },
    {
      id: 'optionC',
      type: 'number | boolean',
    },
  ])).toEqual({
    content: [[
      'option | type | info',
      '--- | --- | ---',
      '`optionA` | `string` | Description for optionA',
      '`optionB` |  | Description for optionB',
      '`optionC` | `number \\| boolean`',
    ].join('\n')],
  })
})
test('optionsTable adds a default column when defaults are present', () => {
  expect(markdownElements.optionsTable([
    {
      id: 'optionA',
      type: 'string',
      default: "'defaultValue'",
      info: 'Description for optionA',
    },
    {
      id: 'optionB',
      info: 'Description for optionB',
    },
    {
      id: 'optionC',
      type: 'number | boolean',
      default: 'true',
    },
  ])).toEqual({
    content: [[
      'option | type | default | info',
      '--- | --- | --- | ---',
      "`optionA` | `string` | `'defaultValue'` | Description for optionA",
      '`optionB` |  |  | Description for optionB',
      '`optionC` | `number \\| boolean` | `true`',
    ].join('\n')],
  })
})
test('optionsList renders required entries with a star', () => {
  expect(markdownElements.optionsList([
    {
      id: 'requiredOption',
      required: true,
    },
    {id: 'optionalOption'},
  ])).toEqual({
    content: ['- * `requiredOption`\n- `optionalOption`'],
  })
})
test('optionsTable renders required entries in an unlabeled star column', () => {
  expect(markdownElements.optionsTable([
    {
      id: 'requiredOption',
      required: true,
      type: 'string',
    },
    {id: 'optionalOption'},
    {
      id: 'typedOption',
      type: 'number',
    },
  ])).toEqual({
    content: [[
      'option |  | type',
      '--- | --- | ---',
      '`requiredOption` | * | `string`',
      '`optionalOption`',
      '`typedOption` |  | `number`',
    ].join('\n')],
  })
})
