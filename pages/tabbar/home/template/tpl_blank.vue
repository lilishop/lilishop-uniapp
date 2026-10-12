<template>
  <view class="tpl-blank" :style="blankStyle"></view>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const blankStyle = computed(() => ({
  background: props.res?.bgColor || "#f5f5f5",
  height: `${props.res?.height ?? 10}rpx`,
  margin: `0 ${props.res?.paddingX ?? 0}rpx ${props.res?.pageGap ?? 10}rpx`,
}));
</script>
