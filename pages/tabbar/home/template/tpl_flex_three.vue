
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
    <u-image @click="modelNavigateTo(item)" height="240rpx" width="100%" class="image-mode flex-img" :style="imgStyle" :src="item.img" v-for="(item, index) in res.list" :key="index">
      <template #loading><u-loading-icon></u-loading-icon></template>
    </u-image>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo, cubeWrapperStyle, cubeImgStyle, cubeGapStyle } from "./tpl";

const props = defineProps<{ res: any }>();

const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const gapStyle = computed(() => cubeGapStyle(props.res));
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  padding: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
}
.flex-img {
  flex: 1;
  min-width: 0;
}
</style>
