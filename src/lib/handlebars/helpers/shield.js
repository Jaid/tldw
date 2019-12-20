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
}