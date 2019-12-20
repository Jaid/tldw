import buildUrl from "build-url"
import ensureArray from "ensure-array"

const debug = require("debug")(_PKG_NAME)

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
  const altText = options.altText || "Shield"
  const color = options.color || "red"
  const query = {
    style: options.style || "flat-square",
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
    query.color = color
  } else {
    const leftText = escapeShieldPart(options.leftText || "Left")
    const rightText = escapeShieldPart(options.rightText || "Right")
    path = `badge/${leftText}-${rightText}-${color}`
  }
  const imgUrl = buildUrl("https://img.shields.io", {
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