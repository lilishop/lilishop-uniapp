
<template>
  <div class="layout">
    <u-image width="140rpx" mode="aspectFit" height="140rpx" @click="modelNavigateTo(item)" class="image-mode" v-for="(item,index) in res.list" :key="index" :src="item.img" alt="">
      <template #loading><u-loading-icon></u-loading-icon></template>
    </u-image>
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
}
</style>