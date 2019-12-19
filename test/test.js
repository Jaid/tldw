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

it("should output help", async () => {
  return coffee.fork(main, ["--help"])
    .expect("stdout", /Options:/)
    .expect("code", 0)
    .debug()
    .end()
})