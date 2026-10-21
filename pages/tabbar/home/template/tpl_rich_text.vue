<template>
  <view class="tpl-rich-text" :style="wrapperStyle">
    <rich-text :nodes="processedHtml"></rich-text>
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
    padding: `0 ${res.paddingX ?? 12}rpx`,
    marginBottom: `${res.pageGap ?? 0}rpx`,
    borderRadius: `${res.borderRadius ?? 0}rpx`,
    overflow: "hidden",
  };
});

// 防止富文本内图片超宽撑破布局
const processedHtml = computed(() => {
  const html = props.res?.content;
  if (!html) return "";
  return String(html).replace(/<img/gi, '<img style="max-width:100%;height:auto;"');
});
</script>
