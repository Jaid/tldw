export interface OwnPackageMetadata {
  description: string
  name: string
  version: string
}

let packageMetadataPromise: Promise<OwnPackageMetadata> | undefined

export const readOwnPackageMetadata = () => {
  packageMetadataPromise ??= (async () => {
    const metadata = await Bun.file(new URL('../../package.json', import.meta.url)).json() as Partial<OwnPackageMetadata>
    return {
      name: metadata.name ?? 'tldw',
      description: metadata.description ?? 'Generate README files from package metadata and configurable fragments.',
      version: metadata.version ?? '0.0.0',
    }
  })()
  return packageMetadataPromise
}
