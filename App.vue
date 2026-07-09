<script setup lang="ts">
import config from '@/config/config'
import { getClipboardData } from '@/js_sdk/h5-copy/h5-copy.js'
import APPUpdate from '@/plugins/APPUpdate'
import storage from '@/utils/storage'
import { getThemeSetting } from '@/api/common.js'
import {
  applyTabBarStyle,
  cacheTheme,
  loadCachedTheme,
  normalizeTheme,
} from '@/utils/theme'
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'

const store = useStore()

// #ifdef MP-WEIXIN
wx.onAppRoute(() => {})
// #endif

onLaunch((val) => {
  initTheme()
  if (val?.query?.inviter) {
    storage.setInviter(val.query.inviter)
  }

  // #ifdef APP-PLUS
  plus.globalEvent.addEventListener('newintent', () => {
    checkArguments()
  })
  // #endif

  // #ifdef MP-WEIXIN
  applyUpdateWeChat()
  // #endif
})

onShow(() => {
  // #ifndef H5
  if (config.enableGetClipboard) {
    getClipboard()
  }
  // #endif

  // #ifdef APP-PLUS
  if (storage.getShow()) {
    if (uni.getSystemInfoSync().platform == 'ios') {
      uni.navigateTo({ url: '/pages/tabbar/screen/fullScreen' })
    }
  }
  // #endif
})

function initTheme() {
  const cached = loadCachedTheme()
  if (cached) {
    store.commit('SET_THEME', cached)
    applyTabBarStyle(cached.mainColor)
  }
  getThemeSetting()
    .then((res) => {
      if (res.data?.success && res.data.result?.settingValue) {
        try {
          const raw = JSON.parse(res.data.result.settingValue)
          const theme = normalizeTheme(raw)
          store.commit('SET_THEME', theme)
          cacheTheme(theme)
          applyTabBarStyle(theme.mainColor)
        } catch (e) {
          // 主题配置解析失败时使用缓存
        }
      }
    })
    .catch(() => {})
}

function applyUpdateWeChat() {
  const updateManager = uni.getUpdateManager()

  updateManager.onCheckForUpdate(() => {})

  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '发现新版本，是否重启应用？',
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      },
    })
  })

  updateManager.onUpdateFailed(() => {})
}

function launch() {
  try {
    const value = uni.getStorageSync('launchFlag')
    if (!value) {
      // uni.navigateTo({ url: '/pages/index/agreement' })
    } else {
      const w = plus.webview.open(
        '/hybrid/html/advertise/advertise.html',
        '本地地址',
        {
          top: 0,
          bottom: 0,
          zindex: 999,
        },
        'fade-in',
        500,
      )
      setTimeout(() => {
        plus.webview.close(w)
        APPUpdate()
      }, 3000)
    }
  } catch (e) {
    uni.setStorage({
      key: 'launchFlag',
      data: true,
      success() {
        console.log('error时存储launchFlag')
      },
    })
  }
}

async function getClipboard() {
  const res = await getClipboardData()
  if (res.indexOf(config.shareLink) != -1 && res != store.state.shareLink) {
    store.state.shareLink = res
    uni.showModal({
      title: '提示',
      content: '检测到一个分享链接是否跳转？',
      confirmText: '跳转',
      success(callback) {
        if (callback.confirm) {
          const path = res.split(config.shareLink)[1]
          if (path.indexOf('tabbar') != -1) {
            uni.switchTab({ url: path })
          } else {
            uni.navigateTo({ url: path })
          }
        }
      },
    })
  }
}

function checkArguments() {
  // #ifdef APP-PLUS
  setTimeout(() => {
    const args = plus.runtime.arguments
    if (args) {
      const argsStr = decodeURIComponent(args)
      const path = argsStr.split('//')[1]
      if (path.indexOf('tabbar') != -1) {
        uni.switchTab({ url: `/${path}` })
      } else {
        uni.navigateTo({ url: `/${path}` })
      }
    }
  })
  // #endif
}
</script>

<style lang="scss">
@import "uview-plus/index.scss";
@import "@/styles/uview-form-fix.scss";

// -------适配底部安全区  苹果x系列刘海屏

// #ifdef MP-WEIXIN
.mp-iphonex-bottom {
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: content-box;
	height: auto !important;
	padding-top: 10rpx;
}

// #endif

body {
	background-color: $bg-color;
}

/************************ */
.w200 {
	width: 200rpx !important;
}

.flex1 {
	flex: 1; //必须父级设置flex
}
</style>
