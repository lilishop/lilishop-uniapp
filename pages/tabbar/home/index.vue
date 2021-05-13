<template>
  <div class="wrapper">
    <tpl />
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
  components: {
    tpl,
  },
  
};
</script>

<style lang="scss" scoped>
.slot-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 0 30rpx;
}
</style>
