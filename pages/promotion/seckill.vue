<template>
  <view class="sale">
    <view class="sale-head">
      <image src="@/pages/promotion/static/head-sample.png"></image>
    </view>
    <scroll-view scroll-x>
      <view class="index-navs">
        <view class="index-nav-v">
          <view class="index-nav" :class="{ 'index-nav-active': nav == index }" @click="setNav(index)" v-for="(item, index) in timeLine" :key="index">
            {{ item.timeLine }}:00
            <view class="index-nav-desc">{{ index === 0 && item.distanceStartTime === 0 ? '抢购中' : '即将开始' }}
            </view>
          </view>
        </view>
      </view>
      <view class="trailer" v-if="timeLine[nav] && times">
        {{ timeLine[nav].distanceStartTime === 0 ? (onlyOne ? '距结束' : '距下一轮') : '距开始' }}
        {{ times.hours == '00' ? '0' : times.hours }}小时{{ times.minutes }}分{{ times.seconds }}秒
      </view>
    </scroll-view>
    <view class="sale-items" v-if="goodsList.length > 0">
      <view class="sale-item" v-for="(item,index) in goodsList" :key="index">
        <view class="sale-item-img">
          <image :src="item.goodsImage" mode="aspectFill"></image>
        </view>
        <view class="sale-item-content">
          <view class="sale-item-title">
            {{ item.goodsName }}
            <view class="sale-item-title-desc"></view>
          </view>
          <view class="sale-item-price">
            <text class="sale-item-price-now">¥{{ item.price | unitPrice}}</text>
            <text class="sale-item-price-origin"> ¥{{ item.originalPrice | unitPrice }}</text>
          </view>
          <view class="sale-item-surplus">
            仅剩{{ item.quantity - item.salesNum }}件
            <view class="sale-item-surplus-text" :style="{ width: (item.quantity / (item.quantity - item.salesNum)) * 100 + '%' }">
            </view>
          </view>
          <view class="sale-item-btn" @click="gotoGoodsDetail(item)">
            {{ timeLine[nav].distanceStartTime === 0 ? (item.salesNum === item.quantity ? '已售空' : '购买') : '即将开始' }}
          </view>
        </view>
      </view>
    </view>
    <view v-else>
      <view class="nodata">
        <image style="height: 240rpx;width: 320rpx;" src="/static/nodata.png" alt="" />
        <div>暂无商品</div>
      </view>
    </view>

  </view>
</template>

<script>
import { getSeckillTimeLine, getSeckillTimeGoods } from "@/api/promotions.js";
import Foundation from "@/utils/Foundation.js";
export default {
  data() {
    return {
      nav: 0,
      sale: "",
      timeLine: "",
      resTime: 0,
      time: 0,
      times: {},
      onlyOne: "",
      goodsList: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
      },
      price: "",
    };
  },
  async onShow() {
    await this.getTimeLine();
    if (!this.timeLine) {
      await uni.showToast({
        icon: "none",
        duration: 2000,
        title: "今天没有活动，明天再来吧",
      });
      // setTimeout(() => {
      //   uni.switchTab({
      //     url: "/pages/index/index",
      //   });
      // }, 2000);
      // return;
    }
    this._setTimeInterval = setInterval(() => {
      if (this.time <= 0) {
        clearInterval(this._setTimeInterval);
        this.getGoodsList();
        this.getTimeLine();
      } else {
        this.times = Foundation.countTimeDown(this.time);
        this.time--;
      }
    }, 1000);
  },

  onUnload() {
    this._setTimeInterval && clearInterval(this._setTimeInterval);
  },
  methods: {
    async getTimeLine() {
      let res = await getSeckillTimeLine();
      if (res.data.success && res.data.result.length > 0) {
        let timeLine = res.data.result.sort(
          (x, y) => Number(x.timeLine) - Number(y.timeLine)
        );
        this.timeLine = timeLine.slice(0, 5);
        this.resTime = parseInt(new Date().getTime() / 1000);
        this.onlyOne = res.data.result.length === 1;
        this.diffTime = parseInt(new Date().getTime() / 1000) - this.resTime;

        this.time =
          this.timeLine[this.nav].distanceStartTime ||
          (this.timeLine[this.nav + 1] &&
            this.timeLine[this.nav + 1].distanceStartTime) ||
          Foundation.theNextDayTime() - this.diffTime;
        // || Foundation.theNextDayTime())

        this.times = Foundation.countTimeDown(this.time);

        this.getGoodsList();
      }
    },
    async getGoodsList() {
      this.params.timeLine = this.timeLine[this.nav].timeLine;
      let res = await getSeckillTimeGoods(this.params.timeLine);
      if (res.data.success && res.data.result.length != 0) {
        this.goodsList = res.data.result;
      } else {
        this.goodsList = [];
      }
    },
    gotoGoodsDetail(item) {
      if (
        item.sold_num === item.quantity ||
        this.timeLine[this.nav].distanceStartTime !== 0
      ) {
        return;
      } else {
        uni.navigateTo({
          url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
        });
      }
    },
    setNav(type) {
      this.nav = type;
      this.diffTime = parseInt(new Date().getTime() / 1000) - this.resTime;
      this.time =
        this.timeLine[this.nav].distanceStartTime ||
        (this.timeLine[this.nav + 1] &&
          this.timeLine[this.nav + 1].distanceStartTime) ||
        Foundation.theNextDayTime() - this.diffTime;

      this.times = Foundation.countTimeDown(this.time);
      this.getGoodsList();
    },
  },
};
</script>

<style lang="less" scoped>
.sale {
  width: 100%;
  min-height: 100vh;
  background-color: #f7f7f7;
}

.nodata {
  flex-direction: column;
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-top: 40rpx;

  > div {
    font-size: 24rpx;
    margin-top: 20rpx;
    color: #666;
  }
}

.sale-head {
  image {
    width: 100%;
    height: 280rpx;
  }
}

.sale-title {
  width: 710rpx;
  height: 310rpx;
  margin: 0 auto;
  font-size: 32rpx;
  color: 666;
  background-color: #fff;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sale-items {
  padding-top: 20rpx;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.sale-item {
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

.sale-item-img {
  margin-right: 20rpx;

  image {
    width: 186rpx;
    height: 186rpx;
    border-radius: 8rpx;
  }
}

.sale-item-content {
  line-height: 2em;
}

.sale-item-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.5;
  font-size: 28rpx;
  color: #333;
}

.sale-item-title-desc {
  font-size: 22rpx;
  color: #999;
}

.sale-item-price {
  font-size: 22rpx;
  color: 999;
}

.sale-item-price-now {
  font-size: 40rpx;
  color: #ff5a10;
  margin: 0 10rpx;
}

.sale-item-price-origin {
  font-size: 20rpx;
  color: #999;

  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
  text-decoration: line-through;
}

.sale-item-surplus {
  border: 2rpx solid rgb(34, 178, 140);
  border-radius: 12px;
  width: 166rpx;
  color: rgb(31, 177, 138);
  font-size: 20rpx;
  position: relative;
  text-align: center;
  z-index: 2;
  height: 32rpx;
  line-height: 28rpx;
  overflow: hidden;
}

.sale-item-surplus-text {
  width: 166rpx;
  background: rgb(234, 247, 245);
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  height: 100%;
}

.sale-item-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  padding: 0 20rpx;
  height: 60rpx;
  background-color: #1abc9c;
  border-radius: 10rpx;
  font-size: 25rpx;
  color: #fff;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
}

.trailer {
  height: 100rpx;
  background: #ffffff;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22rpx;
  color: #666666;
  box-sizing: border-box;
  position: relative;
  z-index: 0;
}

.index-navs {
  background-color: #f7f7f7;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.index-nav-v {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.index-nav {
  font-size: 28rpx;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150rpx;
  flex-direction: column;
  color: #bababa;
  height: 115rpx;
  line-height: 1em;
  position: relative;

  &-active {
    background-image: url(/static/seckill/active.png);
    background-size: 100% 115rpx;
    background-repeat: no-repeat;
    color: #ffffff;
    position: relative;
    z-index: 30;

    .index-nav-desc {
      color: #ffffff;
    }
  }
}

.index-nav-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #bababa;
}

.index-nav-divider {
  height: 64rpx;
  border-left: 1px solid #dddddd;
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
  height: 2100rpx;
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
  height: 410rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 10rpx 0 0 20rpx;
  box-sizing: border-box;
}

.index-item-title-desc {
  font-size: 25rpx;
  color: #999999;
  margin-top: 10rpx;
}

.index-item-price {
  font-size: 110rpx;
  color: #ff5a10;
  padding: 20rpx 0 0 20rpx;
}
</style>
