import fs from "node:fs"
import path from "node:path"

import coffee from "coffee"
import ms from "ms.macro"

const main = path.resolve(process.env.MAIN)

it("should run", async () => {
  const outputFile = path.join(__dirname, "..", "dist", "test", "readme.md")
  const sourceGlob = path.join(__dirname, "exampleSrc", "**")
  return coffee.fork(main, ["--output-file", outputFile, "--source-glob", sourceGlob])
    .expect("code", 0)
    .debug()
    .end()
}, ms`1 minute`)

it("should output version", async () => {
  const pkgFile = path.resolve(__dirname, "..", "package.json")
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"))
  return coffee.fork(main, ["--version"])
    .expect("stdout", `${pkg.version}\n`)
    .expect("code", 0)
    .debug()
    .end()
})