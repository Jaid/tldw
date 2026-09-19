import packageJson from '../../package.json' with {type: 'json'}

export interface OwnPackageMetadata {
  description: string
  name: string
  version: string
}

// Static JSON imports keep metadata available after the source is bundled or relocated.
const packageMetadata: OwnPackageMetadata = {
  name: packageJson.name,
  description: packageJson.description,
  version: packageJson.version,
}

export const readOwnPackageMetadata = async (): Promise<OwnPackageMetadata> => packageMetadata
