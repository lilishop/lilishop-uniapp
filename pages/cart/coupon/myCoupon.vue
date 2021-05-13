<template>
  <view class="b-content">
    <view class="navbar">
      <view v-for="(item, index) in navList" :key="index" class="nav-item" @click="tabClick(index)"><text :class="{ current: tabCurrentIndex === index }">{{
          item.text
        }}</text></view>
    </view>
    <swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
      <swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
        <scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData">
          <!-- 空白页 -->
          <empty v-if="tabItem.nomsg"></empty>
          <!-- 数据 -->
          <view v-if="tabItem.dataList && coupon" class="coupon-item" :class="{ 'coupon-used': tabIndex != 0 }" v-for="(coupon, index) in tabItem.dataList" :key="index">
            <view class="left">
              <view class="wave-line">
                <view class="wave" v-for="(item, index) in 12" :key="index"></view>
              </view>
              <view class="msg">
                 <view class="price" v-if="coupon.couponType == 'DISCOUNT'">{{ coupon.discount }}折</view>
                  <view class="price" v-else>{{ coupon.price }}元</view>
                <!-- <view class="price" v-if="coupon.couponType == 'PRICE'">￥{{ coupon.price | unitPrice }}</view> -->
                <!-- <view class="price" v-if="coupon.couponType == 'DISCOUNT'">￥{{ coupon.couponDiscount }}</view> -->
                <view class="sub-price">满{{ coupon.consumeThreshold | unitPrice }}可用</view>
              </view>
              <view class="circle circle-top"></view>
              <view class="circle circle-bottom"></view>
            </view>
            <view class="right" v-if="coupon">
              <view class="content">
                <view class="title-1">{{ coupon.title }}</view>
                <view class="title-2">使用平台：{{
                    coupon.scopeType == 'ALL' && coupon.id == 'platform'
                      ? "全平台"
                      : coupon.scopeType == "PORTION_CATEGORY"
                      ? "仅限品类"
                      : coupon.storeName == 'platform' ? '全平台' :coupon.storeName+''
                  }}使用</view>
                <view v-if="coupon.endTime">{{
                  coupon.endTime
                  }}</view>
                <view @click="couponDetail(coupon)">详细说明
                  <u-icon style="float: right; margin-top: 10rpx" name="arrow-right"></u-icon>
                </view>
              </view>
              <view class="jiao-1" v-if="tabIndex == 0">
                <text class="text-1">新到</text>
                <text class="text-2" v-if="coupon.used_status == 1">将过期</text>
              </view>
              <image class="no-icon" v-if="tabIndex == 1" src="@/static/img/used.png"></image>
              <image class="no-icon" v-if="tabIndex == 2" src="@/pages/floor/imgs/overdue.png"></image>
              <view class="receive" v-if="tabIndex == 0" @click="nowUse(coupon)">
                <text>立即</text><br />
                <text>使用</text>
              </view>
              <view class="bg-quan"> 券 </view>
            </view>
          </view>
          <uni-load-more :status="tabItem.loadStatus"></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { getMemberCoupons } from "@/api/members.js";

export default {
  data() {
    return {
      tabCurrentIndex: 0,
      navList: [
        {
          text: "未使用",
          loadStatus: "more",
          dataList: [],
          params: {
            memberCouponStatus: "NEW",
            pageNumber: 1,
            pageSize: 10,
            status: 1,
          },
          nomsg: false,
        },
        {
          text: "已使用",
          loadStatus: "more",
          dataList: [],
          params: {
            memberCouponStatus: "USED",
            pageNumber: 1,
            pageSize: 10,
            status: 2,
          },
          nomsg: false,
        },
        {
          text: "已过期",
          loadStatus: "more",
          dataList: [],
          params: {
            memberCouponStatus: "EXPIRE",
            pageNumber: 1,
            pageSize: 10,
            status: 3,
          },
          nomsg: false,
        },
      ],
      couponList: [],
    };
  },
  onNavigationBarButtonTap() {
    uni.navigateTo({
      url: "/pages/cart/coupon/couponIntro",
    });
  },
  onLoad() {
    // this.tabCurrentIndex = 0;
    this.getData();
  },
  onPullDownRefresh() {
    let index = this.tabCurrentIndex;
    this.navList[index].params.pageNumber = 1;
    this.navList[index].dataList = [];
    this.getData();
  },
  watch: {
    tabCurrentIndex(val) {
      if (this.navList[val].dataList.length == 0) this.getData();
    },
  },
  methods: {
    //顶部tab点击
    tabClick(index) {
      this.tabCurrentIndex = index;
      // this.loadData();
    },
    getData() {
      //读取优惠券
      uni.showLoading({
        title: "加载中",
      });
      let index = this.tabCurrentIndex;
      getMemberCoupons(this.navList[index].params).then((res) => {
        uni.stopPullDownRefresh();
        if (res.statusCode == 200) {
          let data = res.data.result.records;
          if (data.length == 0) {
            if (res.data.pageNumber == 1) {
              this.navList[index].nomsg = true;
            } else {
              this.navList[index].loadStatus = "noMore";
            }
          } else if (data.length < 10) {
            this.navList[index].loadStatus = "noMore";
            this.navList[index].dataList.push(...data);
          } else {
            this.navList[index].dataList.push(...data);
          }
        }
        uni.hideLoading();
      });
    },
    changeTab(e) {
      this.tabCurrentIndex = e.target.current;
    },
    loadData() {
      let index = this.tabCurrentIndex;
      if (this.navList[index].loadStatus != "noMore") {
        this.navList[index].params.pageNumber++;
        this.getData();
      }
    },
    nowUse(item) {
        console.log(item)
      return 
      //立即使用
      if (item.storeId) {
        uni.navigateTo({
          url: `/pages/product/shopPage?id=${item.storeId}`,
        });
      } else {
        uni.switchTab({
          url: "/pages/tabbar/home/index",
        });
      }
      

    },
    couponDetail(item) {
      uni.navigateTo({
        url:
          "/pages/cart/coupon/couponDetail?item=" +
          encodeURIComponent(JSON.stringify(item)),
      });
    },
  },
};
</script>
<style>
page {
  height: 100%;
}
</style>
<style lang="scss">
$item-color: #fff;

.b-content {
  background: $page-color-base;
  height: 100%;
}

.swiper-box {
  height: calc(100% - 40px);
}

.list-scroll-content {
  height: 100%;
  width: 100%;

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

      .content {
        color: #666666;
        margin-left: 20rpx;
        line-height: 2em;
        > view:nth-child(1) {
          color: #ff6262;
          font-size: 30rpx;
        }

        .title-1,
        .title-2,
        .title-3 {
          font-size: 25rpx;
        }
      }
      .receive {
        color: #ffffff;
        background-color: $main-color;
        border-radius: 50%;
        width: 86rpx;
        height: 86rpx;
        text-align: center;
        margin-right: 48rpx;
        vertical-align: middle;
        padding-top: 8rpx;
        position: relative;
        z-index: 2;
      }

      .jiao-1 {
        background-color: #ffc71c;
        width: 400rpx;
        transform: rotate(45deg);
        text-align: center;
        position: absolute;
        color: #ffffff;
        right: -130rpx;
        top: 0;
        .text-1 {
          margin-left: 68rpx;
          font-size: 28rpx;
        }
        .text-2 {
          margin-left: 68rpx;
          font-size: 28rpx;
        }
      }
      .no-icon {
        border-radius: 50%;
        width: 86rpx;
        height: 86rpx;
        margin-right: 48rpx;
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
  .coupon-used {
    .left {
      background-color: #dddddd;
      .wave-line {
        background-color: #dddddd;
      }
    }
    .right {
      color: #cccccc;
      .content {
        color: #cccccc;
        > view:nth-child(1) {
          color: #cccccc;
        }
      }
      .bg-quan {
        border: 6rpx solid #cccccc;
        color: #cccccc;
      }
    }
  }
}

.navbar {
  display: flex;
  height: 80rpx;
  padding: 0 5px;
  background: #fff;
  color: $light-color;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;

  .nav-item {
    flex: 1;
    height: 100%;
    font-size: 26rpx;
    color: $light-color;
    position: relative;
    text-align: center;
    text {
      line-height: 80rpx;
    }
    .current {
      font-weight: bold;
      font-size: 28rpx;
      &:after {
        content: "";
        position: absolute;
        bottom: 10rpx;
        left: 108rpx;
        width: 30rpx;
        border-bottom: 2px solid $light-color;
      }
    }
  }
}
</style>
