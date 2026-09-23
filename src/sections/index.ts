import type {Context} from '../lib/types.ts'
import type {HeaderSection} from './base/HeaderSection.ts'

import {AdvancedUsageSection} from './AdvancedUsageSection.ts'
import {ApiSection} from './ApiSection.ts'
import {ArchitectureSection} from './ArchitectureSection.ts'
import {CliUsageSection} from './CliUsageSection.ts'
import {DevelopmentSection} from './DevelopmentSection.ts'
import {EnvironmentVariablesSection} from './EnvironmentVariablesSection.ts'
import {ExampleSection} from './ExampleSection.ts'
import {FaqSection} from './FaqSection.ts'
import {FeaturesSection} from './FeaturesSection.ts'
import {FileSection} from './FileSection.ts'
import {InstallationSection} from './InstallationSection.ts'
import {IntroSection} from './IntroSection.ts'
import {LegalSection} from './LegalSection.ts'
import {LicenseSection} from './LicenseSection.ts'
import {MinimalExampleSection} from './MinimalExampleSection.ts'
import {NotesSection} from './NotesSection.ts'
import {OptionsSection} from './OptionsSection.ts'
import {PropsSection} from './PropsSection.ts'
import {RelatedSection} from './RelatedSection.ts'
import {ScreenshotsSection} from './ScreenshotsSection.ts'
import {ThirdPartiesSection} from './ThirdPartiesSection.ts'
import {TryInBrowserSection} from './TryInBrowserSection.ts'
import {UsageSection} from './UsageSection.ts'
import {WarningSection} from './WarningSection.ts'

// Registration order is independent of display priorities.
export const sectionClasses = [
  AdvancedUsageSection,
  ApiSection,
  ArchitectureSection,
  CliUsageSection,
  DevelopmentSection,
  EnvironmentVariablesSection,
  ExampleSection,
  FaqSection,
  FeaturesSection,
  InstallationSection,
  IntroSection,
  LegalSection,
  LicenseSection,
  MinimalExampleSection,
  NotesSection,
  OptionsSection,
  PropsSection,
  RelatedSection,
  ScreenshotsSection,
  ThirdPartiesSection,
  TryInBrowserSection,
  UsageSection,
  WarningSection,
] as const

export type SectionId = InstanceType<(typeof sectionClasses)[number]>['id']

export const createSections = (context: Context): Array<HeaderSection> => {
  const builtins = sectionClasses.map(SectionClass => new SectionClass(context))
  const builtinIds = new Set<string>(builtins.map(section => section.id))
  return [
    ...builtins.map(section => {
      const file = Object.hasOwn(context.config.sections, section.id) ? context.config.sections[section.id] : undefined
      return file ? new FileSection(context, section.id, file, section) : section
    }),
    ...Object.entries(context.config.sections)
      .filter(([id]) => !builtinIds.has(id))
      .map(([id, file]) => new FileSection(context, id, file)),
  ]
}

export {AdvancedUsageSection} from './AdvancedUsageSection.ts'
export {ApiSection} from './ApiSection.ts'
export {ArchitectureSection} from './ArchitectureSection.ts'
export {BannerSection} from './BannerSection.ts'
export {HeaderSection} from './base/HeaderSection.ts'
export {PropertiesSection} from './base/PropertiesSection.ts'
export type {PropertiesData} from './base/PropertiesSection.ts'
export {Section, sortSectionsByPriority} from './base/Section.ts'
export type {SectionContents, SectionLoadResult} from './base/Section.ts'
export {CliUsageSection} from './CliUsageSection.ts'
export {DescriptionSection} from './DescriptionSection.ts'
export {DevelopmentSection} from './DevelopmentSection.ts'
export {EnvironmentVariablesSection} from './EnvironmentVariablesSection.ts'
export {ExampleSection} from './ExampleSection.ts'
export {FaqSection} from './FaqSection.ts'
export {FeaturesSection} from './FeaturesSection.ts'
export {FileSection} from './FileSection.ts'
export {GenerationCommentSection} from './GenerationCommentSection.ts'
export {InstallationSection} from './InstallationSection.ts'
export {IntroSection} from './IntroSection.ts'
export {LegalSection} from './LegalSection.ts'
export {LicenseSection} from './LicenseSection.ts'
export {loadSections} from './loadSections.ts'
export {MinimalExampleSection} from './MinimalExampleSection.ts'
export {NotesSection} from './NotesSection.ts'
export {OptionsSection} from './OptionsSection.ts'
export {PageSection} from './PageSection.ts'
export {PropsSection} from './PropsSection.ts'
export {RelatedSection} from './RelatedSection.ts'
export {ResultSection} from './ResultSection.ts'
export {ScreenshotsSection} from './ScreenshotsSection.ts'
export {ShieldsSection} from './ShieldsSection.ts'
export {ThirdPartiesSection} from './ThirdPartiesSection.ts'
export {TryInBrowserSection} from './TryInBrowserSection.ts'
export {UsageResultSection} from './UsageResultSection.ts'
export {UsageSection} from './UsageSection.ts'

export {WarningSection} from './WarningSection.ts'
