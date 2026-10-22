<template>
  <view class="sort-bar">
    <view
      class="sort-item"
      :class="{ active: sort === 'releaseTime' }"
      @click="onClick('releaseTime')"
    >
      综合
    </view>
    <view
      class="sort-item"
      :class="{ active: sort === 'buyCount' }"
      @click="onClick('buyCount')"
    >
      销量
    </view>
    <view
      class="sort-item"
      :class="{ active: sort === 'price' }"
      @click="onClick('price')"
    >
      <text>价格</text>
      <view class="arrows">
        <u-icon
          name="arrow-up"
          size="10"
          :color="sort === 'price' && order === 'asc' ? '#ff6700' : '#c5c5c5'"
        ></u-icon>
        <u-icon
          name="arrow-down"
          size="10"
          :color="sort === 'price' && order === 'desc' ? '#ff6700' : '#c5c5c5'"
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
  height: 72rpx;
  background: #fff;
  padding: 0 20rpx;
}
.sort-item {
  display: flex;
  align-items: center;
  margin-right: 40rpx;
  font-size: 26rpx;
  color: #333;
  &.active {
    color: $light-color;
    font-weight: bold;
  }
}
.arrows {
  display: flex;
  flex-direction: column;
  margin-left: 6rpx;
}
</style>
