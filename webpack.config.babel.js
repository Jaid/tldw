import webpackConfigJaid from "webpack-config-jaid"

export default webpackConfigJaid({
  documentation: true,
  publishimo: {
    publishimoOptions: {
      fetchGithub: true,
    },
  },
})