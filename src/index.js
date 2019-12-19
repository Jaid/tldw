import fsp from "@absolunet/fsp"
import path from "path"
import yargs from "yargs"

const job = async ({outputFile}) => {
  await fsp.outputFile(outputFile, "hello")
}

const main = async () => {
  const builder = {
    "output-file": {
      type: "string",
      default: path.join(process.cwd(), "readme.md"),
      description: "Output file",
    },
  }

  yargs
    .scriptName(_PKG_NAME)
    .version(_PKG_VERSION)
    .command("$0", _PKG_DESCRIPTION, builder, job).argv
}

main()