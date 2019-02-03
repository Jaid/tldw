/** @module tldw */

/**
 * @typedef pluginLoader
 * @type {Array<string|function|object>|string|function}
 */

/**
 * @typedef tldwOptions
 * @type {object}
 * @property {pluginLoader[]} plugins
 * @property {object|string} [pkg={}] Path to package.json or pkg data
 */

import {AsyncParallelHook, AsyncSeriesHook} from "tapable"
import resolvePkgOption from "resolve-pkg-option"

import compile from "./compile"

/**
 * Compiles a markdown text based on given plugins
 * @param {tldwOptions} options
 * @returns {object}
 */
export default async options => {
  options = {
    plugins: [],
    pkg: {},
    ...options,
  }

  const loadedPackage = await resolvePkgOption()


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
      pluginsLoaded: new AsyncParallelHook(["plugins"]),
      compile: new AsyncSeriesHook(["write"]),
      compilationDone: new AsyncSeriesHook(["blocks"]),
    },
  }

  options.plugins.forEach(({module}, index) => {
    const pluginResponse = module(compiler, options, index)
    if (typeof pluginResponse === "string") {
      compiler.hooks.compile.tap(`autocompile-${index}`, writeResponse => {
        writeResponse(pluginResponse)
      })
    }
  })

  await compiler.hooks.pluginsLoaded.promise(options.plugins)
  await compiler.hooks.compile.promise(write)
  const text = compile(textBlocks)
  await compiler.hooks.compilationDone.promise(text)

  return {
    text,
  }
}