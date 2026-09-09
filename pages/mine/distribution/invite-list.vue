<template>
  <view class="page" :style="themeStyle">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else>
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
      <text>共 {{ inviteTotal }} 个邀请</text>
      <text>获得邀请奖励 {{ formatMoney(totalInviteReward) }}</text>
    </view>

    <view v-if="loading && !inviteList.length" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else-if="!inviteList.length" class="state-wrap">
      <text class="state-text">暂无邀请记录</text>
    </view>

    <view v-else class="list-wrap">
      <view class="invite-card" v-for="item in inviteList" :key="item.childDistributionId">
        <view class="card-top">
          <image class="avatar" :src="resolveAvatar(item.memberAvatar)" mode="aspectFill" />
          <view class="info">
            <view class="name">{{ displayInviteName(item) }}</view>
            <view class="time">邀请时间：{{ formatTime(item.effectiveTime) }}</view>
          </view>
          <view class="reward">
            <text class="reward-label">奖励</text>
            <text class="reward-value">{{ formatMoney(item.inviteRewardAmount) }}</text>
          </view>
        </view>
        <view class="card-stats">
          <text>销售额：{{ formatMoney(item.salesAmount) }}</text>
          <text>绑客数：{{ item.customerCount || 0 }}</text>
          <text>订单数：{{ item.orderCount || 0 }}</text>
        </view>
      </view>
    </view>

    <view v-if="inviteList.length" class="list-footer">
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
import config from '@/config/config'
import { getThemeStyle } from '@/utils/theme'
import { getDistributionInvitees } from '@/api/distribution'
import { parseGoodsImageUrl } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const defaultAvatar = config.defaultUserPhoto

const rangeTabs = [
  { label: '全部', value: 'ALL' },
  { label: '今日', value: 'TODAY' },
  { label: '昨日', value: 'YESTERDAY' },
  { label: '近七日', value: 'LAST_7_DAYS' },
]

const activeRange = ref('ALL')
const pageReady = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)
const inviteTotal = ref(0)
const totalInviteReward = ref(0)
const inviteList = ref<any[]>([])
const pageNumber = ref(1)
const pageSize = 10

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
  loadInvitees(false)
})

function resetAndLoad() {
  pageNumber.value = 1
  finished.value = false
  inviteList.value = []
  loadInvitees(true)
}

function buildQueryParams() {
  const params: Record<string, any> = {
    pageNumber: pageNumber.value,
    pageSize,
    rangeType: activeRange.value,
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

function loadInvitees(reset = false) {
  if (reset) {
    loading.value = true
    pageNumber.value = 1
    finished.value = false
  } else if (loading.value || loadingMore.value || finished.value) {
    return
  } else {
    loadingMore.value = true
  }

  getDistributionInvitees(buildQueryParams())
    .then((res) => {
      const result = res.data?.result || {}
      const records = result.records || []
      inviteTotal.value = Number(result.total || 0)
      totalInviteReward.value = Number(result.totalInviteReward || 0)
      if (reset) {
        inviteList.value = records
      } else {
        inviteList.value = inviteList.value.concat(records)
      }
      if (records.length < pageSize || inviteList.value.length >= inviteTotal.value) {
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

function changeRange(value: string) {
  if (activeRange.value === value) return
  activeRange.value = value
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

function displayInviteName(item: any) {
  const gradeName = (item.gradeName || '').trim()
  const memberName = (item.memberName || '分销员').trim()
  if (gradeName && !memberName.startsWith(gradeName)) {
    return `${gradeName}${memberName}`
  }
  return memberName
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 20rpx;
  background: #fff;
}

.filter-scroll {
  flex: 1;
  min-width: 0;
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
  flex-shrink: 0;
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
  display: flex;
  justify-content: space-between;
  padding: 16rpx 24rpx 20rpx;
  color: #999;
  font-size: 24rpx;
  background: #f5f6f8;
}

.list-wrap {
  padding: 0 24rpx 24rpx;
}

.invite-card {
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  overflow: hidden;
}

.card-top {
  display: flex;
  align-items: center;
  padding: 24rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #f2f2f2;
  flex-shrink: 0;
}

.info {
  flex: 1;
  min-width: 0;
  margin: 0 20rpx;
}

.name {
  color: #333;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.4;
}

.time {
  margin-top: 8rpx;
  color: #999;
  font-size: 22rpx;
}

.reward {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-shrink: 0;
}

.reward-label {
  color: #666;
  font-size: 24rpx;
  line-height: 1.4;
  margin-right: 6rpx;
}

.reward-value {
  color: #ff6b35;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.2;
}

.card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx 24rpx;
  border-top: 1rpx solid #f5f5f5;
  color: #999;
  font-size: 24rpx;
}

.card-stats text {
  flex: 1;
}

.card-stats text:nth-child(2) {
  text-align: center;
}

.card-stats text:nth-child(3) {
  text-align: right;
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
