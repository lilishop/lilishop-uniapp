
<template>
  <view class="edition-intro">
    <view class="header-block">
      <image :src="config.logo" class="logo" mode="aspectFit" />
      <text class="app-name">{{ config.name }}</text>
      <view class="version">
        <!-- #ifdef APP-PLUS -->
        Version {{ localVersion.version }}
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        小程序版本: {{ localVersion.version }} {{ localVersion.envVersion }}
        <!-- #endif -->
      </view>
    </view>

    <u-cell-group class="cell-group" :border="false">
      <!-- #ifdef APP-PLUS -->
      <u-cell v-if="showIosRating" is-link title="去评分" @click="openAppStoreRating"></u-cell>
      <u-cell is-link title="功能介绍" @click="navigateTo('/pages/mine/set/versionFunctionList')"></u-cell>
      <u-cell is-link title="检查更新" @click="checkUpdate"></u-cell>
      <!-- #endif -->

      <u-cell is-link title="证照信息" @click="navigateTo('/pages/mine/help/tips?type=LICENSE_INFORMATION')"></u-cell>
      <u-cell is-link title="服务协议" @click="navigateTo('/pages/mine/help/tips?type=USER_AGREEMENT')"></u-cell>
      <u-cell is-link title="隐私协议" @click="navigateTo('/pages/mine/help/tips?type=PRIVACY_POLICY')"></u-cell>
      <u-cell is-link title="关于我们" @click="navigateTo('/pages/mine/help/tips?type=ABOUT')"></u-cell>
    </u-cell-group>

    <view class="intro">
      <view v-if="config.customerServiceMobile">客服热线：{{ config.customerServiceMobile }}</view>
      <view v-if="config.customerServiceEmail" class="intro-line">客服邮箱：{{ config.customerServiceEmail }}</view>
      <view class="intro-line">
        <text class="intro-link" @click="navigateTo('/pages/mine/help/tips?type=USER_AGREEMENT')">
          《{{ config.name }}用户协议》
        </text>
      </view>
      <view class="intro-line">CopyRight ©{{ config.name }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import APPUpdate from '@/plugins/APPUpdate'
import config from '@/config/config'
import { getAppVersion } from '@/api/message.js'

const showIosRating = ref(false)
const versionData = ref<Record<string, any>>({})
const localVersion = ref<Record<string, any>>({})
const params = ref<Record<string, any>>({ pageNumber: 1, pageSize: 5 })

onLoad(() => {
  // #ifdef APP-PLUS
  const platform = uni.getSystemInfoSync().platform
  if (platform === 'android') {
    params.value.type = 0
  } else {
    showIosRating.value = true
    params.value.type = 1
  }
  fetchRemoteVersion(platform)

  plus.runtime.getProperty(plus.runtime.appid, (inf) => {
    localVersion.value = {
      versionCode: inf.version.replace(/\./g, ''),
      version: inf.version,
    }
  })
  // #endif

  // #ifdef MP-WEIXIN
  const accountInfo = wx.getAccountInfoSync()
  localVersion.value = {
    versionCode: accountInfo.miniProgram.version.replace(/\./g, ''),
    version: accountInfo.miniProgram.version,
    envVersion: accountInfo.miniProgram.envVersion,
  }
  // #endif
})

async function fetchRemoteVersion(platform: string) {
  const type = platform === 'android' ? 'ANDROID' : 'IOS'
  const res = await getAppVersion(type)
  if (res.data.success) {
    versionData.value = res.data.result
  }
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function openAppStoreRating() {
  plus.runtime.launchApplication({
    action: `itms-apps://itunes.apple.com/app/${config.iosAppId}?action=write-review`,
  })
}

function checkUpdate() {
  if (versionData.value.version?.replace(/\./g, '') < localVersion.value.versionCode) {
    APPUpdate()
  } else {
    uni.showToast({ title: '当前版本已是最新版', duration: 2000, icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8 !important;
}

.edition-intro {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f8f8f8;
  display: flex;
  flex-direction: column;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.header-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background: #fff;
}

.logo {
  width: 200rpx;
  height: 200rpx;
}

.app-name {
  margin-top: 20rpx;
  font-size: 36rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
  color: #333;
}

.version {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.cell-group {
  width: 100%;
  margin-top: 20rpx;
  background: #fff;
}

:deep(.u-cell-group) {
  width: 100%;
}

:deep(.u-cell) {
  width: 100%;
}

:deep(.u-cell__body) {
  padding: 28rpx 30rpx;
}

:deep(.u-cell__title-text) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-cell__right-icon-wrap) {
  color: #ccc !important;
}

:deep(.u-line) {
  width: 100% !important;
  margin: 0 !important;
}

.intro {
  margin-top: auto;
  width: 100%;
  padding: 48rpx 40rpx calc(80rpx + env(safe-area-inset-bottom));
  text-align: center;
  font-size: 24rpx;
  line-height: 1.8;
  color: #666;
  letter-spacing: 1rpx;
  box-sizing: border-box;
}

.intro-line {
  margin-top: 12rpx;
}

.intro-link {
  color: #003a8c;
}
</style>
<style lang="scss">
/* #ifdef H5 */
page {
  min-height: 100vh;
}
/* #endif */
</style>
