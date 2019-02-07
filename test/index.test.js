import path from "path"

import fss from "@absolunet/fss"
import fsp from "@absolunet/fsp"

import tldw from "../src"
import tldwLicense from "../plugins/tldw-plugin-license"
import tldwInstall from "../plugins/tldw-plugin-install"

for (const entry of fss.readdir(__dirname)) {
  if (fss.stat(path.join(__dirname, entry)).isDirectory()) {
    const testFolder = path.resolve(__dirname, entry)
    it(entry, async () => {
      const xml = await fsp.readFile(path.join(testFolder, "tldw.xml"), "utf8")
      const result = await tldw({
        xml,
      })
      await fsp.outputFile(path.join(testFolder, "dist", "readme.md"), result.text)
      const expectedFile = path.join(testFolder, "expected.md")
      const expectedFileExists = await fsp.pathExists(expectedFile)
      if (expectedFileExists) {
        const expectedText = await fsp.readFile(expectedFile, "utf8")
        expect(result.text.trim()).toBe(expectedText.trim())
      }
    })
  }
}