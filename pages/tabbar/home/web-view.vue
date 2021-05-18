<template>
  <view class="web-view">
    <web-view :webview-styles="webviewStyles" :src="src"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      webviewStyles: {
        progress: {
          color: this.$lightColor,
        },
      },
      src: "",
    };
  },
  onLoad(params) {
    this.src = decodeURIComponent(params.src);
  },
};
</script>

<style lang="scss" scoped>
.web-view {
  /deep/ .web-view {
    padding: 0;
    margin: 0;
  }
}
</style>