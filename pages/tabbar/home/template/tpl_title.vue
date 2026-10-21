<template>
  <view class="layout" :style="wrapperStyle">
    <!-- 新样式：左标题+副标题，右侧更多 -->
    <view v-if="styled" class="title-bar" :style="barStyle">
      <view class="title-left">
        <text class="title-main" :style="mainStyle">{{ item.title }}</text>
        <text class="title-sub" :style="subStyle" v-if="item.title1">{{ item.title1 }}</text>
      </view>
      <view
        v-if="item.showMore"
        class="title-more"
        :style="moreStyle"
        @click="goMore"
      >
        {{ (item.moreText || "更多") + " >" }}
      </view>
    </view>
    <!-- 老数据：保持原样 -->
    <view
      v-else
      class="background"
      :style="{ backgroundColor: item.bk_color, textAlign: item.textAlign }"
      @click="modelNavigateTo(item)"
    >
      <view class="title" :style="{ color: item.color }">{{ item.title }}</view>
      <view class="legacy-sub">
        <a :style="{ color: item.color1 }" style="text-decoration: none">{{ item.title1 }}</a>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

const item = computed(() => props.res?.list?.[0] || {});

// 面板保存过样式字段才启用新样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  return {
    padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
    marginBottom: `${Number(res.pageGap) || 0}rpx`,
    borderRadius: `${Number(res.radiusTop) || 0}rpx ${Number(res.radiusTop) || 0}rpx ${Number(res.radiusBottom) || 0}rpx ${Number(res.radiusBottom) || 0}rpx`,
    overflow:
      Number(res.radiusTop) > 0 || Number(res.radiusBottom) > 0 ? "hidden" : "visible",
    background: "#ffffff",
    boxSizing: "border-box",
  };
});

const barStyle = computed(() => {
  const it = item.value;
  if (it.bgType === "image" && it.bgImage) {
    return {
      backgroundImage: `url(${it.bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return { backgroundColor: it.bk_color || "#FFFFFF" };
});

const mainStyle = computed(() => ({
  color: item.value.color || "#282828",
  fontSize: `${(Number(item.value.fontSize) || 20) * 2}rpx`,
  fontWeight: item.value.textStyle === "bold" ? "bold" : "normal",
  fontStyle: item.value.textStyle === "italic" ? "italic" : "normal",
}));
const subStyle = computed(() => ({
  color: item.value.color1 || "#282828",
  fontSize: `${(Number(item.value.subFontSize) || 14) * 2}rpx`,
}));
const moreStyle = computed(() => ({
  color: item.value.moreColor || "#282828",
  fontSize: `${(Number(item.value.moreFontSize) || 12) * 2}rpx`,
}));

function goMore() {
  if (item.value.moreUrl) {
    modelNavigateTo({ url: item.value.moreUrl });
  }
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  background: #ffffff;
}
.title-bar {
  width: 100%;
  min-height: 84rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.title-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  overflow: hidden;
}
.title-main {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title-sub {
  margin-left: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.title-more {
  flex-shrink: 0;
}
.background {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 84rpx;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}
.legacy-sub {
  position: absolute;
  right: 20rpx;
  top: 4rpx;
  color: #fff;
  line-height: 84rpx;
  font-size: 20rpx;
}
.title {
  line-height: 84rpx;
  font-size: 30rpx;
  font-weight: bold;
  margin-left: 8rpx;
}
</style>
