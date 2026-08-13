<template>
  <view class="wrapper">
    <view class="tips">
      <view>分销员申请已改为招募流程</view>
      <view>请前往招募页面提交申请</view>
    </view>
    <u-button :customStyle="{ background: lightColor, color: '#fff', marginTop: '40rpx' }" @click="goJoin">
      前往招募页
    </u-button>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)

function goJoin() {
  uni.redirectTo({ url: '/pages/mine/distribution/join' })
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 32rpx;
}
.tips {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}
</style>
