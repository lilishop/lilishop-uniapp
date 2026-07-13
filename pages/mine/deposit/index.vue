<template>
  <view class="wap">
    <u-navbar
      title="预存款列表"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>

    <view class="wrapper-show-money">
      <view class="money-view">
        <text class="money-label">预存款金额</text>
        <text class="money">￥{{ unitPrice(walletNum) }}</text>
      </view>
    </view>

    <view class="wrapper-tabs">
      <swiper class="swiper-box" :current="swiperCurrent">
        <swiper-item class="swiper-item" v-for="index in list.length" :key="index">
          <scroll-view
            class="scroll-v view-wrapper"
            enable-back-to-top
            scroll-with-animation
            scroll-y
            @scrolltolower="loadMore"
          >
            <view v-if="depositData.length != 0" class="list-card">
              <view
                class="view-item"
                v-for="(logItem, logIndex) in depositData"
                :key="logIndex"
              >
                <view class="view-item-detail">
                  <text class="item-title">{{ logItem.detail }}</text>
                </view>
                <view class="view-item-change">
                  <text
                    class="item-money"
                    :class="getMoneyClass(logItem.serviceType)"
                  >{{ formatLogMoney(logItem) }}</text>
                  <text class="item-time">{{ logItem.createTime }}</text>
                </view>
              </view>
            </view>

            <u-empty v-if="depositData.length == 0" mode="history" text="暂无记录" />
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWalletLog, getUserWallet } from '@/api/members'
import { unitPrice } from '@/utils/filters.js'

const walletNum = ref(0)
const swiperCurrent = ref(0)
const params = ref({
  pageNumber: 1,
  pageSize: 10,
  order: 'desc',
})
const depositData = ref<any[]>([])
const list = [{ name: '预存款变动明细' }]

onMounted(async () => {
  getWallet()
  const result = await getUserWallet()
  walletNum.value = result.data.result.memberWallet
})

function isOutgoing(serviceType: string) {
  return serviceType === 'WALLET_PAY' || serviceType === 'WALLET_WITHDRAWAL'
}

function isIncoming(serviceType: string) {
  return (
    serviceType === 'WALLET_REFUND' ||
    serviceType === 'WALLET_RECHARGE' ||
    serviceType === 'WALLET_COMMISSION'
  )
}

function getMoneyClass(serviceType: string) {
  if (isOutgoing(serviceType)) return 'out'
  if (isIncoming(serviceType)) return 'in'
  return ''
}

function formatLogMoney(logItem: any) {
  const amount = unitPrice(logItem.money)
  if (isOutgoing(logItem.serviceType)) return `-${amount}`
  if (isIncoming(logItem.serviceType)) return `+${amount}`
  return amount
}

function getWallet() {
  getWalletLog(params.value).then((res) => {
    if (res.data.success && res.data.result.records.length) {
      depositData.value.push(...res.data.result.records)
    }
  })
}

function loadMore() {
  params.value.pageNumber++
  getWallet()
}
</script>

<style lang="scss" scoped>
.wap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.wrapper-show-money {
  flex-shrink: 0;
  height: 200rpx;
}

.money-view {
  height: 100%;
  padding: 32rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #fff;
  background-image: linear-gradient(
    25deg,
    $main-color,
    $light-color,
    $aider-light-color
  );
}

.money-label {
  font-size: 28rpx;
  opacity: 0.95;
}

.money {
  margin-top: 12rpx;
  max-width: 100%;
  font-size: 56rpx;
  font-weight: 600;
  line-height: 1.2;
  word-break: break-all;
}

.wrapper-tabs {
  flex: 1;
  min-height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.swiper-box,
.swiper-item,
.scroll-v {
  height: 100%;
}

.list-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.view-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.view-item-detail {
  flex: 1;
  min-width: 0;
  padding-right: 24rpx;
}

.item-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}

.view-item-change {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  align-self: center;
  text-align: right;
}

.item-money {
  font-size: 34rpx;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;

  &.in {
    color: $aider-color-green;
  }

  &.out {
    color: #ff5a5f;
  }
}

.item-time {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.3;
  white-space: nowrap;
}
</style>
