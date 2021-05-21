<template>
  <div class="wrapper">
    <div class="empty" v-if="couponsList.length <= 0">
      <u-empty text="暂无优惠券" mode="coupon"></u-empty>
    </div>
    <view class="coupon-item" v-for="(item, index) in couponsList" :key="index" v-if="item.memberCouponStatus == 'NEW'">
      <view class="left">
        <view class="wave-line">
          <view class="wave" v-for="(item, index) in 12" :key="index"></view>
        </view>
        <view class="message">
          <view>
            <span v-if="item.couponType == 'DISCOUNT'">{{ item.discount }}折</span>
            <span v-else>{{ item.price }}元</span>
          </view>
          <view>满{{ item.consumeThreshold | unitPrice }}元可用</view>
        </view>
        <view class="circle circle-top"></view>
        <view class="circle circle-bottom"></view>
      </view>
      <view class="right">
        <view>
          <view v-if="item.scopeType">
            <span v-if="item.scopeType == 'ALL' && item.id == 'platform'">全平台</span>
            <span v-if="item.scopeType == 'PORTION_CATEGORY'">仅限品类</span>
            <view v-else>{{  item.storeName == 'platform' ? '全平台' :item.storeName+'店铺' }}使用</view>
          </view>
          <view>有效期至：{{item.endTime}}</view>
        </view>
        <view class="receive" @click="clickWay(item)">
          <text>立即</text><br />
          <text>使用</text>
        </view>
        <view class="bg-quan"> 券 </view>
      </view>
    </view>
  </div>
</template>
<script>
import { useCoupon, getMemberCanUse } from "@/api/trade.js";

export default {
  data() {
    return {
      couponsList: [], //优惠券集合
      params: {
        //传参
        memberCouponStatus: "NEW", //优惠券状态
        pageNumber: 1,
        pageSize: 10,
        scopeId: "", //商品skuid
        storeId: "", //店铺id
        totalPrice: "", //价格
      },
      routerVal: "", //上级传参
    };
  },
  /**
   * 赋值
   */
  onLoad(val) {
    this.routerVal = val;
    this.params.scopeId = val.skuId;
    this.params.storeId = val.storeId;
  },
  mounted() {
    uni.getStorage({
      key: "totalPrice",
      success: (res) => {
        this.params.totalPrice = res.data;
        this.getCoupons();
      },
    });
  },

  methods: {
    /**
     * 获取优惠券数量
     */
    getCoupons() {
      getMemberCanUse(this.params).then((res) => {
        if (res.data.success) {
          this.couponsList = res.data.result.records;
        }
      });
    },

    /**
     * 领取优惠券
     */
    clickWay(coupon) {
      useCoupon({
        memberCouponId: coupon.id,
        used: true,
        way: this.routerVal.way,
      }).then((res) => {
        if (res.data.success) {
          uni.navigateBack();
        } else {
          uni.showToast({
            title: res.data.message,
            duration: 2000,
            icon: "none",
          });
        }
      });
    },
  },
};
</script>
<style scoped lang="scss">
.empty {
  margin-top: 20px;
  text-align: center;
}
.wrapper {
  background: #f9f9f9;
  overflow: hidden;
}
.coupon-item {
  display: flex;
  align-items: center;
  height: 220rpx;
  margin: 20rpx;

  .left {
    height: 100%;
    width: 260rpx;
    background-color: $light-color;
    position: relative;
    .message {
      color: $font-color-white;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: 40rpx;

      view:nth-child(1) {
        font-weight: bold;
        font-size: 60rpx;
      }

      view:nth-child(2) {
        font-size: $font-sm;
      }
    }

    .wave-line {
      height: 220rpx;
      width: 8rpx;
      position: absolute;
      top: 0;
      left: 0;
      background-color: $light-color;
      overflow: hidden;

      .wave {
        width: 8rpx;
        height: 16rpx;
        background-color: #ffffff;
        border-radius: 0 16rpx 16rpx 0;
        margin-top: 4rpx;
      }
    }
    .circle {
      width: 40rpx;
      height: 40rpx;
      background-color: $bg-color;
      position: absolute;
      border-radius: 50%;
      z-index: 111;
    }
    .circle-top {
      top: -20rpx;
      right: -20rpx;
    }
    .circle-bottom {
      bottom: -20rpx;
      right: -20rpx;
    }
  }

  .right {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 450rpx;
    font-size: $font-sm;
    height: 100%;
    background-color: #ffffff;
    overflow: hidden;
    position: relative;
    > view:nth-child(1) {
      color: #666666;
      margin-left: 20rpx;
      line-height: 3em;
      > view:nth-child(1) {
        color: #ff6262;
        font-size: 30rpx;
      }
    }

    .receive {
      color: #ffffff;
      background-color: $main-color;
      border-radius: 50%;
      width: 86rpx;
      height: 86rpx;
      text-align: center;
      margin-right: 30rpx;
      vertical-align: middle;
      padding-top: 8rpx;
      position: relative;
      z-index: 2;
    }

    .bg-quan {
      width: 244rpx;
      height: 244rpx;
      border: 6rpx solid $main-color;
      border-radius: 50%;
      opacity: 0.1;
      color: $main-color;
      text-align: center;
      padding-top: 30rpx;
      font-size: 130rpx;
      position: absolute;
      right: -54rpx;
      bottom: -60rpx;
    }
  }
}
</style>
