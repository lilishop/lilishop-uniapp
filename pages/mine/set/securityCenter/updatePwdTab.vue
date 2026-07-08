<template>
  <view class="securityCenter">
    <u-cell-group>
      <u-cell title="验证密码" @click="navigateTo('/pages/mine/set/securityCenter/editLoginPassword')"></u-cell>
      <u-cell title="验证手机号" @click="navigateTo('/pages/mine/set/securityCenter/editPassword')"></u-cell>
    </u-cell-group>
  </view>
</template>

<script setup lang="ts">
function navigateTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.securityCenter {
  .u-cell {
    line-height: normal;
  }
}
</style>
