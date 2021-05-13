<template>
  <view v-if="storeDetail">
    <!-- 商店信息  -->
    <view class="store-info"  >
      <view class="logo">
        <u-image width="120rpx" mode="aspectFit" height="120rpx" :src="storeDetail.storeLogo"></u-image>
      </view>
      <view class="name-star star-con">
        <text class="name">{{ storeDetail.storeName }}</text>
        <view>
          <text :class="{ star: storeDetail.store_service_credit > 0 }"></text>
          <text :class="{ star: storeDetail.store_service_credit > 1 }"></text>
          <text :class="{ star: storeDetail.store_service_credit > 2 }"></text>
          <text :class="{ star: storeDetail.store_service_credit > 3 }"></text>
          <text :class="{ star: storeDetail.store_service_credit > 4 }"></text>
        </view>
      </view>
      <view class="to-store-btn" @click="tostorePage(goodsDetail)">
        <view>进店逛逛</view>
      </view>
    </view>

    <view class="store-recommend" id="main8">
      <view class="store-recommend-title">商品推荐</view>
      <view class="recommend-list">
        <view class="recommend-item" @click="clickGoods(item)" v-for="(item, index) in res" :key="index">
          <u-image class="recommend-item-img" :fade="true" duration="450" :lazy-load="true" :src="item.thumbnail" height="218rpx">
            <u-loading slot="loading"></u-loading>
            <view slot="error" style="font-size: 24rpx; ">加载失败</view>
          </u-image>
          <view class="recommend-item-name">
            {{ item.goodsName }}
          </view>
          <view class="item-price" v-if="item.price != undefined">
            ￥<span class="item-price-blod">{{ Fixed(item.price)[0] }}</span>.{{ Fixed(item.price)[1] }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {};
  },
  props: ["res", "goodsDetail", "storeDetail"],
  mounted() {},
  methods: {
    // 格式化金钱  1999 --> [1999,00]
    Fixed(val) {
      if (typeof val == "undefined") {
        return val;
      }
      return val.toFixed(2).split(".");
    },
    // 点击商品
    clickGoods(val) {
       uni.navigateTo({
        url: `/pages/product/goods?id=${val.id}&goodsId=${val.goodsId}`
      });
     
    },

    tostorePage(val) {
      uni.navigateTo({
        url: "../product/shopPage?id=" + val.storeId,
      });
    },
  },
};
</script>

<style lang="scss" scoped>

@import "../product.scss";
.recommend-item-name {
  height: 70rpx;
  color: #333;
  font-weight: 400;
  font-size: 24rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.item-price-blod {
  font-weight: bold;
  font-size: 32rpx;
}
.recommend-item {
  width: 30%;
  margin: 10rpx 0rpx;
  overflow: hidden;
  border-radius: 12rpx;

  /deep/ .u-image__image {
    height: 218rpx;
    border-radius: 12rpx !important;
  }
}

.recommend-item-img {
  /deep/ .u-image__image {
    width: 100% !important;
  }
}

.recommend-list-view {
  width: 100%;
}

.store-info {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 40rpx 20rpx 50rpx;

  .logo {
    overflow: hidden;
    border-radius: 6px;

    > img {
      width: 100%;
      height: 100%;
    }
  }

  .name-star {
    flex: 1;
    margin-left: 20rpx;
    padding: 10rpx 0;
    font-size: 30rpx;

    .name {
      width: 100%;
      font-weight: 700;
      font-size: 28rpx;
      line-height: 24px;
    }
  }

  .to-store-btn {
    padding: 20rpx 0;

    > view {
      font-size: 24rpx;
      color: #fff;
      width: 160rpx;
      height: 60rpx;
      line-height: 60rpx;
      text-align: center;
      background: $main-color;
      border-radius: 28rpx;
    }
  }
}

/* star */
.star-con {
  display: flex;
  flex-direction: column;

  view {
    flex: 1;
    display: flex;
    align-items: center;

    .star {
      width: 30rpx;
      height: 30rpx;
      background: url(https://image.shutterstock.com/image-vector/star-icon-vector-illustration-260nw-474687040.jpg);
      background-size: 100%;
    }
  }
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  /deep/ .u-row {
    width: 100%;
  }

  .item-price {
    margin: 10rpx 0 20rpx 0;
    text-align: left;
    font-weight: bold;
    overflow: hidden;
    white-space: nowrap;
    margin: 18rpx 0;
    font-size: 22rpx;
    color: $jd-color;
  }

  .recommend-list-con {
    display: flex;
    flex-direction: column;
    width: 32%;
    margin-bottom: 24rpx;
  }

  .name {
    overflow: hidden;
    white-space: nowrap;
  }
}

.store-recommend {
  background: #fff;

  margin: 20rpx 0 0 0;
}
</style>
