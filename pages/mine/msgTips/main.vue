<template>
  <view class="container">
    <view class="list-cell b-b m-t" hover-class="cell-hover" :hover-stay-time="50">
      <u-row gutter="12" justify="start" @click="navigateTo('/pages/mine/msgTips/sysMsg/index')">
        <u-col span="2" class="uCol" style="text-align: center">
          <image class="img" src="/static/mine/setting.png"></image>
        </u-col>
        <u-col span="7">
          <p class="tit_title">系统消息</p>
          <p class="tit_tips">查看系统消息</p>
        </u-col>
        <u-col span="3">
          <view class="cell-more">
            <u-tag
              size="mini"
              v-if="unreadCount.system_num > 0"
              shape="circle"
              mode="dark"
              type="error"
              :text="String(unreadCount.system_num)"
            ></u-tag>
            <span class="yticon icon-you"></span>
          </view>
        </u-col>
      </u-row>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getNoReadMessageNum } from '@/api/members.js'

const unreadCount = ref<Record<string, number>>({ system_num: 0 })

onLoad(() => {
  fetchUnreadCount()
})

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function fetchUnreadCount() {
  getNoReadMessageNum().then((response) => {
    unreadCount.value = response.data || { system_num: 0 }
  })
}
</script>

<style scoped lang="scss">
.uCol {
  display: flex;
  justify-content: center !important;
}
.img {
  width: 60rpx;
  height: 60rpx;
}
.container {
  background: #f9f9f9;
}
::v-deep .u-col-2 {
  height: 60px;
  line-height: 60px;
  text-align: center !important;
}
.tit_title {
  color: $u-main-color;
}
.tit_tips {
  color: $u-tips-color;
}
.u-col-3 {
  text-align: right !important;
  padding-right: 20rpx !important;
}
.list-cell {
  background: #fff;
  align-items: baseline;
  padding: 20rpx 0;
  line-height: 60rpx;
  justify-content: center;
  &.cell-hover {
    background: #fafafa;
  }
  &.m-t {
    margin-top: 16rpx;
  }
  .cell-more {
    height: 60rpx;
    text-align: right;
    font-size: $font-lg;
    color: $font-color-light;
  }
}
</style>
