<template>
  <scroll-view scroll-x scroll-with-animation class="cate-scroller" :scroll-into-view="intoView">
    <view
      v-for="item in list"
      :key="item.id"
      :id="'cs-' + item.id"
      class="cs-item"
      :class="{ active: item.id === currentId, 'cs-item--text': mode === 'text' }"
      @click="$emit('change', item)"
    >
      <template v-if="mode === 'icon'">
        <view class="cs-icon">
          <u-image width="88rpx" height="88rpx" shape="circle" :src="item.image">
            <template #loading><u-loading-icon></u-loading-icon></template>
          </u-image>
        </view>
        <text class="cs-name">{{ item.name }}</text>
      </template>
      <text v-else class="cs-text-name">{{ item.name }}</text>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  list?: any[]
  currentId?: string | number | null
  mode?: 'icon' | 'text'
}>(), {
  list: () => [],
  currentId: null,
  mode: 'icon'
})

defineEmits(['change'])

const intoView = computed(() =>
  props.currentId != null ? `cs-${props.currentId}` : ''
)
</script>

<style lang="scss" scoped>
.cate-scroller {
  white-space: nowrap;
  width: 100%;
  background: #fff;
}
.cs-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  padding: 16rpx 0 10rpx;
  vertical-align: top;
}
.cs-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid transparent;
}
.cs-item.active .cs-icon {
  border-color: $light-color;
}
.cs-name {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #333;
  max-width: 110rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cs-item.active .cs-name {
  color: $light-color;
  font-weight: bold;
}
.cs-item--text {
  width: auto;
  padding: 18rpx 24rpx;
}
.cs-text-name {
  font-size: 26rpx;
  color: #333;
}
.cs-item--text.active .cs-text-name {
  color: $light-color;
  font-weight: bold;
}
</style>
