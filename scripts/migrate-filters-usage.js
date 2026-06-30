const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'uview-ui', '.git', 'scripts'].includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue') || entry.name.endsWith('.js')) files.push(full)
  }
  return files
}

function process(content) {
  let result = content
  result = result.replace(/\$options\.filters\.([a-zA-Z][a-zA-Z0-9_]*)/g, '$1')
  result = result.replace(/this\.([a-zA-Z][a-zA-Z0-9_]*)\(\)/g, (m, name) => {
    const filterNames = ['isLogin', 'tipsToLogin', 'forceLogin', 'quiteLoginOut', 'logoff', 'navigateToLogin', 'talkIm', 'callPhone', 'unitPrice', 'goodsFormatPrice']
    if (filterNames.includes(name) && result.includes(`this.${name}(`)) return m
    return m
  })
  result = result.replace(/([a-zA-Z0-9_.\[\]'"\s]+)\s\|\s(refundWayFilter|accountTypeFilter|statusFilter|paymentTypeFilter)/g, (_, expr, name) => {
    return `${name}(${expr.trim()})`
  })
  return result
}

walk(root).forEach((file) => {
  const original = fs.readFileSync(file, 'utf8')
  const updated = process(original)
  if (updated !== original) {
    fs.writeFileSync(file, updated)
    console.log('updated', path.relative(root, file))
  }
})

console.log('done')
