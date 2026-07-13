<template>
  <div class="layout">
    <div class="flex-one hot-image">
      <image class="hot-image-main" mode="widthFix" :src="res.list[0].img" alt=""></image>

      <image
        v-for="(area, index) in res.list[0].zoneInfo"
				:key="index"
        @click="modelNavigateTo(area)"
        mode="widthFix"
        class="hot-area"
        :style="{
          left: area.leftPer * 100 + '%',
          top: area.topPer * 100 + '%',
          width: area.widthPer * 100 + '%',
          height: area.heightPer * 100 + '%',
        }"
        :src="area.img"
        alt=""
      ></image>
    </div>
  </div>
</template>
<script setup lang="ts">
import { modelNavigateTo } from "./tpl";

defineProps<{ res: any }>();
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.hot-image {
  position: relative;
}
.hot-area {
  position: absolute;
  z-index: 99;
}
.flex-one {
  width: 100%;
  display: block;
  overflow: hidden;
}
.hot-image-main {
  width: 100%;
  min-height: 200rpx;
}
</style>
