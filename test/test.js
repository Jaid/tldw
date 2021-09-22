import {it} from "@jest/globals"

import fs from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"

import coffee from "coffee"
import ms from "ms.macro"

const dirName = path.dirname(fileURLToPath(import.meta.url))

const main = path.resolve(process.env.MAIN)

it("should run", async () => {
  const outputFile = path.join(dirName, "..", "dist", "test", "readme.md")
  const sourceGlob = path.join(dirName, "exampleSrc", "**")
  return coffee.fork(main, ["--output-file", outputFile, "--source-glob", sourceGlob])
    .expect("code", 0)
    .debug()
    .end()
}, ms`1 minute`)

it("should output version", async () => {
  const pkgFile = path.resolve(dirName, "..", "package.json")
  const pkg = JSON.parse(await fs.readFile(pkgFile, "utf8"))
  return coffee.fork(main, ["--version"])
    .expect("stdout", `${pkg.version}\n`)
    .expect("code", 0)
    .debug()
    .end()
})