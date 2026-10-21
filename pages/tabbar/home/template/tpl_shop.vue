<template>
  <view class="tpl-shop" :style="wrapperStyle" v-if="shopList.length">
    <view class="shop-head" v-if="headIcon || title || moreUrl">
      <image v-if="headIcon" class="shop-head-icon" :src="headIcon" mode="aspectFit" />
      <view class="shop-title" :style="titleStyle">{{ title }}</view>
      <view v-if="moreUrl" class="shop-more" :style="moreStyle" @click="goMore">更多 &gt;</view>
    </view>

    <!-- 老数据：两列网格 -->
    <view v-if="!styled" class="shop-grid-legacy">
      <view
        class="shop-item"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <image
          v-if="showLogo"
          class="shop-logo"
          :src="item.storeLogo"
          mode="aspectFill"
        />
        <view v-if="showName" class="shop-name">{{ item.storeName }}</view>
      </view>
    </view>

    <!-- 样式一：店铺卡片（商品图背景 + Logo + 名称 + 类型标签） -->
    <view v-else-if="shopStyle === 'one'" class="shop-grid">
      <view
        class="shop-card"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <image
          v-if="(item.goodsImages && item.goodsImages.length) || item.storeBanner"
          class="shop-card-bg"
          :style="logoStyle"
          :src="item.goodsImages && item.goodsImages.length ? item.goodsImages[0] : item.storeBanner"
          mode="aspectFill"
        />
        <view v-else class="shop-card-bg shop-card-bg-empty" :style="logoStyle"></view>
        <view class="shop-card-body">
          <image
            v-if="showLogo"
            class="shop-card-logo"
            :src="item.storeLogo"
            mode="aspectFit"
          />
          <view v-if="showName" class="shop-card-name" :style="nameStyle">{{ item.storeName }}</view>
        </view>
      </view>
    </view>

    <!-- 样式二：店铺卡片 + 商品列表 -->
    <view v-else class="shop-street-list">
      <view
        class="shop-street-card"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <view class="shop-street-head">
          <image v-if="showLogo" class="shop-street-logo" :src="item.storeLogo" mode="aspectFit" />
          <view v-if="showName" class="shop-street-name" :style="nameStyle">{{ item.storeName }}</view>
          <image
            v-if="(item.goods && item.goods.length) || item.storeBanner"
            class="shop-street-banner"
            :style="logoStyle"
            :src="item.goods && item.goods.length ? item.goods[0].img : item.storeBanner"
            mode="aspectFill"
          />
        </view>
        <view class="shop-street-goods">
          <view
            class="street-goods-item"
            v-for="(g, gi) in item.goods || []"
            :key="gi"
          >
            <image class="street-goods-img" :src="g.img" mode="aspectFill" />
            <view class="street-goods-name">{{ g.name }}</view>
            <view class="street-goods-price">
              ¥{{ goodsFormatPrice(g.price)[0] }}.{{ goodsFormatPrice(g.price)[1] }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { getStoreList } from "@/api/store.js";
import { getGoodsList } from "@/api/goods.js";
import { goodsFormatPrice } from "@/utils/filters.js";
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

const shopList = ref<any[]>([]);

const first = computed(() => props.res?.list?.[0] || {});
const title = computed(() => first.value.title || "");
const count = computed(() => first.value.count || 4);
const headIcon = computed(() => first.value.icon || "");
const moreUrl = computed(() => first.value.moreUrl || "");
const showLogo = computed(() => first.value.showLogo !== false);
const showName = computed(() => first.value.showName !== false);
const shopStyle = computed(() => first.value.shopStyle || "one");

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (styled.value) {
    const bg =
      !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
    const radius = Number(res.borderRadius) || 0;
    return {
      background: bg,
      padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
      marginBottom: `${Number(res.pageGap) || 0}rpx`,
      borderRadius: `${radius}rpx`,
      overflow: radius > 0 ? "hidden" : "visible",
    };
  }
  return {
    background: res.bgColor || "#FFFFFF",
    padding: `20rpx ${res.paddingX ?? 0}rpx`,
    marginBottom: `${res.pageGap ?? 10}rpx`,
    borderRadius: `${res.borderRadius ?? 0}rpx`,
    overflow: "hidden",
  };
});
const titleStyle = computed(() =>
  styled.value && props.res.titleColor ? { color: props.res.titleColor } : {}
);
const nameStyle = computed(() =>
  styled.value && props.res.nameColor ? { color: props.res.nameColor } : {}
);
const moreStyle = computed(() =>
  styled.value && props.res.moreColor ? { color: props.res.moreColor } : {}
);
const logoStyle = computed(() =>
  styled.value ? { borderRadius: `${Number(props.res.imgRadius) || 0}rpx` } : {}
);

async function loadShops() {
  const item = first.value;
  if (item.dataMode === "custom" && Array.isArray(item.shopList) && item.shopList.length) {
    shopList.value = item.shopList;
  } else {
    const res = await getStoreList({ pageNumber: 1, pageSize: count.value });
    if (res.data.success && res.data.result) {
      shopList.value = (res.data.result.records || []).slice(0, count.value);
    }
  }
  loadGoodsImages();
}

// 样式二：按店铺拉取商品（图片、名称、价格）
function loadGoodsImages() {
  if (shopStyle.value !== "two") return;
  shopList.value.forEach((shop: any, i: number) => {
    getGoodsList({ storeId: shop.id, pageNumber: 1, pageSize: 3 }).then((res: any) => {
      const records = res?.data?.result?.records || res?.data?.result || [];
      const goods = (Array.isArray(records) ? records : [])
        .map((g: any) => ({
          name: g.goodsName,
          price: g.price,
          img: g.thumbnail || g.small || g.goodsImage,
        }))
        .filter((g: any) => g.img);
      shopList.value[i].goods = goods;
      shopList.value[i].goodsImages = goods.map((g: any) => g.img);
    }).catch(() => {});
  });
}

watch(
  () => [first.value.dataMode, first.value.shopList, count.value],
  () => loadShops(),
  { immediate: true, deep: true }
);

function goShop(item: any) {
  uni.navigateTo({ url: `/pages/product/shopPage?id=${item.id}` });
}

function goMore() {
  modelNavigateTo({ url: moreUrl.value });
}
</script>

<style lang="scss" scoped>
.shop-head {
  display: flex;
  align-items: center;
  padding: 8rpx 24rpx 20rpx;
}
.shop-head-icon {
  width: 124rpx;
  height: 32rpx;
  flex-shrink: 0;
  margin-right: 12rpx;
}
.shop-title {
  flex: 1;
  min-width: 0;
  font-size: 30rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-more {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #999;
}

// 样式一：三列店铺卡片
.shop-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
  gap: 16rpx;
}
.shop-card {
  width: calc((100% - 32rpx) / 3);
  border-radius: 12rpx;
  overflow: hidden;
  background: #f7f7f7;
}
.shop-card-bg {
  width: 100%;
  height: 140rpx;
  display: block;
  background: #eee;
}
.shop-card-bg-empty {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
.shop-card-body {
  padding: 8rpx;
  text-align: center;
}
.shop-card-logo {
  position: relative;
  z-index: 1;
  display: block;
  width: 96rpx;
  height: 32rpx;
  margin: -16rpx auto 0;
  background: #fff;
}
.shop-card-name {
  font-size: 24rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 6rpx;
}
// 样式二：店铺卡片 + 商品列表
.shop-street-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.shop-street-card {
  border-radius: 12rpx;
  overflow: hidden;
  background: #f7f7f7;
}
.shop-street-head {
  position: relative;
  display: flex;
  align-items: center;
  height: 68rpx;
  padding: 0 16rpx;
  box-sizing: border-box;
  background: var(--theme-primary, #ff3c2a);
  overflow: hidden;
}
.shop-street-logo {
  flex-shrink: 0;
  width: 88rpx;
  height: 32rpx;
  padding: 2rpx 6rpx;
  box-sizing: border-box;
  background: #fff;
  border-radius: 4rpx;
}
.shop-street-name {
  max-width: calc(100% - 220rpx);
  margin-left: 12rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-street-banner {
  position: absolute;
  top: 0;
  right: 0;
  width: 160rpx;
  height: 68rpx;
}
.shop-street-goods {
  display: flex;
  gap: 12rpx;
  padding: 12rpx;
  box-sizing: border-box;
}
.street-goods-item {
  flex: 1;
  min-width: 0;
  border-radius: 8rpx;
  overflow: hidden;
  background: #fff;
}
.street-goods-img {
  width: 100%;
  height: 116rpx;
  display: block;
  background: #eee;
}
.street-goods-name {
  padding: 8rpx 8rpx 0;
  color: #282828;
  font-size: 22rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.street-goods-price {
  padding: 4rpx 8rpx 10rpx;
  color: var(--theme-primary, #ff3c2a);
  font-size: 22rpx;
  font-weight: 600;
}

// 老数据两列网格（未配置样式时）
.shop-grid-legacy {
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
  flex-shrink: 0;
}
.shop-name {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  color: #333;
  margin-left: 16rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
