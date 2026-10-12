<template>
  <view class="tpl-line" :style="wrapperStyle">
    <view :style="lineStyle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `0 ${props.res?.paddingX ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
}));

const lineStyle = computed(() => ({
  borderTop: `${props.res?.lineHeight ?? 1}rpx ${props.res?.lineStyle || "dashed"} ${props.res?.lineColor || "#979797"}`,
}));
</script>
