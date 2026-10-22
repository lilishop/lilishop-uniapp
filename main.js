import { createSSRApp, computed } from 'vue'
import App from './App'
import uviewPlus, { setConfig } from 'uview-plus'
import store from './store'
import config from '@/config/config'
// #ifdef H5
import airBtn from '@/components/m-airbtn/index.vue'
// #endif
import mpShare from '@/utils/mpShare.js'
import * as filterUtils from './utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

export function createApp() {
  const app = createSSRApp(App)

  // uview-plus 内部会触发 Vue3 开发态告警（枚举组件实例 keys），不影响运行
  app.config.warnHandler = (msg, _instance, trace) => {
    if (
      typeof msg === 'string' &&
      msg.includes('enumerating keys on a component instance')
    ) {
      return
    }
    try {
      console.warn(`[Vue warn]: ${msg}${trace || ''}`)
    } catch (e) {
      // #ifdef MP-WEIXIN
      // 微信开发者工具部分版本在输出 Vue warn 时会触发
      // TypeError: Cannot read property '__global' of null
      // #endif
    }
  }

  app.use(store)
  app.use(uviewPlus)

  // uview-plus 的图标字体默认每个 u-icon 实例都会触发 uni.loadFontFace，
  // 导致进入页面时同一字体被反复请求。开启 loadFontOnce 后全局只加载一次。
  setConfig({
    config: {
      loadFontOnce: true,
      iconUrl: 'https://lilishop-uniapp.oss-cn-beijing.aliyuncs.com/font_2225171_8kdcwk4po24.ttf',
    },
    props: {
      form: {
        labelWidth: '180rpx',
        labelPosition: 'left',
      },
    },
  })

  app.config.globalProperties.$store = store
  app.config.globalProperties.$mainColor = computed(() => store.getters.mainColor)
  app.config.globalProperties.$lightColor = computed(() => store.getters.lightColor)
  app.config.globalProperties.$aiderLightColor = computed(
    () => store.getters.aiderLightColor
  )

  const filterMethods = {}
  Object.keys(filterUtils).forEach((key) => {
    if (typeof filterUtils[key] === 'function') {
      filterMethods[key] = filterUtils[key]
    }
  })

  app.mixin({
    methods: filterMethods,
    computed: {
      themeStyle() {
        return getThemeStyle(this.$store.state.theme)
      },
    },
  })
  app.mixin(mpShare)

  // #ifdef H5
  if (config.enableMiniBarStartUpApp) {
    const mountPoint = document.createElement('div')
    document.body.appendChild(mountPoint)
    createSSRApp(airBtn).mount(mountPoint)
  }
  // #endif

  return {
    app
  }
}
