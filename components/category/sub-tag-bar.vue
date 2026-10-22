<template>
  <scroll-view scroll-x scroll-with-animation class="tag-bar" :scroll-into-view="intoView">
    <view
      v-for="item in list"
      :key="item.id"
      :id="'tb-' + item.id"
      class="tag-item"
      :class="{ active: item.id === currentId }"
      @click="$emit('change', item)"
    >
      {{ item.name }}
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  list?: any[]
  currentId?: string | number | null
}>(), {
  list: () => [],
  currentId: null
})

defineEmits(['change'])

const intoView = computed(() =>
  props.currentId != null ? 'tb-' + props.currentId : ''
)
</script>

<style lang="scss" scoped>
.tag-bar {
  white-space: nowrap;
  width: 100%;
  background: #ffffff;
  padding: 12rpx 16rpx 10rpx;
  border-bottom: 1rpx solid #f6f6f6;
  box-sizing: border-box;
  flex-shrink: 0;
}
.tag-item {
  display: inline-block;
  padding: 6rpx 22rpx;
  margin-right: 12rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f6f8;
  border-radius: 24rpx;
  line-height: 1.35;
  transition: all 0.2s ease;

  &.active {
    color: #ffffff;
    background: $light-color;
    font-weight: 500;
  }
}
</style>
