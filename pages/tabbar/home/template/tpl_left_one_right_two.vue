
<template>
  <div class="layout">
    <div class="view-height-150" @click="modelnavigateTo(res.list[0])">
      <u-image width="100%" height="300rpx" class="image-mode" :src="res.list[0].img" >
         <u-loading slot="loading"></u-loading>
      </u-image>
    </div>
    <div class="view-height-150">
      <div class="view-height-75" @click="modelnavigateTo(res.list[1])">
        <u-image width="100%" height="150rpx"  class="image-mode" :src="res.list[1].img" alt >
           <u-loading slot="loading"></u-loading>
        </u-image>
      </div>
      <div class="view-height-75" @click="modelnavigateTo(res.list[2])">
        <u-image width="100%" height="150rpx"  class="image-mode" :src="res.list[2].img" alt >
           <u-loading slot="loading"></u-loading>
        </u-image>
      </div>
    </div>
  </div>
</template>

<script>
import {modelnavigateTo} from './tpl'
export default {
  title: "左一右二",
  props: ["res"],
   data () {
    return {
      modelnavigateTo,
    }
  },
  mounted() {
 
  }
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  display: flex;
  align-items: center;
  justify-content: center;

  background-size: cover;
}

</style>