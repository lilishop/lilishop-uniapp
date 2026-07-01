<template>
  <view v-if="storeDetail">
    <!-- 商店信息  -->
    <view class="store-info">
      <view class="logo">
        <u-image width="120rpx" mode="aspectFit" height="120rpx" :src="storeDetail.storeLogo"></u-image>
      </view>
      <view class="name-star star-con">
        <div class="name">
          {{ storeDetail.storeName }}
          <span v-if="storeDetail.selfOperated == 1" class="shopTag">自营</span>
        </div>
        <div class="store-row">
          <div class="collectionNum">{{ storeDetail.collectionNum || 0 }}人关注</div>
          <div class="goodsNum">{{ storeDetail.goodsNum || 0 }}件商品</div>
        </div>
      </view>
      <view class="to-store-btn" @click="tostorePage(goodsDetail)">
        <view class="to-store-text">进店逛逛</view>
      </view>
    </view>

    <view class="store-recommend" v-if="recommendGoods.length">
      <view class="store-recommend-title">店内其他商品</view>
      <view class="recommend-list">
        <view class="recommend-item" @click="clickGoods(item)" v-for="(item, index) in recommendGoods" :key="item.id || index">
          <view class="recommend-item-img">
            <image class="recommend-thumb" :src="item.thumbnail" mode="aspectFill" lazy-load />
          </view>
          <view class="recommend-item-name">
            {{ item.goodsName }}
          </view>
          <view class="item-price" v-if="item.price != undefined">
            ￥<span class="item-price-blod">{{ goodsFormatPrice(item.price)[0] }}</span>.{{ goodsFormatPrice(item.price)[1] }}
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
  computed: {
    recommendGoods() {
      return (this.res || []).filter((item) => item && item.thumbnail && item.goodsName);
    },
  },
  mounted() {},
  methods: {
    // 点击商品
    clickGoods(val) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${val.id}&goodsId=${val.goodsId}`,
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
  height: 60rpx;
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
  width: calc(33.333% - 12rpx);
  margin-bottom: 16rpx;
  overflow: hidden;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.recommend-item-img {
  width: 100%;
  height: 218rpx;
  overflow: hidden;
  border-radius: 12rpx;
  line-height: 0;
}

.recommend-thumb {
  width: 100%;
  height: 218rpx;
  display: block;
  border-radius: 12rpx;
}

.recommend-list-view {
  width: 100%;
}
.shopTag {
  background: $main-color;
  font-size: 24rpx;
  margin-left: 10rpx;
  padding: 6rpx 12rpx;
  border-radius: 10rpx;
  font-weight: normal;
  color: #fff;
}

.store-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 40rpx 20rpx 50rpx;

  .logo {
    overflow: hidden;
    border-radius: 6px;
  }

  .name-star {
    flex: 1;
    margin-left: 20rpx;
    .name {
      display: flex;
      align-items: center;
      width: 100%;
      line-height: 1;
      font-weight: 700;
      font-size: 28rpx;
    }
    .desc {
      font-size: 12px;
      color: #999;
      margin-left: 10px;
    }
  }

  .to-store-btn {
    display: flex;
    align-items: center;

    > .to-store-text {
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
}

.recommend-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 12rpx;

  ::v-deep .u-row {
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
    color: $price-color;
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
  padding-bottom: 20rpx;
}
.goodsNum,
.collectionNum {
  font-size: 24rpx;
  color: #999;
}
.store-row {
  display: flex;
  align-items: center;
  margin: 10rpx 0;
  > .collectionNum,
  > .goodsNum {
    margin-right: 20rpx;
  }
}
</style>
