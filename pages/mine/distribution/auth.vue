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
import {
  checkSelfRecruitEntry,
  DISTRIBUTION_CLOSE_MESSAGE,
  DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
} from '@/utils/distributionStatus'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)

function goJoin() {
  checkSelfRecruitEntry().then((gate) => {
    if (gate === 'distribution_closed') {
      uni.showToast({ title: DISTRIBUTION_CLOSE_MESSAGE, icon: 'none' })
      return
    }
    if (gate === 'entry_closed') {
      uni.showToast({ title: DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE, icon: 'none' })
      return
    }
    uni.redirectTo({ url: '/pages/mine/distribution/join' })
  })
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
