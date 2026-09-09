<template>
  <view class="page" :style="themeStyle">
    <view v-if="walletLoading && !walletList.length" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <view v-else-if="!walletList.length" class="state-wrap">
      <text class="state-text">暂无流水记录</text>
    </view>
    <view v-else class="log-list">
      <view class="log-item" v-for="item in walletList" :key="item.id">
        <view class="log-left">
          <text class="log-title">{{ logTypeLabel(item.logType) }}</text>
          <text class="log-time">{{ formatTime(item.createTime) }}</text>
        </view>
        <view class="log-right">
          <text class="log-amount" :class="logAmountClass(item.logType)">
            {{ logAmountSign(item.logType) }}{{ formatMoney(Math.abs(item.changeAmount)) }}
          </text>
        </view>
      </view>
    </view>
    <view class="list-footer">
      <text v-if="walletFinished && walletList.length" class="footer-text">没有更多数据了</text>
      <text v-else-if="walletLoadingMore" class="footer-text">加载中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getWalletLog } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const walletList        = ref<any[]>([])
const walletPage        = ref(1)
const walletTotal       = ref(0)
const walletLoading     = ref(true)
const walletLoadingMore = ref(false)
const walletFinished    = ref(false)
const PAGE_SIZE = 15

onLoad(() => {
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    loadWalletLog(true)
  })
})

onReachBottom(() => {
  loadWalletLog(false)
})

function loadWalletLog(reset: boolean) {
  if (!reset && (walletLoading.value || walletLoadingMore.value || walletFinished.value)) return
  if (reset) {
    walletLoading.value = true
    walletPage.value = 1
    walletFinished.value = false
  } else {
    walletLoadingMore.value = true
  }
  getWalletLog({ pageNumber: walletPage.value, pageSize: PAGE_SIZE })
    .then((res: any) => {
      const result  = res?.data?.result || {}
      const records: any[] = result.records || []
      walletTotal.value = Number(result.total || 0)
      walletList.value = reset ? records : [...walletList.value, ...records]
      if (records.length < PAGE_SIZE || walletList.value.length >= walletTotal.value) {
        walletFinished.value = true
      } else {
        walletPage.value += 1
      }
    })
    .finally(() => {
      walletLoading.value = false
      walletLoadingMore.value = false
    })
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 19)
}

const LOG_TYPE_MAP: Record<string, { label: string; income: boolean }> = {
  COMMISSION_FREEZE:  { label: '佣金待结算', income: false },
  COMMISSION_SETTLE:  { label: '销售员佣金', income: true  },
  COMMISSION_REFUND:  { label: '佣金退回',   income: false },
  WITHDRAW_APPLY:     { label: '提现申请',   income: false },
  WITHDRAW_APPROVE:   { label: '提现到账',   income: false },
  WITHDRAW_REJECT:    { label: '提现驳回',   income: true  },
}

function logTypeLabel(type: string) {
  return LOG_TYPE_MAP[type]?.label || type
}

function logAmountClass(type: string) {
  return LOG_TYPE_MAP[type]?.income ? 'log-amount-in' : 'log-amount-out'
}

function logAmountSign(type: string) {
  return LOG_TYPE_MAP[type]?.income ? '+' : '-'
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

.log-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
}

.log-time {
  font-size: 22rpx;
  color: #999;
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

.log-amount-in {
  color: var(--theme-primary);
}

.log-amount-out {
  color: #333;
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
