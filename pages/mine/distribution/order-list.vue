<template>
  <view class="page" :style="themeStyle">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else>
    <view class="search-bar">
      <view class="search-inner">
        <u-icon name="search" color="#bbb" size="18" />
        <input
          class="search-input"
          v-model="keyword"
          confirm-type="search"
          placeholder="输入用户手机号、订单号或商品名"
          placeholder-class="search-placeholder"
          @confirm="onSearch"
        />
      </view>
    </view>

    <view class="main-tabs">
      <view
        v-for="item in mainTabs"
        :key="item.value"
        class="main-tab"
        :class="{ active: activeTab === item.value }"
        @click="changeTab(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
        <view class="filter-tabs">
          <view
            v-for="item in rangeTabs"
            :key="item.value"
            class="filter-tab"
            :class="{ active: activeRange === item.value }"
            @click="changeRange(item.value)"
          >
            {{ item.label }}
          </view>
        </view>
      </scroll-view>
      <view class="custom-time" :class="{ active: activeRange === 'CUSTOM' }" @click="openCustomPicker">
        <text>自定义时间</text>
        <u-icon name="arrow-down" size="12" :color="activeRange === 'CUSTOM' ? '#ff8f3f' : '#999'" />
      </view>
    </view>

    <view class="summary-row">
      <text>
        共
        <text class="summary-highlight">{{ orderTotal }}</text>
        笔订单，获得{{ commissionLabel }}
        <text class="summary-highlight">{{ formatMoney(totalCommission) }}</text>
        元
      </text>
    </view>

    <view v-if="loading && !orderList.length" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="!orderList.length" class="state-wrap">
      <text class="state-text">暂无订单记录</text>
    </view>

    <view v-else class="list-wrap">
      <view class="order-card" v-for="item in orderList" :key="item.orderItemSn || item.orderSn">
        <view class="card-header">
          <text class="buyer-name">买家：{{ item.memberName || '匿名用户' }}</text>
          <text class="status-text" :class="statusClass(item)">{{ item.settlementStatusText }}</text>
        </view>

        <view class="order-time">下单时间：{{ formatTime(item.createTime) }}</view>
        <view v-if="isRefunded(item)" class="refund-tag">已退款</view>

        <view class="goods-row">
          <image class="goods-image" :src="resolveImage(item.image)" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-title-row">
              <text class="goods-title">{{ item.goodsName || '商品' }}</text>
              <text class="goods-num">x{{ item.num || 1 }}</text>
            </view>
            <view class="goods-spec">{{ formatGoodsSpecs(item.specs) }}</view>
          </view>
        </view>

        <view class="amount-block">
          <view class="amount-line">实付金额：¥ {{ formatMoney(item.finalPrice) }}</view>
          <view
            v-if="showCommission(item)"
            class="amount-line commission-line"
          >
            {{ commissionLabel }}：
            <text class="commission-value">{{ formatMoney(item.commissionAmount) }} 元</text>
          </view>
          <view v-if="item.settleTime && item.settlementStatusType === 'SETTLED'" class="settle-time">
            结算时间：{{ formatTime(item.settleTime) }}
          </view>
        </view>

        <view class="card-footer">
          <text class="order-sn">单号：{{ item.orderSn }}</text>
          <text class="detail-btn" @click="goOrderDetail(item)">订单详情</text>
        </view>
      </view>
    </view>

    <view v-if="orderList.length" class="list-footer">
      <text v-if="finished" class="footer-text">没有更多数据了</text>
      <text v-else-if="loadingMore" class="footer-text">加载中...</text>
    </view>

    <u-popup v-model:show="customVisible" mode="bottom" round="16">
      <view class="custom-popup">
        <view class="popup-title">自定义时间</view>
        <view class="popup-row">
          <text class="popup-label">开始日期</text>
          <picker mode="date" :value="customStartDate" @change="onStartDateChange">
            <view class="picker-value">{{ customStartDate || '请选择' }}</view>
          </picker>
        </view>
        <view class="popup-row">
          <text class="popup-label">结束日期</text>
          <picker mode="date" :value="customEndDate" @change="onEndDateChange">
            <view class="picker-value">{{ customEndDate || '请选择' }}</view>
          </picker>
        </view>
        <view class="popup-actions">
          <view class="popup-btn ghost" @click="customVisible = false">取消</view>
          <view class="popup-btn primary" @click="applyCustomRange">确定</view>
        </view>
      </view>
    </u-popup>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onReachBottom, onShow, onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getDistributionOrders } from '@/api/distribution'
import { parseGoodsImageUrl, formatGoodsSpecs } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const mainTabs = [
  { label: '推广订单', value: 'PROMOTION' },
  { label: '邀请订单', value: 'INVITE' },
]

const rangeTabs = [
  { label: '全部', value: 'ALL' },
  { label: '今日', value: 'TODAY' },
  { label: '昨日', value: 'YESTERDAY' },
  { label: '近七日', value: 'LAST_7_DAYS' },
]

const activeTab = ref('PROMOTION')
const activeRange = ref('ALL')
const keyword = ref('')
const pageReady = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const orderTotal = ref(0)
const totalCommission = ref(0)
const orderList = ref<any[]>([])
const pageNumber = ref(1)
const pageSize = 10

const customVisible = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')

const RANGE_VALUES = ['ALL', 'TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'CUSTOM']
const ORDER_TYPE_VALUES = ['PROMOTION', 'INVITE']

function applyRouteOptions(options: Record<string, string | undefined> = {}) {
  const orderType = options.orderType
  if (orderType && ORDER_TYPE_VALUES.includes(orderType)) {
    activeTab.value = orderType
  } else {
    activeTab.value = 'PROMOTION'
  }
  const rangeType = options.rangeType
  if (rangeType && RANGE_VALUES.includes(rangeType)) {
    activeRange.value = rangeType
  } else {
    activeRange.value = 'ALL'
  }
}

onLoad((options) => {
  applyRouteOptions(options as Record<string, string>)
})

onShow(() => {
  const pages = getCurrentPages()
  const current = pages[pages.length - 1] as { options?: Record<string, string> }
  if (current?.options) {
    applyRouteOptions(current.options)
  }
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
    resetAndLoad()
  })
})

onReachBottom(() => {
  loadOrders(false)
})

function buildQueryParams() {
  const params: Record<string, any> = {
    pageNumber: pageNumber.value,
    pageSize,
    rangeType: activeRange.value,
    orderType: activeTab.value,
  }
  const searchKeyword = keyword.value.trim()
  if (searchKeyword) {
    params.keyword = searchKeyword
  }
  if (activeRange.value === 'CUSTOM') {
    if (customStartDate.value) {
      params.startTime = `${customStartDate.value} 00:00:00`
    }
    if (customEndDate.value) {
      params.endTime = `${customEndDate.value} 23:59:59`
    }
  }
  return params
}

const commissionLabel = computed(() => (activeTab.value === 'INVITE' ? '邀请佣金' : '商品佣金'))

function resetAndLoad() {
  pageNumber.value = 1
  finished.value = false
  orderList.value = []
  loadOrders(true)
}

function loadOrders(reset = false) {
  if (reset) {
    loading.value = true
    pageNumber.value = 1
    finished.value = false
  } else if (loading.value || loadingMore.value || finished.value) {
    return
  } else {
    loadingMore.value = true
  }

  getDistributionOrders(buildQueryParams())
    .then((res) => {
      const result = res.data?.result || {}
      const records = result.records || []
      orderTotal.value = Number(result.total || 0)
      totalCommission.value = Number(result.totalCommission || 0)
      if (reset) {
        orderList.value = records
      } else {
        orderList.value = orderList.value.concat(records)
      }
      if (records.length < pageSize || orderList.value.length >= orderTotal.value) {
        finished.value = true
      } else {
        pageNumber.value += 1
      }
    })
    .finally(() => {
      loading.value = false
      loadingMore.value = false
    })
}

function changeTab(value: string) {
  if (activeTab.value === value) return
  activeTab.value = value
  resetAndLoad()
}

function changeRange(value: string) {
  if (activeRange.value === value) return
  activeRange.value = value
  resetAndLoad()
}

function onSearch() {
  resetAndLoad()
}

function openCustomPicker() {
  customVisible.value = true
}

function onStartDateChange(event: any) {
  customStartDate.value = event.detail.value
}

function onEndDateChange(event: any) {
  customEndDate.value = event.detail.value
}

function applyCustomRange() {
  if (!customStartDate.value || !customEndDate.value) {
    uni.showToast({ title: '请选择开始和结束日期', icon: 'none' })
    return
  }
  if (customStartDate.value > customEndDate.value) {
    uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' })
    return
  }
  activeRange.value = 'CUSTOM'
  customVisible.value = false
  resetAndLoad()
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

function statusClass(item: any) {
  if (item.settlementStatusType === 'SETTLED') return 'status-settled'
  if (item.settlementStatusType === 'PENDING') return 'status-pending'
  return 'status-not-settle'
}

function isRefunded(item: any) {
  return item.refunded === true || item.refunded === 1 || item.refunded === '1'
}

function showCommission(item: any) {
  return !isRefunded(item) && Number(item.commissionAmount || 0) > 0
}

function goOrderDetail(item: any) {
  if (!item?.orderItemSn) return
  uni.navigateTo({
    url: `/pages/mine/distribution/order-detail?orderItemSn=${item.orderItemSn}&orderType=${activeTab.value}`,
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}

.search-inner {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  color: #333;
  font-size: 26rpx;
}

.search-placeholder {
  color: #bbb;
  font-size: 26rpx;
}

.main-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.main-tab {
  flex: 1;
  position: relative;
  padding: 24rpx 0;
  text-align: center;
  color: #666;
  font-size: 30rpx;
}

.main-tab.active {
  color: #ff8f3f;
  font-weight: 600;
}

.main-tab.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 56rpx;
  height: 6rpx;
  margin-left: -28rpx;
  border-radius: 999rpx;
  background: #ff8f3f;
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-scroll {
  flex: 1;
  white-space: nowrap;
}

.filter-tabs {
  display: inline-flex;
  align-items: center;
  gap: 16rpx;
}

.filter-tab {
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  color: #666;
  font-size: 26rpx;
  background: #f5f5f5;
}

.filter-tab.active {
  color: #ff8f3f;
  background: #fff2e8;
  font-weight: 600;
}

.custom-time {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-left: 16rpx;
  color: #666;
  font-size: 24rpx;
  flex-shrink: 0;
}

.custom-time.active {
  color: #ff8f3f;
  font-weight: 600;
}

.summary-row {
  padding: 16rpx 24rpx 20rpx;
  color: #999;
  font-size: 24rpx;
  background: #f5f6f8;
}

.summary-highlight {
  color: #ff8f3f;
  font-weight: 600;
}

.list-wrap {
  padding: 0 24rpx 24rpx;
}

.order-card {
  margin-bottom: 20rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.buyer-name {
  color: #333;
  font-size: 28rpx;
  font-weight: 600;
}

.status-text {
  font-size: 24rpx;
}

.status-settled {
  color: #52c41a;
}

.status-pending {
  color: #ff8f3f;
}

.status-not-settle {
  color: #999;
}

.order-time {
  margin-top: 12rpx;
  color: #999;
  font-size: 24rpx;
}

.refund-tag {
  display: inline-block;
  margin-top: 12rpx;
  color: #ff4d4f;
  font-size: 24rpx;
}

.goods-row {
  display: flex;
  margin-top: 20rpx;
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
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-block {
  margin-top: 20rpx;
  text-align: right;
}

.amount-line {
  color: #666;
  font-size: 24rpx;
  line-height: 1.8;
}

.commission-line {
  color: #333;
  font-size: 26rpx;
}

.commission-value {
  color: #ff8f3f;
  font-size: 32rpx;
  font-weight: 700;
}

.settle-time {
  margin-top: 4rpx;
  color: #bbb;
  font-size: 22rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.order-sn {
  flex: 1;
  min-width: 0;
  color: #ccc;
  font-size: 22rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-btn {
  margin-left: 16rpx;
  color: #ff8f3f;
  font-size: 26rpx;
  flex-shrink: 0;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}

.list-footer {
  padding: 12rpx 0 32rpx;
  text-align: center;
}

.footer-text {
  color: #ccc;
  font-size: 24rpx;
}

.custom-popup {
  padding: 32rpx 28rpx 40rpx;
}

.popup-title {
  margin-bottom: 24rpx;
  text-align: center;
  color: #333;
  font-size: 30rpx;
  font-weight: 600;
}

.popup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.popup-label {
  color: #666;
  font-size: 28rpx;
}

.picker-value {
  color: #333;
  font-size: 28rpx;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
}

.popup-btn.ghost {
  color: #666;
  background: #f5f5f5;
}

.popup-btn.primary {
  color: #fff;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
}
</style>
