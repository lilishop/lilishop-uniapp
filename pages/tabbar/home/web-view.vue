<template>
  <view class="web-view">
    <web-view :webview-styles="webviewStyles" :src="src"></web-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import configs from '@/config/config'
import storage from '@/utils/storage'
import { useStore } from '@/store'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const webviewStyles = computed(() => ({
  progress: {
    color: lightColor.value,
  },
}))

const src = ref('')

onLoad((params) => {
  if (params.IM) {
    if (params.IM == 0) {
      src.value = `${configs.imWebSrc}?token=${storage.getAccessToken()}`
    } else {
      src.value = `${configs.imWebSrc}?token=${storage.getAccessToken()}&id=${params.IM}`
    }
  } else {
    src.value = decodeURIComponent(params.src)
    console.log(src.value)
  }
})
</script>

<style lang="scss" scoped>
.web-view {
  ::v-deep .web-view {
    padding: 0;
    margin: 0;
  }
}
</style>
