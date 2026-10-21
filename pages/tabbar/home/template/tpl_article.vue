<template>
  <view class="tpl-article" :class="{ styled: styled }" :style="wrapperStyle" v-if="articleList.length">
    <view class="article-title" v-if="title">{{ title }}</view>
    <view
      class="article-item"
      v-for="item in articleList"
      :key="item.id"
      @click="goDetail(item)"
    >
      <view class="article-text">
        <view class="article-name" :style="nameStyle">{{ item.title }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getArticleList } from "@/api/article.js";

const props = defineProps<{ res: any }>();

const articleList = ref<any[]>([]);

const title = computed(() => props.res?.list?.[0]?.title || "");
const count = computed(() => props.res?.list?.[0]?.count || 3);
const categoryId = computed(() => props.res?.list?.[0]?.categoryId || "");

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (styled.value) {
    const bg =
      !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
    const radius = Number(res.borderRadius) || 0;
    return {
      background: bg,
      padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
      marginBottom: `${Number(res.pageGap) || 0}rpx`,
      borderRadius: `${radius}rpx`,
      overflow: radius > 0 ? "hidden" : "visible",
      display: "flex",
      flexDirection: "column",
      rowGap: `${Number(res.contentGap) || 0}rpx`,
    };
  }
  return {
    background: res.bgColor || "#FFFFFF",
    padding: `20rpx ${res.paddingX ?? 0}rpx`,
    marginBottom: `${res.pageGap ?? 0}rpx`,
    borderRadius: `${res.borderRadius ?? 0}rpx`,
    overflow: "hidden",
  };
});
const nameStyle = computed(() =>
  styled.value && props.res.titleColor ? { color: props.res.titleColor } : {}
);

onMounted(() => {
  const params: any = { pageNumber: 1, pageSize: count.value };
  if (categoryId.value) params.categoryId = categoryId.value;
  getArticleList(params).then((res) => {
    if (res.data.success && res.data.result) {
      articleList.value = (res.data.result.records || []).slice(0, count.value);
    }
  });
});

function goDetail(item: any) {
  uni.navigateTo({ url: `/pages/passport/article?id=${item.id}` });
}
</script>

<style lang="scss" scoped>
.article-title {
  font-size: 30rpx;
  font-weight: 600;
  padding: 8rpx 24rpx 20rpx;
}
.article-item {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-top: 2rpx solid #f5f5f5;
}
.tpl-article.styled .article-item {
  border-top: none;
  padding: 0;
}
.article-text {
  flex: 1;
  min-width: 0;
}
.article-name {
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
