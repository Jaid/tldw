import path from "path"

import test from "ava"
import fss from "@absolunet/fss"
import fsp from "@absolunet/fsp"

import tldw from "../src"

for (const entry of fss.readdir(__dirname)) {
  if (fss.stat(path.join(__dirname, entry)).isDirectory() && !entry.startsWith(".")) {
    const testFolder = path.resolve(__dirname, entry)
    test(entry, async t => {
      const rootComponent = require(path.join(testFolder, "tldw.jsx")).default
      const result = await tldw(rootComponent)
      await fsp.outputFile(path.join(testFolder, "dist", "readme.md"), result.text)
      // await fsp.outputYaml(path.join(testFolder, "dist", "dom.yml"), result.dom)
      // const expectedFile = path.join(testFolder, "expected.md")
      // const expectedFileExists = await fsp.pathExists(expectedFile)
      // if (expectedFileExists) {
      //   const expectedText = await fsp.readFile(expectedFile, "utf8")
      //   expect(result.text.trim()).toBe(expectedText.trim())
      // }
    })
  }
}