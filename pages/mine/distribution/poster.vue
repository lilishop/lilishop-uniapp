<template>
  <view class="wrapper" :style="themeStyle">
    <view v-if="pageLoading" class="state-wrap">
      <text class="state-text">{{ pageLoadingText }}</text>
    </view>

    <view v-else-if="pageError" class="state-wrap">
      <text class="state-text">{{ pageError }}</text>
      <view class="retry-btn" @click="loadPosterSetting">重新加载</view>
    </view>

    <view v-else class="card" :class="{ 'card--has-bg': hasBackground }">
      <image
        v-if="hasBackground"
        class="card-bg"
        :src="backgroundUrl"
        mode="aspectFill"
      />
      <view class="card-content">
        <view v-if="showMemberInfo" class="member-info">
          <image
            v-if="posterContext.memberAvatar"
            class="member-avatar"
            :src="avatarUrl"
            mode="aspectFill"
          />
          <view class="member-name" :style="textStyle">{{ posterContext.memberName || '分销员' }}</view>
        </view>

        <view v-if="posterContext.slogan" class="slogan" :style="textStyle">{{ posterContext.slogan }}</view>

        <view class="qr-wrap" @click="previewQrCode">
          <view v-if="qrLoading" class="qr-state">
            <text class="qr-state-text">{{ qrLoadingText }}</text>
          </view>
          <view v-else-if="qrError" class="qr-state">
            <text class="qr-state-text">{{ qrError }}</text>
            <view class="retry-btn small" @click.stop="loadQrCode">重新生成</view>
          </view>
          <image
            v-else-if="qrImage"
            class="qr-image"
            :src="qrImage"
            mode="aspectFit"
            show-menu-by-longpress
            @error="onQrImageError"
          />
        </view>
      </view>
    </view>

    <view v-if="!pageLoading && !pageError" class="footer-actions">
      <!-- #ifdef MP-WEIXIN -->
      <button class="btn primary share-btn" open-type="share" :disabled="!qrImage">
        <text class="btn-text">微信分享</text>
      </button>
      <!-- #endif -->
      <view class="hint-text">长按图片保存海报</view>
    </view>

    <canvas canvas-id="qrCanvas" class="qr-canvas" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getPromotionPoster } from '@/api/distribution'
import { getMpCode } from '@/api/goods'
import { parseGoodsImageUrl } from '@/utils/filters.js'

const DEFAULT_HOME_PAGE = 'pages/tabbar/home/index'
const QR_CANVAS_SIZE = 280

const instance = getCurrentInstance()
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const pageLoading = ref(true)
const pageLoadingText = ref('加载海报设置...')
const pageError = ref('')
const qrLoading = ref(false)
const qrLoadingText = ref('葵花码生成中...')
const qrError = ref('')
const qrImage = ref('')
const posterContext = ref<Record<string, any>>({})

const showMemberInfo = computed(() => posterContext.value.memberInfoVisible !== false)
const textStyle = computed(() => ({
  color: posterContext.value.textColor || '#1f2a44',
}))
const avatarUrl = computed(() => parseGoodsImageUrl(posterContext.value.memberAvatar))
const backgroundUrl = computed(() => parseGoodsImageUrl(posterContext.value.backgroundImage))
const hasBackground = computed(() => !!backgroundUrl.value)

onLoad(() => {
  loadPosterSetting()
})

onShareAppMessage(() => {
  const ctx = posterContext.value
  const sharePage = normalizeSharePage(ctx.sharePage)
  return {
    title: ctx.slogan || '邀请你一起逛逛',
    path: `/${sharePage}`,
    imageUrl: qrImage.value || '',
  }
})

function normalizeSharePage(page?: string) {
  const value = String(page || DEFAULT_HOME_PAGE).trim()
  return value.replace(/^\//, '')
}

function writeBase64ToTemp(base64: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const raw = String(base64).trim()
    if (!raw || raw.startsWith('{')) {
      reject(new Error('葵花码数据无效'))
      return
    }
    const data = raw.replace(/^data:image\/\w+;base64,/, '')
    const filePath = `${wx.env.USER_DATA_PATH}/poster_qr_${Date.now()}.png`
    wx.getFileSystemManager().writeFile({
      filePath,
      data,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: () => reject(new Error('葵花码写入失败')),
    })
  })
}

function exportQrByCanvas(qrPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext('qrCanvas', instance?.proxy)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)
    ctx.drawImage(qrPath, 0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvasId: 'qrCanvas',
            width: QR_CANVAS_SIZE,
            height: QR_CANVAS_SIZE,
            destWidth: QR_CANVAS_SIZE,
            destHeight: QR_CANVAS_SIZE,
            success: (file) => resolve(file.tempFilePath),
            fail: () => reject(new Error('葵花码导出失败')),
          },
          instance?.proxy
        )
      }, 300)
    })
  })
}

async function resolveQrDisplay(result: string) {
  const tempPath = await writeBase64ToTemp(result)
  qrImage.value = await exportQrByCanvas(tempPath)
}

async function loadPosterSetting() {
  pageLoading.value = true
  pageLoadingText.value = '加载海报设置...'
  pageError.value = ''
  qrImage.value = ''
  qrError.value = ''

  try {
    const res = await getPromotionPoster()
    if (!res.data?.success || !res.data?.result) {
      throw new Error(res.data?.message || '获取海报设置失败')
    }

    const result = res.data.result
    posterContext.value = {
      distributionId: result.distributionId || '',
      memberName: result.memberName || '',
      memberAvatar: result.memberAvatar || '',
      backgroundImage: result.backgroundImage || '',
      slogan: result.slogan || '发现好物，邀请你一起逛逛',
      memberInfoVisible: result.memberInfoVisible !== false,
      textColor: result.textColor || '#1f2a44',
      sharePage: result.sharePage || DEFAULT_HOME_PAGE,
      shareScene: result.shareScene || '',
    }
  } catch (error: any) {
    console.error('load poster setting failed', error)
    pageError.value = error?.message || '获取海报设置失败，请稍后重试'
    return
  } finally {
    pageLoading.value = false
  }

  loadQrCode()
}

async function loadQrCode() {
  if (!posterContext.value.distributionId && !posterContext.value.shareScene) {
    qrError.value = '分销员信息异常，无法生成葵花码'
    return
  }

  qrLoading.value = true
  qrLoadingText.value = '葵花码生成中...'
  qrError.value = ''
  qrImage.value = ''

  try {
    const ctx = posterContext.value
    const codeRes = await getMpCode({
      page: normalizeSharePage(ctx.sharePage),
      scene: ctx.shareScene || `bind,${ctx.distributionId}`,
    })
    if (!codeRes.data?.success || !codeRes.data?.result) {
      throw new Error(codeRes.data?.message || '葵花码生成失败')
    }

    await resolveQrDisplay(codeRes.data.result)
  } catch (error: any) {
    console.error('load qr code failed', error)
    qrError.value = error?.message || '葵花码生成失败，请稍后重试'
  } finally {
    qrLoading.value = false
  }
}

function onQrImageError() {
  qrError.value = '葵花码图片加载失败'
  qrImage.value = ''
}

function previewQrCode() {
  if (!qrImage.value) return
  uni.previewImage({
    current: qrImage.value,
    urls: [qrImage.value],
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background: #f5f5f5;
}

.state-wrap {
  padding: 160rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 28rpx;
}

.retry-btn {
  display: inline-block;
  margin-top: 24rpx;
  padding: 12rpx 40rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
  color: #fff;
  font-size: 26rpx;
}

.retry-btn.small {
  margin-top: 16rpx;
  padding: 8rpx 28rpx;
  font-size: 24rpx;
}

.card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  min-height: 720rpx;
}

.card--has-bg {
  background: transparent;
}

.card-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
  padding: 32rpx 24rpx;
  text-align: center;
}

.card--has-bg .card-content {
  background: rgba(255, 255, 255, 0.12);
}

.member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.member-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-bottom: 16rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
}

.member-name {
  font-size: 34rpx;
  font-weight: bold;
}

.slogan {
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.6;
  padding: 0 16rpx;
}

.qr-wrap {
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}

.qr-state {
  width: 420rpx;
  height: 420rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16rpx;
}

.qr-state-text {
  color: #999;
  font-size: 26rpx;
  padding: 0 24rpx;
  text-align: center;
}

.qr-image {
  width: 420rpx;
  height: 420rpx;
  background: #fff;
  border-radius: 16rpx;
}

.qr-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 280px;
  height: 280px;
}

.footer-actions {
  margin-top: 24rpx;
}

.btn {
  width: 100%;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 40rpx;
  border: 1px solid $light-color;
  color: $light-color;
  font-size: 28rpx;
  box-sizing: border-box;
}

.btn.primary {
  background: $light-color;
  color: #fff;
  border-color: $light-color;
}

.btn.disabled {
  opacity: 0.5;
}

.share-btn {
  display: block;
  width: 100%;
  margin: 0;
  padding: 0;
  line-height: normal;
  font-size: inherit;
}

.share-btn::after {
  border: none;
}

.btn-text {
  display: block;
  padding: 20rpx 0;
  color: #fff;
  font-size: 28rpx;
}

.hint-text {
  margin-top: 24rpx;
  color: #b3b3b3;
  font-size: 24rpx;
  text-align: center;
}
</style>
