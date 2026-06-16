export interface GenerateShieldOptions {
  altText?: string
  baseUrl?: string
  color?: string
  colorSchemeAware?: boolean
  label?: string
  leftText?: string
  link?: string
  logo?: string
  logoColor?: string
  path?: Array<string> | string
  query?: Record<string, string>
  rightText?: string
  style?: string
  variant?: string
}

const defaultBaseUrl = 'https://shieldcn.dev'
const shieldcnVariantByShieldsStyle: Partial<Record<string, string>> = {
  flat: 'secondary',
  'flat-square': 'secondary',
  'for-the-badge': 'default',
  plastic: 'outline',
  social: 'ghost',
}
const imageExtensions = new Set(['.gif', '.png', '.svg'])
const escapeShieldPart = (input: string) => {
  return input.replaceAll('-', '--').replaceAll('_', '__')
}
const encodePath = (input: string) => {
  return input.split('/').map(part => encodeURIComponent(part)).join('/')
}
const hasImageExtension = (input: string) => {
  return [...imageExtensions].some(extension => input.endsWith(extension))
}
const appendSvgExtension = (input: string) => {
  return hasImageExtension(input) ? input : `${input}.svg`
}
const isShieldcnUrl = (input: string) => {
  try {
    const hostname = new URL(input).hostname
    return hostname === 'shieldcn.dev' || hostname === 'www.shieldcn.dev'
  } catch {
    return false
  }
}
const buildUrl = (baseUrl: string, path: string, query: URLSearchParams) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, '')
  const normalizedPath = path.replace(/^\/+/, '')
  const queryString = query.toString()
  return queryString ? `${normalizedBaseUrl}/${normalizedPath}?${queryString}` : `${normalizedBaseUrl}/${normalizedPath}`
}

export default (options: GenerateShieldOptions) => {
  const baseUrl = options.baseUrl ?? defaultBaseUrl
  const altText = options.altText ?? 'Shield'
  const isShieldcn = isShieldcnUrl(baseUrl)
  const query = new URLSearchParams
  if (isShieldcn) {
    query.set('variant', options.variant ?? shieldcnVariantByShieldsStyle[options.style ?? 'flat-square'] ?? options.style ?? 'secondary')
  } else {
    query.set('style', options.style ?? 'flat-square')
  }
  if (options.logo) {
    query.set('logo', options.logo)
  }
  if (options.logoColor) {
    query.set('logoColor', options.logoColor)
  }
  if (options.label) {
    query.set('label', options.label)
  }
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      query.set(key, value)
    }
  }
  let pathValue = `badge/${encodeURIComponent(escapeShieldPart(options.leftText ?? 'Left'))}-${encodeURIComponent(escapeShieldPart(options.rightText ?? 'Right'))}-${encodeURIComponent(options.color ?? 'lightgray')}`
  if (options.path) {
    if (Array.isArray(options.path)) {
      pathValue = options.path.map(part => encodeURIComponent(part)).join('/')
    } else {
      pathValue = encodePath(options.path)
    }
  }
  if (options.path && options.color) {
    query.set('color', options.color)
  }
  const normalizedPathValue = isShieldcn ? appendSvgExtension(pathValue) : pathValue
  const imgUrl = buildUrl(baseUrl, normalizedPathValue, query)
  let image = `<img src="${imgUrl}" alt="${altText}"/>`
  if (options.colorSchemeAware && isShieldcn) {
    const lightQuery = new URLSearchParams(query)
    lightQuery.set('mode', 'light')
    const darkQuery = new URLSearchParams(query)
    darkQuery.set('mode', 'dark')
    image = `<picture><source media="(prefers-color-scheme: dark)" srcset="${buildUrl(baseUrl, normalizedPathValue, darkQuery)}"><img src="${buildUrl(baseUrl, normalizedPathValue, lightQuery)}" alt="${altText}"/></picture>`
  }
  return options.link ? `<a href="${options.link}">${image}</a>` : image
}
