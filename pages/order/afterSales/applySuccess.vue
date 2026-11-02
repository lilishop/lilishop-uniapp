<template>
  <view :style="themeStyle" class="apply-success-page">
    <u-navbar
      title="提交成功"
      :border="false"
      :fixed="true"
      :placeholder="true"
      :auto-back="false"
      @leftClick="handleBack"
    ></u-navbar>

    <view class="page-body">
      <!-- 核心状态卡片 -->
      <view class="result-card">
        <view class="icon-halo">
          <view class="icon-circle">
            <u-icon name="checkmark" size="52rpx" color="#ffffff"></u-icon>
          </view>
        </view>

        <view class="success-title">售后申请提交成功</view>
        <view class="success-sub">商家将尽快为您审核处理，请留意消息通知</view>

        <view class="btn-group">
          <view class="action-btn btn-outline" @click="navigateToHome()">
            回到主页
          </view>
          <view class="action-btn btn-primary" @click="navigateToAfterSales()">
            查看记录
          </view>
        </view>
      </view>

      <!-- 温馨提示卡片 -->
      <view class="tips-card">
        <view class="tips-header">
          <view class="tips-bar"></view>
          <text class="tips-title">温馨提示</text>
        </view>
        <view class="tips-list">
          <view class="tip-item">
            <view class="tip-dot"></view>
            <text class="tip-text">商品寄回地址将在商家审核通过后，在「我的订单 - 售后」详情中展示。</text>
          </view>
          <view class="tip-item">
            <view class="tip-dot"></view>
            <text class="tip-text">提交服务单后，售后专员可能与您电话沟通，请保持手机畅通。</text>
          </view>
          <view class="tip-item">
            <view class="tip-dot"></view>
            <text class="tip-text">售后处理完成后，退款金额将原路退回至您的原支付账户中。</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import {
  prefetchMpMessageTemplates,
  subscribeMpMessageByScenes,
} from '@/js_sdk/lili-pay/wx-pay.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

onLoad(() => {
  // #ifdef MP-WEIXIN
  prefetchMpMessageTemplates()
  // #endif
})

function handleBack() {
  const doBack = () => {
    uni.navigateBack({
      fail: () => {
        uni.redirectTo({
          url: '/pages/order/myOrder?status=5',
        })
      },
    })
  }
  // #ifdef MP-WEIXIN
  subscribeMpMessageByScenes(['AFTER_SALE_AUDIT'], doBack)
  // #endif
  // #ifndef MP-WEIXIN
  doBack()
  // #endif
}

function navigateToAfterSales() {
  const goAfterSales = () => {
    uni.redirectTo({
      url: '/pages/order/myOrder?status=5',
    })
  }
  // #ifdef MP-WEIXIN
  subscribeMpMessageByScenes(['AFTER_SALE_AUDIT'], goAfterSales)
  // #endif
  // #ifndef MP-WEIXIN
  goAfterSales()
  // #endif
}

function navigateToHome() {
  const goHome = () => {
    uni.switchTab({
      url: '/pages/tabbar/home/index',
    })
  }
  // #ifdef MP-WEIXIN
  subscribeMpMessageByScenes(['AFTER_SALE_AUDIT'], goHome)
  // #endif
  // #ifndef MP-WEIXIN
  goHome()
  // #endif
}
</script>

<style lang="scss" scoped>
.apply-success-page {
  min-height: 100vh;
  background: #f5f6fa;
  box-sizing: border-box;
}

.page-body {
  padding: 28rpx 24rpx 60rpx;
}

.result-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 64rpx 40rpx 52rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(17, 30, 79, 0.04);
}

.icon-halo {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 107, 53, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-circle {
  width: 104rpx;
  height: 104rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $main-color 0%, $light-color 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(229, 50, 56, 0.25);
}

.success-title {
  margin-top: 32rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #1d2129;
  letter-spacing: 0.5rpx;
}

.success-sub {
  margin-top: 12rpx;
  font-size: 25rpx;
  color: #86909c;
  text-align: center;
}

.btn-group {
  margin-top: 48rpx;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  box-sizing: border-box;
  transition: opacity 0.15s;

  &:active {
    opacity: 0.85;
  }
}

.btn-primary {
  background: linear-gradient(135deg, $main-color 0%, $light-color 100%);
  color: #ffffff;
  box-shadow: 0 6rpx 16rpx rgba(229, 50, 56, 0.22);
}

.btn-outline {
  background: #fff6f3;
  color: $main-color;
  border: 2rpx solid rgba(229, 50, 56, 0.28);
}

.tips-card {
  margin-top: 24rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 32rpx 32rpx 36rpx;
  box-shadow: 0 4rpx 20rpx rgba(17, 30, 79, 0.03);
}

.tips-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.tips-bar {
  width: 6rpx;
  height: 26rpx;
  border-radius: 4rpx;
  background: linear-gradient(180deg, $main-color 0%, $light-color 100%);
  margin-right: 14rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1d2129;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-item {
  display: flex;
  align-items: flex-start;
}

.tip-dot {
  flex-shrink: 0;
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #c9cdd4;
  margin-top: 14rpx;
  margin-right: 16rpx;
}

.tip-text {
  flex: 1;
  font-size: 25rpx;
  line-height: 1.65;
  color: #4e5969;
}
</style>
