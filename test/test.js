import path from "path"

import fss from "@absolunet/fss"
import fsp from "@absolunet/fsp"
import React from "react"

import tldw from "../src"

const job = async name => {
  const testFolder = path.resolve(__dirname, name)
  const ContentComponent = require(path.join(testFolder, "Component.js")).default
  const result = await tldw(ContentComponent)
  await fsp.outputFile(path.join(testFolder, "dist", "readme.md"), result.text)
  const expectedFile = path.join(testFolder, "expected.md")
  const expectedFileExists = await fsp.pathExists(expectedFile)
  if (expectedFileExists) {
    const expectedText = await fsp.readFile(expectedFile, "utf8")
    expect(result.text).toBe(expectedText.trim())
  }
}

it("basic", () => job("basic"))

it("minimal", () => job("minimal"))