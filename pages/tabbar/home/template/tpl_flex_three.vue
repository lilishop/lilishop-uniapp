
<template>
  <div class="layout">
    <u-image @click="modelnavigateTo(item)" height="240rpx" width="240rpx" class="image-mode" :src="item.img" v-for="(item, index) in res.list" :key="index">
      <u-loading slot="loading"></u-loading>
    </u-image>
  </div>
</template>

<script>
import { modelnavigateTo } from "./tpl";

export default {
  title: "三列单行图片模块",
  props: ["res"],
  mounted() {
    console.log(this.res);
  },
  data() {
    return {
      modelnavigateTo,
    };
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
}
img {
  width: 111px;
}
</style>