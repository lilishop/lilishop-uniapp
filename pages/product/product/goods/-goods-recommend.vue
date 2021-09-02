<template>
  <view class="recommend-box" >
    <h4 class="goods-recommend-title">宝贝推荐</h4>
    <view class="like-goods-list">
      <view class="like-goods-list">
        <view
          class="like-goods-item"
          @click="clickGoods(item)"
          v-for="(item, index) in res"
          :key="index"
        >
          <u-image
            :fade="true"
            duration="450"
            :lazy-load="true"
            :src="item.content.thumbnail"
            width="330rpx"
            height="330rpx"
            class="like-goods-uimage"
          >
            <u-loading slot="loading"></u-loading>
          </u-image>
          <view style="background-color: #ffffff; width: 100%">
            <view class="name">{{ item.content.goodsName }}</view>
            <view class="price-sales">
              <div class="item-price" v-if="item.content.price != undefined">
                ￥
                <span>{{ formatPrice(item.content.price)[0] }}</span>
                .{{formatPrice(item.content.price)[1]}}
                <!-- <text v-if="item.point != undefined">+{{ item.point }}积分</text> -->
              </div>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: ["res"],
  methods: {
    // 点击店铺推荐
    clickGoods(val) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${val.content.id}&goodsId=${val.content.goodsId}`
      });
    },
    // 格式化金钱  1999 --> [1999,00]
    formatPrice(val) {
      if (typeof val == "undefined") {
        return val;
      }
  
      return val.toFixed(2).split(".");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../mp-goods.scss";
@import "../product.scss";

.goods_recomm {
  padding: 12px 0 20rpx 20rpx;
  color: #000;
  font-size: 30rpx;
  font-weight: 400;
  margin-bottom: 28rpx;
}

.like-goods-uimage {
  /deep/ .u-image {
    height: 350rpx !important;
  }

  width: 100%;
}

.recommend-box {
  background-color: #ffffff;
 
  width: 100%;

  padding-bottom: 120rpx;

  .title {
    width: 120rpx;
    height: 42rpx;
    font-size: 30rpx;
    font-weight: 700;
    text-align: left;
    color: #333333;
    margin-left: 20rpx;
  }
}
.like-goods-list {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
}
.like-goods-item {
  padding: 0 !important;
  width: 48%;
  margin: 0 1% 10rpx 1%;
  background: #f7f7f7;
  border-radius: 12rpx;

  overflow: hidden;

  /deep/ .u-image {
    width: 100%;
  }
}

.like-goods-list {
  // background-color: #f8f8f8;
  width: 100%;
  margin-bottom: 100rpx;

  .name {
    padding: 14rpx 8rpx 0 8rpx;

    color: #333;
    font-size: 24rpx;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;

    -webkit-line-clamp: 2;

    background: #f7f7f7;
    height: 80rpx;
  }

  .price-sales {
    padding: 8rpx;
    background: #f7f7f7;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-price {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 26rpx;
      text-align: left;
      color: $price-color;
      line-height: 23px;
      font-weight: bold;
      > span {
        font-size: 32rpx;
      }
    }

    .sales {
      line-height: 23px;
      font-size: 22rpx;
      text-align: left;
      letter-spacing: 0;
      color: #cccccc;
      // padding-right: 10rpx;
    }
  }
}
</style>
