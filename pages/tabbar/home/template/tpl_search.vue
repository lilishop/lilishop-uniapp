<template>
  <view class="layout">
    <view class="search" @click="handleSearch">
      <u-icon name="search"></u-icon>
      <text class="search-text">{{ res.list[0].title }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
const props = defineProps<{ res: any; storeId?: string }>();

function handleSearch() {
  if (props.storeId) {
    uni.navigateTo({
      url: `/pages/navigation/search/searchPage?storeId=${props.storeId}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/navigation/search/searchPage`,
    });
  }
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";

.search {
  width: 100%;
  height: 64rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 10rpx;
  background: #ededed;
  color: #999;
  overflow: hidden;
  box-sizing: border-box;
}

.search-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout {
  display: flex;
  align-items: center;
  width: 100%;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
}
</style>
