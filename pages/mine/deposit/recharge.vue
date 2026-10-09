<template>
  <view :style="themeStyle" class="page">
    <view class="form-card">
      <view class="title">充值金额</view>
      <view class="amount-row">
        <text class="currency">￥</text>
        <u-input
          v-model="price"
          type="digit"
          border="none"
          placeholder="请输入充值金额"
          input-align="left"
          class="amount-input"
        />
      </view>
    </view>

    <view class="submit" :class="{ disabled: flag }" @click="handlerRecharge">充值</view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { recharge } from '@/api/members'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const price = ref('')
const flag = ref(true)

watch(price, (val) => {
  flag.value = !(Number(val) > 0)
})

async function handlerRecharge() {
  const amount = Number(price.value)
  if (!(amount > 0)) {
    uni.showToast({ title: '请输入充值金额', icon: 'none' })
    return
  }
  const res = await recharge({ price: amount })
  if (res.data.success) {
    uni.navigateTo({
      url: `/pages/cart/payment/payOrder?orderType=RECHARGE&recharge_sn=${res.data.result.rechargeSn}`,
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
}

.title {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 24rpx;
}

.amount-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 0 8rpx;
  border-bottom: 1px solid #f0f0f0;
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

.submit {
  margin-top: 80rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: $light-color;
  color: #fff;
  border-radius: 44rpx;
  text-align: center;
  font-size: 32rpx;

  &.disabled {
    opacity: 0.5;
  }
}
</style>
