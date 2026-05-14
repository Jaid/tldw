import type {FragmentId} from '../fragments.ts'

export type InstallationMode = 'dev' | 'global' | 'prod' | false

export interface Config {
  binExample: string | null
  binName: boolean | string
  environmentVariables: Record<string, string>
  exampleResultMayVary: boolean
  githubActions: boolean
  githubPackage: boolean
  installation: InstallationMode
  link: string | null
  linkName: string | null
  needsNodeRuntime: boolean
  personal: boolean
  renderComment: boolean
  tryInBrowser: boolean | null
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
  binExample: string | null
  binName: false | string
  camelCaseName: string
  config: Config
  description: string | null
  developmentScripts: Array<DevelopmentScript>
  esmWarning: boolean
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
  installationCommands: Array<InstallationCommand>
  isMitLicense: boolean
  license: string | null
  pascalCaseName: string
  pkg: PackageData
  slug: string
  tag: string
  title: string
  tldwVersion: string
  usageOptions: UsageOptions | null
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
