<template>
  <!-- 新版商品列表 -->
  <view v-if="isNew" class="goods-new" :style="wrapperStyle">
    <view v-if="displayGoods.length" class="g-list" :class="'mode-' + layout" :style="listStyle">
      <view
        class="g-item"
        v-for="(g, i) in displayGoods"
        :key="i"
        :style="itemStyle"
        @click="goDetail(g)"
      >
        <view class="g-imgbox">
          <image :src="g.img" mode="aspectFill" class="g-img" />
        </view>
        <view class="g-info">
          <view v-if="showName" class="g-name" :style="nameStyle">{{ g.name }}</view>
          <view v-if="showPrice" class="g-price" :style="priceStyle">
            ¥{{ goodsFormatPrice(g.price)[0] }}.{{ goodsFormatPrice(g.price)[1] }}
          </view>
          <view class="g-bottom">
            <text
              v-if="showSales && g.sales != null"
              class="g-sales"
              :style="salesStyle"
              >已售{{ g.sales }}件</text
            >
            <view
              v-if="cartShow"
              class="g-cart"
              :class="'cart-' + cartStyle"
              :style="{ background: priceColor }"
              @click.stop="onCartBtn(g)"
            >
              <text v-if="cartStyle === 'text'" class="cart-text-label">加购</text>
              <text v-else-if="cartStyle === 'plus'" class="cart-plus-label">+</text>
              <u-icon v-else name="shopping-cart" color="#ffffff" size="28rpx"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else class="g-empty">暂无商品</view>
  </view>

  <!-- 旧版：分类标签 + 绑定商品 -->
  <view v-else class="layout">
    <u-sticky>
      <view class="goods-cell-title">
        <view
          class="goods-item-title"
          :class="{ 'selected-title': selected.index == index }"
          @click="handleClickTitle(title, index)"
          v-for="(title, index) in res.list[0].titleWay"
          :key="index"
        >
          <h4 class="h4">{{ title.title }}</h4>
          <view class="title-desc">{{ title.desc }}</view>
        </view>
      </view>
    </u-sticky>
    <view class="goods-list">
      <template v-for="(item, item_index) in res.list[0].listWay" :key="item_index">
        <view
          v-if="
            item.___index != undefined
              ? selected.index == item.___index
              : selected.val == item.type
          "
          @click="handleClick(item)"
          class="goods-item"
        >
          <view class="goods-img">
            <u-image
              :src="item.img"
              height="350rpx"
              mode="aspectFit"
              width="100%"
            >
              <template #loading><u-loading-icon></u-loading-icon></template>
            </u-image>
          </view>
          <view class="goods-desc">
            <view class="goods-title">
              {{ item.title }}
            </view>
            <view class="goods-bottom">
              <view class="goods-price">
                ¥<span class="price-int"
                  >{{ goodsFormatPrice(item.price)[0] }} </span
                >.{{ goodsFormatPrice(item.price)[1] }}
              </view>
            </view>
          </view>
        </view>
      </template>

      <template
        v-if="currentTitleWay?.bindCategory && goodsData.length"
      >
        <view
          v-for="(item, index) in goodsData"
          :key="index"
          class="goods-item"
          @click="handleClick(item)"
        >
          <view class="goods-img">
            <u-image
              :src="item.thumbnail"
              height="350rpx"
              mode="aspectFit"
              width="100%"
            >
              <template #loading><u-loading-icon></u-loading-icon></template>
            </u-image>
          </view>
          <view class="goods-desc">
            <view class="goods-title">
              {{ item.goodsName }}
            </view>
            <view class="goods-bottom">
              <view class="goods-price">
                ¥<span class="price-int"
                  >{{ goodsFormatPrice(item.price)[0] }} </span
                >.{{ goodsFormatPrice(item.price)[1] }}
              </view>
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted, computed } from "vue";
import { getGoodsList } from "@/api/goods.js";
import { addToCart } from "@/api/trade.js";
import { goodsFormatPrice } from "@/utils/filters.js";
import storage from "@/utils/storage.js";

const props = defineProps<{ res: any; enableBottomLoad?: boolean }>();

const selected = reactive({
  index: 0,
  val: "",
});

// ---------- 新版商品列表 ----------
const first = computed(() => props.res?.list?.[0] || {});
const isNew = computed(() => first.value.layout !== undefined);
const layout = computed(() => first.value.layout || "list");
const showName = computed(() => first.value.showName !== false);
const showPrice = computed(() => first.value.showPrice !== false);
const showSales = computed(() => first.value.showSales !== false);
const cartShow = computed(() => first.value.cartShow !== false);
const cartStyle = computed(() => first.value.cartStyle || "plus");
const priceColor = computed(() =>
  props.res?.toneMode === "custom" && props.res?.priceColor
    ? props.res.priceColor
    : "var(--theme-primary, #ff3c2a)"
);
const priceStyle = computed(() => ({ color: priceColor.value }));
const nameStyle = computed(() =>
  props.res?.titleColor ? { color: props.res.titleColor } : {}
);
const salesStyle = computed(() =>
  props.res?.salesColor ? { color: props.res.salesColor } : {}
);
const rpx = (v: any) => `${(Number(v) || 0) * 2}rpx`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1 || "#ffffff"
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    background: bg,
    padding: `${rpx(res.paddingTop)} ${rpx(res.paddingX)} ${rpx(res.paddingBottom)}`,
    borderRadius: rpx(res.borderRadius),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
});
const listStyle = computed(() => ({ gap: rpx(props.res?.contentGap ?? 10) }));
const itemStyle = computed(() => ({
  borderRadius: rpx(props.res?.contentRadius ?? 7),
  overflow: Number(props.res?.contentRadius ?? 7) > 0 ? "hidden" : "visible",
}));

const newGoodsData = ref<any[]>([]);

const displayGoods = computed(() => {
  if (!isNew.value) return [];
  return newGoodsData.value;
});

// 触底加载（新版）
const newParams = reactive({ pageNumber: 1 });
const newTotal = ref(0);

function buildQuery() {
  const item = first.value;
  const params: Record<string, any> = {
    pageNumber: newParams.pageNumber,
    pageSize: item.count || 6,
  };
  if (item.dataMode === "brand" && item.brandId) params.brandId = item.brandId;
  if (item.dataMode === "store" && item.storeId) params.storeId = item.storeId;
  if (item.dataMode === "category" && item.categoryId) params.categoryId = item.categoryId;
  if (item.dataMode === "goods") {
    const ids = (item.goodsList || []).map((g: any) => g.id).filter(Boolean);
    if (!ids.length) return null;
    params.ids = ids.join(",");
    params.pageSize = ids.length;
  }
  if (item.sortType === "sales") {
    params.sort = "buyCount";
    params.order = "desc";
  } else if (item.sortType === "price") {
    params.sort = "price";
    params.order = "asc";
  }
  return params;
}

async function loadNewGoods(reset = true) {
  const params = buildQuery();
  if (!params) {
    newGoodsData.value = [];
    newTotal.value = 0;
    return;
  }
  try {
    const res = await getGoodsList(params);
    if (!res.data.success) return;
    const result = res.data.result || {};
    const records = result.records || [];
    const mapped = records.map((g: any) => ({
      id: g.id,
      goodsId: g.goodsId,
      name: g.goodsName,
      price: g.price,
      img: g.thumbnail || g.small,
      sales: g.buyCount != null ? g.buyCount : null,
    }));
    if (reset) {
      // 指定商品：按选择顺序排列
      if (first.value.dataMode === "goods") {
        const byGoodsId: Record<string, any> = {};
        mapped.forEach((g: any) => {
          byGoodsId[g.goodsId] = g;
        });
        newGoodsData.value = (first.value.goodsList || [])
          .map((g: any) => byGoodsId[g.id])
          .filter(Boolean);
      } else {
        newGoodsData.value = mapped;
      }
    } else {
      newGoodsData.value.push(...mapped);
    }
    newTotal.value = result.totalElements ?? newGoodsData.value.length;
  } catch (e) {
    // 静默失败，保持已有数据
  }
}

function goDetail(g: any) {
  if (!g?.id || !g?.goodsId) return;
  uni.navigateTo({
    url: `/pages/product/goods?id=${g.id}&goodsId=${g.goodsId}`,
  });
}

function onCartBtn(g: any) {
  if (first.value.cartAction !== "add") {
    goDetail(g);
    return;
  }
  if (!g?.id) return;
  if (!storage.getAccessToken()) {
    // #ifdef MP-WEIXIN
    uni.navigateTo({ url: "/pages/passport/wechatMPLogin" });
    // #endif
    // #ifndef MP-WEIXIN
    uni.navigateTo({ url: "/pages/passport/login" });
    // #endif
    return;
  }
  addToCart({ skuId: g.id, num: 1 }).then((res: any) => {
    uni.showToast({
      title: res.data.success ? "已加入购物车" : res.data.message || "加购失败",
      icon: "none",
    });
  });
}

watch(
  () => [
    first.value.dataMode,
    first.value.categoryId,
    first.value.brandId,
    first.value.storeId,
    first.value.count,
    first.value.sortType,
    first.value.goodsList,
  ],
  () => {
    if (!isNew.value) return;
    newParams.pageNumber = 1;
    loadNewGoods(true);
  },
  { immediate: true, deep: true }
);

// ---------- 旧版逻辑 ----------
const currentTitleWay = computed(() => {
  return props.res?.list?.[0]?.titleWay?.[selected.index]
})
const params = reactive({
  pageNumber: 1,
  pageSize: 100,
  categoryId: "",
});
const goodsData = ref<any[]>([]);
const goodsResult = ref<any>("");

watch(
  () => props.res,
  (val) => {
    if (!val?.list?.[0]) return
    if (val.list[0].layout !== undefined) return
    const firstListWay = val.list[0].listWay?.[0]
    selected.val = firstListWay?.type || ''
    const firstTitleWay = val.list[0].titleWay?.[0]
    if (firstTitleWay?.bindCategory) {
      initGoods(firstTitleWay)
    }
  },
  { immediate: true }
)

onMounted(() => {
  uni.$on("onReachBottom", () => {
    if (!props.enableBottomLoad) return;
    if (isNew.value) {
      // 新版：仅分类/品牌/商户模式支持触底加载
      if (first.value.dataMode === "goods") return;
      if (newTotal.value > newGoodsData.value.length) {
        newParams.pageNumber++;
        loadNewGoods(false);
      }
      return;
    }
    if (
      goodsResult.value.totalElements >=
      params.pageNumber * params.pageSize
    ) {
      params.pageNumber++;
      initGoods(props.res.list[0].titleWay[selected.index]);
    }
  });
});

onUnmounted(() => {
  uni.$off("onReachBottom");
});

function handleClick(item: any) {
  if (!item?.id || !item?.goodsId) return
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
  })
}

async function initGoods(val: any) {
  if (props.enableBottomLoad) params.pageSize = 20;
  val ? (params.categoryId = val.bindCategory.id) : "";
  const res = await getGoodsList(params);
  if (res.data.success) {
    goodsResult.value = res.data.result;
    const result = res.data.result.records;
    goodsData.value.push(...result);
  }
}

function handleClickTitle(val: any, index: number) {
  selected.index = index;
  selected.val = val.title;
  if (val.bindCategory) {
    params.pageNumber = 1;
    goodsData.value = [];
    initGoods(val);
  }
}
</script>
<style lang="scss" scoped>
$w_94: 94%;

// ---------- 新版 ----------
.goods-new {
  background: #fff;
}

.g-empty {
  padding: 60rpx 0;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}

.g-list {
  display: flex;
  flex-wrap: wrap;
}

.g-item {
  background: #fff;
  display: flex;
  box-sizing: border-box;
}

.g-imgbox {
  flex-shrink: 0;
  background: #f5f5f5;
  overflow: hidden;
}

.g-img {
  width: 100%;
  height: 100%;
  display: block;
}

.g-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.g-name {
  font-size: 26rpx;
  color: #282828;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.g-bottom {
  display: flex;
  align-items: center;
  margin-top: auto;
}

.g-price {
  color: $main-color;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.g-sales {
  flex: 1;
  min-width: 0;
  font-size: 22rpx;
  color: #666;
}

.g-cart {
  flex-shrink: 0;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: $main-color;
}

.cart-plus,
.cart-cart {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
}

.cart-plus-label {
  font-size: 28rpx;
  line-height: 1;
}

.cart-text {
  border-radius: 18rpx;
  padding: 4rpx 18rpx;
}

.cart-text-label {
  font-size: 22rpx;
}

/* 卡片：左图右文 */
.mode-card {
  flex-direction: column;
  .g-item {
    flex-direction: row;
    align-items: center;
    padding: 16rpx;
  }
  .g-imgbox {
    width: 140rpx;
    height: 140rpx;
    margin-right: 16rpx;
  }
  .g-name {
    margin-bottom: 8rpx;
  }
  .g-cart {
    align-self: center;
  }
}

/* 列表：两列网格 */
.mode-list {
  .g-item {
    width: calc(50% - 10rpx);
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    height: 330rpx;
  }
  .g-info {
    padding: 12rpx;
    min-height: 120rpx;
  }
  .g-name {
    margin-bottom: 8rpx;
  }
}

/* 三列 */
.mode-three {
  .g-item {
    width: calc(33.33% - 12rpx);
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    height: 220rpx;
  }
  .g-info {
    padding: 10rpx;
    min-height: 96rpx;
  }
  .g-name {
    -webkit-line-clamp: 1;
    font-size: 24rpx;
    margin-bottom: 6rpx;
  }
  .g-price {
    font-size: 26rpx;
  }
  .g-sales {
    font-size: 20rpx;
  }
}

/* 大图：一行一个 */
.mode-big {
  flex-direction: column;
  .g-item {
    width: 100%;
    flex-direction: column;
  }
  .g-imgbox {
    width: 100%;
    height: 420rpx;
  }
  .g-info {
    padding: 16rpx;
    min-height: 110rpx;
  }
  .g-name {
    margin-bottom: 8rpx;
  }
}

// ---------- 旧版 ----------
.layout {
  padding: 8px 0;
  background: #f9f9f9;
}

.selected-title {
  .h4 {
    font-size: 30rpx;
    color: #000 !important;
  }

  .title-desc {
    font-weight: bold;
    color: $main-color !important;
  }
}

.goods-cell-title {
  background: #f9f9f9;
  padding: 10px;
  transition: 0.35s;
  display: flex;

  > .goods-item-title {
    flex: 1;
    text-align: center;

    .h4 {
      font-size: 32rpx;
    }

    .title-desc {
      color: #999;
      font-size: 24rpx;
    }
  }
}

.goods-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
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
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  overflow: hidden;
}

.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;
  > .goods-title {
    font-size: 24rpx;
    height: 67rpx;
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
      .price-int {
        font-size: 42rpx;
      }
    }
  }
}
</style>
