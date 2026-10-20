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
import { handleAppLaunchScene } from '@/utils/distributionBind.js'

const store = useStore()

// #ifdef MP-WEIXIN
wx.onAppRoute((res) => {
  applyTabBarStyle(store.state.theme && store.state.theme.mainColor, res && res.path)
})
// #endif

onLaunch((val) => {
  initTheme()
  handleAppLaunchScene(val)
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
  applyTabBarStyle(store.state.theme && store.state.theme.mainColor)

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

.light-color {
	color: $light-color;
}
.main-color {
	color: $main-color !important;
}
.bg-light-color {
	background-color: $light-color !important;
}
.bg-main-color {
	background-color: $main-color !important;
}

// 渐变主题颜色
.bg-linear-gradient {
	background-image: linear-gradient(25deg, var(--theme-primary, #fa123b), var(--theme-light, #ff6b35), var(--theme-aider, #ff9f28), #ffcc03);
}
.uni-tabbar .uni-tabbar__icon {
	width: 20px;
	height: 18px;
}

.flex {
	display: flex;
}

.btn {
	background-color: $light-color;
	color: #ffffff;
	border-width: 0px;
	border: none;
	border-radius: 44px;
	height: 44px;
	box-shadow: none;
	font-weight: 400;
	font-style: normal;
	line-height: 44px;
	text-align: center;
	&::after {
		border: none;
	}
}
.button-hover {
	opacity: 0.7;
}

.margin {
	margin: 10px;
}

.tag {
	background-color: rgba(242, 242, 242, 1);
	color: #333333;
	height: 28px;
	border-radius: 28px;
	box-shadow: none;
	font-family: "PingFangSC-Regular", "PingFang SC", sans-serif;
	font-weight: 400;
	font-style: normal;
	line-height: 28px;
	text-align: center;
	width: 90px;
}

.c-content {
	background-color: #ffffff;
	// margin-top: 30rpx;
	border-top: 1px solid $border-color-light;
	border-bottom: 1px solid $border-color-light;
}
.mt-30 {
	margin-top: 30rpx;
}
.border-top {
	border-top: 1px solid $border-color-light;
}
.describe {
	color: $font-color-light;
	font-size: $font-sm;
	padding: 30rpx;
}
.flex-center {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
}

.flex-a-c{
	align-items: center;
}
.flex-j-sb{
	justify-content: space-between;
}
.relative {
	position: relative;
}

.wes {
	/* 多出部分用省略号表示 , 用于一行 */
	overflow: hidden;
	word-wrap: normal;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.wes-2 {
	/* 适用于webkit内核和移动端 */
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.wes-3 {
	/* 适用于webkit内核和移动端 */
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
}
</style>
