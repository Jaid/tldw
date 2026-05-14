import type {OwnPackageMetadata} from './lib/readOwnPackageMetadata.ts'

import {Clerc, friendlyErrorPlugin, helpPlugin, strictFlagsPlugin, versionPlugin} from 'clerc'

import mainCommand from './command/mainCommand.ts'

export default (packageMetadata: OwnPackageMetadata, args?: Array<string>) => {
  const cli = Clerc.create({
    scriptName: packageMetadata.name,
    description: packageMetadata.description,
    version: packageMetadata.version,
    name: packageMetadata.name,
  })
    .use(helpPlugin())
    .use(versionPlugin())
    .use(strictFlagsPlugin())
    .use(friendlyErrorPlugin())
    .command(mainCommand)
  return async () => {
    await cli.parse(args)
  }
}
