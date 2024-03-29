import generateShield from "../../generateShield.js"

export default (type, ...args) => {
  if (type === "npm") {
    const packageName = args[0]
    return generateShield({
      altText: `${packageName} on npm`,
      leftText: "npm",
      rightText: packageName,
      logo: "npm",
      color: "C23039",
      link: `https://npmjs.com/package/${packageName}`,
    })
  }

  if (type === "yarn") {
    const packageName = args[0]
    return generateShield({
      altText: `${packageName} on Yarn`,
      leftText: "Yarn",
      rightText: packageName,
      logo: "yarn",
      logoColor: "white",
      color: "2F8CB7",
      link: `https://yarnpkg.com/package/${packageName}`,
    })
  }

  if (type === "jsdelivr") {
    const packageName = args[0]
    return generateShield({
      altText: `${packageName} on jsDelivr`,
      leftText: "jsDelivr",
      rightText: packageName,
      logo: "html5",
      color: "orange",
      logoColor: "white",
      link: `https://jsdelivr.com/package/npm/${packageName}/`,
    })
  }

  if (type === "unpkg") {
    const packageName = args[0]
    return generateShield({
      altText: `${packageName} on UNPKG`,
      leftText: "UNPKG",
      rightText: packageName,
      logo: "html5",
      color: "orange",
      logoColor: "white",
      link: `https://unpkg.com/browse/${packageName}/`,
    })
  }

  if (type === "commitsSince") {
    const slug = args[0]
    const tag = args[1]
    return generateShield({
      path: ["github", "commits-since", slug, tag],
      altText: `Commits since ${tag}`,
      logo: "github",
      link: `https://github.com/${slug}/commits`,
    })
  }

  if (type === "issues") {
    const slug = args[0]
    return generateShield({
      path: ["github", "issues", slug],
      altText: "Issues",
      logo: "github",
      link: `https://github.com/${slug}/issues`,
    })
  }

  if (type === "license") {
    const slug = args[0]
    return generateShield({
      path: ["github", "license", slug],
      altText: "License",
      link: `https://raw.githubusercontent.com/${slug}/master/license.txt`,
    })
  }

  if (type === "lastCommit") {
    const slug = args[0]
    return generateShield({
      path: ["github", "last-commit", slug],
      altText: "Last commit",
      logo: "github",
      link: `https://github.com/${slug}/commits`,
    })
  }

  if (type === "githubPackages") {
    const slug = args[0]
    const packageName = `@${slug}`
    return generateShield({
      logo: "github",
      link: `https://github.com/${slug}/packages`,
      altText: `${packageName} on GitHub Packages`,
      leftText: "GitHub Packages",
      rightText: packageName,
      color: "24282e",
    })
  }

  if (type === "dependents") {
    const packageName = args[0]
    const slug = args[1]
    return generateShield({
      path: ["librariesio", "dependents", "npm", packageName],
      altText: "Dependents",
      logo: "npm",
      link: `https://github.com/${slug}/network/dependents`,
    })
  }

  if (type === "npmDownloads") {
    const packageName = args[0]
    return generateShield({
      path: ["npm", "dm", packageName],
      altText: "Downloads",
      logo: "npm",
      link: `https://npmjs.com/package/${packageName}`,
    })
  }

  if (type === "npmLatest") {
    const packageName = args[0]
    return generateShield({
      path: ["npm", "v", packageName],
      altText: "Latest version on npm",
      logo: "npm",
      link: `https://npmjs.com/package/${packageName}`,
      label: "latest version",
    })
  }

  if (type === "actions") {
    const slug = args[0]
    return generateShield({
      altText: "Build status",
      link: `https://actions-badge.atrox.dev/${slug}/goto`,
      path: "endpoint.svg",
      query: {
        url: `https://actions-badge.atrox.dev/${slug}/badge`,
      },
    })
  }

  if (type === "sponsor") {
    const name = args[0]
    const fundingLink = args[1]
    return generateShield({
      altText: `Sponsor ${name}`,
      link: fundingLink,
      leftText: "<3",
      rightText: "Sponsor",
      color: "FF45F1",
    })
  }
}