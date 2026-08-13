<template>
  <view class="share-panel" :style="themeStyle">
    <view class="tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'text' }"
        @click="activeTab = 'text'"
      >
        <text>推广图文</text>
        <view v-if="activeTab === 'text'" class="tab-line"></view>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'poster' }"
        @click="activeTab = 'poster'"
      >
        <text>生成海报</text>
        <view v-if="activeTab === 'poster'" class="tab-line"></view>
      </view>
    </view>

    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="activeTab === 'text'" class="content">
      <view class="text-card">
        <text v-if="shareContext.defaultShareText" class="share-text" :user-select="true">
          {{ shareContext.defaultShareText }}
        </text>
        <view class="share-divider"></view>
        <text class="share-text" :user-select="true">{{ shareBodyText }}</text>
        <view class="share-divider"></view>
      </view>

      <view class="media-section">
        <scroll-view scroll-x class="image-scroll" v-if="images.length">
          <view class="image-list">
            <image
              v-for="(img, index) in images"
              :key="index"
              class="goods-image"
              :src="img"
              mode="aspectFill"
              @click="previewImage(index)"
            />
          </view>
        </scroll-view>
        <view class="save-btn-wrap">
          <view class="save-btn" @click="saveShareContent">保存图文</view>
        </view>
      </view>
    </view>

    <view v-else class="content">
      <poster-panel
        :images="images"
        :goods-name="shareContext.goodsName"
        :goods-desc="posterGoodsDesc"
        :price="shareContext.price"
        :sku-id="skuId"
        :goods-id="goodsId"
        :distribution-id="distributionId"
        :active="activeTab === 'poster'"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from '@/store'
import config from '@/config/config'
import { getThemeStyle } from '@/utils/theme'
import { getDistributionGoodsShareContext } from '@/api/distribution'
import { unitPrice, parseGoodsImageUrl } from '@/utils/filters.js'
import PosterPanel from './poster-panel.vue'
// #ifdef H5
import { h5Copy } from '@/js_sdk/h5-copy/h5-copy.js'
// #endif

const props = defineProps<{
  skuId?: string
  goodsId?: string
  distributionId?: string
}>()

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const activeTab = ref<'text' | 'poster'>('text')
const loading = ref(true)
const shareContext = ref<Record<string, any>>({})

const posterGoodsDesc = computed(() => {
  const ctx = shareContext.value
  return ctx.goodsSellingPoint || ctx.defaultShareText || ''
})

const images = computed(() => {
  const raw: string[] = []
  const list = shareContext.value.images
  if (Array.isArray(list) && list.length) {
    raw.push(...list)
  } else if (shareContext.value.thumbnail) {
    raw.push(shareContext.value.thumbnail)
  }
  const parsed = raw
    .map((item) => parseGoodsImageUrl(item))
    .filter((url) => !!url)
  return [...new Set(parsed)]
})

const shareLink = computed(() => {
  const link = shareContext.value.miniProgramLink || shareContext.value.sharePath || ''
  if (!link) return ''
  if (link.startsWith('http')) return link
  const base = (config.shareLink || '').replace(/\/$/, '')
  return base + link
})

const SHARE_DIVIDER = '- '.repeat(36).trim()

const shareBodyText = computed(() => {
  const ctx = shareContext.value
  const lines: string[] = []
  if (ctx.goodsName) {
    lines.push(`🔴 ${ctx.goodsName}`)
  }
  if (ctx.price !== null && ctx.price !== undefined) {
    lines.push(`【到手价】💰 ${unitPrice(ctx.price, '¥')}元`)
  }
  if (shareLink.value) {
    lines.push(`点击立即参与：${shareLink.value}`)
  }
  return lines.join('\n')
})

const shareText = computed(() => {
  const ctx = shareContext.value
  const lines: string[] = []
  if (ctx.defaultShareText) {
    lines.push(ctx.defaultShareText)
    lines.push('')
  }
  lines.push(SHARE_DIVIDER)
  if (shareBodyText.value) {
    lines.push(shareBodyText.value)
  }
  lines.push(SHARE_DIVIDER)
  return lines.join('\n')
})

watch(
  () => [props.skuId, props.goodsId, props.distributionId],
  () => {
    loadShareContext()
  },
  { immediate: true }
)

function loadShareContext() {
  const { skuId, goodsId, distributionId } = props
  if (!skuId || !goodsId || !distributionId) {
    loading.value = false
    shareContext.value = {}
    return
  }
  loading.value = true
  getDistributionGoodsShareContext({ skuId, goodsId, distributionId })
    .then((res) => {
      if (res.data?.success) {
        shareContext.value = res.data.result || {}
      } else {
        uni.showToast({ title: res.data?.message || '加载失败', icon: 'none' })
      }
    })
    .catch(() => {
      uni.showToast({ title: '加载分享内容失败', icon: 'none' })
    })
    .finally(() => {
      loading.value = false
    })
}

function previewImage(index: number) {
  if (!images.value.length) return
  uni.previewImage({
    current: images.value[index],
    urls: images.value,
  })
}

function isClipboardBlocked(errMsg = '') {
  return (
    errMsg.includes('privacy agreement') ||
    errMsg.includes('no permission') ||
    errMsg.includes('auth deny')
  )
}

function saveShareContent() {
  const text = shareText.value
  if (!text.trim()) {
    uni.showToast({ title: '暂无可保存内容', icon: 'none' })
    return
  }

  // #ifdef H5
  if (h5Copy(text) === false) {
    uni.showToast({ title: '复制失败，请重试', icon: 'none' })
    return
  }
  continueAfterCopy()
  // #endif

  // #ifndef H5
  const runCopy = () => {
    uni.setClipboardData({
      data: text,
      showToast: false,
      success: () => continueAfterCopy(),
      fail: (err: any) => {
        console.error('setClipboardData fail', err)
        const errMsg = err?.errMsg || ''
        if (isClipboardBlocked(errMsg)) {
          continueAfterCopy()
          return
        }
        uni.showToast({ title: '复制失败，请重试', icon: 'none' })
      },
    })
  }

  // #ifdef MP-WEIXIN
  const wxApi = (globalThis as any).wx
  if (wxApi?.requirePrivacyAuthorize) {
    wxApi.requirePrivacyAuthorize({
      success: () => runCopy(),
      fail: () => continueAfterCopy(),
    })
    return
  }
  // #endif
  runCopy()
  // #endif
}

function continueAfterCopy() {
  const imageUrls = images.value
  if (!imageUrls.length) {
    uni.showToast({ title: '内容已复制', icon: 'none' })
    return
  }
  uni.showLoading({ title: '保存中', mask: true })
  saveImages(imageUrls)
    .then(() => {
      uni.hideLoading()
      uni.showToast({ title: '内容已复制', icon: 'none' })
    })
    .catch((error) => {
      uni.hideLoading()
      uni.showToast({ title: '图片保存失败', icon: 'none' })
      console.error('save images failed', error)
    })
}

function saveToAlbum(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: (err: any) => {
        const errMsg = err?.errMsg || ''
        const needAuth =
          errMsg.includes('auth deny') ||
          errMsg.includes('authorize') ||
          errMsg.includes('permission')
        // #ifdef MP-WEIXIN
        if (!needAuth) {
          reject(new Error('save failed'))
          return
        }
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (modalRes) => {
            if (!modalRes.confirm) {
              reject(new Error('auth denied'))
              return
            }
            uni.openSetting({
              success: (settingRes) => {
                if (settingRes.authSetting['scope.writePhotosAlbum']) {
                  saveToAlbum(filePath).then(resolve).catch(reject)
                } else {
                  reject(new Error('auth denied'))
                }
              },
              fail: () => reject(new Error('auth denied')),
            })
          },
          fail: () => reject(new Error('auth denied')),
        })
        // #endif
        // #ifndef MP-WEIXIN
        reject(new Error('save failed'))
        // #endif
      },
    })
  })
}

function saveImages(urls: string[]) {
  return urls.reduce<Promise<void>>((chain, url) => {
    return chain.then(() => downloadAndSaveImage(url))
  }, Promise.resolve())
}

function downloadAndSaveImage(url: string) {
  if (!url || !/^https?:\/\//.test(url)) {
    return Promise.reject(new Error('invalid url'))
  }
  return new Promise<void>((resolve, reject) => {
    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200 || !res.tempFilePath) {
          reject(new Error('download failed'))
          return
        }
        saveToAlbum(res.tempFilePath).then(resolve).catch(reject)
      },
      fail: () => reject(new Error('download failed')),
    })
  })
}
</script>

<style lang="scss" scoped>
.share-panel {
  min-height: 100%;
  background: #fff;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 32rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  position: relative;
  flex: 1;
  text-align: center;
  padding-bottom: 20rpx;
  font-size: 30rpx;
  color: #999;

  &.active {
    color: #333;
    font-weight: 600;
  }
}

.tab-line {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 56rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: #ff8f3f;
}

.loading-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.loading-text {
  color: #999;
  font-size: 28rpx;
}

.content {
  padding: 24rpx 24rpx 48rpx;
}

.text-card {
  background: #f7f7f7;
  border-radius: 16rpx;
  padding: 28rpx;
}

.share-divider {
  width: 100%;
  height: 0;
  margin: 20rpx 0;
  border-top: 2rpx dashed #c8c8c8;
}

.share-text {
  font-size: 28rpx;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  user-select: text;
  -webkit-user-select: text;
}

.media-section {
  margin-top: 24rpx;
}

.image-scroll {
  width: 100%;
}

.image-list {
  display: flex;
  flex-direction: row;
  white-space: nowrap;
}

.goods-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}

.save-btn-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 24rpx;
}

.save-btn {
  min-width: 140rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  padding: 0 20rpx;
  border-radius: 30rpx;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
  color: #fff;
  font-size: 26rpx;
  font-weight: 400;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.2);
}
</style>
