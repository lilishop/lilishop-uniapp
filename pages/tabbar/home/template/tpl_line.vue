<template>
  <view class="tpl-line" :style="wrapperStyle">
    <view :style="lineStyle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const wrapperStyle = computed(() => {
  const res = props.res || {};
  const bg =
    res.bgColor1 !== undefined
      ? !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`
      : res.bgColor || "#FFFFFF";
  return {
    background: bg,
    padding: `0 ${res.paddingX ?? 0}rpx`,
    marginBottom: `${res.pageGap ?? 0}rpx`,
  };
});

const lineStyle = computed(() => ({
  borderTop: `${props.res?.lineHeight ?? 1}rpx ${props.res?.lineStyle || "dashed"} ${props.res?.lineColor || "#979797"}`,
}));
</script>
