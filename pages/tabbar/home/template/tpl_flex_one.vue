<template>
  <div class="layout">
    <div class="flex-one">
      <u-image v-if="res.list[0].zoneInfo == ''" @click="modelNavigateTo(res.list[0])" width="100%" mode="aspectFit" height="280rpx" :src="res.list[0].img" alt=""></u-image>
      <hotzone v-else :res="res"></hotzone>
    </div>
  </div>
</template>
<script>
import { modelNavigateTo } from "./tpl";
import hotzone from "@/pages/tabbar/home/template/tpl_hot_zone.vue";

export default {
  title: "单行图片模块",
  components: {
    hotzone,
  },
  data() {
    return {
      modelNavigateTo
    };
  },
  props: ["res"],
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.flex-one {
  width: 100%;
  display: block;
  overflow: hidden;
  > img {
    width: 100%;
    height: 100%;
  }
}
</style>