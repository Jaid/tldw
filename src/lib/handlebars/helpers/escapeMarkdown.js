import generateShield from "lib/generateShield"

export default (input) => {
  return input.replace(/</g, "\\<")
}