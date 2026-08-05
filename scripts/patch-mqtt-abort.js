const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '../node_modules/mqtt/dist')

const marker = '_MqttAbortControllerFallback'
const navigatorFallback = '"zh-CN.UTF-8"'

const esmOriginalPattern =
  /var\{AbortController:([A-Za-z_$][\w$]*),AbortSignal:([A-Za-z_$][\w$]*)\}=typeof self<"u"\?self:typeof window<"u"\?window:void 0;/
const esmOldPatchPattern =
  /var _mqttGlobal=typeof globalThis<"u"\?globalThis:typeof self<"u"\?self:typeof window<"u"\?window:typeof global<"u"\?global:\{\};var\{AbortController:([A-Za-z_$][\w$]*),AbortSignal:([A-Za-z_$][\w$]*)\}=_mqttGlobal;/

function createEsmReplacement(controllerName, signalName) {
  return `var _mqttGlobal=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{};var _MqttAbortSignalFallback=class{constructor(){this.aborted=!1;this.reason=void 0;this.onabort=null;this._listeners=[]}addEventListener(e,t,r){if(e==="abort"&&t){this._listeners.push({listener:t,once:!!(r&&r.once)})}}removeEventListener(e,t){if(e==="abort"){this._listeners=this._listeners.filter(r=>r.listener!==t)}}dispatchEvent(e){if(!e||e.type!=="abort")return!0;var t=this._listeners.slice();this._listeners=this._listeners.filter(r=>!r.once);for(var r of t){try{typeof r.listener==="function"?r.listener.call(this,e):r.listener&&typeof r.listener.handleEvent==="function"&&r.listener.handleEvent(e)}catch(n){}}return!0}throwIfAborted(){if(this.aborted)throw this.reason||new Error("Aborted")}};var ${marker}=class{constructor(){this.signal=new _MqttAbortSignalFallback}abort(e){if(this.signal.aborted)return;this.signal.aborted=!0;this.signal.reason=e;var t={type:"abort",target:this.signal};if(typeof this.signal.onabort==="function"){try{this.signal.onabort.call(this.signal,t)}catch(r){}}this.signal.dispatchEvent(t)}};var ${controllerName}=_mqttGlobal.AbortController||${marker};var ${signalName}=_mqttGlobal.AbortSignal||_MqttAbortSignalFallback;typeof _mqttGlobal.AbortController>"u"&&(_mqttGlobal.AbortController=${controllerName});typeof _mqttGlobal.AbortSignal>"u"&&(_mqttGlobal.AbortSignal=${signalName});`
}

const jsOriginalPattern =
  /var \{ AbortController, AbortSignal \} = typeof self !== "undefined" \? self : typeof window !== "undefined" \? window : \(\s*\/\* otherwise \*\/\s*void 0\s*\);/
const jsOldPatchPattern =
  /var \{ AbortController, AbortSignal \} = typeof globalThis !== "undefined" \? globalThis : typeof self !== "undefined" \? self : typeof window !== "undefined" \? window : typeof global !== "undefined" \? global : \(\s*\/\* otherwise \*\/\s*(?:void 0|\{\})\s*\);/

const jsReplacement = `var _mqttGlobal = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
      var _MqttAbortSignalFallback = class {
        constructor() {
          this.aborted = false;
          this.reason = void 0;
          this.onabort = null;
          this._listeners = [];
        }
        addEventListener(type, listener, options) {
          if (type === "abort" && listener) this._listeners.push({ listener, once: !!(options && options.once) });
        }
        removeEventListener(type, listener) {
          if (type === "abort") this._listeners = this._listeners.filter((entry) => entry.listener !== listener);
        }
        dispatchEvent(event) {
          if (!event || event.type !== "abort") return true;
          const entries = this._listeners.slice();
          this._listeners = this._listeners.filter((entry) => !entry.once);
          for (const entry of entries) {
            try {
              if (typeof entry.listener === "function") entry.listener.call(this, event);
              else if (entry.listener && typeof entry.listener.handleEvent === "function") entry.listener.handleEvent(event);
            } catch (error) {}
          }
          return true;
        }
        throwIfAborted() {
          if (this.aborted) throw this.reason || new Error("Aborted");
        }
      };
      var ${marker} = class {
        constructor() {
          this.signal = new _MqttAbortSignalFallback();
        }
        abort(reason) {
          if (this.signal.aborted) return;
          this.signal.aborted = true;
          this.signal.reason = reason;
          const event = { type: "abort", target: this.signal };
          if (typeof this.signal.onabort === "function") {
            try { this.signal.onabort.call(this.signal, event); } catch (error) {}
          }
          this.signal.dispatchEvent(event);
        }
      };
      var AbortController = _mqttGlobal.AbortController || ${marker};
      var AbortSignal = _mqttGlobal.AbortSignal || _MqttAbortSignalFallback;
      if (typeof _mqttGlobal.AbortController === "undefined") _mqttGlobal.AbortController = AbortController;
      if (typeof _mqttGlobal.AbortSignal === "undefined") _mqttGlobal.AbortSignal = AbortSignal;`

function isEsmPatched(content) {
  return content.includes(marker)
}

function isJsPatched(content) {
  return content.includes(marker)
}

function patchEsmFile(file) {
  const filePath = path.join(root, file)
  if (!fs.existsSync(filePath)) {
    console.log(`skip ${file} (missing)`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  if (isEsmPatched(content)) {
    console.log(`skip ${file} (already patched)`)
    return
  }

  const match = content.match(esmOriginalPattern) || content.match(esmOldPatchPattern)
  if (match) {
    content = content.replace(match[0], createEsmReplacement(match[1], match[2]))
    fs.writeFileSync(filePath, content)
    console.log(`patched ${file} (embedded AbortController fallback)`)
    return
  }

  throw new Error(`Unable to patch ${file}: unsupported mqtt bundle format`)
}

function patchJsFile() {
  const jsPath = path.join(root, 'mqtt.js')
  if (!fs.existsSync(jsPath)) {
    console.log('skip mqtt.js (missing)')
    return
  }

  let jsContent = fs.readFileSync(jsPath, 'utf8')
  if (isJsPatched(jsContent)) {
    console.log('skip mqtt.js (already patched)')
    return
  }

  const match = jsContent.match(jsOriginalPattern) || jsContent.match(jsOldPatchPattern)
  if (match) {
    jsContent = jsContent.replace(match[0], jsReplacement)
    fs.writeFileSync(jsPath, jsContent)
    console.log('patched mqtt.js (embedded AbortController fallback)')
    return
  }

  throw new Error('Unable to patch mqtt.js: unsupported mqtt bundle format')
}

function patchNavigatorLanguage(file) {
  const filePath = path.join(root, file)
  if (!fs.existsSync(filePath)) {
    console.log(`skip ${file} navigator patch (missing)`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf8')
  const unsafeMinified = 'LANG:navigator.language+".UTF-8"'
  const unsafePretty = 'LANG: navigator.language + ".UTF-8"'
  const safeMinified =
    `LANG:typeof navigator<"u"&&navigator.language?navigator.language+".UTF-8":${navigatorFallback}`
  const safePretty =
    `LANG: typeof navigator !== "undefined" && navigator.language ? navigator.language + ".UTF-8" : ${navigatorFallback}`

  if (content.includes(unsafeMinified)) {
    content = content.replaceAll(unsafeMinified, safeMinified)
    fs.writeFileSync(filePath, content)
    console.log(`patched ${file} (navigator.language fallback)`)
    return
  }

  if (content.includes(unsafePretty)) {
    content = content.replaceAll(unsafePretty, safePretty)
    fs.writeFileSync(filePath, content)
    console.log(`patched ${file} (navigator.language fallback)`)
    return
  }

  if (content.includes(safeMinified) || content.includes(safePretty)) {
    console.log(`skip ${file} navigator patch (already patched)`)
    return
  }

  throw new Error(`Unable to patch navigator.language in ${file}: unsupported mqtt bundle format`)
}

if (!fs.existsSync(root)) {
  console.log('skip mqtt patch (mqtt dist not installed yet)')
  process.exit(0)
}

;['mqtt.esm.js', 'mqtt.min.js'].forEach(patchEsmFile)
patchJsFile()
;['mqtt.esm.js', 'mqtt.min.js', 'mqtt.js'].forEach(patchNavigatorLanguage)
