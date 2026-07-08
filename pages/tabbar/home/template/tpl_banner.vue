<template>
  <view class="layout">
    <view class="banner-box">
      <u-swiper
        v-if="res && res.list && res.list.length"
        class="home-banner-swiper"
        :list="res.list"
        keyName="img"
        height="350rpx"
        imgMode="scaleToFill"
        interval="5000"
        duration="500"
        circular
        indicator
        @click="clickSwiper"
      >
        <template #loading><u-loading-icon></u-loading-icon></template>
      </u-swiper>
    </view>
  </view>
</template>

<script setup lang="ts">
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

function clickSwiper(index: number) {
  modelNavigateTo(props.res.list[index]);
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";

.banner-box {
  width: 100%;
  overflow: hidden;
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
