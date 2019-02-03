export default (compiler, options, index) => {
  if (!options) {
    options = {packageManagers: ["npm", "pnpm", "yarn"]}
  }
  compiler.hooks.compile.tap(`${index}`, write => {
    write({
      header: "Installation",
      text: "abc",
    })
  })
}