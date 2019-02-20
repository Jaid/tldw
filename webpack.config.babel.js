const configure = require("webpack-config-jaid").configureNodeLib

module.exports = configure({
  documentation: true,
  publishimo: {fetchGithub: true},
})