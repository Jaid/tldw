import buildUrl from "build-url"
import ensureArray from "ensure-array"

const debug = require("debug")(process.env.REPLACE_PKG_NAME)

/**
 * @typedef {Object} Options
 * @prop {string} altText
 * @prop {string} color
 * @prop {string} leftText
 * @prop {string} rightText
 * @prop {string} style
 * @prop {string} logo
 * @prop {string} logoColor
 * @prop {string} link
 * @prop {string|string[]} path
 * @prop {string} label
 * @prop {string} baseUrl
 * @prop {Object} query
 */

function escapeShieldPart(input) {
  return input.replace(/-/g, "--").replace(/_/g, "__")
}

/**
  * @function
  * @param {Options} options
  * @return {string}
  */
export default options => {
  const baseUrl = options.baseUrl || "https://img.shields.io"
  const altText = options.altText || "Shield"
  const color = options.color || null
  const additionalQuery = options.query || {}
  const query = {
    style: options.style || "flat-square",
    ...additionalQuery,
  }
  if (options.logo) {
    query.logo = options.logo
  }
  if (options.logoColor) {
    query.logoColor = options.logoColor
  }
  if (options.label) {
    query.label = options.label
  }
  let path
  if (options.path) {
    path = ensureArray(options.path).join("/")
    if (color) {
      query.color = color
    }
  } else {
    const leftText = escapeShieldPart(options.leftText || "Left")
    const rightText = escapeShieldPart(options.rightText || "Right")
    path = `badge/${leftText}-${rightText}-${color}`
  }
  const imgUrl = buildUrl(baseUrl, {
    path,
    queryParams: query,
  })
  const img = `<img src="${imgUrl}" alt="${altText}"/>`
  if (options.link) {
    return `<a href="${options.link}">${img}</a>`
  } else {
    return img
  }
}