<template>
  <view class="page">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <distribution-goods-share
      v-else
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
import { assertActiveDistributor } from '@/utils/distributionStatus'

const query = ref<Record<string, string>>({})
const pageReady = ref(false)

onLoad((options) => {
  query.value = (options || {}) as Record<string, string>
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
  })
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}
</style>
