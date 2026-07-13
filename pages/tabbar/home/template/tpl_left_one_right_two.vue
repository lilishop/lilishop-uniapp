
<template>

<view class="layout">
    <view class="view-height-150" @click="modelNavigateTo(res.list[0])">
      <u-image width="100%" height="340rpx" class="image-mode" :src="res.list[0].img">
        <template #loading><u-loading-icon></u-loading-icon></template>
      </u-image>
    </view>
    <view class="view-height-150">
      <view class="view-height-75" @click="modelNavigateTo(res.list[1])">
        <u-image width="100%" height="170rpx" class="image-mode" :src="res.list[1].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
      <view class="view-height-75" @click="modelNavigateTo(res.list[2])">
        <u-image width="100%" height="170rpx" class="image-mode" :src="res.list[2].img" alt>
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
.layout {
  display: flex;
  align-items: center;
  justify-content: center;

  background-size: cover;
}
</style>