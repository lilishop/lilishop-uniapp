<template>
  <view class="layout" :style="wrapperStyle">
    <view class="flex-two" :style="gapStyle">
      <view class="flex-item" :style="imgStyle" @click="modelNavigateTo(res.list[0])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[0].img" alt>
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </view>
      <view class="flex-item" :style="imgStyle" @click="modelNavigateTo(res.list[1])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[1].img" alt>
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
.flex-two {
  width: 100%;
  display: flex;
  overflow: hidden;
}
.flex-item {
  flex: 1;
  min-width: 0;
}
</style>
