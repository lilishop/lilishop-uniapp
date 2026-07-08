<template>
  <div class="wrapper">
    <u-parse :lazy-load="true" :selectable="true" :content="article.content" v-if="article"></u-parse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getArticleDetailByType } from '@/api/article'

const ARTICLE_TYPE_MAP: Record<string, { title: string; type: string }> = {
  USER_AGREEMENT: { title: '服务协议', type: 'USER_AGREEMENT' },
  PRIVACY_POLICY: { title: '隐私政策', type: 'PRIVACY_POLICY' },
  LICENSE_INFORMATION: { title: '证照信息', type: 'LICENSE_INFORMATION' },
  ABOUT: { title: '关于我们', type: 'ABOUT' },
  STORE_REGISTER: { title: '店铺入驻协议', type: 'STORE_REGISTER' },
}

const article = ref<any>(null)

onLoad((option) => {
  const meta = ARTICLE_TYPE_MAP[option.type]
  if (!meta) return
  uni.setNavigationBarTitle({ title: meta.title })
  fetchArticle(meta.type)
})

function fetchArticle(type: string) {
  getArticleDetailByType(type).then((res) => {
    if (res.data.success) {
      article.value = res.data.result
    }
  })
}
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 16rpx;
}
</style>
