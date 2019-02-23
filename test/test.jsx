import path from "path"

import fss from "@absolunet/fss"
import fsp from "@absolunet/fsp"
import React from "react"

import tldw from "../src"

const job = async name => {
  const testFolder = path.resolve(__dirname, name)
  const Component = require(path.join(testFolder, "Content.jsx")).default
  const reactElement = <Component/>
  const result = await tldw(reactElement)
  await fsp.outputFile(path.join(testFolder, "dist", "readme.md"), result.text)
  const expectedFile = path.join(testFolder, "expected.md")
  const expectedFileExists = await fsp.pathExists(expectedFile)
  if (expectedFileExists) {
    const expectedText = await fsp.readFile(expectedFile, "utf8")
    expect(result.text.trim()).toBe(expectedText.trim())
  }
}

it("1-tag", () => job("1-tag"))

it("minimal", () => job("minimal"))