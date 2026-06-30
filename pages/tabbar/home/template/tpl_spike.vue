<template>
  <div class="layout">
    <div class="join-list">
      <div class="join-title">
        <div class="join-title-name">{{ res.list[0].title }}</div>
        <div class="join-title-more">更多</div>
      </div>
      <div class="join-box">
        <div class="join-item" v-for="item in 4" :key="item">
          <div class="item-img-box">
            <img
              class="item-img"
              src="https://picsum.photos/id/268/200/200"
              alt
            />
          </div>
          <div class="item-price">
            <span class="price-text">￥120.00</span>
          </div>
          <div class="item-line-through">
            <span class="price-text">￥190.00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// TODO 后续版本开发此功能 尽情期待
export default {
  props: ["res"],
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
@import './advertising.scss';

</style>