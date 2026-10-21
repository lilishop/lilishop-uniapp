<template>
  <view class="layout" :style="wrapperStyle">
    <view class="search" :style="boxStyle" @click="handleSearch">
      <u-icon name="search"></u-icon>
      <text class="search-text">{{ displayText }}</text>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";

const props = defineProps<{ res: any; storeId?: string }>();

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingX !== undefined);

// 搜索热词轮播：有热词时按切换时间轮换展示，否则展示提示文字
const hotIndex = ref(0);
let hotTimer: ReturnType<typeof setInterval> | null = null;
const validWords = computed(() =>
  (props.res.hotWords || []).filter((w: string) => w && w.trim())
);
const displayText = computed(() => {
  if (validWords.value.length) {
    return validWords.value[hotIndex.value % validWords.value.length];
  }
  return props.res.list?.[0]?.title || "";
});

function stopHot() {
  if (hotTimer) {
    clearInterval(hotTimer);
    hotTimer = null;
  }
}

watch(
  () => [validWords.value.length, props.res.hotInterval],
  () => {
    stopHot();
    hotIndex.value = 0;
    if (validWords.value.length > 1) {
      hotTimer = setInterval(() => {
        hotIndex.value = (hotIndex.value + 1) % validWords.value.length;
      }, (Number(props.res.hotInterval) || 3) * 1000);
    }
  },
  { immediate: true }
);

onBeforeUnmount(stopHot);

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `0 ${Number(res.paddingX) || 0}rpx`,
    background: bg,
    borderRadius: `${Number(res.borderRadius) || 0}rpx`,
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
});
const boxStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  return {
    background: res.boxColor || "#EDEDED",
    color: res.textColor || "#999999",
    borderRadius: `${Number(res.boxRadius) || 0}rpx`,
    justifyContent: res.textAlign === "center" ? "center" : "flex-start",
  };
});

function handleSearch() {
  if (props.storeId) {
    uni.navigateTo({
      url: `/pages/navigation/search/searchPage?storeId=${props.storeId}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/navigation/search/searchPage`,
    });
  }
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";

.search {
  width: 100%;
  height: 64rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 10rpx;
  background: #ededed;
  color: #999;
  overflow: hidden;
  box-sizing: border-box;
}

.search-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layout {
  display: flex;
  align-items: center;
  width: 100%;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
}
</style>
