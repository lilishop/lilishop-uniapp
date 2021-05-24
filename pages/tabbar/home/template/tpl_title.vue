<template>
  <div class="layout">
    <div class="background">
      <div class="title" :style="{ color: res.list[0].color }">
        {{ res.list[0].title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  title: "标题栏",
  props: ["res"],
  mounted() {},
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.background {
  background: url("/static/title.png") no-repeat;
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 84rpx;
  background-position-x: center;
  background-position-y: center;
  background-size: cover;
}

.layout {
  text-align: center;
  position: relative;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;
}

.title {
  line-height: 84rpx;
  font-size: 30rpx;
  font-weight: bold;
}
</style>
