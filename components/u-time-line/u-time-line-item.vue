<template>
  <view class="u-time-line-item">
    <view class="u-time-line-item__node" :style="nodeStyle">
      <slot name="node">
        <view class="u-time-line-item__dot" :style="{ backgroundColor: bgColor }"></view>
      </slot>
    </view>
    <view class="u-time-line-item__content">
      <slot name="content" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  nodeTop?: string | number
  bgColor?: string
}>()

const nodeStyle = computed(() => {
  if (props.nodeTop === '' || props.nodeTop === null || props.nodeTop === undefined) {
    return {}
  }
  const top = typeof props.nodeTop === 'number' ? `${props.nodeTop}rpx` : props.nodeTop
  return { top }
})
</script>

<style lang="scss" scoped>
.u-time-line-item {
  display: flex;
  flex-direction: row;
  position: relative;
  padding-bottom: 32rpx;

  &:last-child {
    padding-bottom: 0;
  }

  &__node {
    position: relative;
    width: 32rpx;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
    z-index: 1;
  }

  &__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background-color: #ddd;
  }

  &__content {
    flex: 1;
    padding-left: 12rpx;
  }

  &::before {
    content: '';
    position: absolute;
    left: 15rpx;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #ddd;
  }

  &:last-child::before {
    bottom: auto;
    height: 16rpx;
  }
}
</style>
