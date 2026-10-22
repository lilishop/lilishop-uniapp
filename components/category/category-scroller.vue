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
        <view class="cs-icon-box">
          <view class="cs-icon">
            <u-image width="80rpx" height="80rpx" shape="circle" :src="item.image" mode="aspectFill">
              <template #loading><u-loading-icon></u-loading-icon></template>
            </u-image>
          </view>
        </view>
        <text class="cs-name">{{ item.name }}</text>
      </template>
      <template v-else>
        <text class="cs-text-name">{{ item.name }}</text>
        <view class="cs-text-line" v-if="item.id === currentId"></view>
      </template>
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
  props.currentId != null ? 'cs-' + props.currentId : ''
)
</script>

<style lang="scss" scoped>
.cate-scroller {
  white-space: nowrap;
  width: 100%;
  background: #ffffff;
  border-bottom: 1rpx solid #f2f3f5;
  box-sizing: border-box;
  flex-shrink: 0;
}
.cs-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 130rpx;
  padding: 16rpx 6rpx 14rpx;
  vertical-align: top;
  box-sizing: border-box;
  transition: all 0.2s ease;
}
.cs-icon-box {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid transparent;
  box-sizing: border-box;
  background: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.cs-item.active .cs-icon-box {
  border-color: $light-color;
  box-shadow: 0 4rpx 12rpx rgba(255, 102, 0, 0.15);
}
.cs-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  background: #f6f7f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cs-name {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #555;
  max-width: 120rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}
.cs-item.active .cs-name {
  color: $light-color;
  font-weight: 600;
}
.cs-item--text {
  width: auto;
  padding: 18rpx 28rpx;
  position: relative;
}
.cs-text-name {
  font-size: 26rpx;
  color: #666;
  transition: color 0.2s ease;
}
.cs-item--text.active .cs-text-name {
  color: $light-color;
  font-weight: 600;
}
.cs-text-line {
  position: absolute;
  bottom: 6rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 32rpx;
  height: 4rpx;
  border-radius: 2rpx;
  background: $light-color;
}
</style>
