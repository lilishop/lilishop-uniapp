<template>
  <view class="layout">
    <view class="menu-list">
      <view
        class="menu-item"
        @click="modelNavigateTo(item)"
        v-for="(item, index) in res.list"
        :key="index"
      >
        <view class="menu-img-wrap">
          <u-image
            width="88rpx"
            height="88rpx"
            class="menu-img"
            :src="item.img"
          >
            <template #loading><u-loading></u-loading></template>
          </u-image>
        </view>
        <view class="menu-title">{{ item.title }}</view>
      </view>
    </view>
  </view>
</template>
<script>
import { modelNavigateTo } from "./tpl";
export default {
  title: "五列菜单",
  props: ["res"],
  data() {
    return {
      modelNavigateTo,
    };
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.menu-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  > .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 20%;
    flex: 0 0 20%;
    box-sizing: border-box;
    margin: 20rpx 0;
    padding: 0 4rpx;
  }
}

.menu-img-wrap {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-img {
  flex-shrink: 0;
}

:deep(.menu-img .u-image) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-title {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.3;
  width: 100%;
  text-align: center;
}
</style>