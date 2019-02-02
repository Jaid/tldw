/** @module tldw */

/**
 * @typedef pluginLoader
 * @type {Array<string|function|object>|string|function}
 */

/**
 * @typedef tldwOptions
 * @type {object}
 * @property {pluginLoader[]} plugins
 */

import {SyncHook} from "tapable"

/**
 * Compiles a markdown text based on given plugins
 * @param {tldwOptions} options
 * @returns {object}
 */
export default options => {
  options = {
    plugins: [],
    ...options,
  }

  options.plugins = options.plugins.map(plugin => {
    if (typeof plugin === "string" || typeof plugin === "function") {
      plugin = [plugin]
    }
    const [module, pluginOptions = null] = plugin
    if (typeof module === "function") {
      return {
        module,
        options: pluginOptions,
      }
    }
    const requiredModule = require(prependIf(module, "tldw-plugin-"))
    return {
      name: module,
      module: requiredModule,
      options: pluginOptions,
    }
  })

  const textBlocks = []
  const write = block => {
    textBlocks.push(block)
  }

  const compiler = {
    options,
    hooks: {
      pluginsLoaded: new SyncHook(["plugins"]),
      compile: new SyncHook(["write"]),
      compilationDone: new SyncHook(["blocks"]),
    },
  }

  options.plugins.forEach(({module}, index) => {
    const pluginResponse = module(compiler, options)
    if (typeof pluginResponse === "string") {
      compiler.hooks.compile.tap(`autocompile-${index}`, writeResponse => {
        writeResponse(pluginResponse)
      })
    }
  })

  compiler.hooks.pluginsLoaded.call(options.plugins)
  compiler.hooks.compile.call(write)

  const text = textBlocks.join("\n")

  compiler.hooks.compilationDone.call(text)

  return {
    text,
  }
}