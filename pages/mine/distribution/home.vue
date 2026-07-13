<template>
  <view>
    <view class="nav-list">
      <view class="total">可提现金额</view>
      <view class="price">{{ unitPrice(distributionData.canRebate) }}</view>
      <view class="frozen">冻结金额{{ unitPrice(distributionData.commissionFrozen) }}</view>
    </view>
    <view class="nav">
      <view class="nav-item">
        <u-icon
          size="50"
          @click="navigateTo(`/pages/mine/distribution/list?id=${distributionData.id}&name=${distributionData.memberName}`)"
          color="#ff6b35"
          name="bag-fill"
        ></u-icon>
        <view>分销商品</view>
      </view>
      <view
        class="nav-item"
        @click="navigateTo(`/pages/mine/distribution/history?type=0&id=${distributionData.id}&name=${distributionData.memberName}`)"
      >
        <u-icon size="50" color="#ff6b35" name="order"></u-icon>
        <view>分销业绩</view>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/mine/distribution/history?type=1')">
        <u-icon size="50" color="#ff6b35" name="red-packet-fill"></u-icon>
        <view>提现记录</view>
      </view>
      <view class="nav-item" @click="navigateTo('/pages/mine/distribution/withdrawal')">
        <u-icon size="50" color="#ffc71c" name="rmb-circle-fill"></u-icon>
        <view>提现</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { distribution } from '@/api/goods'
import { unitPrice } from '@/utils/filters.js'

const store = useStore()
const distributionData = ref<Record<string, any>>({})

onShow(() => {
  fetchDistributionInfo()
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function fetchDistributionInfo() {
  uni.showLoading({ title: '加载中' })
  distribution().then((res) => {
    if (res.data.result) {
      distributionData.value = res.data.result
    }
    hideLoadingIfNeeded()
  })
}
</script>

<style lang="scss" scoped>
.nav {
  background: #fff;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
}
.nav-list {
  color: #fff;
  padding: 40rpx 0;
  background: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
}
.total {
  padding: 10rpx 0;
  text-align: center;
  font-size: 28rpx;
  opacity: 0.8;
}
.frozen {
  text-align: center;
  font-size: 24rpx;
  opacity: 0.8;
}
.price {
  text-align: center;
  color: #fff;
  font-size: 50rpx;
}
.nav-item {
  height: 240rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  width: 33%;
}
</style>
