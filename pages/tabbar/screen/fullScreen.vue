<template>
   <u-modal v-model:show="show" cancelText="不同意" confirmText="同意" showCancelButton title="服务协议和隐私政策" @confirm="confirm" @cancel="cancel">
    <view class="u-update-content">
      请您务必审慎阅读,充分理解“服务协议”和“隐私政策”各条款，
      包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识,
      操作日志等信息用于分析，优化应用性能。 您可阅读你可阅读
      <a @click="gotoLink">《服务协议》</a>
      和
      <a @click="gotoB"> 《隐私政策》</a>了解详细信息。
      如果您同意，请点击下面按钮开始接受我们的服务。
    </view>
  </u-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import storage from '@/utils/storage'

const show = ref(true)

function gotoLink() {
  uni.navigateTo({
    url: '/pages/tabbar/home/web-view?src=https://pc-b2b2c.pickmall.cn/article/detail?id=1371992704333905920',
  })
}

function gotoB() {
  uni.navigateTo({
    url: '/pages/tabbar/home/web-view?src=https://pc-b2b2c.pickmall.cn/article/detail?id=1371779927900160000',
  })
}

function cancel() {
  // #ifdef APP-PLUS
  plus.ios.import('UIApplication').sharedApplication().performSelector('exit')
  // #endif
}

function confirm() {
  show.value = false
  storage.setShow(show.value)
  if (!show.value) {
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/tabbar/home/index',
      })
    }, 500)
  }
}
</script>

<style scoped>
.u-update-content {
  font-size: 26rpx;
  padding: 30rpx;
}
a {
  text-decoration: blue;
  color: blue;
}
</style>
