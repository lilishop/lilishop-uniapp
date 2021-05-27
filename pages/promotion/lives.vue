<template>
  <div class="box">
    <u-navbar class="navbar">
      <view class="slot-wrap">
        <u-search placeholder="搜索直播间" v-model="keyword"></u-search>
      </view>
    </u-navbar>
    <!-- 轮播图 -->
    <u-swiper class="swiper" :effect3d="true" :list="swiperImg">

    </u-swiper>
    <u-tabs :is-scroll="false" :active-color="activeColor" inactive-color="#606266" ref="tabs" :list="tabs"></u-tabs>

    <div class="wrapper">
      <!-- 直播中 全部 直播回放 -->
      <div class="live-list">
        <div class="live-cover-img">
          <div class="tips">
            <div class="live-box">
              <image class="live-gif" src="./static/live.gif"></image>
            </div>
            <span> 直播中</span>
          </div>
          <div class="bg"></div>
          <image class="zan" src="./static/zan.gif" mode="" />
          <u-image width="326" height="354" src="https://lilishop-oss.oss-cn-beijing.aliyuncs.com/fe5b8167b0264c53836d08a6a7003cf0.jpeg" />
        </div>
        <div class="live-goods">
          <image src="./static/live.png" class="live-icon" mode="" />
          <div class="live-goods-name">
            甄选家电好物，尽在超值5月
          </div>
          <div class="live-store">
            <u-image shape="circle" width="50" height="50" src="https://gfs14.gomein.net.cn/T11wElB7Cv1RCvBVdK_360.jpg?v=1" />
            <span class="wes">lilishop</span>
          </div>
          <div class="live-goods-list">
            <div class="live-goods-item">
              <u-image border-radius="20" height="140"></u-image>
            </div>
            <div class="live-goods-item">
              <u-image border-radius="20" height="140"></u-image>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeColor: this.$lightColor,

      // 标签栏
      tabs: [
        {
          name: "直播中",
        },
        {
          name: "全部",
        },

        {
          name: "回放",
        },
      ],
      // 导航栏的配置
      background: {
        background: "#ff9f28",
      },
      //轮播图滚动的图片
      swiperImg: [
        {
          image:
            "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/8e33ab68ef734558bdc158d6b1b1451f.png",
        },
        {
          image:
            "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/5ec999c942374e849d085071b4d20a19.jpeg",
        },
        {
          image:
            "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/48d789cb9c864b7b87c1c0f70996c3e8.jpeg",
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.slot-wrap {
  display: flex;
  align-items: center;

  /* 如果您想让slot内容占满整个导航栏的宽度 */
  flex: 1;
  /* 如果您想让slot内容与导航栏左右有空隙 */
  /* padding: 0 30rpx; */
}
.wrapper {
  padding: 0 24rpx;
}
.live-list {
  display: flex;
  overflow: hidden;
  border-radius: 20rpx;
  flex-wrap: wrap;
  background: #fff;

  margin: 20rpx 0;
}
.live-cover-img {
  position: relative;
}

.live-goods {
  position: relative;
  flex: 1;
  padding: 16rpx 24rpx 24rpx;
}
.live-goods-name {
  height: 84rpx;
  font-weight: bold;
  font-size: 30rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.live-store {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
  overflow: hidden;
  width: calc(100% - 50rpx);
  > span {
    color: #999;
    margin-left: 20rpx;
  }
}
.live-gif {
  width: 20rpx;
  height: 20rpx;
}
.live-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40rpx;
  margin-right: 10rpx;
  height: 40rpx;
  background: linear-gradient(90deg, #ff6b35, #ff9f28, #ffcc03);
}
.live-goods-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  > .live-goods-item {
    flex: 1;
  }
  > .live-goods-item:nth-of-type(1) {
    padding-right: 38rpx;
  }
}
.live-icon,
.zan {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  z-index: 9;
}
.tips {
  display: flex;
  position: absolute;
  z-index: 9;

  align-items: center;
  top: 20rpx;
  right: 0;
  padding: 4rpx 12rpx 4rpx 0;
  font-size: 24rpx;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.46);
}
.live-icon {
  right: 0;
  top: 104rpx;
}

.zan {
  bottom: 0;
  right: 0;
  width: 100rpx;
  height: 100rpx;
}
.bg {
  position: absolute;
  bottom: 4rpx;
  width: 100%;
  height: 100rpx;
  z-index: 8;
  background-image: -webkit-gradient(
    linear,
    left bottom,
    left top,
    from(rgba(0, 0, 0, 0.25)),
    color-stop(82%, transparent)
  );
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 82%);
  border-bottom-left-radius: 20rpx;
}
</style>