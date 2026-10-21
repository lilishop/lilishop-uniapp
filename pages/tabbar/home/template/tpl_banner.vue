<template>
  <view class="layout" :style="wrapperStyle">
    <view class="banner-box" :style="cardMode ? {} : boxStyle">
      <u-swiper
        v-if="!cardMode && res && res.list && res.list.length"
        class="home-banner-swiper"
        :list="res.list"
        keyName="img"
        height="350rpx"
        imgMode="scaleToFill"
        interval="5000"
        duration="500"
        circular
        :indicator="!customIndicator"
        @change="onChange"
        @click="clickSwiper"
      >
        <template #loading><u-loading-icon></u-loading-icon></template>
      </u-swiper>
      <swiper
        v-if="cardMode && res && res.list && res.list.length"
        class="card-swiper"
        autoplay
        :interval="5000"
        :duration="500"
        circular
        previous-margin="68rpx"
        next-margin="68rpx"
        @change="onChange"
      >
        <swiper-item v-for="(item, i) in res.list" :key="i">
          <view class="card-item" :class="{ active: i === current }" @click="clickSwiper(i)">
            <image class="card-img" :style="boxStyle" :src="item.img" mode="scaleToFill" />
          </view>
        </swiper-item>
      </swiper>
      <view
        v-if="customIndicator && res.indicatorStyle !== 'none' && res.list.length > 1"
        class="indicator"
        :class="'pos-' + (res.indicatorPosition || 'center')"
      >
        <view
          v-for="(item, i) in res.list"
          :key="i"
          class="dot"
          :class="[res.indicatorStyle || 'round', { active: i === current }]"
          :style="i === current ? { background: indicatorColor } : {}"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

const current = ref(0);

// 装修面板保存过样式字段才启用自定义样式/指示器，老数据保持原样
const customIndicator = computed(() => props.res && props.res.indicatorStyle !== undefined);

const cardMode = computed(() => props.res && props.res.swiperStyle === "card");

const indicatorColor = computed(() =>
  props.res.indicatorColorMode === "custom" && props.res.indicatorColor
    ? props.res.indicatorColor
    : "var(--theme-primary, #ff3c2a)"
);

const toRpx = (val: any) => `${Number(val) || 0}rpx`;

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (res.paddingTop === undefined) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `${toRpx(res.paddingTop)} ${toRpx(res.paddingX)} ${toRpx(res.paddingBottom)}`,
    background: bg,
    borderRadius: toRpx(res.borderRadius),
    marginBottom: toRpx(res.pageGap),
  };
});

const boxStyle = computed(() => {
  const res = props.res || {};
  if (res.imgRadius === undefined) return {};
  return { borderRadius: toRpx(res.imgRadius) };
});

function onChange(e: any) {
  current.value = typeof e === "number" ? e : e.current;
}

function clickSwiper(index: number) {
  modelNavigateTo(props.res.list[index]);
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";

.banner-box {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.card-swiper {
  width: 100%;
  height: 350rpx;
}

.card-item {
  width: 100%;
  height: 100%;
  padding: 0 8rpx;
  box-sizing: border-box;
  transform: scale(0.92);
  transition: transform 0.4s ease;
}

.card-item.active {
  transform: scale(1);
}

.card-img {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}

.indicator {
  position: absolute;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  z-index: 2;

  &.pos-left {
    left: 24rpx;
  }
  &.pos-center {
    left: 50%;
    transform: translateX(-50%);
  }
  &.pos-right {
    right: 24rpx;
  }

  .dot {
    background: rgba(255, 255, 255, 0.7);
    transition: background 0.3s ease;

    &.round {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin: 0 6rpx;
    }
    &.line {
      width: 24rpx;
      height: 6rpx;
      border-radius: 3rpx;
      margin: 0 4rpx;
    }
  }
}

:deep(.home-banner-swiper),
:deep(.u-swiper),
:deep(.u-swiper__wrapper) {
  width: 100%;
}

:deep(.u-swiper__wrapper__item),
:deep(.u-swiper__wrapper__item__wrapper) {
  width: 100%;
}

:deep(.u-swiper__wrapper__item__wrapper__image) {
  width: 100% !important;
  display: block;
}
</style>
