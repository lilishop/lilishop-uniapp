<template>
  <view class="store-page">
    <view class="status_bar">
      <!-- 这里是状态栏 -->
    </view>
    <view class="header">
      <div class="search">
        <u-icon @click="back" style="margin:0 10rpx 0;" name="arrow-left" size="40" color="#fff"></u-icon>
        <u-search :show-action="false" border-color="#fff" bg-color="#fff" v-model="keyword" @search="search" placeholder="请输入搜索" />
        <u-icon @click="shareChange()" style="margin:0 10rpx 0;" name="share-fill" size="40" color="#fff"></u-icon>
      </div>
      <view class="tab-header">
        <text :class="{ cur: tabIndex == 0 }" @click="checkNavigation(0)">首页</text>
        <text :class="{ cur: tabIndex == 1 }" @click="checkNavigation(1)">商品</text>
      </view>
    </view>
    <swiper :current="tabIndex" class="swiper-box" @change="tabChange">
      <swiper-item class="swiper-item" v-for="(item, index) in indexCats" :key="index">
        <scroll-view class="scroll-v" scroll-anchoring enableBackToTop="true" scroll-y @refresherrefresh="refresh()" @scroll="pageScroll">
          <storePageMain :load="load" :storeId="storeId" v-if="index == 0"></storePageMain>
          <storePageGoods :load="load"  :categoryId="item" :storeId="storeId" v-if="index == 1"></storePageGoods>
        </scroll-view>
      </swiper-item>
    </swiper>

    <!-- 分享 -->
    <shares type="shops" :link="'/pages/product/shopPage?id='+ this.storeId" v-if="shareFlage" @close="shareFlage = false" />

  </view>
</template>

<script>
import shares from "@/components/m-share/index"; //分享
import storePageMain from "./shopPageMain.vue";
import storePageGoods from "./shopPageGoods.vue";
export default {
  components: {
    shares,
    storePageMain,
    storePageGoods,
  },
  data() {
    return {
      shareFlage: false, //分享share
      tabIndex: 0, //默认为第一个tab
      keyword: "", //搜索关键字
      load: false,
      storeId: undefined, //店铺id
      indexCats: [0, 1],  //默认为2个tab
      loadIndex: 1, //加载的距离
   
    };
  },

  /**
   * 加载 
   */
  async onLoad(options) {
    this.storeId = options.id;

  },
  mounted() {},

  methods: {
    // 点击分享
    async shareChange() {
      this.shareFlage = true;
    },

    /**
     * 搜索
     */
    search() {
      uni.navigateTo({
        url: `/pages/navigation/search/searchPage?storeId=${this.storeId}&keyword=${this.keyword}`,
      });
    },

    /**
     * 下滑加载
     */
    pageScroll(e) {
      if (e.detail.scrollTop > 300 * this.loadIndex) {
        this.loadIndex++;
        this.load = this.loadIndex;
      }
    },

    /**
     * 返回
     */
    back() {
      if (getCurrentPages().length == 1) {
        uni.switchTab({
          url: "/pages/tabbar/home/index",
        });
      } else {
        uni.navigateBack();
      }
    },

    /**
     * 点击导航栏
     */
    checkNavigation(index) {
      this.tabIndex = index;
    },

    /**
     * 滑动回调
     */
    tabChange(e) {
      this.tabIndex = e.detail.current;
      this.checkNavigation(this.tabIndex);
    },
  },
};
</script>
<style>
page {
  height: 100%;
}
</style>
<style lang="scss" scoped>
// #ifdef MP-WEIXIN
@import "./mp-shopPage.scss";
// #endif
input[type="search"] {
  -webkit-appearance: none;
  // 也可以去除加上border: 0;之类的 根据设计图来
}

input::-webkit-search-cancel-button {
  display: none;
}
// 关闭的按钮

.storeScrollBox {
  overflow-y: auto;
}

.store-page {
  height: 100%;
  // background: #fff;
  overflow: auto;

  .tab-header {
    height: 80rpx;
    display: flex;

    justify-content: space-between;
    align-items: center;
    font-size: 28rpx;
    z-index: 9999;

    text {
      width: 50%;
      text-align: center;
      position: relative;
      color: #fff;
      &.cur {
        font-size: 30rpx;
        font-weight: bold;
        color: #fff;

        &::after {
          content: "";
          position: absolute;
          width: 30rpx;
          border: 1px solid #fff;
          bottom: -6rpx;
          left: 50%;
          margin-left: -15rpx;
        }
      }
    }
  }

  .header-line {
    height: 1px;
    background: #f2f2f2;
    position: fixed;
    top: 170rpx;
    left: 0;
    right: 0;
    z-index: 999;
  }
}

.swiper-box {
  width: 750rpx;

  height: calc(
    100% - var(--status-bar-height) - var(--window-top) - var(--window-bottom) -
      (160rpx) - 16rpx - 28rpx
  );

  // #ifdef H5
  height: calc(
    100% - var(--status-bar-height) - var(--window-top) - var(--window-bottom) -
      (160rpx)
  );
  // #endif
}

.swiper-item {
  height: 100%;
}

.scroll-v {
  width: 750rpx;
  height: 100%;
  overflow-y: auto;
}
.status_bar {
  height: calc(var(--status-bar-height) + 160rpx);
  width: 100%;
  background-image: linear-gradient(
    25deg,
    $main-color,
    $light-color,
    $aider-light-color
  );
}
.header {
  width: 100%;
  position: fixed;
  top: var(--status-bar-height);

  padding: 16rpx 0 0;
  font-size: 30rpx;
  z-index: 9999;
  > .search {
    width: 100%;
    display: flex;
    align-items: center;
    .back {
      width: 90rpx;
      height: 90rpx;
    }

    .input-wrap {
      background: $light-color;
      width: 600rpx;
      height: 58rpx;
      padding: 10rpx 30rpx 10rpx 30rpx;
      box-sizing: border-box;
      background-color: #fff;
      border-radius: 50rpx;
      position: relative;
      border: 1px solid $light-color;

      input {
        font-size: 26rpx;
      }
    }
  }
}
</style>
