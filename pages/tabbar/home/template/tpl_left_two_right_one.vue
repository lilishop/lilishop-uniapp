
<template>
  <div class="layout " :style="[wrapperStyle, gapStyle]">
    <div class="view-height-150">
      <div class="view-height-75" :style="imgStyle" @click="modelNavigateTo(res.list[0])">
        <u-image class="image-mode"  width="100%" height="150rpx" :src="res.list[0].img" ></u-image>
      </div>
      <div class="view-height-75" :style="imgStyle" @click="modelNavigateTo(res.list[1])">
        <u-image class="image-mode" width="100%" height="150rpx"  :src="res.list[1].img" ></u-image>
      </div>
    </div>
    <div class="view-height-150" :style="imgStyle" @click="modelNavigateTo(res.list[2])">
      <u-image class="image-mode"  width="100%" height="300rpx"  :src="res.list[2].img" ></u-image>
    </div>
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
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  background-size: cover;
}
.view-height-150 {
  min-width: 0;
}

</style>
