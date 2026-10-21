
<template>

<view class="layout" :style="[wrapperStyle, gapStyle]">
    <view class="view-height-150" :style="imgStyle" @click="modelNavigateTo(res.list[0])">
      <u-image width="100%" height="340rpx" class="image-mode" :src="res.list[0].img">
        <template #loading><u-loading-icon></u-loading-icon></template>
      </u-image>
    </view>
    <view class="view-height-150">
      <view class="view-height-75" :style="imgStyle" @click="modelNavigateTo(res.list[1])">
        <u-image width="100%" height="170rpx" class="image-mode" :src="res.list[1].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
      <view class="view-height-75" :style="imgStyle" @click="modelNavigateTo(res.list[2])">
        <u-image width="100%" height="170rpx" class="image-mode" :src="res.list[2].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo, cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./tpl";

const props = defineProps<{ res: any }>();

const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const gapStyle = computed(() => cubeGapStyle(props.res));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  display: flex;
  align-items: center;
  justify-content: center;

  background-size: cover;
}
.view-height-150 {
  min-width: 0;
}
</style>
