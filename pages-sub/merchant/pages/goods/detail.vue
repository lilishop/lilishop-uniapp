<template>
  <view class="merchant-goods-detail" v-if="goodsDetail">
    <!-- 顶部主图轮播 -->
    <view class="gallery-wrapper">
      <swiper
        class="gallery-swiper"
        :indicator-dots="false"
        :autoplay="false"
        @change="onSwiperChange"
      >
        <swiper-item
          v-for="(img, idx) in galleryImages"
          :key="idx"
          @click="previewGallery(idx)"
        >
          <image class="swiper-img" :src="img" mode="aspectFill"></image>
        </swiper-item>
      </swiper>
      <view class="swiper-indicator" v-if="galleryImages.length > 1">
        <text>{{ currentSwiperIndex + 1 }} / {{ galleryImages.length }}</text>
      </view>
    </view>

    <!-- 核心信息卡片 -->
    <view class="info-card core-card">
      <view class="price-row">
        <view class="main-price">
          <text class="symbol">¥</text>
          <text class="num">{{ goodsDetail.price || '0.00' }}</text>
        </view>
        <view class="sub-price" v-if="goodsDetail.cost">
          <text>成本价 ¥{{ goodsDetail.cost }}</text>
        </view>
        <view class="status-tags">
          <view
            class="badge market"
            :class="goodsDetail.marketEnable === 'UPPER' ? 'on-sale' : 'off-sale'"
          >
            {{ goodsDetail.marketEnable === 'UPPER' ? '出售中' : '已下架' }}
          </view>
          <view
            class="badge auth"
            :class="goodsDetail.authFlag === 'PASS' ? 'auth-pass' : 'auth-pending'"
          >
            {{ getAuthText(goodsDetail.authFlag) }}
          </view>
        </view>
      </view>

      <view class="title-row">
        <text class="goods-title">{{ goodsDetail.goodsName }}</text>
      </view>

      <view class="meta-stats-grid">
        <view class="stat-col">
          <text class="stat-num">{{ goodsDetail.quantity ?? 0 }}</text>
          <text class="stat-label">总库存</text>
        </view>
        <view class="stat-sep"></view>
        <view class="stat-col">
          <text class="stat-num">{{ goodsDetail.buyCount ?? 0 }}</text>
          <text class="stat-label">累计销量</text>
        </view>
        <view class="stat-sep"></view>
        <view class="stat-col">
          <text class="stat-num">{{ goodsDetail.sn || '--' }}</text>
          <text class="stat-label">商品货号</text>
        </view>
      </view>
    </view>

    <!-- 规格与多 SKU 列表 -->
    <view class="info-card" v-if="skuList && skuList.length > 0">
      <view class="card-head">
        <view class="head-left">
          <text class="card-title">规格与 SKU 明细</text>
          <text class="sku-count-pill">共 {{ skuList.length }} 种规格</text>
        </view>
      </view>
      <view class="sku-list">
        <view
          class="sku-item"
          v-for="(sku, index) in skuList"
          :key="sku.id || sku.sn || index"
        >
          <image
            class="sku-thumb"
            :src="getSkuThumb(sku)"
            mode="aspectFill"
          ></image>
          <view class="sku-info">
            <text class="sku-spec">{{ formatSpecs(sku, index) }}</text>
            <text class="sku-sn" v-if="sku.sn">SKU编码：{{ sku.sn }}</text>
            <view class="sku-nums">
              <text class="sku-price">售价：<text class="val">¥{{ sku.price || '0.00' }}</text></text>
              <text class="sku-stock">库存：<text class="val">{{ sku.quantity ?? sku.stock ?? sku.enableQuantity ?? 0 }}</text></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 基本属性卡片（优化分类展示） -->
    <view class="info-card">
      <view class="card-head">
        <text class="card-title">基本属性</text>
      </view>
      <view class="prop-row" v-if="goodsDetail.categoryName">
        <text class="prop-label">所属分类</text>
        <text class="prop-val cat-val">{{ formatCategoryName(goodsDetail.categoryName) }}</text>
      </view>
      <view class="prop-row" v-if="goodsDetail.brandName">
        <text class="prop-label">商品品牌</text>
        <text class="prop-val">{{ goodsDetail.brandName }}</text>
      </view>
      <view class="prop-row" v-if="goodsDetail.goodsUnit">
        <text class="prop-label">计量单位</text>
        <text class="prop-val">{{ goodsDetail.goodsUnit }}</text>
      </view>
      <view class="prop-row" v-if="goodsDetail.releaseTime">
        <text class="prop-label">发布时间</text>
        <text class="prop-val">{{ goodsDetail.releaseTime }}</text>
      </view>
    </view>

    <!-- 图文详情 -->
    <view class="info-card intro-card" v-if="goodsDetail.intro || goodsDetail.mobileIntro">
      <view class="card-head">
        <text class="card-title">商品图文详情</text>
      </view>
      <view class="intro-html">
        <rich-text :nodes="formatRichText(goodsDetail.mobileIntro || goodsDetail.intro)"></rich-text>
      </view>
    </view>

    <!-- 底部固定悬浮操作栏（带安全底间距，防止遮挡内容） -->
    <view class="bottom-action-bar">
      <view class="preview-btn" @click="previewInMall">
        <u-icon name="eye" size="20" color="#4b5563"></u-icon>
        <text>买家预览</text>
      </view>
      <view
        class="market-action-btn off"
        v-if="goodsDetail.marketEnable === 'UPPER'"
        @click="handleToggleMarket('DOWN')"
      >
        <text>下架商品</text>
      </view>
      <view
        class="market-action-btn on"
        v-else
        @click="handleToggleMarket('UPPER')"
      >
        <text>立即上架</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStoreGoodsDetail, getStoreGoodsSkuList, upGoods, downGoods } from '../../api/goods.js'
import { parseGoodsImageUrl } from '@/utils/filters.js'

const getSkuThumb = (sku: any) => {
  const img = sku.thumbnail || sku.original
  if (img) {
    const parsed = parseGoodsImageUrl(img)
    if (parsed) return parsed
  }
  const rawSpec = sku.simpleSpecs || sku.specs
  if (rawSpec && typeof rawSpec === 'string') {
    const match = rawSpec.match(/https?:\/\/[^\s"'\\}]+\.(jpeg|jpg|png|webp|gif)/i)
    if (match) return match[0]
  }
  return galleryImages.value[0] || '/static/tabbar/home.png'
}


const goodsId = ref('')
const goodsDetail = ref<any>(null)
const skuList = ref<any[]>([])
const currentSwiperIndex = ref(0)

onLoad((options: any) => {
  if (options?.id) {
    goodsId.value = options.id
    fetchGoodsDetail()
  }
})

const galleryImages = computed(() => {
  if (!goodsDetail.value) return []
  if (Array.isArray(goodsDetail.value.goodsGalleryList) && goodsDetail.value.goodsGalleryList.length > 0) {
    return goodsDetail.value.goodsGalleryList
  }
  const defaultImg = goodsDetail.value.original || goodsDetail.value.thumbnail
  return defaultImg ? [defaultImg] : ['/static/tabbar/home.png']
})

const fetchGoodsDetail = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    const res: any = await getStoreGoodsDetail(goodsId.value)
    uni.hideLoading()
    if (res?.data && res.data.success && res.data.result) {
      goodsDetail.value = res.data.result
      skuList.value = res.data.result.skuList || []
      if (skuList.value.length === 0) {
        fetchSkuList()
      }
    } else {
      uni.showToast({ title: '获取商品详情失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络连接异常', icon: 'none' })
  }
}

const fetchSkuList = async () => {
  try {
    const skuRes: any = await getStoreGoodsSkuList(goodsId.value)
    if (skuRes?.data && skuRes.data.success && Array.isArray(skuRes.data.result)) {
      skuList.value = skuRes.data.result
    }
  } catch (e) {}
}

const onSwiperChange = (e: any) => {
  currentSwiperIndex.value = e.detail.current
}

const previewGallery = (current: number) => {
  uni.previewImage({
    urls: galleryImages.value,
    current,
  })
}

// 智能清洗并优雅格式化规格文本（过滤 images 等系统 JSON 冗余）
const formatSpecs = (sku: any, index: number) => {
  // 1. 优先使用规范的 specList 数组
  if (sku.specList && Array.isArray(sku.specList) && sku.specList.length > 0) {
    const listStr = sku.specList
      .map((s: any) => {
        if (s.specName && s.specValue) return `${s.specName}: ${s.specValue}`
        return s.specValue || s.specName
      })
      .filter(Boolean)
      .join(' / ')
    if (listStr) return listStr
  }

  // 2. 深度清洗 simpleSpecs 或 specs 中的复杂复合 JSON
  const rawSpec = sku.simpleSpecs || sku.specs
  if (rawSpec && typeof rawSpec === 'string') {
    const trimmed = rawSpec.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const obj = JSON.parse(trimmed)
        const ignoreKeys = ['images', 'code', 'message', 'result', 'success', 'showProgress', 'url', 'status', 'specImage', 'specType']
        const pairs: string[] = []
        for (const [k, v] of Object.entries(obj)) {
          if (!ignoreKeys.includes(k) && typeof v === 'string' && !v.startsWith('http') && v.length < 50) {
            pairs.push(`${k}: ${v}`)
          }
        }
        if (pairs.length > 0) return pairs.join(' / ')
      } catch (e) {}

      // JSON 解析失败时正则提取真实的规格键值对
      const matches = [...trimmed.matchAll(/"([^"]{1,20})"\s*:\s*"([^"]{1,30})"/g)]
      const ignoreKeys = ['code', 'message', 'success', 'url', 'result', 'showProgress', 'status', 'name']
      const pairs: string[] = []
      for (const m of matches) {
        const k = m[1]
        const v = m[2]
        if (!ignoreKeys.includes(k) && !v.startsWith('http')) {
          pairs.push(`${k}: ${v}`)
        }
      }
      if (pairs.length > 0) return pairs.join(' / ')
    } else {
      // 纯文本规格
      return trimmed
    }
  }

  // 3. 提取不同于 SPU 主标题的商品名称差异
  if (sku.goodsName && sku.goodsName !== goodsDetail.value?.goodsName) {
    return sku.goodsName
  }

  // 4. 最终兜底
  return skuList.value.length > 1 ? `规格 ${index + 1}` : '统一规格'
}

// 格式化分类展示：将原始 JSON 数组 [ "数码办公", "手机通讯", "手机" ] 转为层级面包屑 "数码办公 > 手机通讯 > 手机"
const formatCategoryName = (cat: any) => {
  if (!cat) return '--'
  if (Array.isArray(cat)) {
    return cat.filter(Boolean).join(' > ')
  }
  if (typeof cat === 'string') {
    try {
      const parsed = JSON.parse(cat)
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).join(' > ')
      }
    } catch (e) {}
    // 处理带引号或逗号的非标准字符串
    return cat.replace(/[\[\]"']/g, '').split(',').map((s: string) => s.trim()).filter(Boolean).join(' > ')
  }
  return String(cat)
}

const getAuthText = (flag: string) => {
  const map: Record<string, string> = {
    PASS: '审核通过',
    AUDIT: '待审核',
    REFUSE: '审核驳回',
  }
  return map[flag] || flag || '已通过'
}

const formatRichText = (html: string) => {
  if (!html) return ''
  return html
    .replace(/<img[^>]*>/gi, (match) => {
      return match
        .replace(/style="[^"]*"/gi, '')
        .replace(/width="[^"]*"/gi, '')
        .replace(/height="[^"]*"/gi, '')
    })
    .replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;border-radius:12rpx;margin:16rpx 0;"')
}

// 上下架切换
const handleToggleMarket = (targetStatus: string) => {
  const isUp = targetStatus === 'UPPER'
  const actionText = isUp ? '上架' : '下架'

  uni.showModal({
    title: `${actionText}商品`,
    content: `确定要${actionText}当前商品？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: `正在${actionText}...` })
        try {
          const apiCall = isUp ? upGoods(goodsId.value) : downGoods(goodsId.value)
          const resp: any = await apiCall
          uni.hideLoading()
          if (resp?.data && resp.data.success) {
            uni.showToast({ title: `${actionText}成功`, icon: 'success' })
            fetchGoodsDetail()
          } else {
            uni.showToast({
              title: resp?.data?.message || `${actionText}失败`,
              icon: 'none',
            })
          }
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
        }
      }
    },
  })
}

// 前往买家端预览
const previewInMall = () => {
  uni.navigateTo({
    url: `/pages/product/goods?id=${goodsId.value}`,
  })
}
</script>

<style lang="scss" scoped>
.merchant-goods-detail {
  min-height: 100vh;
  background-color: #f4f5f7;
  /* 预留出底部固定操作栏的高以及全面屏安全区，彻底解决内容被底部遮挡 */
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.gallery-wrapper {
  position: relative;
  width: 100%;
  height: 680rpx;
  background: #ffffff;

  .gallery-swiper {
    width: 100%;
    height: 100%;

    .swiper-img {
      width: 100%;
      height: 100%;
    }
  }

  .swiper-indicator {
    position: absolute;
    right: 28rpx;
    bottom: 44rpx;
    background: rgba(0, 0, 0, 0.55);
    color: #ffffff;
    font-size: 22rpx;
    font-weight: 500;
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    backdrop-filter: blur(4px);
  }
}

.info-card {
  margin: 20rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

  .card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #f9fafb;

    .head-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
    }

    .card-title {
      font-size: 30rpx;
      font-weight: 700;
      color: #111827;
    }

    .sku-count-pill {
      font-size: 22rpx;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4rpx 14rpx;
      border-radius: 12rpx;
    }
  }

  &.core-card {
    margin-top: -30rpx;
    position: relative;
    z-index: 10;

    .price-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;

      .main-price {
        color: #ef4444;
        display: flex;
        align-items: baseline;

        .symbol {
          font-size: 28rpx;
          font-weight: 700;
        }

        .num {
          font-size: 48rpx;
          font-weight: 700;
          margin-left: 4rpx;
        }
      }

      .sub-price {
        font-size: 24rpx;
        color: #9ca3af;
        margin-left: 16rpx;
        flex: 1;
      }

      .status-tags {
        display: flex;
        gap: 12rpx;

        .badge {
          font-size: 22rpx;
          padding: 6rpx 16rpx;
          border-radius: 10rpx;
          font-weight: 600;

          &.on-sale {
            background: #ecfdf5;
            color: #059669;
          }

          &.off-sale {
            background: #f3f4f6;
            color: #9ca3af;
          }

          &.auth-pass {
            background: #eff6ff;
            color: #2563eb;
          }

          &.auth-pending {
            background: #fffbeb;
            color: #d97706;
          }
        }
      }
    }

    .title-row {
      margin-top: 20rpx;

      .goods-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #111827;
        line-height: 1.45;
      }
    }

    .meta-stats-grid {
      display: flex;
      align-items: center;
      background: #f9fafb;
      border-radius: 16rpx;
      padding: 22rpx 0;
      margin-top: 26rpx;

      .stat-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .stat-num {
          font-size: 28rpx;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          font-size: 22rpx;
          color: #9ca3af;
          margin-top: 4rpx;
        }
      }

      .stat-sep {
        width: 1rpx;
        height: 38rpx;
        background: #e5e7eb;
      }
    }
  }

  .sku-list {
    .sku-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .sku-thumb {
        width: 104rpx;
        height: 104rpx;
        border-radius: 14rpx;
        background: #f9fafb;
        border: 1rpx solid #f3f4f6;
        flex-shrink: 0;
      }

      .sku-info {
        flex: 1;
        margin-left: 22rpx;
        display: flex;
        flex-direction: column;

        .sku-spec {
          font-size: 28rpx;
          font-weight: 600;
          color: #111827;
          line-height: 1.35;
        }

        .sku-sn {
          font-size: 22rpx;
          color: #9ca3af;
          margin-top: 6rpx;
        }

        .sku-nums {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 10rpx;

          .sku-price {
            font-size: 24rpx;
            color: #6b7280;

            .val {
              font-size: 28rpx;
              font-weight: 700;
              color: #ef4444;
            }
          }

          .sku-stock {
            font-size: 24rpx;
            color: #6b7280;

            .val {
              font-weight: 600;
              color: #111827;
            }
          }
        }
      }
    }
  }

  .prop-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f9fafb;

    &:last-child {
      border-bottom: none;
    }

    .prop-label {
      font-size: 26rpx;
      color: #6b7280;
      width: 160rpx;
      flex-shrink: 0;
    }

    .prop-val {
      flex: 1;
      text-align: right;
      font-size: 26rpx;
      color: #111827;
      font-weight: 500;
      line-height: 1.45;

      &.cat-val {
        color: #2563eb;
        background: #eff6ff;
        display: inline-block;
        padding: 6rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
        font-weight: 500;
      }
    }
  }

  &.intro-card {
    .intro-html {
      margin-top: 16rpx;
      font-size: 28rpx;
      color: #374151;
      line-height: 1.6;
      word-break: break-all;
    }
  }
}

.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom)) 28rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
  gap: 20rpx;

  .preview-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;

    text {
      font-size: 20rpx;
      color: #4b5563;
      margin-top: 4rpx;
    }
  }

  .market-action-btn {
    flex: 1;
    height: 84rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 600;

    &.off {
      background: #fef2f2;
      color: #dc2626;
      border: 1rpx solid #fecaca;
    }

    &.on {
      background: #111827;
      color: #ffffff;
    }
  }
}
</style>
