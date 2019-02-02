import publishimo from "publishimo"
import {AsyncSeriesHook} from "tapable"

export default (compiler, options, index) => {
  compiler.hooks.publishimoGeneratedPkg = new AsyncSeriesHook(["publishimoResult"])
  compiler.hooks.pluginsLoaded.tapPromise(`${index}-tldw-plugin-publishimo`, async () => {
    const publishimoResult = await publishimo()
    await compiler.hooks.publishimoGeneratedPkg.promise(publishimoResult)
  })
}