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

    <view v-if="loading" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>

    <view v-else class="content">
      <view class="summary-card">
        <view class="summary-label-row">
          <text class="summary-label">累计收益</text>
          <view class="info-icon" @click="showGuide = true">
            <u-icon name="info-circle" size="14" color="#999" />
          </view>
        </view>
        <view class="summary-amount">
          <text class="amount-value">{{ formatMoney(stats.totalEarnings) }}</text>
          <text class="amount-unit">元</text>
        </view>
        <view class="summary-pending">含待结算 {{ formatMoney(stats.pendingEarnings) }}元</view>
      </view>

      <view class="earn-grid">
        <view class="earn-item">
          <view class="earn-title">已结算收益</view>
          <view class="earn-value">{{ formatMoney(stats.settledEarnings) }}<text class="unit">元</text></view>
        </view>
        <view class="earn-item">
          <view class="earn-title">商品佣金</view>
          <view class="earn-value">{{ formatMoney(stats.directCommission) }}<text class="unit">元</text></view>
          <view class="earn-sub">含待结算: {{ formatMoney(stats.directPending) }}元</view>
        </view>
        <view class="earn-item">
          <view class="earn-title">邀请奖励</view>
          <view class="earn-value">{{ formatMoney(stats.inviteReward) }}<text class="unit">元</text></view>
          <view class="earn-sub">含待结算: {{ formatMoney(stats.invitePending) }}元</view>
        </view>
      </view>

      <view class="stats-grid">
        <view class="stats-item">
          <view class="stats-label">累计销售额(元)</view>
          <view class="stats-value">{{ formatMoney(stats.totalSales) }}</view>
        </view>
        <view class="stats-item">
          <view class="stats-label">累计订单(笔)</view>
          <view class="stats-value">{{ stats.totalOrders || 0 }}</view>
        </view>
        <view class="stats-item">
          <view class="stats-label">累计客户(人)</view>
          <view class="stats-value">{{ stats.totalCustomers || 0 }}</view>
        </view>
        <view class="stats-item">
          <view class="stats-label">累计邀请(人)</view>
          <view class="stats-value">{{ stats.totalInvites || 0 }}</view>
        </view>
      </view>

      <view class="guide-link" @click="showGuide = true">查看业绩指标说明</view>
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

    <u-popup v-model:show="showGuide" mode="center" round="16" :safe-area-inset-bottom="false">
      <view class="guide-popup">
        <view class="guide-title">业绩指标说明</view>
        <view class="guide-item">
          <view class="guide-term">销售额</view>
          <view class="guide-desc">仅统计推广订单的销售金额总和</view>
        </view>
        <view class="guide-item">
          <view class="guide-term">客户</view>
          <view class="guide-desc">与分销员建立绑定关系的买家</view>
        </view>
        <view class="guide-item">
          <view class="guide-term">邀请</view>
          <view class="guide-desc">分销员成功邀请的下级分销员</view>
        </view>
        <view class="guide-item">
          <view class="guide-term">商品佣金</view>
          <view class="guide-desc">分销员推荐客户购买商品后获得的佣金</view>
        </view>
        <view class="guide-item">
          <view class="guide-term">邀请奖励</view>
          <view class="guide-desc">下级分销员推广商品后，上级获得的奖励</view>
        </view>
        <view class="guide-btn" @click="showGuide = false">知道了</view>
      </view>
    </u-popup>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getDistributionPerformance } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const rangeTabs = [
  { label: '全部', value: 'ALL' },
  { label: '今日', value: 'TODAY' },
  { label: '昨日', value: 'YESTERDAY' },
  { label: '近七日', value: 'LAST_7_DAYS' },
]

const pageReady = ref(false)
const activeRange = ref('ALL')
const loading = ref(false)
const customVisible = ref(false)
const showGuide = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')

const stats = ref({
  totalEarnings: 0,
  pendingEarnings: 0,
  settledEarnings: 0,
  directCommission: 0,
  directPending: 0,
  inviteReward: 0,
  invitePending: 0,
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalInvites: 0,
})

const RANGE_VALUES = ['ALL', 'TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'CUSTOM']

onLoad((options: Record<string, string>) => {
  if (options?.rangeType && RANGE_VALUES.includes(options.rangeType)) {
    activeRange.value = options.rangeType
  }
})

onShow(() => {
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
    loadPerformance()
  })
})

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function buildParams() {
  const params: Record<string, string> = { rangeType: activeRange.value }
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

function loadPerformance() {
  loading.value = true
  getDistributionPerformance(buildParams())
    .then((res) => {
      const data = res.data?.result || {}
      stats.value = {
        totalEarnings: Number(data.totalEarnings || 0),
        pendingEarnings: Number(data.pendingEarnings || 0),
        settledEarnings: Number(data.settledEarnings || 0),
        directCommission: Number(data.directCommission || 0),
        directPending: Number(data.directPending || 0),
        inviteReward: Number(data.inviteReward || 0),
        invitePending: Number(data.invitePending || 0),
        totalSales: Number(data.totalSales || 0),
        totalOrders: Number(data.totalOrders || 0),
        totalCustomers: Number(data.totalCustomers || 0),
        totalInvites: Number(data.totalInvites || 0),
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function changeRange(value: string) {
  if (activeRange.value === value) return
  activeRange.value = value
  loadPerformance()
}

function openCustomPicker() {
  customVisible.value = true
}

function onStartDateChange(e: { detail: { value: string } }) {
  customStartDate.value = e.detail.value
}

function onEndDateChange(e: { detail: { value: string } }) {
  customEndDate.value = e.detail.value
}

function applyCustomRange() {
  if (!customStartDate.value || !customEndDate.value) {
    uni.showToast({ title: '请选择开始和结束日期', icon: 'none' })
    return
  }
  activeRange.value = 'CUSTOM'
  customVisible.value = false
  loadPerformance()
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
  gap: 12rpx;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 28rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f6f8;
}

.filter-tab.active {
  color: #ff8f3f;
  background: #fff3ea;
  font-weight: 600;
}

.custom-time {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-left: 16rpx;
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
}

.custom-time.active {
  color: #ff8f3f;
  font-weight: 600;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  font-size: 28rpx;
  color: #999;
}

.content {
  padding: 24rpx;
}

.summary-card,
.earn-grid,
.stats-grid {
  background: #fff;
  border-radius: 16rpx;
}

.summary-card {
  padding: 32rpx 28rpx 28rpx;
  margin-bottom: 20rpx;
}

.summary-label-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.info-icon {
  display: flex;
  align-items: center;
}

.summary-amount {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;
}

.amount-value {
  font-size: 64rpx;
  font-weight: 700;
  color: #222;
  line-height: 1;
}

.amount-unit {
  margin-left: 8rpx;
  font-size: 28rpx;
  color: #222;
}

.summary-pending {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
}

.earn-grid {
  display: flex;
  padding: 28rpx 0;
  margin-bottom: 20rpx;
}

.earn-item {
  flex: 1;
  padding: 0 20rpx;
  text-align: center;
  border-right: 1rpx solid #f0f0f0;
}

.earn-item:last-child {
  border-right: none;
}

.earn-title {
  font-size: 24rpx;
  color: #666;
}

.earn-value {
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 700;
  color: #222;
}

.earn-value .unit {
  font-size: 22rpx;
  font-weight: 400;
}

.earn-sub {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #999;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.stats-item {
  padding: 32rpx 28rpx;
  border-right: 1rpx solid #f0f0f0;
  border-bottom: 1rpx solid #f0f0f0;
}

.stats-item:nth-child(2n) {
  border-right: none;
}

.stats-item:nth-last-child(-n + 2) {
  border-bottom: none;
}

.stats-label {
  font-size: 24rpx;
  color: #666;
}

.stats-value {
  margin-top: 16rpx;
  font-size: 40rpx;
  font-weight: 700;
  color: #222;
}

.guide-link {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #3b82f6;
}

.custom-popup {
  padding: 32rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24rpx;
}

.popup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-label {
  font-size: 28rpx;
  color: #666;
}

.picker-value {
  font-size: 28rpx;
  color: #222;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.popup-btn.ghost {
  background: #f5f6f8;
  color: #666;
}

.popup-btn.primary {
  background: linear-gradient(135deg, #ff9f43, #ff7f27);
  color: #fff;
}

.guide-popup {
  width: 620rpx;
  padding: 40rpx 36rpx 32rpx;
  box-sizing: border-box;
}

.guide-title {
  font-size: 34rpx;
  font-weight: 700;
  text-align: center;
  color: #222;
  margin-bottom: 28rpx;
}

.guide-item {
  margin-bottom: 24rpx;
}

.guide-term {
  font-size: 28rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 8rpx;
}

.guide-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.guide-btn {
  margin-top: 12rpx;
  height: 84rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, #ff9f43, #ff7f27);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
