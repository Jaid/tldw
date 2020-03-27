export default input => {
  return input.replace(/</g, "\\<")
}