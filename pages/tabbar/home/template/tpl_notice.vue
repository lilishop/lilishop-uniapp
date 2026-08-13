<template>
  <div class="layout" v-if="list.length">
    <div class="background">
      <u-notice-bar
        direction="column"
        :bg-color="noticeStyle.bk_color"
        :color="noticeStyle.color"
        :text="list"
      ></u-notice-bar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ res: any }>();

const noticeStyle = computed(() => props.res?.list?.[0] || {});

const list = computed(() => {
  const titles = props.res?.list?.[0]?.title;
  if (!Array.isArray(titles)) return [];
  return titles
    .map((item: { context?: string }) => (item?.context == null ? "" : String(item.context)))
    .filter((text: string) => text.length > 0);
});
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
