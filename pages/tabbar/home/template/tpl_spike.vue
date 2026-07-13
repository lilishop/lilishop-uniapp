<template>
  <div class="layout" v-if="goodsList.length">
    <div class="join-list">
      <div class="join-title" @click="goMore">
        <div class="join-title-name">{{ res.list[0].title }}</div>
        <div class="join-title-more">更多</div>
      </div>
      <div class="join-box">
        <div
          class="join-item"
          @click="goDetail(item)"
          v-for="(item, index) in goodsList"
          :key="index"
        >
          <div class="item-img-box">
            <u-image
              class="item-img"
              width="150rpx"
              height="150rpx"
              :src="item.goodsImage || item.thumbnail"
            />
          </div>
          <div class="item-price">
            <span class="price-text">￥{{ item.price }}</span>
          </div>
          <div class="item-line-through">
            <span class="price-text">￥{{ item.originalPrice }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import * as API_Promotions from "@/api/promotions";

const props = defineProps<{ res: any }>();

const goodsList = ref<any[]>([]);

onMounted(() => {
  API_Promotions.getSeckillTimeLine().then((res) => {
    if (res.data.success && res.data.result && res.data.result.length) {
      const sorted = res.data.result.sort(
        (x: any, y: any) => Number(x.timeLine) - Number(y.timeLine)
      );
      const first = sorted[0] || {};
      goodsList.value = (first.seckillGoodsList || []).slice(
        0,
        props.res.list[0].count || 3
      );
    }
  });
});

function goMore() {
  uni.navigateTo({ url: "/pages/promotion/seckill" });
}

function goDetail(item: any) {
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
  });
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
@import "./advertising.scss";
.join-box {
  display: flex;
}
.item-price {
  .price-text {
    font-size: 15px;
    font-weight: 500;
    color: $main-color;
  }
}
.join-item {
  flex: 1;
  text-align: center;
}
.item-img {
  width: 75px;
  height: 75px;
  margin: 0 auto;
  display: block;
}
.item-img-box {
  position: relative;
}
.item-line-through {
  .price-text {
    font-size: 10px;
    font-weight: 400;
    text-decoration: line-through;
    color: #999;
  }
}
.join-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  height: 50px;
  .join-title-name {
    font-size: 16px;
    font-weight: bold;
  }
  .join-title-more {
    font-size: 12px;
    color: #999;
  }
}
</style>
