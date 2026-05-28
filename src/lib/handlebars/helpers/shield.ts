import type {Context} from '../../types.ts'

import {renderBuiltinShield} from '../../renderShield.ts'

const getRootContext = (inputArgs: Array<unknown>) => {
  const options = inputArgs.at(-1)
  if (typeof options !== 'object' || options === null || !('data' in options)) {
    return null
  }
  const data = options.data
  if (typeof data !== 'object' || data === null || !('root' in data)) {
    return null
  }
  const root = data.root
  if (typeof root !== 'object' || root === null) {
    return null
  }
  return root as Partial<Context>
}

export default (type: string, ...inputArgs: Array<unknown>) => {
  const rootContext = getRootContext(inputArgs)
  if (!rootContext?.config || !rootContext.pkg || !rootContext.slug || !rootContext.tag) {
    return ''
  }
  return renderBuiltinShield(type, {
    config: rootContext.config,
    fundingLink: rootContext.fundingLink ?? null,
    pkg: rootContext.pkg,
    slug: rootContext.slug,
    tag: rootContext.tag,
  })
}
