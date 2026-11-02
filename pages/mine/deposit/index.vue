<template>
  <view :style="themeStyle" class="deposit-log-page">
    <u-navbar
      title="预存款明细"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>

    <!-- 顶部余额概览卡片 -->
    <view class="header-wrap">
      <view class="balance-hero">
        <view class="hero-glow hero-glow-1"></view>
        <view class="hero-glow hero-glow-2"></view>
        <view class="hero-top">
          <text class="money-label">当前预存款余额 (元)</text>
        </view>
        <view class="money-row">
          <text class="money-symbol">¥</text>
          <text class="money-value">{{ unitPrice(walletNum) }}</text>
        </view>
      </view>

      <!-- 收支筛选栏 -->
      <view class="filter-bar">
        <view
          v-for="(tab, idx) in filterTabs"
          :key="tab.key"
          class="filter-pill"
          :class="{ active: activeFilter === idx }"
          @click="activeFilter = idx"
        >
          {{ tab.name }}
        </view>
      </view>
    </view>

    <!-- 明细列表区 -->
    <view class="list-container">
      <view v-if="filteredData.length > 0" class="list-card">
        <view
          class="log-item"
          v-for="(item, logIndex) in filteredData"
          :key="logIndex"
        >
          <!-- 第一行：类型标签 + 标题 | 变动金额 -->
          <view class="log-row-main">
            <view class="log-title-wrap">
              <text class="type-tag" :class="item.parsed.tagClass">{{ item.parsed.tagText }}</text>
              <text class="log-title">{{ item.parsed.title }}</text>
            </view>
            <text class="log-amount" :class="item.parsed.moneyClass">
              {{ item.parsed.formattedMoney }}
            </text>
          </view>

          <!-- 第二行：提取出的单号或备注说明 -->
          <view v-if="item.parsed.metaList.length > 0" class="log-meta-box">
            <view
              class="log-meta-line"
              v-for="(meta, mIdx) in item.parsed.metaList"
              :key="mIdx"
            >
              <text class="meta-label">{{ meta.label }}：</text>
              <text class="meta-val">{{ meta.value }}</text>
            </view>
          </view>

          <!-- 第三行：变动时间 -->
          <view class="log-row-foot">
            <text class="log-time">{{ item.createTime }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="loaded" class="empty-box">
        <u-empty mode="history" text="暂无预存款变动记录" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { getWalletLog, getUserWallet } from '@/api/members'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const walletNum = ref(0)
const loaded = ref(false)
const hasMore = ref(true)
const activeFilter = ref(0)
const filterTabs = [
  { key: 'ALL', name: '全部明细' },
  { key: 'IN', name: '收入 / 退款' },
  { key: 'OUT', name: '支出 / 提现' },
]

const params = ref({
  pageNumber: 1,
  pageSize: 10,
  order: 'desc',
})
const depositData = ref<any[]>([])

onMounted(async () => {
  getWallet()
  const result = await getUserWallet()
  walletNum.value = result.data?.result?.memberWallet ?? 0
})

onReachBottom(() => {
  if (!hasMore.value) return
  loadMore()
})

function isOutgoing(logItem: any) {
  const money = Number(logItem?.money) || 0
  if (money < 0) return true
  const serviceType = logItem?.serviceType
  return serviceType === 'WALLET_PAY' || serviceType === 'WALLET_WITHDRAWAL'
}

function isIncoming(logItem: any) {
  const money = Number(logItem?.money) || 0
  if (money > 0) return true
  const serviceType = logItem?.serviceType
  return (
    serviceType === 'WALLET_REFUND' ||
    serviceType === 'WALLET_RECHARGE' ||
    serviceType === 'WALLET_COMMISSION'
  )
}

function parseLogDetail(logItem: any) {
  const raw = String(logItem?.detail || '').trim()
  const serviceType = logItem?.serviceType || ''
  const out = isOutgoing(logItem)
  const inc = isIncoming(logItem)

  const absAmount = unitPrice(Math.abs(Number(logItem?.money) || 0))
  const formattedMoney = out ? `-${absAmount}` : inc ? `+${absAmount}` : absAmount
  const moneyClass = out ? 'out' : inc ? 'in' : ''

  let title = '余额变动'
  let tagText = '变动'
  let tagClass = 'tag-default'

  const orderMatch = raw.match(/订单\[([^\]]+)\]/)
  const afterSaleMatch = raw.match(/售后单\[([^\]]+)\]/)
  const rechargeMatch = raw.match(/充值单号为[：:]\s*([A-Za-z0-9_-]+)/)

  if (afterSaleMatch && afterSaleMatch[1] === 'ORDER_CANCEL') {
    title = '订单取消退回'
    tagText = '退款'
    tagClass = 'tag-in'
  } else if (serviceType === 'WALLET_REFUND' || raw.includes('退还') || raw.includes('返还')) {
    title = '售后退款入账'
    tagText = '退款'
    tagClass = 'tag-in'
  } else if (serviceType === 'WALLET_PAY' || raw.includes('支付金额')) {
    title = '订单余额支付'
    tagText = '消费'
    tagClass = 'tag-out'
  } else if (serviceType === 'WALLET_RECHARGE') {
    title = raw.includes('后台') ? '平台余额充值' : '预存款充值'
    tagText = '充值'
    tagClass = 'tag-in'
  } else if (serviceType === 'WALLET_WITHDRAWAL') {
    title = out ? '余额提现申请' : '提现退回解冻'
    tagText = '提现'
    tagClass = out ? 'tag-out' : 'tag-in'
  } else if (serviceType === 'WALLET_COMMISSION') {
    title = '分销佣金入账'
    tagText = '佣金'
    tagClass = 'tag-in'
  }

  const metaList: Array<{ label: string; value: string }> = []
  if (orderMatch && orderMatch[1]) {
    metaList.push({ label: '订单编号', value: orderMatch[1] })
  }
  if (afterSaleMatch && afterSaleMatch[1] && afterSaleMatch[1] !== 'ORDER_CANCEL') {
    metaList.push({ label: '售后单号', value: afterSaleMatch[1] })
  }
  if (rechargeMatch && rechargeMatch[1]) {
    metaList.push({ label: '充值单号', value: rechargeMatch[1] })
  }

  if (metaList.length === 0 && raw && !raw.includes('???')) {
    const cleaned = raw
      .replace(/[，,]?\s*(支付金额|退还金额|余额返还)\[[^\]]+\]/g, '')
      .replace(/:\s*\d+(\.\d+)?$/, '')
      .trim()
    if (cleaned && cleaned !== title) {
      metaList.push({ label: '变动说明', value: cleaned })
    }
  }

  return {
    title,
    tagText,
    tagClass,
    formattedMoney,
    moneyClass,
    isOut: out,
    isIn: inc,
    metaList,
  }
}

const decoratedList = computed(() =>
  depositData.value.map((item) => ({
    ...item,
    parsed: parseLogDetail(item),
  }))
)

const filteredData = computed(() => {
  if (activeFilter.value === 1) {
    return decoratedList.value.filter((item) => item.parsed.isIn)
  }
  if (activeFilter.value === 2) {
    return decoratedList.value.filter((item) => item.parsed.isOut)
  }
  return decoratedList.value
})

function getWallet() {
  getWalletLog(params.value).then((res) => {
    loaded.value = true
    const records = (res.data?.success && res.data?.result?.records) || []
    if (records.length) {
      depositData.value.push(...records)
    }
    if (records.length < params.value.pageSize) {
      hasMore.value = false
    }
  })
}

function loadMore() {
  params.value.pageNumber++
  getWallet()
}
</script>

<style lang="scss" scoped>
.deposit-log-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 48rpx;
  box-sizing: border-box;
}

.header-wrap {
  padding: 24rpx 24rpx 8rpx;
}

.balance-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24rpx;
  padding: 36rpx 36rpx 34rpx;
  color: #ffffff;
  background: linear-gradient(135deg, $main-color 0%, $light-color 60%, $aider-light-color 100%);
  box-shadow: 0 12rpx 28rpx rgba(229, 50, 56, 0.18);
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}

.hero-glow-1 {
  width: 220rpx;
  height: 220rpx;
  right: -60rpx;
  top: -70rpx;
}

.hero-glow-2 {
  width: 140rpx;
  height: 140rpx;
  right: 90rpx;
  bottom: -60rpx;
  background: rgba(255, 255, 255, 0.08);
}

.hero-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.money-label {
  font-size: 25rpx;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.5rpx;
}

.money-row {
  margin-top: 14rpx;
  display: flex;
  align-items: baseline;
}

.money-symbol {
  font-size: 34rpx;
  font-weight: 600;
  margin-right: 8rpx;
}

.money-value {
  font-size: 58rpx;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 1rpx;
  font-variant-numeric: tabular-nums;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
}

.filter-pill {
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 25rpx;
  color: #666666;
  background: #ffffff;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: $main-color;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(229, 50, 56, 0.2);
  }
}

.list-container {
  padding: 16rpx 24rpx 0;
}

.list-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.log-item {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(17, 30, 79, 0.03);
}

.log-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.log-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
  flex: 1;
}

.type-tag {
  flex-shrink: 0;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  line-height: 1.3;

  &.tag-in {
    color: #00a870;
    background: rgba(0, 168, 112, 0.1);
  }

  &.tag-out {
    color: #ff4d4f;
    background: rgba(255, 77, 79, 0.1);
  }

  &.tag-default {
    color: #666666;
    background: #f0f2f5;
  }
}

.log-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-amount {
  flex-shrink: 0;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  color: #1d2129;

  &.in {
    color: #00a870;
  }

  &.out {
    color: #ff4d4f;
  }
}

.log-meta-box {
  margin-top: 16rpx;
  padding: 14rpx 18rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.log-meta-line {
  display: flex;
  align-items: center;
  font-size: 23rpx;
  line-height: 1.45;
  color: #4e5969;
}

.meta-label {
  flex-shrink: 0;
  color: #86909c;
}

.meta-val {
  flex: 1;
  min-width: 0;
  color: #4e5969;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  word-break: break-all;
}

.log-row-foot {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.log-time {
  font-size: 22rpx;
  color: #999999;
  line-height: 1.2;
}

.empty-box {
  padding-top: 120rpx;
}
</style>
