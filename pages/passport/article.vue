<template>
  <!-- 此文件路径禁止移动 -->
  <view>
    <view class="container ">
      <view class="u-skeleton" v-if="!articleData">
          <u-empty text="文章暂无内容" mode="list"></u-empty>
      </view>
      <!-- <h3>{{routers.title}}</h3> -->
      <u-parse v-else :html="articleData"></u-parse>
    </view>
  </view>
</template>

<script>
import { getArticleDetail } from "@/api/article.js";
export default {
  data() {
    return {
      loading: true,
      routers: "",
      articleData: "",
    };
  },
  onLoad(val) {
    this.routers = val;
    console.log(val);
    getArticleDetail(val.id).then((res) => {
      if (res.data.result) {
        this.articleData = res.data.result.content;
      }
      uni.setNavigationBarTitle({
        title: val.title,
      });
    });
  },
};
</script>
<style lang="scss" scoped>
page {
  background: #fff;
}
.container {
  padding: 32rpx;
  > p {
    margin: 20rpx;
  }
}
</style>