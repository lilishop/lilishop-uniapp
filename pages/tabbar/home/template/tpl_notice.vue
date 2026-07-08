<template>
  <div class="layout">
    <div class="background">
      <u-notice-bar mode="vertical" :bg-color="res.list[0].bk_color" :color="res.list[0].color" :list="list"></u-notice-bar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const list = computed(() =>
  props.res.list[0].title.map((i: { context: string }) => i.context)
);
</script>
<style lang="scss" scoped>
  @import "./tpl.scss";
  .background {
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 84rpx;
    text-align: left;
    font-size: 20rpx;
    background-size: cover;
  }
  .layout {
    text-align: center;
    position: relative;
    height: 84rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    background: #ffffff;
  }
  .title {
    line-height: 84rpx;
    font-size: 20px;
    font-weight: bold;
  }
</style>
