import type {TypedOption} from '#src/config.schema.ts'
import type MarkdownMap from 'markdown-map'

import fencen from 'fencen'
import flattenString from 'flatten-string'

export interface FlexibleListItemDefinition {
  description?: unknown
  title: string
}

export type FlexibleListItem = FlexibleListItemDefinition | string
export type FlexibleListInput = Array<FlexibleListInput> | FlexibleListItem
export type OptionsEntries = Readonly<Record<string, Omit<TypedOption, 'id'>>> | ReadonlyArray<TypedOption>
type MarkdownMapContents = NonNullable<ReturnType<MarkdownMap['get']>>
type FlexibleListComplexity = 'descriptiveList' | 'sections' | 'shortList'
interface NormalizedFlexibleListItem {
  description: string
  markdownMapContents: MarkdownMapContents | null
  title: string
}
const blockquote = (content: string) => {
  return flattenString.lines(content
    .replaceAll(/\r\n?/gu, '\n')
    .split('\n')
    .map(line => {
      if (!line) {
        return '>'
      }
      return `> ${line}`
    }))
}
const image = (alt: string, source: string) => {
  return `![${alt}](${source})`
}
const link = (text: string, target: string) => {
  return `[${text}](${target})`
}
const note = (...content: Parameters<typeof flattenString.paragraphs>) => {
  return `> [!NOTE]\n${blockquote(flattenString.paragraphs(...content))}`
}
const isMarkdownMapContents = (value: unknown): value is MarkdownMapContents => {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && ('content' in value || 'priority' in value || 'sections' in value)
}
const flattenListInputs = (inputs: ReadonlyArray<FlexibleListInput>): Array<FlexibleListItem> => {
  const items: Array<FlexibleListItem> = []
  const visit = (input: FlexibleListInput) => {
    if (Array.isArray(input)) {
      for (const nestedInput of input) {
        visit(nestedInput)
      }
      return
    }
    items.push(input)
  }
  for (const input of inputs) {
    visit(input)
  }
  return items
}
const normalizeFlexibleListItems = (items: ReadonlyArray<FlexibleListItem>): Array<NormalizedFlexibleListItem> => {
  return items.map(item => {
    if (typeof item === 'string') {
      return {
        title: item,
        description: '',
        markdownMapContents: null,
      }
    }
    const markdownMapContents = isMarkdownMapContents(item.description) ? item.description : null
    return {
      title: item.title,
      description: markdownMapContents ? '' : flattenString.paragraphs(item.description),
      markdownMapContents,
    }
  })
}
const getComplexity = (items: ReadonlyArray<NormalizedFlexibleListItem>): FlexibleListComplexity => {
  if (items.some(item => item.markdownMapContents !== null || item.description.includes('\n'))) {
    return 'sections'
  }
  if (items.some(item => item.description)) {
    return 'descriptiveList'
  }
  return 'shortList'
}
const renderExpandedDescription = (description: string) => {
  return description
    .replaceAll(/\r\n?/gu, '\n')
    .replaceAll(/(?<!\n)\n(?!\n)/gu, '<br>')
}
const renderShortList = (items: ReadonlyArray<NormalizedFlexibleListItem>): MarkdownMapContents => {
  return {
    content: [flattenString.lines(items.map(item => `- ${item.title}`))],
  }
}
const renderDescriptiveList = (items: ReadonlyArray<NormalizedFlexibleListItem>): MarkdownMapContents => {
  return {
    content: [flattenString.lines(items.map(item => {
      return item.description ? `- ${item.title} – ${item.description}` : `- ${item.title}`
    }))],
  }
}
const renderSections = (items: ReadonlyArray<NormalizedFlexibleListItem>): MarkdownMapContents => {
  return {
    sections: Object.fromEntries(items.map(item => {
      if (item.markdownMapContents) {
        return [item.title, item.markdownMapContents]
      }
      return [item.title, {content: [renderExpandedDescription(item.description)]}]
    })),
  }
}
const isTypedOptionArray = (entries: OptionsEntries): entries is ReadonlyArray<TypedOption> => Array.isArray(entries)
const normalizeOptionsEntries = (entries: OptionsEntries): Array<TypedOption> => {
  if (isTypedOptionArray(entries)) {
    return entries.map(value => ({...value}))
  }
  return Object.entries(entries).map(([id, value]) => ({
    id,
    ...value,
  }))
}
const renderOptionId = (option: TypedOption) => {
  const id = fencen.inline(option.id)
  return option.required ? `* ${id}` : id
}
const renderOptionDeclaration = (option: TypedOption) => {
  const type = option.type ? `: ${option.type}` : ''
  const defaultValue = option.default === undefined ? '' : ` = ${option.default}`
  const declaration = fencen.inline(`${option.id}${type}${defaultValue}`)
  return option.required ? `* ${declaration}` : declaration
}
const getOptionsListComplexity = (options: ReadonlyArray<TypedOption>): FlexibleListComplexity => {
  if (options.some(option => option.info?.includes('\n'))) {
    return 'sections'
  }
  if (options.some(option => option.info)) {
    return 'descriptiveList'
  }
  return 'shortList'
}
const optionsList = (entries: OptionsEntries): MarkdownMapContents => {
  const options = normalizeOptionsEntries(entries).map(option => ({
    ...option,
    info: option.info?.replaceAll(/\r\n?/gu, '\n'),
  }))
  if (!options.length) {
    return {content: []}
  }
  const complexity: FlexibleListComplexity = getOptionsListComplexity(options)
  if (complexity !== 'sections') {
    return {
      content: [flattenString.lines(options.map(option => {
        const declaration = renderOptionDeclaration(option)
        return option.info ? `- ${declaration} – ${option.info}` : `- ${declaration}`
      }))],
    }
  }
  return {
    sections: Object.fromEntries(options.map(option => {
      const metadata = [
        option.type ? `- type ${fencen.inline(option.type)}` : '',
        option.default === undefined ? '' : `- default ${fencen.inline(option.default)}`,
      ].filter(Boolean)
      const content = [
        metadata.length ? flattenString.lines(metadata) : '',
        option.info ? renderExpandedDescription(option.info) : '',
      ].filter(Boolean)
      return [renderOptionId(option), {content}]
    })),
  }
}
const optionsTable = (entries: OptionsEntries): MarkdownMapContents => {
  const options = normalizeOptionsEntries(entries)
  if (!options.length) {
    return {content: []}
  }
  const hasType = options.some(option => option.type !== undefined)
  const hasDefault = options.some(option => option.default !== undefined)
  const hasInfo = options.some(option => option.info !== undefined)
  const hasRequired = options.some(option => option.required === true)
  if (!hasType && !hasDefault && !hasInfo && !hasRequired) {
    return {
      content: [flattenString.lines(options.map(option => `- ${fencen.inline(option.id)}`))],
    }
  }
  const columns = [
    {
      header: 'option',
      value: (option: TypedOption) => fencen.inline(option.id),
    },
    ...hasRequired ? [{
      header: '',
      value: (option: TypedOption) => {
        return option.required ? '*' : ''
      },
    }] : [],
    ...hasType ? [{
      header: 'type',
      value: (option: TypedOption) => {
        return option.type === undefined ? '' : fencen.inline(option.type)
      },
    }] : [],
    ...hasDefault ? [{
      header: 'default',
      value: (option: TypedOption) => {
        return option.default === undefined ? '' : fencen.inline(option.default)
      },
    }] : [],
    ...hasInfo ? [{
      header: 'info',
      value: (option: TypedOption) => option.info?.replaceAll(/\r\n?/gu, '\n').replaceAll('\n', '<br>') ?? '',
    }] : [],
  ]
  const rows = options.map(option => {
    const cells = columns.map(column => column.value(option).replaceAll('|', String.raw`\|`))
    while (cells.at(-1) === '') {
      cells.pop()
    }
    return cells.join(' | ')
  })
  return {
    content: [flattenString.lines(
      columns.map(column => column.header).join(' | '),
      columns.map(() => '---').join(' | '),
      rows,
    )],
  }
}
const flexibleList = (...inputs: Array<FlexibleListInput>): MarkdownMapContents => {
  const items = normalizeFlexibleListItems(flattenListInputs(inputs))
  const complexity: FlexibleListComplexity = getComplexity(items)
  if (complexity === 'shortList') {
    return renderShortList(items)
  }
  if (complexity === 'descriptiveList') {
    return renderDescriptiveList(items)
  }
  return renderSections(items)
}

export default {
  flexibleList,
  image,
  link,
  note,
  optionsList,
  optionsTable,
}
