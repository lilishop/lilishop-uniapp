<template>
  <view>
    <u-popup v-model:show="show" mode="bottom" height="800rpx" border-radius="14">
      <view class="wrapper">
        <view class="down-goods-tips">该商品已下架</view>
        <scroll-view scroll-y="true" style="height: 670rpx">
          <goodsRecommend title="其他商品" />
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import goodsRecommend from "@/components/m-goods-recommend/index.vue"

const show = ref(true)
</script>

<style lang="scss" scoped>
.down-goods-tips {
  font-size: 36rpx;
  text-align: center;
  font-weight: bold;
  padding: 40rpx 0;
}
</style>
