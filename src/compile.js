export default blocks => {
  let text = ""
  for (const block of textBlocks) {
    if (typeof block === "string") {
      text += `${block}<br>\n`
    }
    if (block.header) {
      text += `## ${block.header}\n\n`
    }
    if (typeof block.text === "string") {
      text += `${block.text}<br>\n`
    }
  }
  return text
}