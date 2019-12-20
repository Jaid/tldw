import buildUrl from "build-url"

/**
 * @typedef {Object} Options
 * @prop {string} altText
 * @prop {string} color
 * @prop {string} leftText
 * @prop {string} rightText
 * @prop {string} style
 * @prop {string} logo
 * @prop {string} link
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
  const color = options.color || "00CC00"
  const leftText = escapeShieldPart(options.leftText, "Left")
  const rightText = escapeShieldPart(options.rightText || "Right")
  const query = {
    style: options.style || "flat-square",
  }
  if (options.logo) {
    query.logo = options.logo
  }
  if (options.link) {
    query.link = options.link
  }
  const imgUrl = buildUrl("https://img.shields.io", {
    path: `badge/${leftText}-${rightText}-${color}`,
    queryParams: query,
  })
  return `![${altText}](${imgUrl})`
}