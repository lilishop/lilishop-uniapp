<template>
  <view class="tpl-blank" :style="blankStyle"></view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const blankStyle = computed(() => {
  const res = props.res || {};
  const bg =
    res.bgColor1 !== undefined
      ? !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`
      : res.bgColor || "#f5f5f5";
  return {
    background: bg,
    height: `${res.height ?? 10}rpx`,
    margin: `0 ${res.paddingX ?? 0}rpx ${res.pageGap ?? 0}rpx`,
  };
});
</script>
