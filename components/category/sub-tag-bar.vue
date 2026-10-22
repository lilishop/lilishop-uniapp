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
  props.currentId != null ? `tb-${props.currentId}` : ''
)
</script>

<style lang="scss" scoped>
.tag-bar {
  white-space: nowrap;
  width: 100%;
  background: #fff;
  padding: 8rpx 0;
}
.tag-item {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  font-size: 24rpx;
  color: #333;
  background: #f5f5f5;
  border-radius: 24rpx;
  &.active {
    color: #fff;
    background: $light-color;
    font-weight: bold;
  }
}
</style>
