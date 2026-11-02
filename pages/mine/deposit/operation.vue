<template>
  <view :style="themeStyle" class="page">
    <u-navbar
      title="余额"
      :auto-back="false"
      :placeholder="true"
      :border="false"
      @leftClick="back"
    ></u-navbar>

    <view class="page-body">
      <view class="balance-card">
        <view class="deposit">预存款金额</view>
        <view class="money">￥{{ unitPrice(walletNum) }}</view>
        <view class="operation-btns">
          <view
            class="operation-btn light"
            @click="navigateTo('/pages/mine/deposit/withdrawal')"
          >提现</view>
          <view
            class="operation-btn primary"
            @click="navigateTo('/pages/mine/deposit/recharge')"
          >充值</view>
        </view>
      </view>

      <view class="menu-list">
        <view class="list-item" @click="navigateTo('/pages/mine/deposit/index')">
          <text class="list-label">预存款明细</text>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </view>
        <view class="list-item" @click="navigateTo('/pages/mine/deposit/withdrawApply')">
          <text class="list-label">提现记录</text>
          <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getUserWallet } from '@/api/members'
import { isLogin, navigateToLogin, unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import {
  prefetchMpMessageTemplates,
  subscribeMpMessageByScenes,
} from '@/js_sdk/lili-pay/wx-pay.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const walletNum = ref(0)

onShow(async () => {
  if (isLogin('auth')) {
    // #ifdef MP-WEIXIN
    prefetchMpMessageTemplates()
    // #endif
    const result = await getUserWallet()
    walletNum.value = result.data.result.memberWallet
  } else {
    navigateToLogin('redirectTo')
  }
})

function back() {
  const doBack = () => {
    uni.switchTab({ url: '/pages/tabbar/user/my' })
  }
  // #ifdef MP-WEIXIN
  subscribeMpMessageByScenes(['WALLET_CHANGE'], doBack)
  // #endif
  // #ifndef MP-WEIXIN
  doBack()
  // #endif
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-body {
  padding: 24rpx;
}

.balance-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx 32rpx 40rpx;
  text-align: center;
}

.deposit {
  font-size: 28rpx;
  color: #999;
}

.money {
  margin: 24rpx 0 40rpx;
  font-size: 64rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 2rpx;
}

.operation-btns {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
}

.operation-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  text-align: center;
}

.light {
  background: #fdf2ee;
  color: $light-color;
  border: 1px solid rgba(238, 109, 65, 0.25);
}

.primary {
  background: $light-color;
  color: #fff;
}

.menu-list {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.list-label {
  font-size: 30rpx;
  color: #333;
}
</style>
