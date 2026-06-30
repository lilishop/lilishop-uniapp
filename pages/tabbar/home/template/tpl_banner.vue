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
        <template #loading><u-loading></u-loading></template>
      </u-swiper>
    </view>
  </view>
</template>

<script>
import { modelNavigateTo } from "./tpl";
export default {
  title: "导航栏",
  props: ["res"],
  watch: {
    res: {
      handler(newValue, oldValue) {
        this["res"] = newValue;
      },
      deep: true,
    },
  },

  mounted() {
   
  },
  methods: {
    clickSwiper(index) {
      modelNavigateTo(this.res.list[index]);
    },
  },
};
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
