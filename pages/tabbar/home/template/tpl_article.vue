<template>
  <view class="tpl-article" :style="wrapperStyle" v-if="articleList.length">
    <view class="article-title" v-if="title">{{ title }}</view>
    <view
      class="article-item"
      v-for="item in articleList"
      :key="item.id"
      @click="goDetail(item)"
    >
      <view class="article-text">
        <view class="article-name">{{ item.title }}</view>
        <view class="article-time" v-if="item.createTime">{{ item.createTime.split(" ")[0] }}</view>
      </view>
      <image v-if="item.cover" class="article-thumb" :src="item.cover" mode="aspectFill" />
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

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `20rpx ${props.res?.paddingX ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: "hidden",
}));

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
.article-time {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
.article-thumb {
  width: 112rpx;
  height: 84rpx;
  border-radius: 8rpx;
  margin-left: 20rpx;
  flex-shrink: 0;
}
</style>
