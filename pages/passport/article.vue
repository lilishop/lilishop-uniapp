<template>
  <!-- 此文件路径禁止移动 -->
  <view>
    <view class="container ">
      <view class="u-skeleton" v-if="!articleData">
          <u-empty text="文章暂无内容" mode="list"></u-empty>
      </view>
      <u-parse v-else :content="articleData"></u-parse>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getArticleDetail } from '@/api/article.js'

const articleData = ref('')

onLoad((val) => {
  getArticleDetail(val.id).then((res) => {
    if (res.data.result) {
      articleData.value = res.data.result.content
    }
    uni.setNavigationBarTitle({
      title: val.title,
    })
  })
})
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