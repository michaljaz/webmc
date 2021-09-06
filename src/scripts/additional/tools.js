const antiXSS = (str) => {
  const replacements = [
    [/&/g, '&amp;'],
    [/</g, '&lt;'],
    [/>/g, '&gt;'],
    [/"/g, '&quot;']
  ]
  for (const replacement of replacements) {
    str = str.replace(replacement[0], replacement[1])
  }
  return str
}
export { antiXSS }
