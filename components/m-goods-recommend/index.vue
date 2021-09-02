<template>
  <div>
    <div class="goods-recommend">{{title ? `--${title}-- `:''}}</div>
    <div class="goods-list">
      <div @click="handleClick(item)" class="goods-item" v-for="(item, item_index) in goodsList" :key="item_index">
        <div class="goods-img">
          <u-image :src="item.content.thumbnail" mode="aspectFill" height="350rpx" width="100%">
            <u-loading slot="loading"></u-loading>
          </u-image>
        </div>
        <div class="goods-desc">
          <div class="goods-title">
            {{ item.content.goodsName }}
          </div>
          <div class="goods-bottom">
            <div class="goods-price">￥{{ item.content.price | unitPrice }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getGoodsList } from "@/api/goods.js";
export default {
  data() {
    return {
      goodsList: [],
      params: {
        pageNumber: 1,
      },
    };
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    pageSize: {
      type: null,
      default: 12,
    },
    categoryId: {
      type: null,
      default: "",
    },
    storeId: {
      type: null,
      default: "",
    },
  },
  mounted() {
    this.initGoods();
  },
  methods: {
    /**
     * 初始化商品
     */
    async initGoods() {
      let submit = JSON.parse(
        JSON.stringify(
          Object.assign(this.params, {
            pageSize: this.pageSize,
            categoryId: this.categoryId,
            storeId: this.storeId,
          })
        )
      );

      Object.keys(submit).map((key) => {
        if (!submit[key] || submit[key].length == 0) {
          delete submit[key];
        }
      });
      let goodsList = await getGoodsList(submit);
      this.goodsList.push(...goodsList.data.result.content);
    },
    handleClick(item) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${item.content.id}&goodsId=${item.content.goodsId}`,
      });
    },
  },
};
</script>

<style scoped lang="scss">
/**商品代码 */
$w_94: 94%;
.goods-recommend {
  background: #f7f7f7;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  background: #f7f7f7;
}
.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}
.goods-img {
  position: relative;
  margin: 0 auto;
  width: $w_94;
  height: 350rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
  }
}
.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;
  > .goods-title {
    font-size: 12px;
    height: 70rpx;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;

    -webkit-line-clamp: 2;

    overflow: hidden;
  }

  > .goods-bottom {
    display: flex;
    font-weight: bold;

    > .goods-price {
      line-height: 2;
      color: $main-color;
    }
  }
}
</style>