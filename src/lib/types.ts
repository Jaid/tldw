import type {FragmentId} from '../fragments.ts'
import type {GenerateShieldOptions} from './generateShield.ts'
import type {PackageManager} from './packageManagers.ts'

export type Arrayable<Type> = Array<Type> | Type

export type InstallationMode = 'dev' | 'global' | 'prod' | false

export interface BannerDefinition {
  bottomColor?: string
  font?: string
  text?: string
  topColor?: string
}

export type BannerConfig = BannerDefinition | boolean | string

export interface CustomShieldDefinition extends GenerateShieldOptions {
  id?: string
}

export type ConfiguredShield = CustomShieldDefinition | string

export type ShieldsConfig = Array<Array<ConfiguredShield> | ConfiguredShield>

export interface Config {
  banner: BannerConfig
  binExample: string | null
  binName: boolean | string
  environmentVariables: Record<string, string>
  exampleResultMayVary: boolean
  excludeShields: Arrayable<string>
  githubActions: boolean
  githubPackage: boolean
  installation: InstallationMode
  link: string | null
  linkName: string | null
  maxBlankLines: number
  needsNodeRuntime: boolean
  packageManagers: Arrayable<PackageManager>
  personal: boolean
  renderComment: boolean
  shields: ShieldsConfig | null
  tryInBrowser: boolean | null
  versionInInstallation: boolean
}

export interface PackageRepositoryObject {
  directory?: string
  type?: string
  url?: string
}

export type PackageFunding = Array<{type?: string
  url?: string} | string> | {type?: string
    url?: string} | string

export interface PackageData {
  bin?: Record<string, string> | string
  description?: string
  displayName?: string
  domain?: string
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
  anyEntryHasDefault: boolean
  anyEntryHasInfo: boolean
  anyEntryHasRequired: boolean
  anyEntryHasType: boolean
  entries: Array<UsageOptionEntry>
}

export interface CliArgs {
  configDirectory: string
  licenseFile: string
  outputFile: string
  packageFile: string
}

export interface InstallationCommand {
  bonusText?: string
  command: string
  header: string
  headerArgument: string
}

export interface DevelopmentScript {
  name: string
  script: string
}

export type FragmentContent = Partial<Record<FragmentId, string>>

export interface Context {
  args: CliArgs
  bannerSvg: string | null
  binExample: string | null
  binName: false | string
  camelCaseName: string
  config: Config
  description: string | null
  developmentScripts: Array<DevelopmentScript>
  example: string | null
  exampleResults: Record<string, string>
  fragments: FragmentContent
  fundingLink: string | null
  globalName: string
  hasDevelopmentSection: boolean
  hasEnvironmentVariables: boolean
  hasExampleSection: boolean
  hasOptionsSection: boolean
  hasUsageOptions: boolean
  hasUsageSection: boolean
  installationCommands: Array<InstallationCommand>
  isMitLicense: boolean
  license: string | null
  pascalCaseName: string
  pkg: PackageData
  shieldLines: Array<string>
  slug: string
  tag: string
  title: string
  tldwVersion: string
  usage: string | null
  usageCode: string | null
  usageCodeLanguage: string
  usageOptions: UsageOptions | null
  usageResult: string | null
  usageResultLanguage: string
  worksAsScriptTag: boolean
}

export type WriteReadmeStatus = 'created' | 'overwritten' | 'skipped' | 'unchanged'

export interface WriteReadmeResult {
  bytes?: number
  outputFile: string
  readmeText?: string
  reason?: string
  status: WriteReadmeStatus
}
