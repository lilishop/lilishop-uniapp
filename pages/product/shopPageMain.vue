<template>
  <view class="store-page">
    <view>
      <!-- 商店信息 -->
      <view class="store-info">
        <view class="logo">
          <image :src="storeInfo.storeLogo || '/static/logo.png'" mode="aspectFit"></image>
        </view>
        <view class="store-name">
          <view class="name">{{ storeInfo.storeName }}</view>
          <view>{{ storeInfo.goodsNum || 0 }}关注 {{ storeInfo.collectionNum || 0 }}件商品</view>
        </view>
        <view class="follow" @click="whetherCollection">
          <view>{{ isCollection  ? '已关注' : '+ 关注' }}</view>
        </view>
      </view>
      <view class="store-intro">
        <view class="title">店铺简介</view>
        <view class="text">
          <view v-html="storeInfo.storeDesc"></view>

        </view>
      </view>
      <!-- 优惠券 -->
      <scroll-view scroll-x="true" show-scrollbar="false" class="discount" v-if="couponList.length > 0">
        <view class="card-box" v-for="(item, index) in couponList" :key="index">
          <view class="card" @click="getCoupon(item)">
            <view class="money">
              <view>
                <span v-if="item.couponType == 'DISCOUNT'">{{ item.couponDiscount }}折</span>
                <span v-else>{{ item.price }}元</span>
              </view>

            </view>
            <view class="xian"></view>
            <view class="text">
              <text>{{'领取优惠券'  }}</text>
              <text>满{{ item.consumeThreshold | unitPrice }}元可用</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <!-- 精选商品 -->
      <view class="handpick">
        <view class="title">精选商品</view>
        <view class="contant">
          <view v-if="!recommandGoods.length" class="no-goods">暂无商品信息</view>
          <view v-else class="item" v-for="(item,index) in recommandGoods" :key="index" @click="navigateToGoodsDetail(item)">
            <u-image width="324rpx" height="324rpx" mode="aspectFit" :src="item.thumbnail">
              <u-loading slot="loading"></u-loading>
            </u-image>
            <div class="name">{{ item.goodsName }}</div>
            <div class="price">
              <div>￥{{ item.price | unitPrice }}</div>
            </div>
            <view class="buyCount">
              <div>已售 {{ item.buyCount || "0" }}</div>
            </view>
          </view>
        </view>
      </view>

    </view>
  </view>
</template>

<script>
import { getstoreBaseInfo } from "@/api/store.js";
import {
  receiveCoupons,
  deleteStoreCollection,
  collectionGoods,
  getGoodsIsCollect,
} from "@/api/members.js";
import { getGoodsList } from "@/api/goods.js";
import { getAllCoupons } from "@/api/promotions.js";
export default {
  props: {
    storeId: {
      value: Number,
    },
    load: {
      value: Boolean,
    },
  },
  data() {
    return {
      // 店铺介绍按钮
      storeInfo: "", //店铺详情
      isCollection: false, //是否关注
      recommandGoods: [], //推荐货物
      couponList: [], //优惠券列表
      params: {
        pageNumber: 1,
        pageSize: 50,
        storeId: "",
      },
    };
  },
  watch: {},
  mounted(options) {
    if (this.$options.filters.isLogin("auth")) {
      getGoodsIsCollect("STORE", this.storeId).then((res) => {
        this.isCollection = res.data.result;
      });
    }
    this.initStoreInfo();
  },
  methods: {
    /**
     * 店铺信息
     */
    initStoreInfo() {
      uni.showLoading({
        title: "加载中",
      });
      this.params.storeId = this.storeId;
      getstoreBaseInfo(this.storeId).then((res) => {
        if (res.data.success) {
          this.storeInfo = res.data.result;
          uni.hideLoading();
          Promise.all([
            getAllCoupons(this.params),
            getGoodsList({ storeId: this.storeId }),
            ,
          ]).then((res) => {
            this.couponList = res[0].data.result.records;
            this.recommandGoods = res[1].data.result.content;
          });
        } else {
          uni.reLaunch({
            url: "/",
          });
        }
      });
    },

    /**
     * 跳转到商品详情
     */
    navigateToGoodsDetail(val) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${val.id}&goodsId=${val.goodsId}`,
      });
    },

    /**
     *  是否收藏
     */
    whetherCollection() {
      if (this.isCollection) {
        deleteStoreCollection(this.storeId).then((res) => {
          if (res.data.success) {
            this.isCollection = false;
            uni.showToast({
              icon: "none",
              duration: 3000,
              title: "取消关注成功！",
            });
          }
        });
      } else {
        collectionGoods("STORE", this.storeId).then((res) => {
          if (res.data.success) {
            this.isCollection = true;
            uni.showToast({
              icon: "none",
              duration: 3000,
              title: "关注成功！",
            });
          }
        });
      }
    },

    /**
     * 获取优惠券
     */
    getCoupon(item) {
      if (!this.$options.filters.isLogin("auth")) {
        uni.showToast({
          icon: "none",
          duration: 3000,
          title: "请先登录！",
        });
        uni.redirectTo({
          url: "/pages/passport/login",
        });
        return false;
      }
      receiveCoupons(item.id).then((res) => {
        if (res.data.success) {
          uni.showToast({
            icon: "none",
            duration: 3000,
            title: "领取成功！",
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.store-page {
  height: 100%;
  background: #fff;
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90rpx;
    line-height: 90rpx;
    font-size: 30rpx;
    z-index: 9999;
  }
  .tab-header {
    position: fixed;
    top: 90rpx;
    left: 0;
    right: 0;
    height: 100rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 30rpx;
    z-index: 9999;
    background: #fff;
    text {
      width: 30%;
      text-align: center;
      &.cur {
        color: #29bb9c;
        font-size: 34rpx;
        font-weight: 500;
      }
    }
  }
  .header-line {
    height: 1px;
    background: #f2f2f2;
    position: fixed;
    top: 190rpx;
    left: 0;
    right: 0;
    z-index: 999;
  }
  .store-info {
    display: flex;
    justify-content: space-between;
    padding: 40rpx 40rpx 30rpx;

    .logo {
      width: 128rpx;
      height: 128rpx;
      overflow: hidden;
      border-radius: 6px;
      image {
        width: 128rpx;
        height: 128rpx;
      }
    }

    .store-name {
      text-align: center;
      font-size: 26rpx;
      color: #999;
      margin-left: -50rpx;
      .name {
        margin: 20rpx 0 16rpx;
        font-size: 30rpx;
        color: #333;
        text-align: left;
      }
    }
    .follow {
      padding: 40rpx 0;
      > view {
        font-size: 26rpx;
        color: #fff;
        padding: 0 30rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        background: $aider-light-color;
        border-radius: 28rpx;
        text {
          font-size: 40rpx;
        }
      }
    }
  }
  .store-intro {
    padding: 0 40rpx 18rpx;
    .title,
    .text {
      font-size: 26rpx;
      color: #999999;
      line-height: 48rpx;
    }
    .title {
      padding-left: 20rpx;
      position: relative;
      &:before {
        content: "";
        width: 1px;
        height: 45rpx;
        background: #999;
        position: absolute;
        left: 0;
        top: 0;
      }
    }
    .text {
      position: relative;
      &.close {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 46rpx;
      }
      &.open {
        padding-right: 0;
        white-space: wrap;
        overflow: auto;
        text-overflow: clip;
      }
      .zhankai {
        width: 20rpx;
        height: 20rpx;
        position: absolute;
        right: 10rpx;
        bottom: 0;
        border-top: 3px solid #999;
        border-right: 3px solid #999;
        &.close {
          transform: rotateZ(135deg);
          bottom: 15rpx;
        }
        &.open {
          transform: rotateZ(-45deg);
        }
      }
    }
  }
  .discount {
    height: 189rpx;
    border-top: 1px solid #f6f6f6;
    border-bottom: 18rpx solid #f6f6f6;
    background: #f6f6f6;
    overflow: hidden;
    white-space: nowrap;
    .card-box {
      display: inline-block;
      padding-top: 25rpx;
    }
    .card {
      width: 324rpx;
      height: 116rpx;
      background: #fff;
      margin-left: 20rpx;
      border-radius: 5px;
      display: flex;
      align-items: center;
      .money {
        width: 45%;
        color: #fd6466;
        font-weight: 500;
        text-align: center;
        text {
          font-size: 50rpx;
        }
      }
      .xian {
        height: 66rpx;
        border: 1px dashed #f6f6f6;
        position: relative;
        &:before,
        &:after {
          content: "";
          width: 22rpx;
          height: 12rpx;
          position: absolute;
          background: #f6f6f6;
        }
        &:before {
          border-radius: 0 0 22rpx 22rpx;
          top: -30rpx;
          left: -10rpx;
        }
        &:after {
          border-radius: 22rpx 22rpx 0 0;
          bottom: -30rpx;
          left: -10rpx;
        }
      }
      .text {
        flex: 1;
        color: $aider-light-color;
        font-size: 24rpx;
        display: flex;
        flex-direction: column;
        margin-left: 14rpx;
        text:nth-of-type(2) {
          color: #ccc;
        }
        .cur:nth-of-type(1) {
          color: #ccc;
        }
      }
    }
  }
  .hot,
  .handpick {
    .title {
      height: 132rpx;
      padding: 0 20rpx;
      line-height: 132rpx;
      font-size: 32rpx;
      text-align: center;
      position: relative;
      &:before,
      &:after {
        content: "";
        width: 44rpx;
        height: 6rpx;
        position: absolute;
        background: #f0f1fc;
      }
      &:before {
        top: 63rpx;
        left: 236rpx;
      }
      &:after {
        border-radius: 22rpx 22rpx 0 0;
        top: 63rpx;
        right: 236rpx;
      }
    }
    .no-goods {
      width: 100%;
      height: 364rpx;
      text-align: center;
      line-height: 364rpx;
      color: #999999;
    }
  }
  .hot {
    .contant {
      height: 364rpx;
      display: flex;
      padding: 0 20rpx;
      overflow: hidden;
      white-space: nowrap;

      .item-box {
        display: inline-block;
      }
      .item {
        width: 216rpx;
        margin-left: 15rpx;
        font-size: 24rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        image {
          width: 212rpx;
          height: 212rpx;
        }
        .name {
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 66rpx;
        }
        .price {
          font-weight: 500;
          margin-bottom: 20rpx;
          color: #fd6466;
          text {
            font-size: 26rpx;
          }
        }
      }
    }
    border-bottom: 18rpx solid #f9f9f9;
  }
  .item-img-recommand {
    width: 324rpx !important;
    height: 324rpx !important;
  }
  .item-img {
    width: 212rpx !important;
    height: 212rpx !important;
  }
  .handpick {
    background: #fff;
    .contant {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      padding: 0 40rpx;
      .item {
        width: 324rpx;
        height: 484rpx;
        font-size: 26rpx;
        display: flex;
        flex-direction: column;
        border: 1px solid #f8f8f8;
        margin-bottom: 20rpx;
        image {
          width: 324rpx;
          height: 260rpx;
        }
        .name {
          text-align: left !important;
          color: #333;
          padding: 0 20rpx;
          margin-top: 20rpx;
          line-height: 1.4em;
          max-height: 2.8em; //height是line-height的整数倍，防止文字显示不全
          overflow: hidden;
        }
        .price {
          font-weight: 500;
          color: $main-color;
          font-size: 30rpx;
          padding: 0 20rpx;
          margin-top: 20rpx;
          white-space: nowrap;
        }
        .buyCount {
          display: flex;
          padding: 0 20rpx;
          font-size: 24upx;
          justify-content: space-between;
          color: #999;
        }
      }
    }
  }
  .bottom {
    background: #fff;
    height: 90rpx;
    text-align: center;
    text {
      color: #ccc;
      font-size: 24rpx;
      position: relative;
      &:before {
        content: "";
        display: block;
        width: 180rpx;
        height: 1px;
        background: #f0f1fc;
        position: absolute;
        top: 20rpx;
        left: -270rpx;
      }
      &:after {
        content: "";
        display: block;
        width: 180rpx;
        height: 1px;
        background: #f0f1fc;
        position: absolute;
        top: 20rpx;
        right: -200rpx;
      }
    }
  }
}
</style>
