<template>
  <view class="box">
    <u-navbar
      class="navbar"
      :border="false"
      :fixed="true"
      :placeholder="true"
      left-icon="arrow-left"
      :auto-back="false"
      @left-click="back"
    >
      <template #center>
        <view class="slot-wrap">
          <u-search placeholder="搜索直播间" @custom="searchLive" @clear="clear" @search="searchLive" v-model="keyword"></u-search>
        </view>
      </template>
    </u-navbar>
    <!-- 轮播图 -->
    <u-swiper @click="clickSwiper" class="swiper" keyName="image" :list="swiperImg">

    </u-swiper>
    <u-tabs
      :scrollable="false"
      v-model:current="current"
      @change="changeTabs"
      :lineColor="activeColor"
      :activeStyle="{ color: activeColor }"
      :inactiveStyle="{ color: '#606266' }"
      ref="tabs"
      :list="tabs"
    ></u-tabs>

    <view class="wrapper">
      <view
        class="live-item"
        :class="{ invalid: item.status == 'END' }"
        v-for="(item, index) in liveList"
        :key="item.id || item.roomId || index"
        @click="handleLivePlayer(item)"
      >
        <view class="live-cover-img">
          <view class="tips">
            <view class="live-box" v-if="item.status === 'START'">
              <image class="live-gif" src="/pages/promotion/static/live.gif" mode="aspectFit"></image>
            </view>
            <text>{{ item.status == 'END' ? '已结束' : item.status == 'NEW' ? '未开始' : '直播中' }}</text>
          </view>
          <view class="bg"></view>
          <u-image
            class="cover-image"
            width="326rpx"
            height="354rpx"
            mode="aspectFill"
            :src="item.shareImg"
          />
        </view>
        <view class="live-goods">
          <view class="live-goods-name">{{ item.name }}</view>
          <view class="live-store">
            <text class="wes">{{ config.name }}</text>
          </view>
          <view class="live-goods-list" v-if="item.roomGoodsList && item.roomGoodsList.length">
            <view
              class="live-goods-item"
              v-for="(goodsImg, goodsIndex) in item.roomGoodsList.slice(0, 2)"
              :key="goodsIndex"
            >
              <u-image
                border-radius="20"
                :src="goodsImg"
                width="100%"
                height="140rpx"
                mode="aspectFill"
              ></u-image>
            </view>
          </view>
        </view>
      </view>
      <u-loadmore v-if="liveList.length > 0" bg-color="#f8f8f8" :status="status" />
      <view class="empty-live" v-if="!liveList.length && status === 'noMore'">暂无直播间</view>
    </view>
  </view>
</template>

<script>
import { getLiveList } from "@/api/promotions.js";
import config from "@/config/config";
export default {
  data() {
    return {
      config,
      status: "loadmore",
      activeColor: this.$lightColor,
      current: 0, // 当前tabs索引
      keyword: "", //搜索直播间
      // 标签栏
      tabs: [
        {
          name: "直播中",
        },
        {
          name: "全部",
        },
      ],
      // 导航栏的配置
      background: {
        background: "#ff9f28",
      },
      // 直播间params
      params: [
        {
          pageNumber: 1,
          pageSize: 10,
          status: "START",
        },
        {
          pageNumber: 1,
          pageSize: 4,
        },
      ],
      // 推荐直播间Params
      recommendParams: {
        pageNumber: 1,
        pageSize: 3,
        recommend: 0,
      },
      // 直播间列表
      liveList: [],
      // 推荐直播间列表
      recommendLiveList: [],

      //轮播图滚动的图片
      swiperImg: [
        {
          image:
            "https://lilishop-oss.oss-cn-beijing.aliyuncs.com/48d789cb9c864b7b87c1c0f70996c3e8.jpeg",
        },
      ],
    };
  },
  onShow() {
    this.params[this.current].pageNumber = 1;
    this.liveList = [];
    this.getLives();
    this.getRecommendLives();
  },
  onReachBottom() {
    this.params[this.current].pageNumber++;
    this.getLives();
  },
  methods: {
    back() {
      uni.navigateBack({
        delta: 1,
        fail: () => {
          uni.switchTab({ url: "/pages/tabbar/home/index" });
        },
      });
    },
    /**
     * 点击标签栏切换
     */
    changeTabs() {
      this.params[this.current].pageNumber = 1;
      this.init();
    },

    /**
     * 初始化直播间
     */
    init() {
      this.liveList = [];
      this.status = "loadmore";
      this.getLives();
    },

    /**
     * 清除搜索内容
     */
    clear() {
      delete this.params[this.current].name;
      this.init();
    },
    /**
     * 点击顶部推荐直播间
     */
    clickSwiper(val) {
      console.log(this.swiperImg[val]);
      this.handleLivePlayer(this.swiperImg[val]);
    },

    /**
     * 搜索直播间
     */
    searchLive(val) {
      this.params[this.current].pageNumber = 1;
      this.params[this.current].name = val;
      this.init();
    },
    /**
     * 获取推荐直播间
     */
    async getRecommendLives() {
      this.status = "loading";
      let recommendLives = await getLiveList(this.recommendParams);
      if (recommendLives.data.success) {
        // 推荐直播间
        if (recommendLives.data.result.records.length) {
          this.status = "loadmore";
          this.recommendLiveList = recommendLives.data.result.records;
        } else {
          this.status = "noMore";
        }

        /**
         * 如果推荐直播间没有的情况下
         * 1.获取直播间第一个图片
         * 2.如果没有直播间设置一个默认图片
         */

        if (!this.recommendLiveList.length) {
          if (this.liveList[0] && this.liveList[0].shareImg) {
            this.swiperImg = [
              {
                image: this.liveList[0].shareImg,
                roomId: this.liveList[0].roomId,
              },
            ];
          }
        } else {
          this.recommendLiveList.forEach((item) => {
            this.swiperImg = [{ image: item.shareImg, roomId: item.roomId }];
          });
        }
      }
    },

    /**
     * 获取直播间
     */
    async getLives() {
      this.status = "loading";
      let res = await getLiveList(this.params[this.current]);
      // 直播间
      if (res.data.success) {
        if (res.data.result.records.length ) {
          this.status = "loadmore";
          this.liveList.push(...res.data.result.records);
        } else {
          this.status = "noMore";
        }
        res.data.result.total >
        this.params[this.current].pageNumber *
          this.params[this.current].pageSize
          ? (this.status = "loadmore")
          : (this.status = "noMore");

      
        this.liveList.forEach((item) => {
          if (item.roomGoodsList && typeof item.roomGoodsList === "string") {
            try {
              item.roomGoodsList = JSON.parse(item.roomGoodsList);
            } catch (e) {
              item.roomGoodsList = [];
            }
          }
        });
      }
    },

    /**
     * 进入直播间
     */
    handleLivePlayer(val) {
      // #ifdef MP-WEIXIN
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
      // #endif

      // #ifndef MP-WEIXIN
      uni.showToast({
        title: "请从微信小程序中预览直播功能",
        duration: 2000,
        icon: "none",
      });
      // #endif
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.box {
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  box-sizing: border-box;
}

.slot-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  padding-right: 24rpx;
}

.invalid {
  filter: grayscale(1);
}

.wrapper {
  padding: 0 24rpx 40rpx;
  box-sizing: border-box;
}

.live-item {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
  border-radius: 20rpx;
  background: #fff;
  margin: 20rpx 0;
}

.live-cover-img {
  position: relative;
  flex-shrink: 0;
  width: 326rpx;
  height: 354rpx;
  overflow: hidden;
  border-radius: 20rpx 0 0 20rpx;
}

.cover-image {
  display: block;
  width: 100%;
  height: 100%;
}

.swiper {
  margin: 20rpx 24rpx;
}

.live-goods {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.live-goods-name {
  min-height: 84rpx;
  font-weight: bold;
  font-size: 30rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: #333;
}

.live-store {
  display: flex;
  align-items: center;
  margin: 12rpx 0 20rpx;
  overflow: hidden;
  font-size: 24rpx;
  color: #999;
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
  flex-shrink: 0;
  background: linear-gradient(90deg, #ff6b35, #ff9f28, #ffcc03);
}

.live-goods-list {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: auto;
}

.live-goods-item {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  border-radius: 20rpx;
}

.tips {
  display: flex;
  position: absolute;
  z-index: 9;
  align-items: center;
  top: 20rpx;
  left: 20rpx;
  padding: 4rpx 12rpx 4rpx 4rpx;
  font-size: 24rpx;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.46);
}

.bg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  z-index: 8;
  pointer-events: none;
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 82%);
}

.empty-live {
  padding: 80rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>