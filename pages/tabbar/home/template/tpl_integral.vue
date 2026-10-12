<template>
  <view class="layout" :style="wrapperStyle" v-if="goodsList.length">
    <view class="join-list">
      <view class="join-title" @click="goMore">
        <view class="join-title-name">{{ title }}</view>
        <view class="join-title-more">更多</view>
      </view>
      <view class="join-box">
        <view
          class="join-item"
          @click="goDetail(item)"
          v-for="(item, index) in goodsList"
          :key="index"
        >
          <view class="item-img-box">
            <u-image
              class="item-img"
              width="150rpx"
              height="150rpx"
              :src="item.goodsImage || item.thumbnail"
            />
          </view>
          <view class="item-price">
            <span class="price-text">{{ item.points != null ? item.points : 0 }}积分</span>
          </view>
          <view class="item-line-through" v-if="item.originalPrice">
            <span class="price-text">￥{{ item.originalPrice }}</span>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import * as API_Promotions from "@/api/promotions";

const props = defineProps<{ res: any }>();

const goodsList = ref<any[]>([]);

const title = computed(() => props.res?.list?.[0]?.title || "积分商城");
const count = computed(() => props.res?.list?.[0]?.count || 3);

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `0 ${props.res?.paddingX ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: "hidden",
}));

onMounted(() => {
  API_Promotions.getPointsGoods({
    pageNumber: 1,
    pageSize: count.value,
  }).then((res) => {
    if (res.data.success && res.data.result && res.data.result.records) {
      goodsList.value = res.data.result.records.slice(0, count.value);
    }
  });
});

function goMore() {
  uni.navigateTo({ url: "/pages/promotion/point/pointList" });
}

function goDetail(item: any) {
  uni.navigateTo({ url: `/pages/promotion/point/detail?id=${item.id}` });
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.join-box {
  display: flex;
}
.item-price {
  .price-text {
    font-size: 30rpx;
    font-weight: 500;
    color: $main-color;
  }
}
.join-item {
  flex: 1;
  text-align: center;
}
.item-img-box {
  position: relative;
}
.item-line-through {
  .price-text {
    font-size: 20rpx;
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
  height: 100rpx;
  padding: 0 20rpx;
  .join-title-name {
    font-size: 32rpx;
    font-weight: bold;
  }
  .join-title-more {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
