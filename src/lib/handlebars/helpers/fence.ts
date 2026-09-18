import fencen from 'fencen'

export default (input: unknown, language: unknown) => {
  if (typeof input !== 'string') {
    return ''
  }
  return fencen.block(input, {
    language: typeof language === 'string' ? language : undefined,
  })
}
