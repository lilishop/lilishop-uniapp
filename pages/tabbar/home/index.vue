<template>
  <div class="wrapper">
    <!-- 楼层装修组件 -->
    <tpl ref="tpl" />
  </div>
</template>
<script>
import tpl from "@/pages/tabbar/home/views.vue";

export default {
  data() {
    return {
      background: {
        backgroundColor: "#fff",
      },
    };
  },
  onReachBottom(){
    // 给子级监听触底加载
    uni.$emit('onReachBottom',true)
  },
  
  onPullDownRefresh() {
    this.$refs.tpl.init();

    uni.stopPullDownRefresh();
  },
  components: {
    tpl,
  },
};
</script>

<style lang="scss" scoped>
</style>
