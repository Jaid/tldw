import generateShield from "lib/generateShield"

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
      color: "2F8CB7",
      link: `https://yarnpkg.com/package/${packageName}`,
    })
  }

  if (type === "commitsSince") {
    const slug = args[0]
    const tag = args[1]
    return generateShield({
      path: ["github", "commits-since", slug, tag],
      altText: `Commits since ${tag}`,
      logo: "github",
      color: "success",
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
      color: "success",
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
}