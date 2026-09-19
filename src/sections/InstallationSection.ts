import type {InstallationType} from '../config.schema.ts'
import type {PackageManager} from '../lib/packageManagers.ts'
import type {SectionContents} from './base/Section.ts'

import fencen from 'fencen'
import flattenString from 'flatten-string'

import {renderBuiltinShield} from '../lib/renderShield.ts'
import {HeaderSection} from './base/HeaderSection.ts'

interface InstallationCommand {
  bonusText?: string
  command: string
  header: string
}
const getGithubPackagesInstallFlag = (installation: InstallationType) => {
  if (installation === 'development') {
    return '--save-dev '
  }
  if (installation === 'global') {
    return '--global '
  }
  return '--save '
}
const appendVersionToPackageSpec = (packageSpec: string, version: string, versionInInstallation: boolean) => {
  if (!versionInInstallation) {
    return packageSpec
  }
  return `${packageSpec}@^${version}`
}
const installationCommandFactories = {
  bun: {
    production: (packageSpec: string) => `bun add ${packageSpec}`,
    development: (packageSpec: string) => `bun add --development ${packageSpec}`,
    global: (packageSpec: string) => `bun add --global ${packageSpec}`,
  },
  npm: {
    production: (packageSpec: string) => `npm install --save ${packageSpec}`,
    development: (packageSpec: string) => `npm install --save-dev ${packageSpec}`,
    global: (packageSpec: string) => `npm install --global ${packageSpec}`,
  },
  pnpm: {
    production: (packageSpec: string) => `pnpm add ${packageSpec}`,
    development: (packageSpec: string) => `pnpm add --save-dev ${packageSpec}`,
    global: (packageSpec: string) => `pnpm add --global ${packageSpec}`,
  },
  yarn: {
    production: (packageSpec: string) => `yarn add ${packageSpec}`,
    development: (packageSpec: string) => `yarn add --dev ${packageSpec}`,
    global: (packageSpec: string) => `yarn global add ${packageSpec}`,
  },
  deno: {
    production: (packageSpec: string) => `deno add npm:${packageSpec}`,
    development: (packageSpec: string) => `deno add --dev npm:${packageSpec}`,
    global: (packageSpec: string) => `deno install --global npm:${packageSpec}`,
  },
} satisfies Record<PackageManager, Record<InstallationType, (packageSpec: string) => string>>

export class InstallationSection extends HeaderSection {
  readonly id = 'installation'

  override collectContents(): SectionContents {
    const contents = super.collectContents()
    const commands = this.getCommands()
    const generated = commands.map(command => {
      const shield = renderBuiltinShield(command.header, this.context)
      const header = command.bonusText ? flattenString.spaced(`${shield}<br>`, command.bonusText) : shield
      return flattenString.paragraphs(header, fencen.block(command.command, {language: 'sh'}))
    })
    if (commands.length && !this.context.config.tldw.needsNodeRuntime) {
      generated.push(flattenString.paragraphs(
        flattenString.spaced(renderBuiltinShield('jsdelivr', this.context), renderBuiltinShield('unpkg', this.context)),
        fencen.block(`<script src="https://cdn.jsdelivr.net/npm/${this.context.pkg.name}@${this.context.pkg.version}/index.js"></script>`, {language: 'html'}),
      ))
    }
    return {
      ...contents,
      content: [...contents.content ?? [], ...generated],
    }
  }

  getCommands(): Array<InstallationCommand> {
    const context = this.context
    const commands: Array<InstallationCommand> = []
    const installation = context.config.installation
    if (!installation) {
      return commands
    }
    const packageSpec = appendVersionToPackageSpec(context.pkg.name, context.pkg.version, installation.version)
    const githubPackagesBonusText = '(if [configured properly](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages))'
    for (const packageManager of installation.packageManagers) {
      commands.push({
        header: packageManager,
        command: installationCommandFactories[packageManager][installation.type](packageSpec),
      })
    }
    if (installation.githubPackage) {
      commands.push({
        header: 'githubPackages',
        bonusText: githubPackagesBonusText,
        command: `npm install ${getGithubPackagesInstallFlag(installation.type)}${appendVersionToPackageSpec(`@${context.slug}`, context.pkg.version, installation.version)}`,
      })
    }
    return commands
  }

  override getPriority() {
    return 200
  }
}
