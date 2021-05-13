<template>
  <div class="wrapper">
    <div class="nomore" v-if="current === 0 && couponsList.length <= 0">
      暂无优惠券
    </div>
    <div class="nomore" v-if="current === 1 && disabledCouponsList.length <= 0">
      暂无优惠券
    </div>

    <view class="coupon-item" v-for="(item, index) in couponsList" :key="index" v-if="item.memberCouponStatus == 'NEW'">
      <view class="left">
        <view class="wave-line">
          <view class="wave" v-for="(item, index) in 12" :key="index"></view>
        </view>
        <view class="msg">
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
import {
  useCoupon,
  getMemberCouponList,
  getMemberCanUse,
} from "@/api/trade.js";

export default {
  data() {
    return {
      current: 0,
      list: [
        {
          name: "可用优惠券",
        },
        {
          name: "不可用优惠券",
        },
      ],
      curNow: "",
      couponsList: [],
      disabledCouponsList: [],
      params: {
        memberCouponStatus: "NEW",
        pageNumber: 1,
        pageSize: 10,
        scopeId: "",
        storeId: "",
        totalPrice: "",
        // endTime: this.$u.timeFormat(new Date().getTime(),'yyyy-mm-dd hh:MM:ss')
      },
      way: [],
      routerVal: "",
    };
  },
  onReachBottom() {
    this.pageNumber++;
    this.getAllCouponsFun();
  },
  onLoad(val) {
    this.routerVal = val;
    this.params.scopeId = val.skuId;
    this.params.storeId = val.storeId;
    if (val.type) {
      this.params.endTime = new Date().getTime();
    }
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
   
    // 获取优惠券数量
    getCoupons() {
      getMemberCanUse(this.params).then((res) => {
        if (res.data.success) {
         

          this.couponsList = res.data.result.records;
        }
      });
    },

    // 领取优惠券
    async clickWay(coupon) {
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

    submitback() {
      uni.navigateBack();
    },
    // 获取商品优惠券
    getAllCouponsFun() {},

    sectionChange(index) {
      this.curNow = index;
    },

    change(index) {
      this.current = index;
    },
  },
};
</script>
<style scoped lang="scss">
.nomore {
  margin-top: 20px;
  text-align: center;
}
.selectBtn {
  position: fixed;
  bottom: 0;
  background: #fff;
  text-align: center;
  width: 100%;
  padding: 20rpx 0;
}

.wrapper {
  background: #f9f9f9;

  overflow: hidden;
}

.coupon-jd {
  margin: 40rpx auto 0 auto;
  width: 700rpx;
  height: auto;

  background-color: #ffffff;
  display: flex;
  .left {
    padding: 0 30rpx;
    width: 200rpx;
    background-color: $aider-light-color;
    text-align: center;
    font-size: 28rpx;
    color: #ffffff;
    .sum {
      margin-top: 50rpx;
      font-weight: bold;
      font-size: 32rpx;
      .num {
        font-size: 60rpx;
      }
    }
    .type {
      margin-bottom: 50rpx;
      font-size: 24rpx;
    }
  }
  .right {
    padding: 20rpx 20rpx 0;
    font-size: 28rpx;
    .top {
      border-bottom: 2rpx dashed $u-border-color;
      .title {
        margin-right: 60rpx;
        line-height: 40rpx;
        .tag {
          padding: 4rpx 20rpx;
          background-color: $aider-light-color;
          border-radius: 20rpx;
          color: #ffffff;
          font-weight: bold;
          font-size: 24rpx;
          margin-right: 10rpx;
        }
      }
      .bottom {
        display: flex;
        margin-top: 20rpx;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10rpx;
        .date {
          font-size: 20rpx;
          flex: 1;
        }
      }
    }
    .tips {
      width: 100%;
      line-height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 24rpx;
      .transpond {
        margin-right: 10rpx;
      }
      .explain {
        display: flex;
        align-items: center;
      }
      .particulars {
        width: 30rpx;
        height: 30rpx;
        box-sizing: border-box;
        padding-top: 8rpx;
        border-radius: 50%;
        background-color: $u-type-info-disabled;
        text-align: center;
      }
    }
  }
}
.immediate-use {
  height: auto;
  padding: 0 20rpx;
  font-size: 24rpx;
  text-align: center;
  width: 160rpx;
  margin: 20rpx 0;
  border-radius: 40rpx;
  line-height: 40rpx;
  color: $aider-light-color;
  border: 2rpx solid $aider-light-color;
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
    .msg {
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
