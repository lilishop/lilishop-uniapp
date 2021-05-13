<template>
  <div class="layout">
    <div class="menu-list">
      <div class="menu-item" @click="modelnavigateTo(item)" v-for="(item, index) in res.list" :key="index">
        <div>
          <u-image
            width="88rpx"
            height="88rpx"
            class="menu-img"
            :src="item.img"
          >
           <u-loading slot="loading"></u-loading>
          </u-image>
        </div>
        <div class="menu-title">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script>
import {modelnavigateTo} from './tpl'
export default {
  props: ["res"],
  data () {
    return {
      modelnavigateTo,
    }
  }
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.menu-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  > .menu-item {
    text-align: center;
    width: 20%;
    // flex: 1;
    margin: 20rpx 0;
  }
}
.menu-img {
  display: flex;
  margin: 0 auto;
  width: 88rpx;
  height: 88rpx;
}
.menu-title {
  font-size: 24rpx;
}
</style>