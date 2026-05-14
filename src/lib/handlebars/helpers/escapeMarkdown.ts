export default (input: unknown) => {
  if (typeof input !== 'string') {
    return ''
  }
  return input.replaceAll('<', String.raw`\<`)
}
