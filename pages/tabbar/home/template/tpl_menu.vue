<template>
  <view class="layout" :style="wrapperStyle">
    <view
      class="menu-list"
      :class="{ styled: styled, single: isSingle }"
      :style="listStyle"
    >
      <view
        class="menu-item"
        :style="itemStyle"
        @click="modelNavigateTo(item)"
        v-for="(item, index) in visibleList"
        :key="index"
      >
        <view class="menu-img-wrap" :style="imgStyle">
          <u-image width="88rpx" height="88rpx" class="menu-img" :src="item.img">
            <template #loading><u-loading-icon></u-loading-icon></template>
          </u-image>
        </view>
        <view class="menu-title" :style="titleStyle">{{ item.title }}</view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { modelNavigateTo, cubeWrapperStyle, cubeImgStyle } from "./tpl";

const props = defineProps<{ res: any }>();

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const listStyle = computed(() =>
  styled.value ? { rowGap: `${Number(props.res.contentGap) || 0}rpx` } : {}
);
const titleStyle = computed(() =>
  styled.value && props.res.textColor ? { color: props.res.textColor } : {}
);

// 展示设置：单行/多行、行数、每行个数，超出部分不展示
const isSingle = computed(
  () => styled.value && props.res.menuDisplay === "single"
);
const cols = computed(() =>
  styled.value ? Number(props.res.menuCols) || 4 : 4
);
const rows = computed(() => Number(props.res.menuRows) || 3);
const itemStyle = computed(() =>
  styled.value ? { flex: `0 0 ${100 / cols.value}%` } : {}
);
const visibleList = computed(() => {
  const list = props.res.list || [];
  if (!styled.value) return list;
  const limit = isSingle.value ? cols.value : rows.value * cols.value;
  return list.slice(0, limit);
});
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.menu-list {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;

  &.single {
    flex-wrap: nowrap;
    overflow: hidden;
  }

  > .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 25%;
    flex: 0 0 25%;
    box-sizing: border-box;
    margin: 20rpx 0;
    padding: 0 4rpx;
  }

  &.styled > .menu-item,
  &.single > .menu-item {
    margin: 0;
    width: auto;
  }
}

.menu-img-wrap {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-img {
  flex-shrink: 0;
}

:deep(.menu-img .u-image) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-title {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.3;
  width: 100%;
  text-align: center;
}
</style>
