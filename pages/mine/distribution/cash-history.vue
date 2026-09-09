<template>
  <view class="page" :style="themeStyle">
    <view v-if="cashLoading && !cashList.length" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <view v-else-if="!cashList.length" class="state-wrap">
      <text class="state-text">暂无提现记录</text>
    </view>
    <view v-else class="log-list">
      <view class="log-item" v-for="item in cashList" :key="item.id">
        <view class="log-left">
          <view class="log-sn">单号：{{ item.sn || item.id }}</view>
          <view class="log-time">{{ formatTime(item.createTime) }}</view>
        </view>
        <view class="log-right">
          <text class="log-amount log-amount-out">-{{ formatMoney(item.price) }}</text>
          <view class="cash-status-tag" :class="cashStatusClass(item.distributionCashStatus)">
            {{ cashStatusLabel(item.distributionCashStatus) }}
          </view>
        </view>
      </view>
    </view>
    <view class="list-footer">
      <text v-if="cashFinished && cashList.length" class="footer-text">没有更多数据了</text>
      <text v-else-if="cashLoadingMore" class="footer-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { cashLog } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const cashList        = ref<any[]>([])
const cashPage        = ref(1)
const cashTotal       = ref(0)
const cashLoading     = ref(true)
const cashLoadingMore = ref(false)
const cashFinished    = ref(false)
const PAGE_SIZE = 15

onLoad(() => {
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    loadCashHistory(true)
  })
})

onReachBottom(() => {
  loadCashHistory(false)
})

function loadCashHistory(reset: boolean) {
  if (!reset && (cashLoading.value || cashLoadingMore.value || cashFinished.value)) return
  if (reset) {
    cashLoading.value = true
    cashPage.value = 1
    cashFinished.value = false
  } else {
    cashLoadingMore.value = true
  }
  cashLog({ pageNumber: cashPage.value, pageSize: PAGE_SIZE, sort: 'createTime', order: 'desc' })
    .then((res: any) => {
      const result  = res?.data?.result || {}
      const records: any[] = result.records || []
      cashTotal.value = Number(result.total || 0)
      cashList.value = reset ? records : [...cashList.value, ...records]
      if (records.length < PAGE_SIZE || cashList.value.length >= cashTotal.value) {
        cashFinished.value = true
      } else {
        cashPage.value += 1
      }
    })
    .finally(() => {
      cashLoading.value = false
      cashLoadingMore.value = false
    })
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

const CASH_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  APPLY:         { label: '审核中', cls: 'status-pending' },
  VIA_AUDITING:  { label: '已通过', cls: 'status-success' },
  FAIL_AUDITING: { label: '已驳回', cls: 'status-fail'    },
}

function cashStatusLabel(status: string) {
  return CASH_STATUS_MAP[status]?.label || status
}

function cashStatusClass(status: string) {
  return CASH_STATUS_MAP[status]?.cls || ''
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
  padding: 16rpx 24rpx 40rpx;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}

.log-list {
  padding-top: 16rpx;
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.log-left {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.log-time {
  font-size: 22rpx;
  color: #999;
}

.log-sn {
  font-size: 24rpx;
  color: #666;
  max-width: 360rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.log-amount {
  font-size: 32rpx;
  font-weight: 700;
}

.log-amount-out {
  color: #333;
}

.cash-status-tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.status-pending {
  background: #fff8e6;
  color: #e6a23c;
}

.status-success {
  background: #e8f8ec;
  color: #3aaa52;
}

.status-fail {
  background: #fef0f0;
  color: #f56c6c;
}

.list-footer {
  padding: 12rpx 0 32rpx;
  text-align: center;
}

.footer-text {
  color: #ccc;
  font-size: 24rpx;
}
</style>
