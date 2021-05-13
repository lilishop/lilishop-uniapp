<template>
  <view class="coupon-center">
    <swiper :current="tabIndex" class="swiper-box" @change="ontabchange">
    
      <swiper-item @touchmove.stop class="swiper-item" v-for="tab in categoryIndexData" :key="tab.category_id">
        <scroll-view class="scroll-v" enableBackToTop="true" scroll-y @scrolltolower="loadMore">
         <u-empty mode="coupon" text="没有优惠券了" v-if="nomsg"></u-empty>
          <view v-else class="coupon-item" v-for="(item, index) in list" :key="index">
            <view class="left">
              <view class="wave-line">
                <view class="wave" v-for="(item, index) in 12" :key="index"></view>
              </view>
              <view class="msg">
                <view>
                  <span v-if="item.couponType == 'DISCOUNT'">{{ item.couponDiscount }}折</span>
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
                <view>有效期至：{{  item.endTime.split(" ")[0] }}</view>
              </view>
              <view class="receive" @click="receive(item)">
                <text>点击</text><br />
                <text>领取</text>
              </view>
              <view class="bg-quan"> 券 </view>
            </view>
          </view>
          <uni-load-more :status="loadStatus"></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
import { receiveCoupons } from "@/api/members.js";
import { getAllCoupons } from "@/api/promotions.js";
import { getCategoryIndexData } from "@/api/home.js";
export default {
  data() {
    return {
      loadStatus: "more",
      nomsg: false,
      list: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        status: 1,
      },
      storeId: "",
      categoryIndexData: [],
      currentLeft: 0,
      tabIndex: 0,
    };
  },
  onLoad(option) {
    this.storeId = option.storeId;
    this.getCoupon();
    this.getTabbar();
  },
  onPullDownRefresh() {
    //下拉刷新
    console.log("refresh");
    this.params.pageNumber = 1;
    this.list = [];
    this.getCoupon();
  },
  methods: {
    getCoupon() {
      //全部优惠券
      uni.showLoading({
        title: "加载中",
      });
      if (this.storeId) {
        getAllCoupons({ storeId: this.storeId ,...this.params })
          .then((res) => {
            uni.hideLoading();
            uni.stopPullDownRefresh();
            if (res.statusCode == 200) {
              let data = res.data.result;
              if (data.total == 0) {
                this.nomsg = true;
              } else {
                this.list.push(...data.records);
                this.loadStatus = "noMore";
              }
            }
          })
          .catch((err) => {
            uni.hideLoading();
          });
      } else {
        getAllCoupons(this.params)
          .then((res) => {
            uni.hideLoading();
            uni.stopPullDownRefresh();
            if (res.statusCode == 200) {
              console.log(res);
              let data = res.data.result;
              if (data.total == 0) {
                this.nomsg = true;
                console.log("这里");
              } else if (data.total < 10) {
                this.list.push(...data.records);
                this.loadStatus = "noMore";
              } else {
                this.list.push(...data.records);
                if (data.data.length < 10) this.loadStatus = "noMore";
              }
            }
          })
          .catch((err) => {
            uni.hideLoading();
          });
      }
    },
    receive(item) {
      //领取优惠券
      receiveCoupons(item.id).then((res) => {
        if (res.data.code == 200) {
          uni.showToast({
            title: "领取成功",
            icon: "none",
          });
        } else {
          uni.showToast({
            title: res.data.message,
            icon: "none",
          });
        }
      });
      // this.$set(this.list,0,this.list[0])
      // console.log(this.list)
    },
    getTabbar() {
      //获取顶级分类
      // uni.showLoading({
      // 	title: "加载中"
      // })
      let tabbar = {
        category_id: 0,
        name: "全部",
        parent_id: 0,
        category_path: "|0|",
        goods_count: 0,
        category_order: 0,
        list_show: 1,
        image:
          "https://wwwyinbeicn.oss-cn-beijing.aliyuncs.com/yinbeistore/normal/FF468285411041E1AE5C36DAD1161AE4.png",
      };
      getCategoryIndexData().then((res) => {
        console.log(res);
        this.categoryIndexData.push(tabbar, ...res.data.result);
      });
    },
    loadMore() {
      if (this.loadStatus != "noMore") {
        this.params.pageNumber++;
        this.getAllCoupons();
      }
    },
    setCat(type) {
      this.tabIndex = type;
      // this.searchStore();
    },
    ontabchange(e) {
      this.tabIndex = e.detail.current;
      if (e.detail.current > 3) {
        this.currentLeft = (e.detail.current - 3) * 90;
      } else {
        this.currentLeft = 0;
      }
      // this.searchStore();
    },
  },
  onNavigationBarButtonTap(e) {
    uni.navigateTo({
      url: "/pages/cart/coupon/couponIntro",
    });
  },
};
</script>
<style>
page {
  height: 100%;
}
</style>
<style lang="scss" scoped>
.coupon-center {
  height: 100%;

  .list-scroll-content {
    position: relative;
    width: 100%;
    display: flex;
    white-space: nowrap;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    background-color: $main-color;
    color: #ffffff;

    .tab-item {
      width: 160rpx;
      height: 80rpx;
      line-height: 60rpx;
      text-align: center;
      display: inline-block;
    }

    .active {
      border-bottom: 2px solid #ffffff;
      broder-width: 60rpx;
      font-size: 30rpx;
      font-weight: 700;
      padding-bottom: 4rpx;
    }
  }

  .swiper-box {
    height: 100%;

    .scroll-v {
      height: 100%;
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
  }
}
</style>
