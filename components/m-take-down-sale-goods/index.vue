<template>
  <div>
    <u-popup v-model="show" mode="bottom" height="800rpx" border-radius="14">
      <div class="wrapper">
        <view class="down-goods-tips">该商品已下架</view>
        <scroll-view scroll-y="true" style="height: 670rpx">
          <goodsRecommend title="其他商品" />
        </scroll-view>
      </div>
    </u-popup>
  </div>
</template>

<script>
import goodsRecommend from "@/components/m-goods-recommend/index.vue";

export default {
  data() {
    return {
      show: true, // 是否显示
    };
  },
  components: { goodsRecommend },
};
</script>

<style lang="scss" scoped>
.down-goods-tips {
  font-size: 36rpx;
  text-align: center;
  font-weight: bold;
  padding: 40rpx 0;
}
</style>
