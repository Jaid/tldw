import tldw from "../src"
import tldwLicense from "../plugins/tldw-license"

it("should run", () => {
  const result = tldw({
    plugins: [tldwLicense],
  })
  expect(result).toMatchObject({
    text: "a",
  })
})