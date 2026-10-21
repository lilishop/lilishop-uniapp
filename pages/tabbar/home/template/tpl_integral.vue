<template>
  <view class="layout" :style="wrapperStyle" v-if="goodsList.length">
    <view class="integral-head" :style="headStyle" @click="goMore">
      <image
        v-if="styled && options.titleType === 'image' && options.titleImage"
        class="integral-head-img"
        :src="options.titleImage"
        mode="aspectFit"
      />
      <view v-else class="integral-head-title" :style="headTitleStyle">{{ title }}</view>
      <view class="integral-head-space"></view>
      <view class="integral-head-more" :style="moreStyle">{{ "更多 >" }}</view>
    </view>
    <!-- 老数据：原始四列样式 -->
    <view v-if="!styled" class="join-box">
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
    <!-- 样式一：两列大卡片 -->
    <view v-else-if="layoutStyle === '1'" class="ig-grid2" :style="gapStyle">
      <view
        class="ig-g2-item"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="goDetail(item)"
      >
        <view class="ig-g2-img-box" :style="imgRadiusStyle">
          <image class="ig-img" :src="item.goodsImage || item.thumbnail" mode="aspectFill" />
        </view>
        <view class="ig-g2-name" :style="nameStyle">{{ item.goodsName || item.promotionName || '' }}</view>
        <view class="ig-price-row">
          <view class="ig-price" :style="pointStyle">
            <text class="ig-coin">¥</text>{{ item.points != null ? item.points : 0 }}积分
          </view>
          <text class="ig-original" v-if="item.originalPrice">¥{{ item.originalPrice }}</text>
        </view>
      </view>
    </view>
    <!-- 样式二：三列，积分价在名称上方 -->
    <view v-else-if="layoutStyle === '2'" class="ig-grid3" :style="gapStyle">
      <view
        class="ig-g3-item"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="goDetail(item)"
      >
        <view class="ig-g3-img-box" :style="imgRadiusStyle">
          <image class="ig-img" :src="item.goodsImage || item.thumbnail" mode="aspectFill" />
        </view>
        <view class="ig-price ig-price-sm" :style="pointStyle">
          <text class="ig-coin ig-coin-sm">¥</text>{{ item.points != null ? item.points : 0 }}积分
        </view>
        <view class="ig-g3-name" :style="nameStyle">{{ item.goodsName || item.promotionName || '' }}</view>
      </view>
    </view>
    <!-- 样式三：三列，仅积分价 -->
    <view v-else class="ig-grid3" :style="gapStyle">
      <view
        class="ig-g3-item"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="goDetail(item)"
      >
        <view class="ig-g3-img-box" :style="imgRadiusStyle">
          <image class="ig-img" :src="item.goodsImage || item.thumbnail" mode="aspectFill" />
        </view>
        <view class="ig-price ig-price-sm" :style="pointStyle">
          <text class="ig-coin ig-coin-sm">¥</text>{{ item.points != null ? item.points : 0 }}积分
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

const options = computed(() => props.res || {});
const title = computed(() => props.res?.list?.[0]?.title || "积分兑好礼");
const count = computed(() => props.res?.list?.[0]?.count || 6);
const layoutStyle = computed(() => props.res?.layoutStyle || "1");

// 面板保存过样式字段才启用新样式，老数据保持原样
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
    padding: `0 ${res.paddingX ?? 0}rpx`,
    marginBottom: `${res.pageGap ?? 0}rpx`,
    borderRadius: `${res.borderRadius ?? 0}rpx`,
    overflow: "hidden",
  };
});

const headStyle = computed(() => {
  if (!styled.value) return {};
  const res = props.res;
  if (res.headBgType === "image" && res.headBgImage) {
    return {
      backgroundImage: `url(${res.headBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  const bg =
    !res.headBg2 || res.headBg1 === res.headBg2
      ? res.headBg1
      : `linear-gradient(90deg, ${res.headBg1}, ${res.headBg2})`;
  return { background: bg };
});

const headTitleStyle = computed(() => {
  if (!styled.value) return {};
  const res = props.res;
  return {
    color: res.titleColor || "#FFFFFF",
    fontWeight: res.titleStyle === "bold" ? "bold" : "normal",
    fontStyle: res.titleStyle === "italic" ? "italic" : "normal",
  };
});

const moreStyle = computed(() =>
  styled.value ? { color: props.res.moreColor || "#999999" } : {}
);
const pointStyle = computed(() =>
  styled.value && props.res.pointColor ? { color: props.res.pointColor } : {}
);
const nameStyle = computed(() =>
  styled.value && props.res.nameColor ? { color: props.res.nameColor } : {}
);
const gapStyle = computed(() => {
  if (!styled.value) return {};
  const gap = `${Number(props.res.contentGap ?? 10) || 0}rpx`;
  return { gap, "--ig-gap": gap };
});
const imgRadiusStyle = computed(() =>
  styled.value ? { borderRadius: `${Number(props.res.imgRadius) || 0}rpx`, overflow: "hidden" } : {}
);

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
.integral-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 96rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}
.integral-head-img {
  width: 154rpx;
  height: 32rpx;
}
.integral-head-title {
  font-size: 32rpx;
  font-weight: bold;
}
.integral-head-space {
  flex: 1;
}
.integral-head-more {
  flex-shrink: 0;
  font-size: 24rpx;
  color: #999;
}
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

/* 积分商品卡片（参考 CRMEB 积分商城） */
.ig-img {
  width: 100%;
  height: 100%;
  display: block;
}
.ig-grid2 {
  display: flex;
  flex-wrap: wrap;
}
.ig-g2-item {
  width: calc((100% - var(--ig-gap, 10rpx)) / 2);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding-bottom: 16rpx;
  box-sizing: border-box;
}
.ig-g2-img-box {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
}
.ig-g2-name {
  margin: 16rpx 16rpx 0;
  font-size: 26rpx;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ig-price-row {
  display: flex;
  align-items: baseline;
  margin: 10rpx 16rpx 0;
  min-width: 0;
}
.ig-price {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #f5483a;
  white-space: nowrap;
}
.ig-price-sm {
  font-size: 24rpx;
  margin: 10rpx 16rpx 0;
}
.ig-coin {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffe29a, #f5a623);
  color: #fff;
  font-size: 18rpx;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6rpx;
  flex-shrink: 0;
}
.ig-coin-sm {
  width: 24rpx;
  height: 24rpx;
  font-size: 16rpx;
}
.ig-original {
  font-size: 22rpx;
  color: #999;
  margin-left: 10rpx;
  white-space: nowrap;
  text-decoration: line-through;
}
.ig-grid3 {
  display: flex;
  flex-wrap: wrap;
}
.ig-g3-item {
  width: calc((100% - var(--ig-gap, 10rpx) * 2) / 3);
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding-bottom: 16rpx;
  box-sizing: border-box;
}
.ig-g3-img-box {
  width: 100%;
  height: 184rpx;
  background: #f5f5f5;
}
.ig-g3-name {
  margin: 8rpx 16rpx 0;
  font-size: 24rpx;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
