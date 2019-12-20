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
    })
  }

  if (type === "issues") {
    const slug = args[0]
    return generateShield({
      path: ["github", "issues", slug],
      altText: "Issues",
      logo: "github",
    })
  }

  if (type === "license") {
    const slug = args[0]
    return generateShield({
      path: ["github", "license", slug],
      altText: "License",
      color: "success",
    })
  }

  if (type === "lastCommit") {
    const slug = args[0]
    return generateShield({
      path: ["github", "last-commit", slug],
      altText: "Last commit",
      logo: "github",
    })
  }
}