<template>
  <view class="layout" :class="{ styled: styled }" v-if="texts.length" :style="wrapperStyle">
    <view class="notice-bar">
      <image
        v-if="styled && item.img"
        class="notice-icon"
        :src="item.img"
        mode="aspectFit"
      />
      <view class="notice-body" :style="{ textAlign: alignValue }">
        <u-notice-bar
          :direction="directionValue"
          :bg-color="styled ? 'transparent' : item.bk_color"
          :color="item.color"
          :text="noticeText"
          @click="clickNotice"
        ></u-notice-bar>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

const item = computed(() => props.res?.list?.[0] || {});

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingX !== undefined);

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  const radius = Number(res.borderRadius) || 0;
  return {
    padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
    background: bg,
    borderRadius: `${radius}rpx`,
    marginBottom: `${Number(res.pageGap) || 0}rpx`,
    overflow: radius > 0 ? "hidden" : "visible",
  };
});

const directionValue = computed(() =>
  styled.value && item.value.direction === "horizontal" ? "row" : "column"
);
const alignValue = computed(() =>
  styled.value ? item.value.textAlign || "left" : "left"
);

const titleList = computed(() => {
  const titles = item.value?.title;
  if (!Array.isArray(titles)) return [];
  return titles.filter(
    (t: any) => t && t.context != null && String(t.context).length > 0
  );
});

const texts = computed(() =>
  titleList.value.map((t: any) => String(t.context))
);

// uView-plus 的 notice-bar 在横向滚动（direction="row"）时要求 text 为字符串，竖向（column）可为数组
const noticeText = computed(() => {
  if (directionValue.value === "row") {
    return texts.value.join("    ");
  }
  return texts.value;
});

function clickNotice(index?: number) {
  const target =
    typeof index === "number"
      ? titleList.value[index] || titleList.value[0]
      : titleList.value[0];
  if (target && target.url) {
    modelNavigateTo(target);
  }
}
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.layout {
  display: flex;
  align-items: center;
  height: 84rpx;
  background: #ffffff;
}
.layout.styled {
  height: auto;
}
.notice-bar {
  width: 100%;
  display: flex;
  align-items: center;
}
.notice-icon {
  width: 130rpx;
  height: 36rpx;
  flex-shrink: 0;
  margin: 0 16rpx;
}
.notice-body {
  flex: 1;
  min-width: 0;
}
</style>
