<template>
  <view class="tpl-shop" :style="wrapperStyle" v-if="shopList.length">
    <view class="shop-head" v-if="headIcon || title || moreUrl">
      <image v-if="headIcon" class="shop-head-icon" :src="headIcon" mode="aspectFit" />
      <view class="shop-title" :style="titleStyle">{{ title }}</view>
      <view v-if="moreUrl" class="shop-more" :style="moreStyle" @click="goMore">{{ "更多 >" }}</view>
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

    <!-- 样式一：店铺卡片（全景大片橱窗） -->
    <view v-else-if="shopStyle === 'one'" class="shop-grid">
      <view
        class="shop-card"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <image
          v-if="!item.imgError && ((item.goodsImages && item.goodsImages.length) || item.storeBanner)"
          class="shop-card-bg"
          :style="logoStyle"
          :src="item.goodsImages && item.goodsImages.length ? item.goodsImages[0] : item.storeBanner"
          mode="aspectFill"
          @error="handleImgError(item)"
        />
        <image
          v-else-if="item.storeLogo"
          class="shop-card-bg"
          :style="logoStyle"
          :src="item.storeLogo"
          mode="aspectFill"
        />
        <view v-else class="shop-card-bg shop-card-bg-empty" :style="logoStyle"></view>
        <view class="shop-card-badge" v-if="isSelf(item)">自营</view>
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

    <!-- 样式二：店铺卡片 + 商品列表（大牌名店街 + 精品橱窗） -->
    <view v-else class="shop-street-list">
      <view
        class="shop-street-card"
        v-for="item in shopList"
        :key="item.id"
        @click="goShop(item)"
      >
        <view class="shop-street-head">
          <view class="shop-street-info">
            <image v-if="showLogo" class="shop-street-logo" :src="item.storeLogo" mode="aspectFit" />
            <view class="shop-street-meta">
              <view class="shop-street-name-row">
                <view v-if="showName" class="shop-street-name" :style="nameStyle">{{ item.storeName }}</view>
                <text class="shop-street-tag" v-if="isSelf(item)">自营</text>
              </view>
              <view class="shop-street-desc">热卖好物甄选中</view>
            </view>
          </view>
          <view class="shop-street-enter">进店逛逛 &gt;</view>
        </view>
        <view class="shop-street-goods">
          <view
            class="street-goods-item"
            v-for="(g, gi) in item.goods || []"
            :key="gi"
          >
            <view class="street-goods-cover">
              <image class="street-goods-img" :src="g.img" mode="aspectFill" />
            </view>
            <view class="street-goods-name">{{ g.name }}</view>
            <view class="street-goods-price">
              <text class="street-goods-symbol">¥</text>{{ goodsFormatPrice(g.price)[0] }}.{{ goodsFormatPrice(g.price)[1] }}
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
    marginBottom: `${res.pageGap ?? 0}rpx`,
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

// 按店铺拉取商品（样式一用第1张商品作为店铺封面图，样式二展示商品条）
function loadGoodsImages() {
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
      if (shopList.value[i]) {
        shopList.value[i].goods = goods;
        shopList.value[i].goodsImages = goods.map((g: any) => g.img);
      }
    }).catch(() => {});
  });
}

watch(
  () => [first.value.dataMode, first.value.shopList, count.value],
  () => loadShops(),
  { immediate: true, deep: true }
);

function isSelf(shop: any) {
  if (!shop) return false;
  return Boolean(
    shop.selfOperated === true ||
    shop.selfOperated === 'true' ||
    shop.selfOperated === 1 ||
    shop.selfOperated === '1' ||
    (shop.storeName && shop.storeName.includes('自营')) ||
    (shop.name && shop.name.includes('自营'))
  );
}

function handleImgError(item: any) {
  item.imgError = true;
}

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

// 样式一：三列店铺卡片（全景大片橱窗）
.shop-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 24rpx;
  gap: 16rpx;
}
.shop-card {
  position: relative;
  width: calc((100% - 32rpx) / 3);
  height: 224rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #f7f7f7;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
.shop-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.shop-card-bg-empty {
  background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
}
.shop-card-badge {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  z-index: 2;
  font-size: 20rpx;
  color: #fff;
  background: #e1251b;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  line-height: 1.3;
  font-weight: 500;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
}
.shop-card-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 32rpx 12rpx 12rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.25) 35%, rgba(0, 0, 0, 0.72) 100%);
}
.shop-card-logo {
  flex-shrink: 0;
  display: block;
  width: 40rpx;
  height: 40rpx;
  border-radius: 6rpx;
  background: #fff;
  padding: 2rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}
.shop-card-name {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.6);
}

// 样式二：大牌名店街 + 精品橱窗
.shop-street-list {
  padding: 0 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.shop-street-card {
  border-radius: 20rpx;
  overflow: hidden;
  background: #fbfbfb;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.shop-street-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}
.shop-street-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-width: 0;
  flex: 1;
}
.shop-street-logo {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  padding: 4rpx;
  box-sizing: border-box;
  background: #fff;
  border-radius: 50%;
  border: 1px solid #eee;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}
.shop-street-meta {
  min-width: 0;
  flex: 1;
}
.shop-street-name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.shop-street-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shop-street-tag {
  flex-shrink: 0;
  font-size: 18rpx;
  color: #fff;
  background: #e1251b;
  padding: 0 8rpx;
  border-radius: 6rpx;
  line-height: 28rpx;
  font-weight: 500;
}
.shop-street-desc {
  font-size: 20rpx;
  color: #999;
  margin-top: 4rpx;
}
.shop-street-enter {
  flex-shrink: 0;
  font-size: 20rpx;
  font-weight: 500;
  color: var(--theme-primary, #ff3c2a);
  background: #fff;
  border: 1px solid rgba(255, 60, 42, 0.25);
  padding: 6rpx 16rpx;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 4rpx rgba(255, 60, 42, 0.05);
  margin-left: 16rpx;
}
.shop-street-goods {
  display: flex;
  gap: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
}
.street-goods-item {
  flex: 1;
  min-width: 0;
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f2f2f2;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.02);
}
.street-goods-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #fafafa;
}
.street-goods-img {
  width: 100%;
  height: 100%;
  display: block;
}
.street-goods-name {
  padding: 8rpx 12rpx 0;
  color: #333;
  font-size: 22rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.street-goods-price {
  padding: 4rpx 12rpx 12rpx;
  color: var(--theme-primary, #ff3c2a);
  font-size: 24rpx;
  font-weight: 700;
}
.street-goods-symbol {
  font-size: 18rpx;
  font-weight: normal;
  margin-right: 2rpx;
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
