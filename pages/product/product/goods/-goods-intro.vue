<template>
  <view v-if="hasDetailContent">
    <view class="detail-box" v-if="res.mobileIntro">
      <view class="goods-detail">
        <view class="detail_padding">
          <div class="goods-detail-box">
            <div class="goods-detail-item goods-active">商品介绍</div>
          </div>
          <u-parse
            class="vhtml"
            :lazy-load="true"
            :content="res.mobileIntro"
            :tag-style="style"
          ></u-parse>
        </view>
      </view>
    </view>

    <view class="detail-box" v-if="goodsParams && goodsParams.length">
      <view class="goods-detail">
        <view class="detail_padding">
          <div class="goods-detail-box">
            <div class="goods-detail-item goods-active">商品参数</div>
          </div>
          <!-- <u-divider>商品参数</u-divider> -->
          <div class="param-list">
            <div
              class="param-item"
              v-for="(param, index) in goodsParams"
              :key="index"
            >
              <div class="param-left">{{ param.paramName }}</div>
              <div class="param-right">{{ param.paramValue }}</div>
            </div>
          </div>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getGoodsMessage } from '@/api/goods'

const props = defineProps<{
  res?: any
  goodsId?: string | number
  goodsParams?: any[]
}>()

const goodsDetail = ref('')
const style = {
  img: 'display:block;width:100%',
}

const hasDetailContent = computed(() => {
  return !!(props.res?.mobileIntro || (props.goodsParams && props.goodsParams.length))
})

onMounted(async () => {
  if (!props.goodsId) return
  const res = await getGoodsMessage(props.goodsId)
  if (res.data.success) {
    goodsDetail.value = res.data.result
  }
})
</script>

<style lang="scss" scoped>
@import "../product.scss";
.param-list {
  padding: 40rpx 0 80rpx 0;
}
.param-item {
  display: flex;
  justify-content: center;
  border-bottom: none;

  > .param-left,
  > .param-right {
    padding: 16rpx 0;
    font-size: 24rpx;
    color: #666;
    border: 1px solid rgb(220, 223, 230);
    border-bottom: none;
  }
  > .param-left {
    text-align: center;
    border-right: none;
    flex: 3;
  }

  > .param-right {
    padding: 0 10rpx;
    align-items: center;
    display: flex;
    flex: 7;
  }
}
.param-item:nth-last-of-type(1) {
  > .param-left,
  > .param-right {
    border-bottom: 1px solid rgb(220, 223, 230);
  }
}
.empty {
  margin: 40rpx 0;
}
.goods-detail ::v-deep .vhtml {
  overflow: hidden;

  width: 100%;
}
.goods-detail-box {
  display: flex;
  justify-content: space-between;
  // padding: 0 80rpx;
  height: 120rpx;
  line-height: 120rpx;
  > .goods-active {
    font-weight: 700;
    &::before {
      position: absolute;
      left: 50%;
      bottom: 15px;
      -webkit-transform: translateX(-50%);
      transform: translateX(-50%);
      content: "";
      display: block;
      width: 52rpx;
      height: 6rpx;

      background-image: linear-gradient(90deg, $price-color, $price-light-color);
    }
  }
  > .goods-detail-item {
    color: #262626;
    position: relative;
  }
}
.detail_padding {
}
</style>
