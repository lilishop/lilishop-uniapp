<template>
  <view class="bind-page"></view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import {
  resolveDistributionIdFromScene,
  tryBindDistribution,
} from '@/utils/distributionBind.js'

onLoad(async (options) => {
  let distributionId = (options?.distributionId as string) || ''

  if (options?.scene) {
    distributionId = await resolveDistributionIdFromScene(String(options.scene))
  }

  if (distributionId) {
    await tryBindDistribution(distributionId)
  }

  uni.switchTab({ url: '/pages/tabbar/home/index' })
})
</script>

<style lang="scss" scoped>
.bind-page {
  min-height: 100vh;
  background: #fff;
}
</style>
