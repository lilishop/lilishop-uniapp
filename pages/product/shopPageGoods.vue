<template>
  <view class="index-content">
    <!-- 搜索板块 -->
    <view class="index-navs">
      <view class="index-nav" :class="{ 'index-nav-active': nav == 1 }" @click="tabClick(1)">精选</view>
      <view class="index-nav-divider"></view>

      <view class="index-nav" :class="{ 'index-nav-active': nav == 2}" @click="tabClick(2,'buyCount')">
        销量
        <view class="index-nav-arrows">
          <view class="index-nav-arrow">
            <image src="/static/index/arrow-up-1.png" v-if="params.sort === 'buyCount' && params.order === 'asc'" mode="aspectFit"></image>
            <image src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
          </view>
          <view class="index-nav-arrow">
            <image src="/static/index/arrow-down.png" v-if="params.sort === 'buyCount' && params.order === 'desc'" mode="aspectFit"></image>
            <image src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
          </view>
        </view>
      </view>
      <view class="index-nav-divider"></view>
      <view class="index-nav" :class="{ 'index-nav-active': nav == 3}" @click="tabClick(3,'price')">
        价格
        <view class="index-nav-arrows">
          <view class="index-nav-arrow">
            <image src="/static/index/arrow-up-1.png" v-if="params.sort === 'price' && params.order === 'asc'" mode="aspectFit"></image>
            <image src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
          </view>
          <view class="index-nav-arrow">
            <image src="/static/index/arrow-down.png" v-if="params.sort === 'price' && params.order === 'desc'" mode="aspectFit"></image>
            <image src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-with-animation scroll-y class="scoll-page" @scroll="pageScroll">
      <view class="index-items">
        <view class="index-item" v-for="(goods, index) in goodsList" :key="index" @click="toGoodsDetail(goods)">
          <view class="index-item-img">
            <u-image mode="aspectFit" height="160px" width="173px" class="index-item-store-img" :src="goods.thumbnail">
              <u-loading slot="loading"></u-loading>
            </u-image>
            <view class="index-item-title">
              <div> {{ goods.goodsName }}</div>
              <view class="index-item-title-desc" v-if="goods.sellingPoint ">{{ goods.sellingPoint }}</view>
            </view>
            <view class="index-item-price">
              <div class="price">￥{{ goods.price | unitPrice }}</div>
              <view class="index-item-sale">
                已售 {{ goods.buyCount || "0" }}
                <!-- 好评90% -->
              </view>
            </view>
          </view>
        </view>
      </view>
      <u-loadmore bg-color="#f6f6f6" @loadmore="loadMore" :status="loadStatus" />
    </scroll-view>
  </view>
</template>

<script>
import { getGoodsList } from "@/api/goods.js";

export default {
  props: {
    storeId: {
      value: Number,
    },
    categoryId: {
      value: Number,
      default: 0,
    },
    load: {
      value: Number,
    },
  },
  data() {
    return {
      loadStatus: "loadmore", //加载更多状态
      nav: 1,
      // 默认双列显示
      goodsListTemplate: 2,
      // 过滤参数
      curCateFid: "",
      params: {
        pageNumber: 1,
        pageSize: 10,
        storeId: this.storeId,
      },
      goodsList: [],
      cateList: [
        { name: "综合", value: "100001" },
        { name: "推荐", value: "100002" },
        { name: "信用", value: "100003" },
      ],

      typeSort1: true,
      typeSort2: false,
    };
  },
  watch: {
    load(val) {
      this.params.pageNumber = val;
      this.loadMore();
    },
  },
  onReachBottom() {
 
    this.loadMore();
  },
  mounted() {
    this.initGoodsInfo();
  },
  methods: {
    pageScroll(e) {},
    loadMore() {
      this.initGoodsInfo();
    },
    tabClick(index, type) {
      this.goodsList = [];
      this.params.pageNumber = 0;
      this.params.pageSize = 10;

      this.nav = index;
      if (this.params.sort == type) {
        this.params.order == "asc"
          ? (this.params.order = "desc")
          : (this.params.order = "asc");
        this.$set(this.params, "sort", type);
      } else {
        this.params.order = "desc";
        this.$set(this.params, "sort", type);
      }

      this.initGoodsInfo();
    },
    toGoodsDetail(val) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${val.id}&goodsId=${val.goodsId}`,
      });
    },
    initGoodsInfo() {
      this.params.storeId = this.storeId;
      getGoodsList(this.params).then((res) => {
        if (
          res.data.result.totalElements <=
          res.data.result.number * res.data.result.size
        ) {
         
          this.loadStatus = "noMore";
        } else {
         
          this.loadStatus = "loadmore";
        }
        this.goodsList.push(...res.data.result.content);
      });
    },
    // 点击了右侧的模板选择按钮：即单列还是双列展示商品
    goodsTemplateChanged(templateValue) {
      this.goodsListTemplate = templateValue;
    },
  },
};
</script>

<style lang="scss" scoped>
.scoll-page {
  height: 100%;
}
.store-items {
  padding-top: 20rpx;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  flex-direction: column;
}
.store-item {
  width: 710rpx;
  height: 226rpx;
  padding-left: 20rpx;
  margin-bottom: 10rpx;
  border-radius: 12rpx;
  background-color: #fff;
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
}
.store-item-img {
  margin-right: 20rpx;
  image {
    width: 186rpx;
    height: 186rpx;
    border-radius: 8rpx;
  }
}

.store-item-title {
  font-size: 28rpx;
  color: #333;
}
.store-item-title-desc {
  font-size: 22rpx;
  color: #999;
}
.store-item-price {
  font-size: 110rpx;
  color: #ff5a10;
  padding-top: 10rpx;
}
.store-item-sale {
  font-size: 25rpx;
  color: #999;
  padding-top: 10rpx;
}

.index-navs {
  height: 120rpx;
  margin-top: -10rpx;
  padding: 0 52rpx;
  background-color: #f7f7f7;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.index-item-store-img {
  width: 346rpx !important;
  height: 320rpx !important;
}
.index-nav {
  font-size: 30rpx;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  &-active {
    color: $aider-light-color;
    font-weight: 700;
    &::after {
      content: "";
      position: absolute;
      width: 30rpx;
      border: 1px solid $aider-light-color;
      bottom: -6rpx;
      left: 96rpx;
    }
  }
}

.index-nav-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.index-nav-divider {
  height: 64rpx;
  border-left: 1px solid #dddddd;
}

.index-nav-arrows {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.index-nav-arrow {
  image {
    width: 26rpx;
    height: 26rpx;
  }
}
.index-nav-arrow:last-child {
  margin-top: -26rpx;
}

.index-items {
  padding-left: 20rpx;
  background-color: #f7f7f7;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.index-item {
  width: 346rpx;
  padding-bottom: 10rpx;
  background-color: #fff;
  margin: 0 18rpx 20rpx 0;
  border-radius: 16rpx;
  box-sizing: border-box;
  overflow: hidden;
}
.index-item-img {
  image {
    width: 346rpx;
    height: 320rpx;
  }
}
.index-item-title {
  font-size: 26rpx;
  color: #333333;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  padding: 0 0 0 20rpx;
  box-sizing: border-box;
}
.index-item-title-desc {
  font-size: 25rpx;
  color: #999999;
  margin-top: 10rpx;
}
.index-item-price {
  padding: 0 20rpx;
  > .price {
    font-weight: 500;
    color: $main-color;
    font-size: 30rpx;

    margin-top: 20rpx;
    white-space: nowrap;
  }
  > .index-item-sale {
    font-size: 24upx;
    color: #999;
  }
}
</style>
