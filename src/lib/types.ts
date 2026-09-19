import type {bannerDefinitionSchema, Config, customShieldSchema, ResolvedConfig, shieldsListSchema} from '../config.schema.ts'
import type {FlexibleListItem} from './markdownElements.ts'
import type zod from 'zod'

export type {Config, InstallationType, ResolvedConfig} from '../config.schema.ts'
export type Arrayable<Type> = Array<Type> | Type
export type BannerDefinition = zod.input<typeof bannerDefinitionSchema>
export type BannerConfig = Config['banner']
export type ConfiguredShield = CustomShieldDefinition | string
export type CustomShieldDefinition = zod.input<typeof customShieldSchema>
export type ShieldsConfig = zod.input<typeof shieldsListSchema>

export interface PackageRepositoryObject {
  directory?: string
  type?: string
  url?: string
}

export type PackageFunding = Array<{
  type?: string
  url?: string
} | string> | {
  type?: string
  url?: string
} | string

export interface PackageData {
  bin?: Record<string, string> | string
  description?: string
  displayName?: string
  domain?: string
  features?: Array<FlexibleListItem>
  funding?: PackageFunding
  license?: unknown
  name: string
  repository?: PackageRepositoryObject | string
  scripts?: Record<string, string>
  title?: string
  type?: string
  version: string
  webpackConfigJaid?: string
}

export interface UsageOptionEntry {
  default?: unknown
  info?: string
  name: string
  required?: boolean
  type?: string
}

export interface UsageOptions {
  entries: Array<UsageOptionEntry>
}

export interface CliArgs {
  configDirectory: string
  licenseFile: string
  outputFile: string
  packageFile: string
}

export interface Context {
  args: CliArgs
  config: ResolvedConfig
  fundingLink: string | null
  isBunProject: boolean
  licenseUrl: string | null
  pkg: PackageData
  projectDirectory: string
  slug: string
  tag: string
  title: string
  tldwVersion: string
}

export type WriteReadmeStatus = 'created' | 'overwritten' | 'skipped' | 'unchanged'

export interface WriteReadmeResult {
  bytes?: number
  outputFile: string
  readmeText?: string
  reason?: string
  status: WriteReadmeStatus
}
