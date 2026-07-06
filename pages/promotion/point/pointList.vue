<template>
  <view class="index">
    <user-point />
    <view class="index-head">
      <!-- #ifdef H5 -->
      <view class="list-scroll-content list-scroll-content-h5">
        <view class="index-head-navs">
          <view
            class="index-head-nav"
            v-for="(ele, index) in categoryIndexData"
            :key="index"
            :class="{ 'index-head-nav-active': tabIndex == index }"
            @click="setCat(index)"
          >
            {{ ele.name }}
          </view>
        </view>
      </view>
      <!-- #endif -->
      <!-- #ifndef H5 -->
      <scroll-view scroll-x class="list-scroll-content" :scroll-left="currentLeft" scroll-with-animation>
        <view class="index-head-navs">
          <view class="index-head-nav" v-for="(ele, index) in categoryIndexData" :key="index"
            :class="{ 'index-head-nav-active': tabIndex == index }" @click="setCat(index)">
            {{ ele.name }}
          </view>
        </view>
      </scroll-view>
      <!-- #endif -->
    </view>

    <!-- #ifdef H5 -->
    <view class="tab-content-h5">
      <view class="index-items">
        <view
          class="index-item"
          v-for="(item, key) in categoryIndexData[tabIndex].goods"
          :key="item.id || key"
          @click="toGoods(item)"
        >
          <view class="index-item-img">
            <image
              class="index-item-image"
              :src="item.thumbnail"
              mode="aspectFit"
              lazy-load
            ></image>
          </view>
          <view class="index-item-info">
            <view class="index-item-title">{{ item.goodsName || item.promotionName || '' }}</view>
            <view class="index-item-price">
              <view class="point">
                <text class="point-num">{{ item.points != null ? item.points : 0 }}</text>
                <text class="point-unit">积分</text>
              </view>
              <text class="tipsMkt">¥{{ unitPrice(item.originalPrice) }}</text>
            </view>
          </view>
        </view>
      </view>
      <uni-load-more
        :status="categoryIndexData[tabIndex].loadStatus"
        @clickLoadMore="loadMore"
      ></uni-load-more>
    </view>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <swiper :current="tabIndex" class="swiper-box" @change="ontabchange" duration="300">
      <swiper-item v-for="(nav, index) in categoryIndexData" :key="index" class="swiper-item">
        <scroll-view class="scroll-v" enableBackToTop="true" scroll-with-animation scroll-y @scrolltolower="loadMore">
          <view class="index-items">
            <view class="index-item" v-for="(item, key) in nav.goods" :key="item.id || key" @click="toGoods(item)">
              <view class="index-item-img">
                <image
                  class="index-item-image"
                  :src="item.thumbnail"
                  mode="aspectFit"
                  lazy-load
                ></image>
              </view>
              <view class="index-item-info">
                <view class="index-item-title">{{ item.goodsName || item.promotionName || '' }}</view>
                <view class="index-item-price">
                  <view class="point">
                    <text class="point-num">{{ item.points != null ? item.points : 0 }}</text>
                    <text class="point-unit">积分</text>
                  </view>
                  <text class="tipsMkt">¥{{ unitPrice(item.originalPrice) }}</text>
                </view>
              </view>
            </view>
          </view>
          <uni-load-more :status="nav.loadStatus"></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
    <!-- #endif -->
  </view>
</template>

<script>
import { getPointsCategory, getPointsGoods } from "@/api/promotions.js";
import userPoint from "./user";
export default {
  components: {
    "user-point": userPoint,
  },
  data() {
    return {
      headOffSetTop: "0",
      tabIndex: 0,
      categoryIndexData: [
        {
          categoryId: 0,
          name: "全部",
          loadStatus: "more",
          goods: [],
          params: {
            pageNumber: 1,
            pageSize: 10,
            pointsGoodsCategoryId: "",
          },
        },
      ],
      currentLeft: 0,
      pageParams: {
        pageNumber: 1,
        pageSize: 10,
        pointsGoodsCategoryId: 0,
      },
      flag: true,
    };
  },
  onLoad() {},
  async onPullDownRefresh() {
    // #ifndef H5
    this.categoryIndexData[this.tabIndex].goods = [];
    this.categoryIndexData[this.tabIndex].params.pageNumber = 1;
    this.categoryIndexData[this.tabIndex].loadStatus = "more";
    this.loadGoods();
    // #endif
  },
  // #ifndef H5
  onPageScroll(e) {
    if (e.scrollTop < -40 && this.flag) {
      this.flag = false;
      this.categoryIndexData[this.tabIndex].goods = [];
      this.categoryIndexData[this.tabIndex].params.pageNumber = 1;
      this.categoryIndexData[this.tabIndex].loadStatus = "more";
      uni.startPullDownRefresh();
      this.loadGoods();
    }
  },
  // #endif
  watch: {
    tabIndex(val) {
      if (
        this.categoryIndexData[this.tabIndex].goods.length == 0 &&
        this.categoryIndexData[this.tabIndex].params.pageNumber == 1
      ) {
        this.loadGoods();
      }
    },
  },
  async onShow() {
    //获取顶级分类
    this.categoryIndexData = [
      {
        categoryId: 0,
        name: "全部",
        loadStatus: "more",
        goods: [],
        params: {
          pageNumber: 1,
          pageSize: 10,
          pointsGoodsCategoryId: "",
        },
      },
    ];

    let response = await getPointsCategory();

    if (response.data.success) {
      let navData = response.data.result.records;
      navData.forEach((item) => {
        this.categoryIndexData.push({
          categoryId: item.id,
          goods: [],
          loadStatus: "more",
          name: item.name,
          params: {
            pageNumber: 1,
            pageSize: 10,
            pointsGoodsCategoryId: item.id,
          },
        });
      });
    }

    this.loadGoods();
  },
  methods: {
    // 跳转
    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },

    toGoods(item) {
      //跳转详情
      uni.navigateTo({
        url: `/pages/promotion/point/detail?id=${item.id}`,
      });
    },

    async loadGoods() {
      let index = this.tabIndex;

      //获取商品数据
      let response = await getPointsGoods(this.categoryIndexData[index].params);
      if (response.data.success) {
        this.categoryIndexData[index].goods.push(
          ...response.data.result.records
        );
        if (response.data.result.records.length < 10) {
          this.categoryIndexData[index].loadStatus = "noMore";
        }
        let _this = this;
        setTimeout(function () {
          _this.flag = true;
        }, 3000);
      }

      // #ifndef H5
      uni.stopPullDownRefresh();
      // #endif
    },
    setCat(type) {
      this.tabIndex = type;
    },
    ontabchange(e) {
      this.tabIndex = e.detail.current;
      if (e.detail.current > 3) {
        this.currentLeft = (e.detail.current - 3) * 70;
      } else {
        this.currentLeft = 0;
      }
    },
    loadMore() {
      if (this.categoryIndexData[this.tabIndex].loadStatus !== "more") {
        return;
      }
      this.categoryIndexData[this.tabIndex].params.pageNumber++;
      this.loadGoods();
    },
  },
  // #ifdef H5
  onReachBottom() {
    if (this.categoryIndexData[this.tabIndex].loadStatus !== 'more') {
      return;
    }
    this.loadMore();
  },
  // #endif
};
</script>
<style lang="scss" scoped>
page {
  height: 100%;
}
.tipsMkt {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 24rpx !important;
  text-decoration: line-through;
  margin-left: 12rpx;
}


.index {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  // #ifdef H5
  height: auto;
  min-height: 100vh;
  overflow: visible;
  // #endif
}

.index-head {
  background: #fff;
  flex-shrink: 0;
}

.list-scroll-content {
  white-space: nowrap;
  width: 100%;
  height: 100rpx;
  color: #333;
}

.index-head-navs {
  width: 100%;
  height: 92rpx;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
}

.index-head-nav {
  padding-bottom: 8rpx;
  margin: 20rpx;
  text-align: center;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 30rpx;
  color: #333;

  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;

  &-active {
    border-bottom: 4rpx solid $light-color;
  }
}

// #ifdef H5
.list-scroll-content-h5 {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  .index-head-navs {
    display: inline-flex;
    min-width: 100%;
  }
}

.tab-content-h5 {
  padding-bottom: 40rpx;
}
// #endif

.swiper-box {
  flex: 1;
  min-height: 0;

  .scroll-v {
    height: 100%;
  }
}

.index-items {
  padding: 20rpx 20rpx 0;
  background-color: #f7f7f7;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
}

.index-item {
  width: calc(50% - 9rpx);
  background-color: #fff;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.index-item-img {
  width: 100%;
  height: 320rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.index-item-image {
  width: 100%;
  height: 320rpx;
  display: block;
}

.index-item-info {
  position: relative;
  z-index: 1;
  flex: 1;
  background-color: #fff;
}

.index-item-title {
  font-size: 26rpx;
  color: #333;
  padding: 16rpx 20rpx 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.index-item-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #ff3c2a;
  padding: 12rpx 20rpx 20rpx;

  .point {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    overflow: hidden;
  }

  .point-num {
    font-size: 42rpx;
    font-weight: bold;
    color: #ff3c2a;
    line-height: 1;
  }

  .point-unit {
    margin-left: 6rpx;
    font-size: 24rpx;
    color: #ff3c2a;
    flex-shrink: 0;
  }
}
</style>
<style lang="scss">
/* #ifdef H5 */
page {
  height: auto;
  min-height: 100vh;
  overflow-y: auto;
}
/* #endif */
</style>
