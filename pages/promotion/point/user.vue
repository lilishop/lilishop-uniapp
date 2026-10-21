<template>
  <div class="user-point">
    <!-- <div class="point-rule">积分规则</div> -->
    <div class="point-wrapper">
      <u-image shape="circle" :lazy-load="true" width="100" height="100"
        :src="userInfo.face || '/static/missing-face.png'"></u-image>
      <div class="whether-point">
        <div>你的可用积分：<span class="point">{{userInfo.point || 0}}</span></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfo } from '@/api/members'

const userInfo = ref<any>({})

onMounted(() => {
  init()
})

async function init() {
  const res = await getUserInfo()
  if (res.data.success) {
    userInfo.value = res.data.result
  }
}
</script>
<style lang="scss" scoped>
.user-point {
  padding: 0 20rpx;
  height: 300rpx;
  flex-shrink: 0;
  background: url("/pages/promotion/static/point-bg.png") no-repeat;
  background-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.point {
  font-size: 40rpx;
}
.point-rule {
  color: #fff;
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 0;
}
.point-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.whether-point {
  color: #fff;
  margin-top: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
}
</style>
