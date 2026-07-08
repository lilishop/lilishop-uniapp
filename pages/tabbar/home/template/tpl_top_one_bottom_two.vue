
<template>
  <div class="layout">
    <div class="view-width-100" @click="modelNavigateTo(res.list[0])">
      <u-image class="image-mode" width="100%" height="200rpx" :src="res.list[0].img">
        <template #loading><u-loading-icon></u-loading-icon></template>
      </u-image>
    </div>
    <div class="view-width-100" @click="modelNavigateTo(res.list[1])">
      <div class="view-height-85">
        <u-image class="image-mode" width="100%" height="170rpx" :src="res.list[1].img">
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </div>
      <div class="view-height-85" @click="modelNavigateTo(res.list[2])">
        <u-image class="image-mode" width="100%" height="170rpx" :src="res.list[2].img">
          <template #loading><u-loading-icon></u-loading-icon></template>
        </u-image>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { modelNavigateTo } from "./tpl";

defineProps<{ res: any }>();
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;

  flex-direction: column;
}
// img {
//   width: 100% !important;
//   height: 85px !important;
// }
.view-width-100 {
  padding: 1px 0;
  display: flex;
  height: 200rpx;
  width: 100%;
}
.view-height-85 {
  padding: 0 1px;
  width: 50%;
}
.image-mode{
  width: 100%;
}
</style>