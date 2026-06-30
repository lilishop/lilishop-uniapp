/**
 * Vue 3 migration helpers for template and script patterns.
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const filterNames = [
  'unitPrice',
  'goodsFormatPrice',
  'secrecyMobile',
  'unixToDate',
  'beautifyTime',
  'formatTime',
  'orderStatusList',
  'serviceStatusList',
  'noPassByName',
  'setClipboard',
  'clearStrComma'
]

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'uview-ui' || entry.name === '.git') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.name.endsWith('.vue')) files.push(full)
  }
  return files
}

function convertFilterPipes(content) {
  let result = content
  for (const name of filterNames) {
    const re = new RegExp(`([\\w\\[\\].'"()\\s]+?)\\s\\|\\s${name}(\\([^)]*\\))?`, 'g')
    result = result.replace(re, (_, expr, args = '') => {
      const trimmed = expr.trim()
      return `${name}(${trimmed}${args ? args.slice(1, -1) ? ', ' + args.slice(1, -1) : '' : ''})`
    })
  }
  return result
}

function convertComponentFilters(content) {
  return content.replace(/\|\s*([a-zA-Z][a-zA-Z0-9_]*)(\([^)]*\))?/g, (match, name, args = '') => {
    if (filterNames.includes(name)) return match
    return match
  })
}

function convertPopupVModel(content) {
  const tags = ['u-popup', 'u-modal', 'u-action-sheet', 'u-picker', 'u-select', 'u-keyboard', 'u-calendar']
  let result = content
  for (const tag of tags) {
    result = result.replace(new RegExp(`(<${tag}[^>]*?)\\bv-model="([^"]+)"`, 'g'), '$1v-model:show="$2"')
  }
  return result
}

function convertNavbarProps(content) {
  return content
    .replace(/:is-back="false"/g, ':auto-back="false"')
    .replace(/:isBack="false"/g, ':auto-back="false"')
    .replace(/:is-back="true"/g, ':auto-back="true"')
    .replace(/:isBack="true"/g, ':auto-back="true"')
}

function convertSlotSyntax(content) {
  let result = content
  result = result.replace(/\sslot="right-icon"/g, ' #right-icon')
  result = result.replace(/\sslot="loading"/g, ' #loading')
  result = result.replace(/\sslot="([^"]+)"/g, ' #$1')
  result = result.replace(/slot-scope="([^"]+)"/g, '#default="$1"')
  return result
}

function convertSetDelete(content) {
  return content
    .replace(/this\.\$set\(([^,]+),\s*([^,]+),\s*([^)]+)\)/g, '$1[$2] = $3')
    .replace(/this\.\$delete\(([^,]+),\s*([^)]+)\)/g, 'delete $1[$2]')
}

function moveLocalFiltersToMethods(content) {
  const match = content.match(/filters:\s*\{([\s\S]*?)\n\s*\},/)
  if (!match) return content
  const filtersBlock = match[1]
  const methodEntries = []
  const re = /([a-zA-Z][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{([\s\S]*?)\n\s*\},/g
  let m
  while ((m = re.exec(filtersBlock + ',')) !== null) {
    methodEntries.push(`    ${m[1]}(${m[2]}) {${m[3]}\n    },`)
  }
  if (!methodEntries.length) return content

  let updated = content.replace(/filters:\s*\{[\s\S]*?\n\s*\},\n?/, '')
  updated = convertComponentFiltersInTemplate(updated, methodEntries.map(e => e.trim().split('(')[0].trim()))

  if (updated.includes('methods: {')) {
    updated = updated.replace('methods: {', `methods: {\n${methodEntries.join('\n')}`)
  }
  return updated
}

function convertComponentFiltersInTemplate(content, localNames) {
  let result = content
  for (const name of localNames) {
    const clean = name.replace(/^\s+/, '')
    const re = new RegExp(`([\\w\\[\\].'"()\\s]+?)\\s\\|\\s${clean}(\\([^)]*\\))?`, 'g')
    result = result.replace(re, (_, expr, args = '') => {
      const trimmed = expr.trim()
      const argText = args ? args.slice(1, -1) : ''
      return `${clean}(${trimmed}${argText ? ', ' + argText : ''})`
    })
  }
  return result
}

function fixShareComponent(content) {
  return content
    .replace(/import mpShare from "uview-ui\/libs\/mixin\/mpShare.js";/, 'import mpShare from "@/utils/mpShare.js";')
    .replace(/this\.\$options\.filters\.setClipboard\(([^)]+)\)/g, 'setClipboard($1)')
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content
  content = convertFilterPipes(content)
  content = convertPopupVModel(content)
  content = convertNavbarProps(content)
  content = convertSlotSyntax(content)
  content = convertSetDelete(content)
  content = moveLocalFiltersToMethods(content)
  content = fixShareComponent(content)
  content = content.replace(/import uFormItem from "@\/uview-ui\/components\/u-form-item\/u-form-item.vue";?\n?/g, '')
  content = content.replace(/import uImage from "@\/uview-ui\/components\/u-image\/u-image.vue";?\n?/g, '')
  content = content.replace(/components:\s*\{\s*uFormItem,?\s*\},?\n?/g, '')
  content = content.replace(/components:\s*\{\s*uImage,?\s*\},?\n?/g, '')
  if (content !== original) {
    fs.writeFileSync(file, content)
    console.log('updated', path.relative(root, file))
  }
}

walk(root).forEach(processFile)
console.log('migration complete')
