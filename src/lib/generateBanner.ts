import {escapeXml} from './helpers.ts'

export interface GenerateBannerOptions {
  bottomColor?: string
  font?: string
  text: string
  topColor?: string
}

const defaultFont = 'Bahnschrift, Lexend, sans-serif'
const defaultTopColor = 'oklch(37% 50% 320)'
const defaultBottomColor = 'oklch(29% 75% 335)'

export default ({bottomColor = defaultBottomColor, font = defaultFont, text, topColor = defaultTopColor}: GenerateBannerOptions) => {
  const escapedFont = escapeXml(font)
  const escapedText = escapeXml(text)
  const escapedTopColor = escapeXml(topColor)
  const escapedBottomColor = escapeXml(bottomColor)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16000 1000"><style>.text { font: 500px ${escapedFont} }</style><defs><linearGradient id="color" x1="50%" y1="0%" x2="50%" y2="100%"><stop stop-color="${escapedTopColor}"/><stop offset="100%" stop-color="${escapedBottomColor}"/></linearGradient></defs><rect width="16000" height="1000" fill="url(#color)" rx="0" ry="0"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="white" class="text">${escapedText}</text></svg>`
}
