<template>
  <scroll-view scroll-y scroll-with-animation class="side-list">
    <view
      v-for="item in list"
      :key="item.id"
      class="side-item"
      :class="{ active: item.id === currentId }"
      @click="$emit('change', item)"
    >
      <view class="active-indicator" v-if="item.id === currentId"></view>
      <text class="side-item-text">{{ item.name }}</text>
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
  width: 176rpx;
  flex-shrink: 0;
  height: 100%;
  background-color: #f6f7f9;
  border-right: 1rpx solid #ebebeb;
  box-sizing: border-box;
}
.side-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 96rpx;
  padding: 16rpx 14rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #666;
  text-align: center;
  position: relative;
  transition: all 0.2s ease;

  &.active {
    font-weight: 600;
    color: $light-color;
    background: #ffffff;
  }
}
.side-item-text {
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}
.active-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 36rpx;
  border-radius: 0 4rpx 4rpx 0;
  background: $light-color;
}
</style>
