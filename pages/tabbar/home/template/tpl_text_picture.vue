
<template>
  <div class="layout" :style="[wrapperStyle, gapStyle]">
    <div class="view-list" :style="gapStyle">
      <div class="view-item" @click="modelNavigateTo(res.list[0])">
        <div class="-item-tilte">{{res.list[0].title}}</div>
        <div class="-item-image" :style="imgStyle">
          <u-image width="120rpx" mode="scaleToFill" height="120rpx" :src="res.list[0].img" alt ></u-image>
        </div>
      </div>
      <div class="view-item" @click="modelNavigateTo(res.list[1])">
        <div class="-item-tilte">{{res.list[1].title}}</div>
        <div class="-item-image" :style="imgStyle">
          <u-image width="120rpx" mode="scaleToFill" height="120rpx"  :src="res.list[1].img" alt ></u-image>
        </div>
      </div>
    </div>
    <div class="view-list" :style="gapStyle">
      <div class="view-item" @click="modelNavigateTo(res.list[2])">
        <div class="-item-tilte">{{res.list[2].title}}</div>
        <div class="-item-image" :style="imgStyle">
          <u-image width="120rpx" mode="scaleToFill" height="120rpx"  :src="res.list[2].img" alt ></u-image>
        </div>
      </div>
      <div class="view-item" @click="modelNavigateTo(res.list[3])">
        <div class="-item-tilte">{{res.list[3].title}}</div>
        <div class="-item-image" :style="imgStyle">
          <u-image width="120rpx" mode="scaleToFill" height="120rpx"  :src="res.list[3].img" alt ></u-image>
        </div>
      </div>
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
  display: flex;
  background: #e8e8e8;
  align-items: center;
  justify-content: center;
  background-size: cover;
  padding: 0;
}
.-item-image {
  padding: 20rpx;
}
.-item-tilte {
  background: $aider-light-color;
  height: 60rpx;
  color: #fff;
  font-size: 28rpx;
  text-align: center;
  line-height: 60rpx;
}

.view-list {
  width: 48%;
  margin: 0 auto;
  display: flex;
  background: #fff;
   border-top-left-radius: 0.8em;
    border-top-right-radius: 0.8em;
    border: 2rpx solid #ededed;

  > .view-item {
    flex: 1;
    min-width: 0;
  }
  > .view-item:nth-of-type(1) {
    > .-item-tilte {
      border-top-left-radius: 0.8em;
    }
  }
  > .view-item:nth-of-type(2) {
    > .-item-tilte {
      border-top-right-radius: 0.8em;
    }
  }
}
</style>
