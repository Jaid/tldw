import generateShield from '../../generateShield.ts'

const getArgs = (inputArgs: Array<unknown>) => {
  return inputArgs.slice(0, -1)
}
const getStringArg = (args: Array<unknown>, index: number) => {
  const value = args[index]
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}
const getRawLicenseUrl = (slug: string) => {
  return `https://raw.githubusercontent.com/${slug}/HEAD/license.txt`
}

export default (type: string, ...inputArgs: Array<unknown>) => {
  const args = getArgs(inputArgs)
  if (type === 'bun') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} on Bun`,
      leftText: 'Bun',
      rightText: packageName,
      logo: 'bun',
      logoColor: 'FBF0DF',
      color: '000000',
      link: `https://npmjs.com/package/${packageName}`,
    })
  }
  if (type === 'npm') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} on npm`,
      leftText: 'npm',
      rightText: packageName,
      logo: 'npm',
      color: 'C23039',
      link: `https://npmjs.com/package/${packageName}`,
    })
  }
  if (type === 'yarn') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} on Yarn`,
      leftText: 'Yarn',
      rightText: packageName,
      logo: 'yarn',
      logoColor: 'white',
      color: '2F8CB7',
      link: `https://yarnpkg.com/package/${packageName}`,
    })
  }
  if (type === 'jsdelivr') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} on jsDelivr`,
      leftText: 'jsDelivr',
      rightText: packageName,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://www.jsdelivr.com/package/npm/${packageName}`,
    })
  }
  if (type === 'unpkg') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} on UNPKG`,
      leftText: 'UNPKG',
      rightText: packageName,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://unpkg.com/browse/${packageName}/`,
    })
  }
  if (type === 'web') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      altText: `${packageName} in the browser`,
      leftText: 'browser',
      rightText: packageName,
      logo: 'html5',
      color: 'orange',
      logoColor: 'white',
      link: `https://www.jsdelivr.com/package/npm/${packageName}`,
    })
  }
  if (type === 'commitsSince') {
    const slug = getStringArg(args, 0)
    const tag = getStringArg(args, 1)
    return generateShield({
      path: ['github', 'commits-since', slug, tag],
      altText: `Commits since ${tag}`,
      logo: 'github',
      link: `https://github.com/${slug}/commits`,
    })
  }
  if (type === 'issues') {
    const slug = getStringArg(args, 0)
    return generateShield({
      path: ['github', 'issues', slug],
      altText: 'Issues',
      logo: 'github',
      link: `https://github.com/${slug}/issues`,
    })
  }
  if (type === 'license') {
    const slug = getStringArg(args, 0)
    return generateShield({
      path: ['github', 'license', slug],
      altText: 'License',
      link: getRawLicenseUrl(slug),
    })
  }
  if (type === 'lastCommit') {
    const slug = getStringArg(args, 0)
    return generateShield({
      path: ['github', 'last-commit', slug],
      altText: 'Last commit',
      logo: 'github',
      link: `https://github.com/${slug}/commits`,
    })
  }
  if (type === 'githubPackages') {
    const slug = getStringArg(args, 0)
    const packageName = `@${slug}`
    return generateShield({
      logo: 'github',
      link: `https://github.com/${slug}/packages`,
      altText: `${packageName} on GitHub Packages`,
      leftText: 'GitHub Packages',
      rightText: packageName,
      color: '24282e',
    })
  }
  if (type === 'dependents') {
    const packageName = getStringArg(args, 0)
    const slug = getStringArg(args, 1)
    return generateShield({
      path: ['librariesio', 'dependents', 'npm', packageName],
      altText: 'Dependents',
      logo: 'npm',
      link: `https://github.com/${slug}/network/dependents`,
    })
  }
  if (type === 'npmDownloads') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      path: ['npm', 'dm', packageName],
      altText: 'Downloads',
      logo: 'npm',
      link: `https://npmjs.com/package/${packageName}`,
    })
  }
  if (type === 'npmLatest') {
    const packageName = getStringArg(args, 0)
    return generateShield({
      path: ['npm', 'v', packageName],
      altText: 'Latest version on npm',
      logo: 'npm',
      link: `https://npmjs.com/package/${packageName}`,
      label: 'latest version',
    })
  }
  if (type === 'actions') {
    const slug = getStringArg(args, 0)
    return generateShield({
      altText: 'Build status',
      link: `https://actions-badge.atrox.dev/${slug}/goto`,
      path: 'endpoint.svg',
      query: {
        url: `https://actions-badge.atrox.dev/${slug}/badge`,
      },
    })
  }
  if (type === 'sponsor') {
    const name = getStringArg(args, 0)
    const fundingLink = getStringArg(args, 1)
    return generateShield({
      altText: `Sponsor ${name}`,
      link: fundingLink,
      leftText: '<3',
      rightText: 'Sponsor',
      color: 'FF45F1',
    })
  }
  throw new Error(`Unknown shield type: ${type}`)
}
