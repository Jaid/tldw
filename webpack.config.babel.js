import {configureNodeLib} from "webpack-config-jaid"

export default configureNodeLib({
  documentation: true,
  publishimo: {fetchGithub: true},
})