<template>
  <div>
    <u-collapse v-if="versionList.length !== 0">
      <u-collapse-item
        class="version-item"
        :title="item.versionName"
        v-for="(item, index) in versionList"
        :key="index"
      >
        {{ item.content }}
      </u-collapse-item>
    </u-collapse>
    <u-empty class="empty" v-else text="暂无版本信息" mode="list"></u-empty>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAppVersionList } from '@/api/message'

const versionList = ref<any[]>([])
const appType = ref('')
const params = { pageNumber: 1, pageSize: 10 }

onLoad(() => {
  const platform = uni.getSystemInfoSync().platform
  appType.value = platform === 'android' ? 'ANDROID' : 'IOS'
  fetchVersionList()
})

async function fetchVersionList() {
  const res = await getAppVersionList(appType.value, params)
  if (res.data.success) {
    versionList.value = res.data.result.records
  }
}
</script>

<style scoped lang="scss">
.version-item {
  padding: 10rpx;
  background: #fff;
}
</style>
