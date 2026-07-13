<template>
  <!-- 轮播图 -->
  <view class="carousel">

    <swiper class="goods-swiper" circular="true" duration="400" @change="swiperChange">
      <swiper-item v-if='video'>
        <!-- #ifndef APP-PLUS -->
        <video class="video" show-mute-btn style="width:100%; height:100%;" muted autoplay :src='video' loop
          object-fit="cover"></video>
        <!-- #endif -->
        <!-- #ifdef APP-PLUS -->
        <view style="width:100%; height:100%;">
          <!-- <video class="video" show-mute-btn style="width:100%; height:100%;" muted autoplay :src='video' loop
              object-fit="cover"></video> -->
          <view v-html="html" style="width:100%; height:100%;"></view>
        </view>
        <!-- #endif -->

      </swiper-item>
      <swiper-item class="swiper-item" v-for="(item, index) in res" :key="index">

        <view class="image-wrapper">
          <image class="swiper-img" :src="item" mode="aspectFit"></image>
        </view>
      </swiper-item>
    </swiper>
    <view class="swiper-dots">{{ current }}/{{ video ? res.length + 1 : res.length }}</view>
  </view>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  res?: string[]
  video?: string
}>()

const current = ref(1)
const html = ref('')

watch(
  () => props.video,
  (val) => {
    if (val) {
      html.value =
        '<video muted="muted"   ref="videoPlay" style="width:100%; height:100%;" src=' +
        val +
        '  page-gesture show-mute-btn   autoplay  webkit-playsinline="" playsinline="" ></video>'
    }
  },
  { immediate: true }
)

function swiperChange(e: any) {
  current.value = e.detail.current + 1
}
</script>
<style lang="scss" scoped>
.carousel {
  // #ifdef MP-WEIXIN
  margin-top: 44px;
  // #endif
  width: 750rpx;
  height: 750rpx;
  position: relative;

  .goods-swiper {
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
  }

  .swiper-img {
    width: 100%;
    height: 100%;
  }

  .swiper-item {
    display: flex;
    justify-content: center;
    align-content: center;
    height: 750rpx;
    overflow: hidden;
  }

  position: relative;

  .swiper-dots {
    position: absolute;
    right: 0rpx;
    bottom: 40rpx;
    font-size: 32rpx;
    width: 107rpx;
    height: 44rpx;
    line-height: 44rpx;
    text-align: center;
    border-radius: 30rpx 0rpx 0rpx 30rpx;
    background: #333333;
    opacity: 0.4;
    font-weight: 400;
    color: #fff;
  }
}

::v-deep .image-wrapper .u-image__image {
  opacity: 1 !important;
}

.video {
  width: 100%;
  height: 100%;
}
</style>
