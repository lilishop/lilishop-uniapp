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
      <div class="live-item" :class="{'invalid':item.status == 'END'}" v-for="(item,index) in liveList" :key="index" @click="handleLivePlayer(item)">
        <div class="live-cover-img">
          <div class="tips">
            <div class="live-box">
              <image class="live-gif" src="./static/live.gif"></image>
            </div>
            <span>{{item.status == 'END' ? '已结束' : item.status =='NEW' ? '未开始' : '直播中'}}</span>
          </div>
          <div class="bg"></div>
          <u-image width="326" height="354" :src="item.shareImg" />
        </div>
        <div class="live-goods">
          <div class="live-goods-name">
            {{item.name}}
          </div>
          <div class="live-store">

            <span class="wes">lilishop</span>
          </div>
        
          <div class="live-goods-list">
            <div class="live-goods-item">
              <u-image border-radius="20" :src="item.roomGoodsList.length !=0 ? item.roomGoodsList[0] : ''" height="140"></u-image>
            </div>
            <div class="live-goods-item">
              <u-image border-radius="20" :src="item.roomGoodsList.length !=0 ? item.roomGoodsList[1] : ''" height="140"></u-image>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getLiveList } from "@/api/promotions.js";
export default {
  data() {
    return {
      activeColor: this.$lightColor,
      keyword: "",
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
      // 直播间列表
      liveList: "",
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
  mounted() {
    this.getLives();
  },
  methods: {
    /**
     *
     */
    async getLives() {
      let res = await getLiveList();
      if (res.data.success) {
        this.liveList = res.data.result.records;

        this.liveList.forEach((item) => {
          console.log();
        });
      }
    },

    /**
     * 推荐直播间
     */
    async getStarLive() {},

    /**
     * 进入直播间
     */
    handleLivePlayer(val) {
      let roomId = val.roomId; // 填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
      let customParams = encodeURIComponent(
        JSON.stringify({ path: "pages/index/index", pid: 1 })
      ); // 开发者在直播间页面路径上携带自定义参数，后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
      uni.navigateTo({
        url:
          "plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=" +
          roomId +
          "&custom_params=" +
          customParams,
      });
    },
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
.invalid {
  filter: grayscale(1);
}
.wrapper {
  padding: 0 24rpx;
}
.live-item {
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