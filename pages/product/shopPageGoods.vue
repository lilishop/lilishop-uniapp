<template>
  <div>
    <u-navbar :title="title"></u-navbar>
    <!-- 商品 -->
    <div class="contant">
      <view v-if="!goodsList.length" class="empty">暂无商品信息</view>
      <view v-else class="item" v-for="(item,index) in goodsList" :key="index" @click="navigateToGoodsDetail(item)">
        <u-image width="100%" mode="aspectFit" height="324rpx" :src="item.content.thumbnail">
          <u-loading slot="loading"></u-loading>
        </u-image>
        <div class="name">{{ item.content.goodsName }}</div>
        <div class="price">
          <div>￥{{ item.content.price | unitPrice }}</div>
        </div>
        <view class="buyCount">
          <div>已售 {{ item.content.buyCount || "0" }}</div>
        </view>
      </view>
    </div>
  </div>

</template>

<script>
import { getGoodsList } from "@/api/goods.js";
export default {
  data() {
    return {
      title: "",
      routerVal: "",
      goodsList: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
        storeCatId: "",
        storeId: "",
      },
    };
  },
  onLoad(options) {
    this.routerVal = options;
    this.params.storeId = options.storeId;
    this.params.storeCatId = options.id;
    this.title = options.title;
  },
  onShow() {
    this.goodsList =[]
    this.params.pageNumber = 1;
    this.getGoodsData();
  },
  onReachBottom(){
    this.params.pageNumber ++;
    this.getGoodsData();
  },
  methods: {
    /**
     * 跳转到商品详情
     */
    navigateToGoodsDetail(val) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${val.content.id}&goodsId=${val.content.goodsId}`,
      });
    },

    async getGoodsData() {
      // #TODO
      let goodsList = await getGoodsList(this.params);
      if (goodsList.data.success) {
        this.goodsList.push(...goodsList.data.result.content);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.contant {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  > .empty {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
  }
  .item {
    overflow: hidden;

    background: #fff;
    width: 49%;
    height: 484rpx;
    font-size: 26rpx;
    display: flex;
    flex-direction: column;
    border: 1px solid #f8f8f8;
    margin-bottom: 20rpx;

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
</style>