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

function fixNavbarLine(line) {
  if (!line.includes('u-navbar')) return line
  let result = line
  result = result.replace(/:border-bottom="false"/g, ':border="false"')
  result = result.replace(/:is-back="/g, ':auto-back="')
  result = result.replace(/:custom-back="back"/g, ':auto-back="false" @leftClick="back"')
  result = result.replace(/back-icon-color="/g, 'left-icon-color="')
  result = result.replace(/:background="navbarOnlyBack"/g, ':bg-color="navbarOnlyBack.background"')
  result = result.replace(/:background="navbar"/g, ':bg-color="navbar.background"')
  result = result.replace(/:background="navObj"/g, ':bg-color="navObj.background"')
  result = result.replace(/:background="background"/g, ':bg-color="background.backgroundColor"')
  return result
}

function fixCellLine(line) {
  if (!line.includes('u-cell') || !line.includes(':border-bottom')) return line
  return line.replace(/:border-bottom="false"/g, ':border="false"')
}

function fixInputLine(line) {
  if (!line.includes('u-input') || !line.includes(':border-bottom')) return line
  return line.replace(/:border-bottom="false"/g, 'border="none"')
}

function processFile(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  const updated = lines.map((line) => fixInputLine(fixCellLine(fixNavbarLine(line)))).join('\n')
  const original = lines.join('\n')
  if (updated !== original) {
    fs.writeFileSync(file, updated)
    console.log('updated', path.relative(root, file))
  }
}

walk(root).forEach(processFile)
console.log('navbar props migration done')
