<template>
  <view class="layout">
    <view class="flex-two">
      <view class="flex-item" @click="modelNavigateTo(res.list[0])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[0].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
      <view class="flex-item" @click="modelNavigateTo(res.list[1])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[1].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { modelNavigateTo } from "./tpl";

defineProps<{ res: any }>();
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.flex-two {
  width: 100%;
  display: flex;
  overflow: hidden;
}
.flex-item {
  width: 50%;
}
</style>