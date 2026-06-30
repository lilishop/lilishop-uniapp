<template>
  <view class="u-time-line">
    <slot />
  </view>
</template>

<script>
export default {
  name: 'UTimeLine'
}
</script>

<style lang="scss" scoped>
.u-time-line {
  display: flex;
  flex-direction: column;
}
</style>
