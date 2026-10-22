<template>
  <view class="sort-bar">
    <view
      class="sort-item"
      :class="{ active: sort === 'releaseTime' }"
      @click="onClick('releaseTime')"
    >
      <text class="sort-label">综合</text>
    </view>
    <view
      class="sort-item"
      :class="{ active: sort === 'buyCount' }"
      @click="onClick('buyCount')"
    >
      <text class="sort-label">销量</text>
    </view>
    <view
      class="sort-item"
      :class="{ active: sort === 'price' }"
      @click="onClick('price')"
    >
      <text class="sort-label">价格</text>
      <view class="arrows">
        <u-icon
          name="arrow-up-fill"
          size="7"
          :color="sort === 'price' && order === 'asc' ? '#ff6700' : '#bbbbbb'"
        ></u-icon>
        <u-icon
          name="arrow-down-fill"
          size="7"
          :color="sort === 'price' && order === 'desc' ? '#ff6700' : '#bbbbbb'"
        ></u-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  sort?: string
  order?: string
}>(), {
  sort: 'releaseTime',
  order: 'desc'
})

const emit = defineEmits(['change'])

function onClick(type: string) {
  let nextOrder = 'desc'
  if (type === 'price') {
    nextOrder = props.sort === 'price' && props.order === 'desc' ? 'asc' : 'desc'
  }
  emit('change', { sort: type, order: nextOrder })
}
</script>

<style lang="scss" scoped>
.sort-bar {
  display: flex;
  align-items: center;
  height: 68rpx;
  background: #ffffff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f6f6f6;
  box-sizing: border-box;
  flex-shrink: 0;
}
.sort-item {
  display: flex;
  align-items: center;
  margin-right: 44rpx;
  font-size: 26rpx;
  color: #666;
  height: 100%;
  cursor: pointer;
  transition: color 0.2s ease;

  &.active {
    color: $light-color;
    font-weight: 600;
  }
}
.sort-label {
  font-size: 26rpx;
}
.arrows {
  display: flex;
  flex-direction: column;
  margin-left: 8rpx;
  gap: 2rpx;
}
</style>
