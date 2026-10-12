<template>
  <view class="layout" :style="wrapperStyle">
    <view class="flex-one" :style="contentStyle">
      <u-image
        v-if="!hasHotZone"
        @click="modelNavigateTo(res.list[0])"
        width="100%"
        mode="aspectFit"
        height="280rpx"
        :src="res.list[0].img"
        alt=""
      ></u-image>
      <hotzone v-else :res="res"></hotzone>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo } from "./tpl";
import hotzone from "./tpl_hot_zone.vue";

const props = defineProps<{ res: any }>();

const hasHotZone = computed(() => {
  const zoneInfo = props.res?.list?.[0]?.zoneInfo;
  return Array.isArray(zoneInfo) ? zoneInfo.length > 0 : !!zoneInfo;
});

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor ?? "transparent",
  padding: `${props.res?.paddingTop ?? 0}rpx ${props.res?.paddingX ?? 0}rpx ${props.res?.paddingBottom ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 0}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: (props.res?.borderRadius ?? 0) > 0 ? "hidden" : "visible",
}));

const contentStyle = computed(() => ({
  borderRadius: `${props.res?.imgRadius ?? 0}rpx`,
}));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.flex-one {
  width: 100%;
  display: block;
  overflow: hidden;
}
</style>
