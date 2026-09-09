<template>
  <view class="wrapper" :style="themeStyle">
    <view v-if="pageLoading" class="state-wrap">
      <text class="state-text">{{ pageLoadingText }}</text>
    </view>

    <view v-else-if="pageError" class="state-wrap">
      <text class="state-text">{{ pageError }}</text>
      <view class="retry-btn" @click="loadInviteCardSetting">重新加载</view>
    </view>

    <template v-else>
      <view v-if="qrLoading || posterComposing" class="card state-card">
        <text class="state-text">{{ posterComposing ? '邀请卡合成中...' : qrLoadingText }}</text>
      </view>

      <view v-else-if="qrError || composeError" class="card state-card">
        <text class="state-text">{{ composeError || qrError }}</text>
        <view class="retry-btn" @click="retryGenerate">重新生成</view>
      </view>

      <image
        v-else-if="posterImage"
        class="poster-image"
        :src="posterImage"
        mode="widthFix"
        show-menu-by-longpress
        @click="previewPoster"
      />
    </template>

    <view v-if="posterImage" class="footer-actions">
      <!-- #ifdef MP-WEIXIN -->
      <button class="btn primary share-btn" open-type="share">
        <text class="btn-text">微信分享</text>
      </button>
      <!-- #endif -->
      <view class="save-btn" @click="savePoster">保存海报</view>
      <view class="hint-text">点击预览，长按或保存到相册</view>
    </view>

    <view class="canvas-hide">
      <!-- #ifdef MP-WEIXIN -->
      <canvas type="2d" id="inviteQrCanvas" class="qr-canvas" />
      <canvas type="2d" id="inviteComposeCanvas" :style="composeCanvasStyle" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <canvas canvas-id="inviteQrCanvas" class="qr-canvas" />
      <canvas canvas-id="inviteComposeCanvas" id="inviteComposeCanvas" :style="composeCanvasStyle" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue'
import { onLoad, onReady, onShareAppMessage } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getInviteCard } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'
import { getMpCode } from '@/api/goods'
import { parseGoodsImageUrl } from '@/utils/filters.js'
import {
  POSTER_WIDTH,
  POSTER_HEIGHT,
  composeDistributionPoster,
  savePosterToAlbum,
} from '@/utils/distributionPosterCanvas'

const DEFAULT_JOIN_PAGE = 'pages/mine/distribution/join'
const QR_CANVAS_SIZE = 280
const COMPOSE_CANVAS_SELECTOR = 'inviteComposeCanvas'

function getCanvasPixelRatio() {
  return wx.getWindowInfo?.().pixelRatio || wx.getDeviceInfo?.().pixelRatio || 2
}

const instance = getCurrentInstance()
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const composeCanvasStyle = {
  width: `${POSTER_WIDTH}px`,
  height: `${POSTER_HEIGHT}px`,
}

let canvas2dNode: any = null

const pageLoading = ref(true)
const pageLoadingText = ref('加载邀请卡设置...')
const pageError = ref('')
const qrLoading = ref(false)
const qrLoadingText = ref('葵花码生成中...')
const qrError = ref('')
const qrImage = ref('')
const posterImage = ref('')
const posterComposing = ref(false)
const composeError = ref('')
const inviteContext = ref<Record<string, any>>({})

const avatarUrl = computed(() => parseGoodsImageUrl(inviteContext.value.memberAvatar))
const backgroundUrl = computed(() => parseGoodsImageUrl(inviteContext.value.backgroundImage))

onLoad(() => {
  loadInviteCardSetting()
})

onReady(() => {
  // #ifdef MP-WEIXIN
  initCanvas2d()
  // #endif
})

onShareAppMessage(() => {
  const ctx = inviteContext.value
  const sharePage = normalizeSharePage(ctx.sharePage)
  const query = ctx.distributionId ? `?distributionId=${ctx.distributionId}` : ''
  return {
    title: ctx.slogan || '邀请您成为我的下级分销员',
    path: `/${sharePage}${query}`,
    imageUrl: posterImage.value || qrImage.value || '',
  }
})

function normalizeSharePage(page?: string) {
  const value = String(page || DEFAULT_JOIN_PAGE).trim()
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
    const filePath = `${wx.env.USER_DATA_PATH}/invite_qr_${Date.now()}.png`
    wx.getFileSystemManager().writeFile({
      filePath,
      data,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: () => reject(new Error('葵花码写入失败')),
    })
  })
}

function initCanvas2d() {
  return new Promise<void>((resolve, reject) => {
    if (canvas2dNode) {
      resolve()
      return
    }
    uni
      .createSelectorQuery()
      .in(instance?.proxy)
      .select('#inviteQrCanvas')
      .fields({ node: true, size: true })
      .exec((res: any[]) => {
        const node = res?.[0]?.node
        if (!node) {
          reject(new Error('canvas 节点获取失败'))
          return
        }
        canvas2dNode = node
        const dpr = getCanvasPixelRatio()
        node.width = QR_CANVAS_SIZE * dpr
        node.height = QR_CANVAS_SIZE * dpr
        resolve()
      })
  })
}

function exportQrByCanvas2d(qrPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = canvas2dNode
    const ctx = canvas.getContext('2d')
    const dpr = getCanvasPixelRatio()
    ctx.scale(dpr, dpr)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)

    const img = canvas.createImage()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvas,
            width: QR_CANVAS_SIZE,
            height: QR_CANVAS_SIZE,
            destWidth: QR_CANVAS_SIZE,
            destHeight: QR_CANVAS_SIZE,
            success: (file: any) => resolve(file.tempFilePath),
            fail: () => reject(new Error('葵花码导出失败')),
          },
          instance?.proxy
        )
      }, 300)
    }
    img.onerror = () => reject(new Error('葵花码图片加载失败'))
    img.src = qrPath
  })
}

function exportQrByCanvasLegacy(qrPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCanvasContext('inviteQrCanvas', instance?.proxy)
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)
    ctx.drawImage(qrPath, 0, 0, QR_CANVAS_SIZE, QR_CANVAS_SIZE)
    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath(
          {
            canvasId: 'inviteQrCanvas',
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

async function exportQrByCanvas(qrPath: string): Promise<string> {
  // #ifdef MP-WEIXIN
  await initCanvas2d()
  return exportQrByCanvas2d(qrPath)
  // #endif
  // #ifndef MP-WEIXIN
  return exportQrByCanvasLegacy(qrPath)
  // #endif
}

async function resolveQrDisplay(result: string) {
  const tempPath = await writeBase64ToTemp(result)
  qrImage.value = await exportQrByCanvas(tempPath)
}

async function composePoster() {
  if (!qrImage.value) return

  posterComposing.value = true
  composeError.value = ''
  posterImage.value = ''

  try {
    const ctx = inviteContext.value
    posterImage.value = await composeDistributionPoster(
      COMPOSE_CANVAS_SELECTOR,
      instance?.proxy || instance,
      {
        backgroundImage: backgroundUrl.value,
        memberAvatar: avatarUrl.value,
        memberName: ctx.memberName || '分销员',
        slogan: ctx.slogan || '',
        qrImage: qrImage.value,
        textColor: ctx.textColor || '#1f2a44',
        showMemberInfo: ctx.memberInfoVisible !== false,
      }
    )
  } catch (error: any) {
    console.error('compose invite card failed', error)
    composeError.value = error?.message || '邀请卡合成失败，请稍后重试'
  } finally {
    posterComposing.value = false
  }
}

async function loadInviteCardSetting() {
  pageLoading.value = true
  pageLoadingText.value = '加载邀请卡设置...'
  pageError.value = ''
  qrImage.value = ''
  posterImage.value = ''
  qrError.value = ''
  composeError.value = ''

  const distributor = await assertActiveDistributor()
  if (!distributor) {
    return
  }

  try {
    const res = await getInviteCard()
    if (!res.data?.success || !res.data?.result) {
      throw new Error(res.data?.message || '获取邀请卡设置失败')
    }

    const result = res.data.result
    inviteContext.value = {
      distributionId: result.distributionId || '',
      memberName: result.memberName || '',
      memberAvatar: result.memberAvatar || '',
      backgroundImage: result.backgroundImage || '',
      slogan: result.slogan || '邀请您成为我的下级分销员',
      memberInfoVisible: result.memberInfoVisible !== false,
      textColor: result.textColor || '#1f2a44',
      sharePage: result.sharePage || DEFAULT_JOIN_PAGE,
      shareScene: result.shareScene || '',
    }
  } catch (error: any) {
    console.error('load invite card setting failed', error)
    pageError.value = error?.message || '获取邀请卡设置失败，请稍后重试'
    return
  } finally {
    pageLoading.value = false
  }

  loadQrCode()
}

async function loadQrCode() {
  if (!inviteContext.value.distributionId && !inviteContext.value.shareScene) {
    qrError.value = '分销员信息异常，无法生成葵花码'
    return
  }

  qrLoading.value = true
  qrLoadingText.value = '葵花码生成中...'
  qrError.value = ''
  qrImage.value = ''
  posterImage.value = ''
  composeError.value = ''

  try {
    const ctx = inviteContext.value
    const codeRes = await getMpCode({
      page: normalizeSharePage(ctx.sharePage),
      scene: ctx.shareScene || `recruit_${ctx.distributionId}`,
    })
    if (!codeRes.data?.success || !codeRes.data?.result) {
      throw new Error(codeRes.data?.message || '葵花码生成失败')
    }

    await resolveQrDisplay(codeRes.data.result)
    await composePoster()
  } catch (error: any) {
    console.error('load invite qr code failed', error)
    qrError.value = error?.message || '葵花码生成失败，请稍后重试'
  } finally {
    qrLoading.value = false
  }
}

function retryGenerate() {
  if (qrImage.value && composeError.value) {
    composePoster()
    return
  }
  loadQrCode()
}

function previewPoster() {
  if (!posterImage.value) return
  uni.previewImage({
    current: posterImage.value,
    urls: [posterImage.value],
  })
}

function savePoster() {
  savePosterToAlbum(posterImage.value)
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

.retry-btn,
.save-btn {
  display: inline-block;
  margin-top: 24rpx;
  padding: 12rpx 40rpx;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
  color: #fff;
  font-size: 26rpx;
}

.card {
  position: relative;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  aspect-ratio: 630 / 1000;
}

.state-card {
  display: flex;
  align-items: center;
  justify-content: center;
}

.poster-image {
  width: 100%;
  border-radius: 16rpx;
  display: block;
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

.save-btn {
  display: block;
  width: 100%;
  margin-top: 24rpx;
  text-align: center;
  box-sizing: border-box;
}

.hint-text {
  margin-top: 24rpx;
  color: #b3b3b3;
  font-size: 24rpx;
  text-align: center;
}

.canvas-hide {
  position: fixed;
  left: -9999px;
  top: 0;
  opacity: 0;
  pointer-events: none;
}

.qr-canvas {
  width: 280px;
  height: 280px;
}
</style>
