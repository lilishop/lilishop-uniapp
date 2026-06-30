const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'scripts'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue')) files.push(full)
  }
  return files
}

function process(content) {
  return content
    .replace(/u-verification-code/g, 'u-code')
    .replace(/<u-cell-item/g, '<u-cell')
    .replace(/<\/u-cell-item>/g, '</u-cell>')
    .replace(/:arrow="false"/g, ':isLink="false"')
    .replace(/<u-loading(\s|>|\/)/g, '<u-loading-icon$1')
    .replace(/<\/u-loading>/g, '</u-loading-icon>')
    .replace(/<u-alert-tips/g, '<u-alert')
    .replace(/<\/u-alert-tips>/g, '</u-alert>')
}

walk(root).forEach((file) => {
  const original = fs.readFileSync(file, 'utf8')
  const updated = process(original)
  if (updated !== original) {
    fs.writeFileSync(file, updated)
    console.log('updated', path.relative(root, file))
  }
})

console.log('uview component aliases updated')
