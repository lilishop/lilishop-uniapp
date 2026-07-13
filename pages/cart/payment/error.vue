<template>
  <view class="error-page">
    <u-navbar title="支付失败" :border="false" :fixed="true" :placeholder="true" :auto-back="true"></u-navbar>
    <view class="error-content">
      <u-icon name="close-circle-fill" color="#f56c6c" size="120"></u-icon>
      <text class="error-title">支付失败</text>
      <text class="error-desc">{{ errorMessage || '支付过程中出现错误，请重试' }}</text>
      <view class="btn-group">
        <u-button type="primary" text="返回订单" @click="goBack"></u-button>
        <u-button type="warning" text="去支付" @click="rePay"></u-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const errorMessage = ref('')
const orderSn = ref('')

onLoad((options: any) => {
  if (options) {
    errorMessage.value = options.message || ''
    orderSn.value = options.orderSn || ''
  }
})

function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/tabbar/user/my' })
    }
  })
}

function rePay() {
  if (orderSn.value) {
    uni.navigateTo({
      url: `/pages/cart/payment/payOrder?orderSn=${orderSn.value}`
    })
  } else {
    goBack()
  }
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  background: #fff;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
}

.error-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-top: 40rpx;
}

.error-desc {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
  text-align: center;
}

.btn-group {
  display: flex;
  gap: 24rpx;
  margin-top: 60rpx;
  width: 100%;

  :deep(.u-button) {
    flex: 1;
  }
}
</style>
