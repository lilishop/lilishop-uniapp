<template>
  <view class="page">
    <distribution-goods-share
      :sku-id="query.skuId"
      :goods-id="query.goodsId"
      :distribution-id="query.distributionId"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import DistributionGoodsShare from '@/components/distribution-goods-share/index.vue'

const query = ref<Record<string, string>>({})

onLoad((options) => {
  query.value = (options || {}) as Record<string, string>
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
}
</style>
