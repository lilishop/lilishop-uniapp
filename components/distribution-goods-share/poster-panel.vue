<template>
  <view class="poster-panel">
    <view v-if="posterList.length" class="poster-hint">点击海报预览后可保存到相册</view>

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">海报生成中...</text>
    </view>

    <view v-else-if="loadError" class="loading-wrap">
      <text class="loading-text">{{ loadError }}</text>
      <view class="retry-btn" @click="generatePosters">重新生成</view>
    </view>

    <view v-else-if="!images.length" class="loading-wrap">
      <text class="loading-text">暂无商品图片</text>
    </view>

    <template v-else-if="posterList.length">
      <view class="poster-content">
      <swiper
        class="poster-swiper"
        :current="current"
        circular
        @change="onSwiperChange"
      >
        <swiper-item v-for="(item, index) in posterList" :key="index">
          <view class="poster-card-wrap" @click="previewPoster(index)">
            <image class="poster-image" :src="item" mode="widthFix" />
          </view>
        </swiper-item>
      </swiper>
      <view v-if="posterList.length > 1" class="poster-dots">
        <view
          v-for="(_, index) in posterList"
          :key="index"
          :class="['dot', current === index && 'active']"
        />
      </view>
      <view class="save-btn-wrap">
        <view class="save-btn" @click="saveCurrentPoster">保存海报</view>
      </view>
      </view>
    </template>

    <view class="canvas-hide">
      <!-- #ifdef MP-WEIXIN -->
      <canvas id="distributionPosterCanvas" type="2d" style="width: 600px; height: 840px" />
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <canvas
        canvas-id="distributionPosterCanvas"
        id="distributionPosterCanvas"
        style="width: 600px; height: 840px"
      />
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, nextTick } from 'vue'
import DrawPoster from '@/js_sdk/u-draw-poster'
import { getDistributionGoodsPosterContext } from '@/api/distribution'
import { unitPrice } from '@/utils/filters.js'

const CANVAS_SELECTOR = 'distributionPosterCanvas'
const POSTER_WIDTH = 600
const IMAGE_HEIGHT = POSTER_WIDTH
const BOTTOM_HEIGHT = 240
const POSTER_HEIGHT = IMAGE_HEIGHT + BOTTOM_HEIGHT
const QR_SIZE = 120
const QR_MARGIN_RIGHT = 28
const QR_MARGIN_BOTTOM = 28
const GENERATE_TIMEOUT = 45000

const props = defineProps<{
  images?: string[]
  goodsName?: string
  goodsDesc?: string
  price?: number | null
  skuId?: string
  goodsId?: string
  distributionId?: string
  active?: boolean
}>()

const instance = getCurrentInstance()
const posterList = ref<string[]>([])
const current = ref(0)
const loading = ref(false)
const loadError = ref('')
const hasGenerated = ref(false)
let dp: any = null

// #ifdef MP-WEIXIN
const st2 = (size: number) => size * 2
// #endif
// #ifndef MP-WEIXIN
const st2 = (size: number) => size
// #endif

watch(
  () => [props.images?.length, props.skuId, props.goodsId, props.distributionId],
  () => {
    resetPosters()
    if (props.active && props.images?.length) {
      generatePosters()
    }
  }
)

watch(
  () => props.active,
  (active) => {
    if (active && !hasGenerated.value && props.images?.length && !loading.value) {
      generatePosters()
    }
  },
  { immediate: true }
)

function resetPosters() {
  hasGenerated.value = false
  posterList.value = []
  loadError.value = ''
  clearDrawPosterCache()
}

function clearDrawPosterCache() {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  if (!page) return
  delete page[`#${CANVAS_SELECTOR}__dp`]
  delete page[`${CANVAS_SELECTOR}__dp`]
}

function onSwiperChange(e: any) {
  current.value = e.detail?.current ?? 0
}

function previewPoster(index: number) {
  if (!posterList.value.length) return
  uni.previewImage({
    current: posterList.value[index],
    urls: posterList.value,
  })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function getComponentThis() {
  return instance?.proxy || instance
}

async function waitCanvasReady() {
  await nextTick()
  await sleep(150)
}

async function resolveImagePath(url: string) {
  if (!url) {
    throw new Error('商品图片地址无效')
  }
  if (
    url.startsWith('data:') ||
    url.startsWith('wxfile://') ||
    url.startsWith('http://tmp/') ||
    url.startsWith('https://tmp/')
  ) {
    return url
  }
  const res = await uni.downloadFile({ url })
  if (res.statusCode === 200 && res.tempFilePath) {
    return res.tempFilePath
  }
  throw new Error('商品图片下载失败，请检查图片域名配置')
}

function getImageInfo(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (res) => resolve({ width: res.width, height: res.height }),
      fail: reject,
    })
  })
}

function calcContainBox(
  imgW: number,
  imgH: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
) {
  const scale = Math.min(boxW / imgW, boxH / imgH)
  const width = imgW * scale
  const height = imgH * scale
  return {
    x: boxX + (boxW - width) / 2,
    y: boxY + (boxH - height) / 2,
    width,
    height,
  }
}

async function generatePosters() {
  const { skuId, goodsId, distributionId, images } = props
  if (!skuId || !goodsId || !distributionId || !images?.length) {
    return
  }
  if (loading.value) {
    return
  }

  // #ifndef MP-WEIXIN
  {
    loadError.value = '请在微信小程序中生成海报'
    return
  }
  // #endif

  loading.value = true
  loadError.value = ''
  posterList.value = []
  clearDrawPosterCache()

  try {
    await withTimeout(runGeneratePosters(images, skuId, goodsId, distributionId), GENERATE_TIMEOUT, '海报生成超时，请重试')
    hasGenerated.value = true
  } catch (error: any) {
    console.error('generate posters failed', error)
    loadError.value = error?.message || '海报生成失败，请稍后重试'
    clearDrawPosterCache()
  } finally {
    loading.value = false
  }
}

async function runGeneratePosters(
  images: string[],
  skuId: string,
  goodsId: string,
  distributionId: string
) {
  const posterRes = await getDistributionGoodsPosterContext({ skuId, goodsId, distributionId })
  if (!posterRes.data?.success || !posterRes.data?.result?.qrCode) {
    throw new Error(posterRes.data?.message || '葵花码生成失败')
  }
  const qrCode = `data:image/png;base64,${posterRes.data.result.qrCode}`

  await waitCanvasReady()

  dp = await DrawPoster.build({
    selector: CANVAS_SELECTOR,
    componentThis: getComponentThis(),
    loading: false,
    debugging: false,
  })

  if (!dp?.canvas || !dp?.ctx) {
    throw new Error('画布初始化失败，请重试')
  }

  // #ifdef MP-WEIXIN
  dp.canvas.width = st2(POSTER_WIDTH)
  dp.canvas.height = st2(POSTER_HEIGHT)
  // #endif

  const results: string[] = []
  for (const image of images) {
    const localImage = await resolveImagePath(image)
    results.push(await drawPoster(dp, localImage, qrCode))
  }
  posterList.value = results
}

async function drawPoster(dpInst: any, productImg: string, qrCode: string) {
  const goodsName = props.goodsName || '商品推荐'
  const goodsDesc = resolveGoodsDesc()
  const priceText =
    props.price !== null && props.price !== undefined ? unitPrice(props.price, '¥') : ''

  await dpInst.draw((ctx: any) => {
    ctx.clearRect(st2(0), st2(0), st2(POSTER_WIDTH), st2(POSTER_HEIGHT))
    ctx.fillStyle = '#ffffff'
    ctx.fillRoundRect(st2(0), st2(0), st2(POSTER_WIDTH), st2(POSTER_HEIGHT), st2(20))
    ctx.clip()
  })

  await dpInst.draw(async (ctx: any) => {
    ctx.fillStyle = '#f7f7f7'
    ctx.fillRect(st2(0), st2(0), st2(POSTER_WIDTH), st2(IMAGE_HEIGHT))
    const { width: imgW, height: imgH } = await getImageInfo(productImg)
    const fit = calcContainBox(imgW, imgH, 0, 0, POSTER_WIDTH, IMAGE_HEIGHT)
    await ctx.drawImage(
      productImg,
      st2(fit.x),
      st2(fit.y),
      st2(fit.width),
      st2(fit.height)
    )
  })

  await dpInst.draw(async (ctx: any) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(st2(0), st2(IMAGE_HEIGHT), st2(POSTER_WIDTH), st2(POSTER_HEIGHT - IMAGE_HEIGHT))

    const qrX = POSTER_WIDTH - QR_SIZE - QR_MARGIN_RIGHT
    const qrY = POSTER_HEIGHT - QR_SIZE - QR_MARGIN_BOTTOM
    ctx.save()
    ctx.beginPath()
    ctx.arc(
      st2(qrX + QR_SIZE / 2),
      st2(qrY + QR_SIZE / 2),
      st2(QR_SIZE / 2),
      0,
      Math.PI * 2
    )
    ctx.clip()
    await ctx.drawImage(qrCode, st2(qrX), st2(qrY), st2(QR_SIZE), st2(QR_SIZE))
    ctx.restore()
  })

  await dpInst.draw((ctx: any) => {
    const textLeft = 24
    const textMaxWidth = POSTER_WIDTH - QR_SIZE - QR_MARGIN_RIGHT - textLeft - 20
    const bottomTop = IMAGE_HEIGHT
    const bottomBottom = POSTER_HEIGHT - 16
    const qrY = POSTER_HEIGHT - QR_SIZE - QR_MARGIN_BOTTOM

    const nameLineHeight = 36
    const descLineHeight = 28
    const priceLineHeight = 36
    const textGap = 16
    const nameLineCount = Math.min(2, Math.max(1, Math.ceil(goodsName.length / 16)))
    const descLineCount = goodsDesc ? Math.min(2, Math.max(1, Math.ceil(goodsDesc.length / 14))) : 0

    let textBlockHeight = nameLineCount * nameLineHeight
    if (goodsDesc) {
      textBlockHeight += textGap + descLineCount * descLineHeight
    }
    if (priceText) {
      textBlockHeight += textGap + priceLineHeight
    }

    const maxTextHeight = bottomBottom - bottomTop - 12
    if (textBlockHeight > maxTextHeight) {
      textBlockHeight = maxTextHeight
    }

    let textY = qrY + (QR_SIZE - textBlockHeight) / 2
    textY = Math.max(bottomTop + 12, textY)
    if (textY + textBlockHeight > bottomBottom) {
      textY = bottomBottom - textBlockHeight
    }

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#333333'
    ctx.font = `${st2(28)}px PingFang SC`
    ctx.fillWarpText({
      text: goodsName,
      maxWidth: st2(textMaxWidth),
      x: st2(textLeft),
      y: st2(textY),
      layer: 2,
      lineHeight: st2(nameLineHeight),
    })
    textY += nameLineCount * nameLineHeight
    if (goodsDesc) {
      textY += textGap
      ctx.fillStyle = '#999999'
      ctx.font = `${st2(22)}px PingFang SC`
      ctx.fillWarpText({
        text: goodsDesc,
        maxWidth: st2(textMaxWidth),
        x: st2(textLeft),
        y: st2(textY),
        layer: 2,
        lineHeight: st2(descLineHeight),
      })
      textY += descLineCount * descLineHeight
    }

    if (priceText) {
      textY += textGap
      const priceY = Math.min(textY, bottomBottom - priceLineHeight)
      ctx.fillStyle = '#ff3c2a'
      ctx.font = `bold ${st2(36)}px PingFang SC`
      ctx.fillText(priceText, st2(textLeft), st2(priceY))
    }
  })

  const path = await dpInst.createImagePath()
  if (!path || path === '---stop createImagePath---') {
    throw new Error('海报图片导出失败')
  }
  return path
}

function resolveGoodsDesc() {
  const desc = (props.goodsDesc || '').trim()
  const name = (props.goodsName || '').trim()
  if (!desc || desc === name) return ''
  return desc.length > 28 ? `${desc.slice(0, 28)}...` : desc
}

function saveCurrentPoster() {
  const filePath = posterList.value[current.value]
  if (!filePath) return

  uni.saveImageToPhotosAlbum({
    filePath,
    success: () => {
      uni.showToast({ title: '已保存到相册', icon: 'none' })
    },
    fail: (err: any) => {
      const errMsg = err?.errMsg || ''
      if (errMsg.includes('auth deny') || errMsg.includes('authorize')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting({})
            }
          },
        })
        return
      }
      uni.showToast({ title: '保存失败', icon: 'none' })
    },
  })
}
</script>

<style lang="scss" scoped>
.poster-panel {
  padding: 8rpx 0 48rpx;
}

.poster-hint {
  text-align: center;
  font-size: 26rpx;
  color: #b3b3b3;
  margin-bottom: 40rpx;
}

.poster-content {
  margin-top: 8rpx;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
  box-sizing: border-box;
}

.loading-text {
  display: block;
  width: 100%;
  color: #999;
  font-size: 28rpx;
  line-height: 1.6;
  text-align: center;
}

.retry-btn {
  margin-top: 32rpx;
}

.retry-btn,
.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  padding: 0 40rpx;
  border-radius: 32rpx;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
  color: #fff;
  font-size: 26rpx;
  white-space: nowrap;
}

.poster-swiper {
  height: 1000rpx;
}

.poster-card-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0 48rpx;
}

.poster-image {
  width: 100%;
  max-width: 620rpx;
  border-radius: 20rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.08);
}

.poster-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: 24rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #e0e0e0;

  &.active {
    width: 24rpx;
    border-radius: 8rpx;
    background: #ff8f3f;
  }
}

.save-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28rpx;
}

.canvas-hide {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 600px;
  height: 840px;
  opacity: 0;
  pointer-events: none;
}
</style>
