const fragments = {
  legal: 'Legal',
  warning: 'Warning',
  usage: 'Usage',
  advancedUsage: 'Advanced Usage',
  example: true,
  options: true,
  development: true,
  description: true,
  result: true,
  notes: 'Notes',
  related: 'Related',
  faq: 'Questions & Answers',
} as const

export default fragments

export type FragmentId = keyof typeof fragments
