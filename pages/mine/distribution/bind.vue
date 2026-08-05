<template>
  <view class="bind-page"></view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import storage from '@/utils/storage'
import { getGoodsDistribution } from '@/api/distribution'

const store = useStore()

onLoad(async (options) => {
  let distributionId = (options?.distributionId as string) || ''

  if (options?.scene) {
    const scene = decodeURIComponent(String(options.scene))
    const parts = scene.split(',')
    if (parts[0] === 'bind' && parts[1]) {
      distributionId = parts[1]
    }
  }

  if (distributionId) {
    store.state.distributionId = distributionId
    if (storage.getAccessToken()) {
      try {
        await getGoodsDistribution(distributionId)
      } catch (error) {
        console.warn('bind distribution failed', error)
      }
    }
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
