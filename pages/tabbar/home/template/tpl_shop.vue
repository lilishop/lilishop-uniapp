<template>
  <view class="tpl-shop" :style="wrapperStyle" v-if="shopList.length">
    <view class="shop-title" v-if="title">{{ title }}</view>
    <view class="shop-grid">
      <view
        class="shop-item"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <image class="shop-logo" :src="item.storeLogo" mode="aspectFill" />
        <view class="shop-name">{{ item.storeName }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getStoreList } from "@/api/store.js";

const props = defineProps<{ res: any }>();

const shopList = ref<any[]>([]);

const title = computed(() => props.res?.list?.[0]?.title || "");
const count = computed(() => props.res?.list?.[0]?.count || 4);

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `20rpx ${props.res?.paddingX ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: "hidden",
}));

onMounted(() => {
  getStoreList({ pageNumber: 1, pageSize: count.value }).then((res) => {
    if (res.data.success && res.data.result) {
      shopList.value = (res.data.result.records || []).slice(0, count.value);
    }
  });
});

function goShop(item: any) {
  uni.navigateTo({ url: `/pages/product/shopPage?id=${item.id}` });
}
</script>

<style lang="scss" scoped>
.shop-title {
  font-size: 30rpx;
  font-weight: 600;
  padding: 8rpx 24rpx 20rpx;
}
.shop-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
}
.shop-item {
  width: 50%;
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}
.shop-logo {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f0f0f0;
  flex-shrink: 0;
}
.shop-name {
  font-size: 26rpx;
  color: #333;
  margin-left: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
