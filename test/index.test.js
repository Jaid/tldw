import path from "path"

import fs from "@absolunet/fss"

import tldw from "../src"
import tldwLicense from "../plugins/tldw-plugin-license"
import tldwInstall from "../plugins/tldw-plugin-install"

it("should run", () => {
  const result = tldw({
    plugins: [
      tldwInstall,
      tldwLicense,
    ],
  })
  fs.outputFile(path.join(__dirname, "output", "readme.md"), result.text)
})