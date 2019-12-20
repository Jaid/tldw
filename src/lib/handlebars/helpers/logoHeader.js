export default (id, packageName) => {
  if (id === "npm") {
    return `<a href='https://npmjs.com/package/${packageName}'><img alt='npm logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/npm.png'/></a>`
  }
  if (id === "yarn") {
    return `<a href='https://yarnpkg.com/package/${packageName}'><img alt='Yarn logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/yarn.png'/></a>`
  }
  if (id === "browser") {
    return "<img alt='Chromium logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/browser.png'/>"
  }
  if (id === "runkit") {
    return `<a href='https://npm.runkit.com/${packageName}'><img alt='RunKit logo' src='https://github.com/Jaid/action-readme/raw/master/images/base-assets/runkit.png'/></a>`
  }
}