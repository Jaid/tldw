import type {ConfiguredShield, Context} from './types.ts'

import generateShield from './generateShield.ts'
import {isExcludedShield} from './helpers.ts'

export type ShieldRenderContext = Pick<Context, 'config' | 'fundingLink' | 'pkg' | 'slug' | 'tag'>

const getRawLicenseUrl = (slug: string) => {
  return `https://raw.githubusercontent.com/${slug}/HEAD/license.txt`
}

export const renderBuiltinShield = (type: string, context: ShieldRenderContext) => {
  if (isExcludedShield(context.config.excludeShields, type)) {
    return ''
  }
  if (type === 'bun') {
    return generateShield({
      altText: `${context.pkg.name} on Bun`,
      leftText: 'Bun',
      rightText: context.pkg.name,
      logo: 'bun',
      logoColor: 'FBF0DF',
      color: '000000',
      link: `https://npmjs.com/package/${context.pkg.name}`,
    })
  }
  if (type === 'npm') {
    return generateShield({
      altText: `${context.pkg.name} on npm`,
      leftText: 'npm',
      rightText: context.pkg.name,
      logo: 'npm',
      color: 'C23039',
      link: `https://npmjs.com/package/${context.pkg.name}`,
    })
  }
  if (type === 'npmx') {
    return generateShield({
      altText: `${context.pkg.name} on npm`,
      leftText: 'npmx',
      rightText: context.pkg.name,
      logo: 'npm',
      color: 'C23039',
      link: `https:/npmx.dev/package/${context.pkg.name}`,
    })
  }
  if (type === 'pnpm') {
    return generateShield({
      altText: `${context.pkg.name} on pnpm`,
      leftText: 'pnpm',
      rightText: context.pkg.name,
      logo: 'pnpm',
      logoColor: 'white',
      color: 'F69220',
      link: `https://npmjs.com/package/${context.pkg.name}`,
    })
  }
  if (type === 'yarn') {
    return generateShield({
      altText: `${context.pkg.name} on Yarn`,
      leftText: 'Yarn',
      rightText: context.pkg.name,
      logo: 'yarn',
      logoColor: 'white',
      color: '2F8CB7',
      link: `https://yarnpkg.com/package/${context.pkg.name}`,
    })
  }
  if (type === 'jsdelivr') {
    return generateShield({
      altText: `${context.pkg.name} on jsDelivr`,
      leftText: 'jsDelivr',
      rightText: context.pkg.name,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://www.jsdelivr.com/package/npm/${context.pkg.name}`,
    })
  }
  if (type === 'unpkg') {
    return generateShield({
      altText: `${context.pkg.name} on UNPKG`,
      leftText: 'UNPKG',
      rightText: context.pkg.name,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://unpkg.com/browse/${context.pkg.name}/`,
    })
  }
  if (type === 'web') {
    return generateShield({
      altText: `${context.pkg.name} in the browser`,
      leftText: 'browser',
      rightText: context.pkg.name,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://www.jsdelivr.com/package/npm/${context.pkg.name}`,
    })
  }
  if (type === 'commitsSince') {
    return generateShield({
      path: ['github', 'commits-since', context.slug, context.tag],
      altText: `Commits since ${context.tag}`,
      logo: 'github',
      link: `https://github.com/${context.slug}/commits`,
    })
  }
  if (type === 'issues') {
    return generateShield({
      path: ['github', 'issues', context.slug],
      altText: 'Issues',
      logo: 'github',
      link: `https://github.com/${context.slug}/issues`,
    })
  }
  if (type === 'license') {
    return generateShield({
      path: ['github', 'license', context.slug],
      altText: 'License',
      link: getRawLicenseUrl(context.slug),
    })
  }
  if (type === 'lastCommit') {
    return generateShield({
      path: ['github', 'last-commit', context.slug],
      altText: 'Last commit',
      logo: 'github',
      link: `https://github.com/${context.slug}/commits`,
    })
  }
  if (type === 'githubPackages') {
    const packageName = `@${context.slug}`
    return generateShield({
      logo: 'github',
      link: `https://github.com/${context.slug}/packages`,
      altText: `${packageName} on GitHub Packages`,
      leftText: 'GitHub Packages',
      rightText: packageName,
      color: '24282e',
    })
  }
  if (type === 'dependents') {
    return generateShield({
      path: ['librariesio', 'dependents', 'npm', context.pkg.name],
      altText: 'Dependents',
      logo: 'npm',
      link: `https://github.com/${context.slug}/network/dependents`,
    })
  }
  if (type === 'npmDownloads') {
    return generateShield({
      path: ['npm', 'dm', context.pkg.name],
      altText: 'Downloads',
      logo: 'npm',
      link: `https://npmjs.com/package/${context.pkg.name}`,
    })
  }
  if (type === 'npmLatest') {
    return generateShield({
      path: ['npm', 'v', context.pkg.name],
      altText: 'Latest version on npm',
      logo: 'npm',
      link: `https://npmjs.com/package/${context.pkg.name}`,
      label: 'latest version',
    })
  }
  if (type === 'actions') {
    if (!context.config.githubActions) {
      return ''
    }
    return generateShield({
      altText: 'Build status',
      link: `https://actions-badge.atrox.dev/${context.slug}/goto`,
      path: 'endpoint.svg',
      query: {
        url: `https://actions-badge.atrox.dev/${context.slug}/badge`,
      },
    })
  }
  if (type === 'sponsor') {
    if (!context.fundingLink) {
      return ''
    }
    return generateShield({
      altText: `Sponsor ${context.pkg.name}`,
      link: context.fundingLink,
      leftText: '<3',
      rightText: 'Sponsor',
      color: 'FF45F1',
    })
  }
  throw new Error(`Unknown shield type: ${type}`)
}

export const renderConfiguredShield = (definition: ConfiguredShield, context: ShieldRenderContext) => {
  if (typeof definition === 'string') {
    return renderBuiltinShield(definition, context)
  }
  if (definition.id && isExcludedShield(context.config.excludeShields, definition.id)) {
    return ''
  }
  return generateShield(definition)
}
