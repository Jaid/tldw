export interface GenerateShieldOptions {
  altText?: string
  baseUrl?: string
  color?: string
  label?: string
  leftText?: string
  link?: string
  logo?: string
  logoColor?: string
  path?: Array<string> | string
  query?: Record<string, string>
  rightText?: string
  style?: string
}

const escapeShieldPart = (input: string) => {
  return input.replaceAll('-', '--').replaceAll('_', '__')
}
const encodePath = (input: string) => {
  return input.split('/').map(part => encodeURIComponent(part)).join('/')
}
const buildUrl = (baseUrl: string, path: string, query: URLSearchParams) => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, '')
  const normalizedPath = path.replace(/^\/+/, '')
  const queryString = query.toString()
  return queryString ? `${normalizedBaseUrl}/${normalizedPath}?${queryString}` : `${normalizedBaseUrl}/${normalizedPath}`
}

export default (options: GenerateShieldOptions) => {
  const baseUrl = options.baseUrl ?? 'https://img.shields.io'
  const altText = options.altText ?? 'Shield'
  const query = new URLSearchParams({
    style: options.style ?? 'flat-square',
  })
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
  const imgUrl = buildUrl(baseUrl, pathValue, query)
  const image = `<img src="${imgUrl}" alt="${altText}"/>`
  return options.link ? `<a href="${options.link}">${image}</a>` : image
}
