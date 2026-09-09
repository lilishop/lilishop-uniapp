<template>
  <view class="page" :style="themeStyle">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <u-icon name="arrow-left" color="#fff" size="20" />
      </view>
      <view class="nav-title">分销订单详情</view>
      <view class="nav-placeholder"></view>
    </view>

    <view v-if="!loading && detail.orderItemSn" class="hero">
      <view class="hero-status">{{ detail.settlementStatusText || '待结算' }}</view>
      <view class="hero-sub">分销订单详情</view>
    </view>

    <view v-if="loading" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="!detail.orderItemSn" class="state-wrap">
      <text class="state-text">订单不存在</text>
    </view>

    <view v-else class="content-card">
      <view class="steps">
        <view
          v-for="(step, index) in progressSteps"
          :key="step.key"
          class="step-item"
          :class="{ active: step.done, current: step.current }"
        >
          <view class="step-node-wrap">
            <view class="step-node"></view>
            <view v-if="index < progressSteps.length - 1" class="step-line"></view>
          </view>
          <text class="step-label">{{ step.label }}</text>
        </view>
      </view>

      <view class="section">
        <view class="section-title">
          <u-icon name="bag-fill" color="#c58b4e" size="16" />
          <text>物流信息</text>
        </view>
        <view class="logistics-card">
          <view class="logistics-row">
            <text class="logistics-tag">{{ deliveryTypeText }}</text>
            <text class="logistics-text">{{ logisticsSummary }}</text>
          </view>
          <view class="logistics-trace">{{ logisticsTraceText }}</view>
        </view>
      </view>

      <view class="buyer-row">买家：{{ detail.memberName || '匿名用户' }}</view>

      <view class="goods-card">
        <image class="goods-image" :src="resolveImage(detail.image)" mode="aspectFill" />
        <view class="goods-info">
          <view class="goods-title-row">
            <text class="goods-title">{{ detail.goodsName || '商品' }}</text>
            <text class="goods-num">x{{ detail.num || 1 }}</text>
          </view>
          <view class="goods-spec">{{ formatGoodsSpecs(detail.specs) }}</view>
        </view>
      </view>

      <view class="amount-block">
        <view class="amount-line">商品总数 {{ totalGoodsNum }} 件</view>
        <view class="amount-line">
          订单总价
          <text class="amount-value">¥{{ formatMoney(detail.totalOrderPrice) }}</text>
        </view>
        <view v-if="showCommission" class="amount-line commission-line">
          {{ detail.commissionLabel || '商品佣金' }}
          <text class="amount-value">¥{{ formatMoney(detail.commissionAmount) }}</text>
        </view>
        <view v-if="detail.settleTime && detail.settlementStatusType === 'SETTLED'" class="settle-time">
          结算时间：{{ formatTime(detail.settleTime) }}
        </view>
      </view>

      <view class="section order-info-section">
        <view class="section-title with-bar">
          <view class="title-bar"></view>
          <text>订单信息</text>
        </view>
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value">{{ detail.orderSn || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ formatTime(detail.createTime) }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ formatTime(detail.paymentTime) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getDistributionOrderDetail } from '@/api/distribution'
import { parseGoodsImageUrl, formatGoodsSpecs } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const statusBarHeight = ref(20)
const loading = ref(true)
const detail = ref<Record<string, any>>({})
const orderItemSn = ref('')
const orderType = ref('PROMOTION')

onLoad((options) => {
  statusBarHeight.value = uni.getWindowInfo?.()?.statusBarHeight || 20
  orderItemSn.value = options?.orderItemSn || ''
  orderType.value = options?.orderType || 'PROMOTION'
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    loadDetail()
  })
})

const totalGoodsNum = computed(() => Number(detail.value.totalGoodsNum || detail.value.num || 0))

const showCommission = computed(() => {
  const refunded = detail.value.refunded === true || detail.value.refunded === 1
  return !refunded && Number(detail.value.commissionAmount || 0) > 0
})

const deliveryTypeText = computed(() => {
  const method = detail.value.deliveryMethod
  if (method === 'SELF_PICK_UP') return '自提'
  if (method === 'LOCAL_TOWN_DELIVERY') return '同城配送'
  return '快递'
})

const logisticsSummary = computed(() => {
  const name = detail.value.logisticsName
  const no = detail.value.logisticsNo
  if (name && no) return `${name}：${no}`
  if (name) return name
  if (no) return no
  return '暂无物流信息'
})

const logisticsTraceText = computed(() => {
  if (!detail.value.logisticsNo) return '暂无物流轨迹'
  return '暂无物流轨迹'
})

const progressSteps = computed(() => {
  const paid = detail.value.payStatus === 'PAID'
  const orderStatus = detail.value.orderStatus || ''
  const delivered = ['DELIVERED', 'TAKE', 'COMPLETED', 'COMPLETE'].includes(orderStatus)
    || detail.value.deliverStatus === 'DELIVERED'
  const completed = ['COMPLETED', 'COMPLETE'].includes(orderStatus)
  const settled = detail.value.settlementStatusType === 'SETTLED'
  const steps = [
    { key: 'paid', label: '买家付款', done: paid },
    { key: 'deliver', label: '商家发货', done: delivered },
    { key: 'complete', label: '交易完成', done: completed },
    { key: 'settle', label: '结算佣金', done: settled },
  ]
  let currentMarked = false
  return steps.map((step) => {
    if (!step.done && !currentMarked) {
      currentMarked = true
      return { ...step, current: true }
    }
    return { ...step, current: false }
  })
})

function loadDetail() {
  if (!orderItemSn.value) return
  loading.value = true
  getDistributionOrderDetail({
    orderItemSn: orderItemSn.value,
    orderType: orderType.value,
  })
    .then((res) => {
      detail.value = res.data?.result || {}
    })
    .catch(() => {
      detail.value = {}
    })
    .finally(() => {
      loading.value = false
    })
}

function resolveImage(image?: string) {
  return parseGoodsImageUrl(image) || '/static/nodata.png'
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.navigateTo({ url: '/pages/mine/distribution/order-list' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.status-bar {
  background: linear-gradient(180deg, #ff9f3f 0%, #ff7a2f 100%);
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 24rpx;
  background: linear-gradient(180deg, #ff7a2f 0%, #ff6b35 100%);
}

.nav-back,
.nav-placeholder {
  width: 60rpx;
}

.nav-title {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.hero {
  padding: 12rpx 32rpx 80rpx;
  background: linear-gradient(180deg, #ff6b35 0%, #ff8f3f 100%);
}

.hero-status {
  color: #fff;
  font-size: 48rpx;
  font-weight: 700;
  line-height: 1.3;
}

.hero-sub {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.85);
  font-size: 26rpx;
}

.content-card {
  margin: -56rpx 24rpx 32rpx;
  padding: 32rpx 24rpx;
  border-radius: 20rpx;
  background: #fff;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-node-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-node {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #e8e8e8;
  z-index: 1;
}

.step-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100%;
  height: 4rpx;
  margin-top: -2rpx;
  background: #f0f0f0;
  z-index: 0;
}

.step-item.active .step-node {
  background: #ff8f3f;
}

.step-item.active .step-line {
  background: #ffd8bf;
}

.step-label {
  margin-top: 12rpx;
  color: #bbb;
  font-size: 22rpx;
  text-align: center;
}

.step-item.active .step-label {
  color: #ff8f3f;
}

.section {
  margin-bottom: 24rpx;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 16rpx;
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.section-title.with-bar {
  gap: 12rpx;
}

.title-bar {
  width: 6rpx;
  height: 28rpx;
  border-radius: 999rpx;
  background: #ff8f3f;
}

.logistics-card {
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  background: #fafafa;
}

.logistics-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.logistics-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  background: #fff2e8;
  color: #ff8f3f;
  font-size: 22rpx;
}

.logistics-text {
  flex: 1;
  color: #666;
  font-size: 24rpx;
}

.logistics-trace {
  margin-top: 12rpx;
  color: #ccc;
  font-size: 22rpx;
}

.buyer-row {
  margin-bottom: 20rpx;
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.goods-card {
  display: flex;
  margin-bottom: 24rpx;
}

.goods-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f4f4f4;
  flex-shrink: 0;
}

.goods-info {
  flex: 1;
  min-width: 0;
  margin-left: 16rpx;
}

.goods-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.goods-title {
  flex: 1;
  color: #333;
  font-size: 28rpx;
  line-height: 1.4;
}

.goods-num {
  color: #999;
  font-size: 24rpx;
  flex-shrink: 0;
}

.goods-spec {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.amount-block {
  text-align: right;
  margin-bottom: 28rpx;
}

.amount-line {
  color: #666;
  font-size: 24rpx;
  line-height: 1.9;
}

.commission-line {
  color: #333;
  font-size: 28rpx;
}

.amount-value {
  color: #ff4d4f;
  font-size: 34rpx;
  font-weight: 700;
  margin-left: 8rpx;
}

.settle-time {
  margin-top: 4rpx;
  color: #ccc;
  font-size: 22rpx;
}

.order-info-section {
  padding-top: 8rpx;
  border-top: 1rpx solid #f5f5f5;
}

.info-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #999;
  font-size: 26rpx;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #333;
  font-size: 26rpx;
  text-align: right;
  word-break: break-all;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}
</style>
