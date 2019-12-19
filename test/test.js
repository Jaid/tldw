import coffee from "coffee"
import path from "path"

const main = path.resolve(process.env.MAIN)

it("should run", async () => {
  const outputFile = path.join(__dirname, "..", "dist", "test", "readme.md")
  return coffee.fork(main, ["--output-file", outputFile])
    .expect("code", 0)
    .debug()
    .end()
})

it("should output version", async () => {
  return coffee.fork(main, ["--version"])
    .expect("stdout", `${_PKG_VERSION}\n`)
    .expect("code", 0)
    .debug()
    .end()
})