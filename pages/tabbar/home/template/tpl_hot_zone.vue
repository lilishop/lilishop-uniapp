<template>
  <div class="layout">
    <div class="flex-one hot-image">
      <image mode="widthFix" :src="res.list[0].img" alt=""></image>

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
<script>
import { modelNavigateTo } from "./tpl";

export default {
  title: "热区模块",
  data() {
    return {
      modelNavigateTo,
    };
  },
  props: ["res"],
};
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
  image {
    width: 100%;
   
    min-height: 200rpx;
    // height: 100%;
  }
}
</style>
