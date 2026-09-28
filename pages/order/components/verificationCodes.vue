<template>
  <view v-if="items.length" class="verify-codes">
    <view v-for="(item, index) in items" :key="item.key" class="verify-code">
      <text class="verify-code__label">{{ index === 0 ? '核销码' : '' }}</text>
      <text class="verify-code__text" :class="{ 'is-struck': item.struck }">{{ item.code }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<style lang="scss" scoped>
.verify-code {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  margin-bottom: 12rpx;
  line-height: 1.5;
}
.verify-code__label {
  color: #999;
  width: 140rpx;
  flex-shrink: 0;
}
.verify-code__text {
  flex: 1;
  min-width: 0;
  font-weight: bold;
  letter-spacing: 2rpx;
  color: #333;
}
.verify-code__text.is-struck {
  color: #999;
  font-weight: normal;
  text-decoration: line-through;
}
</style>
