<template>
  <view class="wrapper" :style="themeStyle">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else>
    <view class="feedBack-box">
      <view class="box-title">提现金额</view>
      <view class="amount-row">
        <text class="currency">￥</text>
        <u-input
          v-model="price"
          type="digit"
          border="none"
          placeholder="请输入提现金额"
          class="amount-input"
        />
      </view>
      <view class="amount-extra">
        <view class="all-btn" @click="fillAllAmount">全部</view>
        <view class="balance-tip">
          可提现金额
          <text class="balance-value">{{ unitPrice(distributionData.canRebate) }}</text>
          元
        </view>
      </view>
    </view>

    <view class="submit" @click="submitWithdraw">提现</view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { useStore } from '@/store'
import { cash } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'
import { unitPrice } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const { proxy } = getCurrentInstance()!

const themeStyle = computed(() => getThemeStyle(store.state.theme))
const price = ref('')
const pageReady = ref(false)
const distributionData = ref<Record<string, any>>({})

onMounted(() => {
  fetchDistributionInfo()
})

function fetchDistributionInfo() {
  assertActiveDistributor().then((result) => {
    if (!result) {
      return
    }
    distributionData.value = result
    pageReady.value = true
  })
}

function submitWithdraw() {
  const amount = String(price.value != null ? price.value : '')
  if (proxy.$u.test.amount(parseInt(amount))) {
    cash({ price: amount }).then((res) => {
      if (res.data.success) {
        uni.showToast({ title: '提现成功!', duration: 2000, icon: 'none' })
        setTimeout(() => {
          uni.navigateBack({ delta: 1 })
        }, 1000)
      }
    })
  } else {
    uni.showToast({ title: '请输入正确金额', duration: 2000, icon: 'none' })
  }
}

function fillAllAmount() {
  price.value =
    distributionData.value.canRebate != null
      ? distributionData.value.canRebate
      : ''
}
</script>

<style lang="scss">
page {
  background: #f8f8f8;
}
</style>

<style lang="scss" scoped>
@import '@/pages/passport/entry/seller/entry-form.scss';

.wrapper {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 20rpx 24rpx 40rpx;
  background: #f8f8f8;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}

.feedBack-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
}

.box-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.amount-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 24rpx;
  padding: 16rpx 24rpx;
  background: #fafafa;
  border-radius: 12rpx;
}

.currency {
  flex-shrink: 0;
  margin-right: 16rpx;
  font-size: 56rpx;
  font-weight: 600;
  line-height: 1;
  color: #333;
}

.amount-input {
  flex: 1;
  min-width: 0;
}

:deep(.amount-input .u-input) {
  padding: 0 !important;
}

:deep(.amount-input .u-input__content) {
  background: transparent !important;
}

:deep(.amount-input .u-input__content__field-wrapper__field) {
  height: 72rpx !important;
  min-height: 72rpx !important;
  font-size: 56rpx !important;
  font-weight: 600 !important;
  color: #333 !important;
}

:deep(.amount-input .u-input__content__field-wrapper__field--placeholder) {
  font-size: 32rpx !important;
  font-weight: 400 !important;
  color: #c0c4cc !important;
}

.amount-extra {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
}

.all-btn {
  font-size: 28rpx;
  color: var(--theme-light, #ff6b35);
}

.balance-tip {
  font-size: 24rpx;
  color: #999;
}

.balance-value {
  margin: 0 4rpx;
  color: #333;
}

.submit {
  @include seller-entry-submit;
}
</style>
