<template>
  <view class="tpl-rich-text" :style="wrapperStyle">
    <rich-text :nodes="processedHtml"></rich-text>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `0 ${props.res?.paddingX ?? 12}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: "hidden",
}));

// 防止富文本内图片超宽撑破布局
const processedHtml = computed(() => {
  const html = props.res?.content;
  if (!html) return "";
  return String(html).replace(/<img/gi, '<img style="max-width:100%;height:auto;"');
});
</script>
