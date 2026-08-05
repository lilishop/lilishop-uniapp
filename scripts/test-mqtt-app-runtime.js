const fs = require('fs')
const path = require('path')
const vm = require('vm')

const bundle = fs.readFileSync(
  path.join(path.dirname(require.resolve('mqtt/package.json')), 'dist/mqtt.js'),
  'utf8'
)

const context = vm.createContext({
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  queueMicrotask,
  TextEncoder,
  TextDecoder,
  URL,
})

vm.runInContext(bundle, context, { timeout: 10000 })

if (typeof context.AbortController !== 'function') {
  throw new Error('MQTT bundle did not install AbortController fallback')
}
if (typeof context.AbortSignal !== 'function') {
  throw new Error('MQTT bundle did not install AbortSignal fallback')
}

const controller = new context.AbortController()
let abortEvents = 0
controller.signal.addEventListener('abort', () => {
  abortEvents += 1
}, { once: true })
controller.abort('test-reason')
controller.abort('ignored-reason')

if (!controller.signal.aborted) {
  throw new Error('AbortSignal was not marked aborted')
}
if (controller.signal.reason !== 'test-reason') {
  throw new Error('AbortSignal reason was not preserved')
}
if (abortEvents !== 1) {
  throw new Error(`Expected one abort event, got ${abortEvents}`)
}

console.log('MQTT App runtime fallback test passed')
