<template>
  <scroll-view scroll-y scroll-with-animation class="side-list">
    <view
      v-for="item in list"
      :key="item.id"
      class="side-item"
      :class="{ active: item.id === currentId }"
      @click="$emit('change', item)"
    >
      {{ item.name }}
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  list?: any[]
  currentId?: string | number | null
}>(), {
  list: () => [],
  currentId: null
})

defineEmits(['change'])
</script>

<style lang="scss" scoped>
.side-list {
  width: 160rpx;
  flex-shrink: 0;
  height: 100%;
  background-color: #f7f7f7;
}
.side-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 90rpx;
  padding: 10rpx 8rpx;
  box-sizing: border-box;
  font-size: 24rpx;
  color: #333;
  text-align: center;
  &.active {
    font-weight: bold;
    color: $light-color;
    background: #fff;
  }
}
</style>
