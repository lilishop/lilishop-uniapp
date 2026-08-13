<template>
  <view class="redirect-wrap">
    <u-loading mode="circle" />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { getPackage, getExpress } from '@/api/trade.js'

onLoad(async (option) => {
  const orderSn = option?.order_sn
  if (!orderSn) {
    uni.showToast({ title: '订单号缺失', icon: 'none' })
    return
  }

  try {
    const packageRes = await getPackage(orderSn)
    const packages = packageRes?.data?.result || []
    if (packages.length) {
      uni.redirectTo({
        url: `/pages/order/deliverDetail?order_sn=${orderSn}`,
      })
      return
    }

    const traceRes = await getExpress(orderSn)
    if (traceRes?.data?.result) {
      uni.redirectTo({
        url: `/pages/order/deliverDetail?order_sn=${orderSn}`,
      })
      return
    }
  } catch {
    // 降级跳转，由 deliverDetail 统一处理展示
  }

  uni.redirectTo({
    url: `/pages/order/deliverDetail?order_sn=${orderSn}`,
  })
})
</script>

<style lang="scss">
.redirect-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
