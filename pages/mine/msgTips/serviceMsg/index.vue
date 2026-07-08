<template>
  <view class="container">
    <view class="list-cell b-b m-t" hover-class="cell-hover" :hover-stay-time="50">
      <u-row gutter="12" justify="start">
        <u-col span="2">
          <img
            class="list_img"
            src="https://web-assets.fancynode.com.cn/web_v1/images/pxcook/features/icon-cloud.png"
            alt
          />
        </u-col>
        <u-col span="7">
          <p class="tit_title">
            <img
              src="https://web-assets.fancynode.com.cn/web_v1/images/pxcook/features/icon-cloud.png"
              alt
            />
            在线客服
          </p>
          <p class="tit_tips">查看回复客服的消息</p>
        </u-col>
        <u-col span="3">
          <text class="cell-more">
            <p class="msgTime">2020-12-12</p>
            <span class="redBox">55</span>
          </text>
        </u-col>
      </u-row>
    </view>
  </view>
</template>

<script setup lang="ts">
// 占位页，后续接入客服消息
</script>

<style scoped lang="scss">
.msgTime {
  font-size: 13px;
}
page {
  background: $page-color-base;
}
.list_img {
  width: 100%;
  height: 100%;
  vertical-align: middle;
  border-radius: 0.4em;
}
.redBox {
  padding: 10rpx 12rpx;
  display: inline-block;
  text-align: center;
  font-size: 12px;
  line-height: 1em;
  width: 1em;
  height: 1em;
  background: #ed6533;
  border-radius: 50%;
  color: #fff;
}
.tit_title,
.tit_tips {
  margin-left: 8rpx;
}
.tit_title {
  color: $u-main-color;
  > img {
    vertical-align: middle;
    margin-right: 10rpx;
    width: 40rpx;
    height: 40rpx;
  }
}
.tit_tips {
  color: $u-tips-color;
}
.list-cell {
  align-items: baseline;
  padding: 20rpx 30rpx;
  line-height: 60rpx;
  position: relative;
  background: #fff;
  justify-content: center;
  &.cell-hover {
    background: #fafafa;
  }
  &.m-t {
    margin-top: 16rpx;
  }
  .cell-more {
    text-align: right;
    margin-top: 10rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: baseline;
    font-size: $font-lg;
    color: $font-color-light;
    margin-left: 10rpx;
  }
}
</style>
