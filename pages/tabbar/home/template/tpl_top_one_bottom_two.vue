
<template>
  <div class="layout">
    <div class="view-width-100" @click="modelnavigateTo(res.list[0])">
      <u-image class="image-mode" width="100%" height="200rpx" :src="res.list[0].img">
        <u-loading slot="loading"></u-loading>
      </u-image>
    </div>
    <div class="view-width-100" @click="modelnavigateTo(res.list[1])">
      <div class="view-height-85">
        <u-image class="image-mode" width="100%" height="170rpx" :src="res.list[1].img">
          <u-loading slot="loading"></u-loading>
        </u-image>
      </div>
      <div class="view-height-85" @click="modelnavigateTo(res.list[2])">
        <u-image class="image-mode" width="100%" height="170rpx" :src="res.list[2].img">
          <u-loading slot="loading"></u-loading>
        </u-image>
      </div>
    </div>
  </div>
</template>

<script>
import { modelnavigateTo } from "./tpl";
export default {
  title: "上一下二",
  props: ["res"],
  data() {
    return {
      modelnavigateTo,
    };
  },
  mounted() {},
};
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
  > img {
    width: 100%;
    height: 100%;
  }
}
.view-height-85 {
  padding: 0 1px;
  width: 50%;
  > img {
    width: 100%;
    height: 100%;
  }
}
.image-mode{
  width: 100%;
}
</style>