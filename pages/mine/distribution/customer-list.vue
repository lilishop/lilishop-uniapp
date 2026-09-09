<template>
  <view class="page" :style="themeStyle">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <u-icon name="arrow-left" color="#333" size="20" />
      </view>
      <view v-if="detailId" class="nav-title">客户详情</view>
      <view v-else class="search-box">
        <u-icon name="search" color="#bbb" size="16" />
        <input
          class="search-input"
          v-model="keyword"
          confirm-type="search"
          placeholder="请输入手机号或有效客户昵称搜索"
          placeholder-class="search-placeholder"
          @confirm="onSearch"
        />
      </view>
    </view>

    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else-if="detailId">
      <view v-if="detailLoading" class="state-wrap">
        <text class="state-text">加载中...</text>
      </view>
      <view v-else-if="!detail.id" class="state-wrap">
        <text class="state-text">客户不存在</text>
      </view>
      <view v-else class="detail-wrap">
        <view class="detail-card">
          <view class="profile-row">
            <image class="detail-avatar" :src="resolveAvatar(detail.memberAvatar)" mode="aspectFill" />
            <view class="profile-info">
              <view class="detail-name-row">
                <text class="detail-name">{{ detail.memberNickname || '客户' }}</text>
                <text class="star-icon" :class="{ active: detail.starred }">★</text>
              </view>
              <view class="star-action" @click="toggleStar">
                {{ detail.starred ? '取消星标' : '设为星标' }}
              </view>
            </view>
          </view>
          <view class="stats-grid">
            <view class="stats-item">
              <view class="stats-value">{{ detail.orderCount || 0 }}</view>
              <view class="stats-label">订单数量</view>
            </view>
            <view class="stats-item">
              <view class="stats-value">{{ formatMoney(detail.tradeAmount) }}</view>
              <view class="stats-label">成交金额（元）</view>
            </view>
            <view class="stats-item">
              <view class="stats-value">{{ formatMoney(detail.averageOrderAmount) }}</view>
              <view class="stats-label">客单价（元）</view>
            </view>
            <view class="stats-item">
              <view class="stats-value stats-time">{{ formatTime(detail.lastTradeTime) }}</view>
              <view class="stats-label">最后成交时间</view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <template v-else-if="pageReady">
      <view class="main-tabs">
        <view
          v-for="item in mainTabs"
          :key="item.value"
          class="main-tab"
          :class="{ active: activeFilter === item.value }"
          @click="changeFilter(item.value)"
        >
          <text>{{ item.label }}</text>
          <view v-if="activeFilter === item.value" class="tab-line"></view>
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
            <view
              class="filter-tab custom-time"
              :class="{ active: activeRange === 'CUSTOM' }"
              @click="openCustomPicker"
            >
              <text>自定义时间</text>
              <u-icon name="arrow-down" size="12" :color="activeRange === 'CUSTOM' ? '#ff8f3f' : '#999'" />
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="summary-row">
        <text>共{{ customerTotal }}个客户</text>
      </view>

      <view v-if="loading && !customerList.length" class="state-wrap">
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="!customerList.length" class="state-wrap">
        <text class="state-text">暂无客户</text>
      </view>

      <view v-else class="list-wrap">
        <view class="customer-card" v-for="item in customerList" :key="item.id" @click="openDetail(item)">
          <image class="avatar" :src="resolveAvatar(item.memberAvatar)" mode="aspectFill" />
          <view class="info">
            <view class="name-row">
              <text class="name">{{ item.memberNickname || '客户' }}</text>
              <u-icon
                v-if="item.starred"
                name="star-fill"
                color="#ff8f3f"
                size="16"
              />
            </view>
            <view class="meta-line phone-status-row">
              <view class="phone-wrap">
                <text class="meta-label">手机号：</text>
                <text class="meta-value">{{ item.memberMobile || '-' }}</text>
              </view>
              <view class="status-wrap">
                <text class="meta-label">状态：</text>
                <text class="status-text" :class="{ effective: item.relationEffective }">
                  {{ item.relationStatusText || '-' }}
                </text>
              </view>
            </view>
            <view class="bind-time">绑定时间：{{ formatTime(item.bindTime) }}</view>
          </view>
        </view>
      </view>

      <view v-if="customerList.length" class="list-footer">
        <text v-if="finished" class="footer-text">没有更多数据了</text>
        <text v-else-if="loadingMore" class="footer-text">加载中...</text>
      </view>
    </template>

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
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onReachBottom, onShow, onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import config from '@/config/config'
import { getThemeStyle } from '@/utils/theme'
import {
  getDistributionCustomers,
  getDistributionCustomerDetail,
  updateDistributionCustomerStarred,
} from '@/api/distribution'
import { parseGoodsImageUrl } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const defaultAvatar = config.defaultUserPhoto
const statusBarHeight = ref(20)

const mainTabs = [
  { label: '全部客户', value: 'ALL' },
  { label: '星标客户', value: 'STARRED' },
  { label: '下单客户', value: 'ORDERED' },
  { label: '即将失效客户', value: 'EXPIRING_SOON' },
]

const rangeTabs = [
  { label: '全部', value: 'ALL' },
  { label: '今日', value: 'TODAY' },
  { label: '昨日', value: 'YESTERDAY' },
  { label: '近七日', value: 'LAST_7_DAYS' },
]

const activeFilter = ref('ALL')
const activeRange = ref('ALL')
const keyword = ref('')
const pageReady = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const customerTotal = ref(0)
const customerList = ref<any[]>([])
const pageNumber = ref(1)
const pageSize = 10

const detailId = ref('')
const detailLoading = ref(false)
const detail = ref<Record<string, any>>({})

const customVisible = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')

const RANGE_VALUES = ['ALL', 'TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'CUSTOM']

function applyRouteOptions(options: Record<string, string | undefined> = {}) {
  const rangeType = options.rangeType
  if (rangeType && RANGE_VALUES.includes(rangeType)) {
    activeRange.value = rangeType
    return
  }
  activeRange.value = 'ALL'
}

onLoad((options) => {
  applyRouteOptions(options as Record<string, string>)
})

onShow(() => {
  statusBarHeight.value = uni.getWindowInfo?.()?.statusBarHeight || 20
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
    if (!detailId.value) {
      resetAndLoad()
    }
  })
})

onReachBottom(() => {
  if (!detailId.value) {
    loadCustomers(false)
  }
})

function buildQueryParams() {
  const params: Record<string, any> = {
    pageNumber: pageNumber.value,
    pageSize,
    filterType: activeFilter.value,
    rangeType: activeRange.value,
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

function resetAndLoad() {
  pageNumber.value = 1
  finished.value = false
  customerList.value = []
  loadCustomers(true)
}

function loadCustomers(reset = false) {
  if (reset) {
    loading.value = true
    pageNumber.value = 1
    finished.value = false
  } else if (loading.value || loadingMore.value || finished.value) {
    return
  } else {
    loadingMore.value = true
  }

  getDistributionCustomers(buildQueryParams())
    .then((res) => {
      const result = res.data?.result || {}
      const records = result.records || []
      customerTotal.value = Number(result.total || 0)
      if (reset) {
        customerList.value = records
      } else {
        customerList.value = customerList.value.concat(records)
      }
      if (records.length < pageSize || customerList.value.length >= customerTotal.value) {
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

function loadDetail() {
  if (!detailId.value) return
  detailLoading.value = true
  getDistributionCustomerDetail(detailId.value)
    .then((res) => {
      detail.value = res.data?.result || {}
    })
    .catch(() => {
      detail.value = {}
    })
    .finally(() => {
      detailLoading.value = false
    })
}

function openDetail(item: any) {
  if (!item?.id) return
  detailId.value = item.id
  detail.value = {}
  loadDetail()
}

function closeDetail() {
  const currentId = detailId.value
  const starred = detail.value?.starred
  detailId.value = ''
  detail.value = {}
  if (currentId) {
    const target = customerList.value.find((item) => item.id === currentId)
    if (target) {
      target.starred = starred
    }
  }
}

function toggleStar() {
  if (!detail.value?.id) return
  const next = !detail.value.starred
  updateDistributionCustomerStarred(detail.value.id, next).then(() => {
    detail.value.starred = next
    const target = customerList.value.find((item) => item.id === detail.value.id)
    if (target) {
      target.starred = next
    }
    uni.showToast({
      title: next ? '已设为星标' : '已取消星标',
      icon: 'none',
    })
  })
}

function changeFilter(value: string) {
  if (activeFilter.value === value) return
  activeFilter.value = value
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

function resolveAvatar(avatar?: string) {
  return parseGoodsImageUrl(avatar) || defaultAvatar
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

function goBack() {
  if (detailId.value) {
    closeDetail()
    return
  }
  if (getCurrentPages().length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.navigateTo({ url: '/pages/mine/distribution/home' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.status-bar,
.nav-bar {
  background: #fff;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx 16rpx;
  gap: 16rpx;
}

.nav-back {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-title {
  flex: 1;
  text-align: center;
  margin-right: 56rpx;
  color: #222;
  font-size: 32rpx;
  font-weight: 600;
}

.search-box {
  flex: 1;
  height: 64rpx;
  border-radius: 999rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 12rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  font-size: 26rpx;
  color: #333;
}

.search-placeholder {
  color: #bbb;
  font-size: 26rpx;
}

.main-tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 12rpx 12rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.main-tab {
  position: relative;
  flex: 1;
  text-align: center;
  padding: 20rpx 0 24rpx;
  color: #666;
  font-size: 28rpx;
}

.main-tab.active {
  color: #ff8f3f;
  font-weight: 600;
}

.tab-line {
  position: absolute;
  left: 50%;
  bottom: 8rpx;
  width: 48rpx;
  height: 6rpx;
  margin-left: -24rpx;
  border-radius: 999rpx;
  background: #ff8f3f;
}

.filter-bar {
  background: #fff;
  padding: 28rpx 0 16rpx;
}

.filter-scroll {
  white-space: nowrap;
  width: 100%;
}

.filter-tabs {
  display: inline-flex;
  align-items: center;
  padding: 0 24rpx;
  gap: 28rpx;
}

.filter-tab {
  color: #666;
  font-size: 26rpx;
  flex-shrink: 0;
}

.filter-tab.active {
  color: #ff8f3f;
  font-weight: 600;
}

.custom-time {
  display: inline-flex;
  align-items: center;
  gap: 4rpx;
}

.summary-row {
  padding: 20rpx 24rpx;
  color: #999;
  font-size: 24rpx;
}

.list-wrap,
.detail-wrap {
  padding: 0 24rpx 24rpx;
}

.customer-card,
.detail-card {
  border-radius: 16rpx;
  background: #fff;
}

.customer-card {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20rpx;
  padding: 28rpx 24rpx;
}

.detail-card {
  padding: 32rpx 28rpx 24rpx;
}

.avatar,
.detail-avatar {
  border-radius: 50%;
  background: #f2f2f2;
  flex-shrink: 0;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
}

.detail-avatar {
  width: 104rpx;
  height: 104rpx;
}

.info,
.profile-info {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.profile-info {
  padding-top: 4rpx;
}

.name-row,
.detail-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.name,
.detail-name {
  color: #222;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.name {
  max-width: 420rpx;
  font-size: 32rpx;
}

.detail-name {
  max-width: 420rpx;
  margin-right: 10rpx;
  font-size: 34rpx;
}

.star-icon {
  color: #ccc;
  font-size: 30rpx;
  line-height: 1;
}

.star-icon.active {
  color: #ff8f3f;
}

.star-action {
  display: inline-flex;
  margin-top: 16rpx;
  padding: 8rpx 22rpx;
  border: 1rpx solid #ddd;
  border-radius: 999rpx;
  color: #666;
  font-size: 24rpx;
  line-height: 1.2;
}

.profile-row {
  display: flex;
  align-items: flex-start;
  padding-bottom: 32rpx;
}

.stats-grid {
  display: flex;
  flex-wrap: wrap;
  border-top: 1rpx solid #f2f2f2;
  padding-top: 8rpx;
}

.stats-item {
  width: 50%;
  box-sizing: border-box;
  padding: 28rpx 8rpx 20rpx;
}

.stats-value {
  color: #222;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-all;
}

.stats-time {
  font-size: 28rpx;
  font-weight: 600;
}

.stats-label {
  margin-top: 10rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 1.3;
}

.meta-line {
  margin-top: 10rpx;
  font-size: 26rpx;
  line-height: 1.4;
}

.phone-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.phone-wrap,
.status-wrap {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.status-wrap {
  flex-shrink: 0;
}

.meta-label {
  color: #666;
}

.meta-value {
  color: #333;
}

.status-text {
  color: #999;
  font-weight: 400;
}

.status-text.effective {
  color: #22c55e;
  font-weight: 400;
}

.bind-time {
  margin-top: 12rpx;
  color: #999;
  font-size: 24rpx;
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
  padding: 12rpx 0 40rpx;
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
