<template>
  <div class="layout">
    <div class="flex-two">
      <div class="flex-item" @click="modelNavigateTo(res.list[0])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[0].img" alt>
          <template #loading><u-loading></u-loading></template>
        </u-image>
      </div>
      <div class="flex-item" @click="modelNavigateTo(res.list[1])">
        <u-image height="250rpx" width="100%" mode="scaleToFill" :src="res.list[1].img" alt>
          <template #loading><u-loading></u-loading></template>
        </u-image>
      </div>
    </div>
  </div>
</template>
<script>
import { modelNavigateTo } from "./tpl";
export default {
    title: "两张横图",
  props: ["res"],
  mounted() {
   
  },
  data() {
    return {
      modelNavigateTo,
    };
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.flex-two {
  width: 100%;
  display: flex;
  overflow: hidden;
}
.flex-item {
  width: 50%;
}
</style>