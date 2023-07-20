<template>
  <!-- 轮播图 -->
  <view class="carousel">

    <swiper circular="true" duration="400" @change="swiperChange">
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
          <u-image :src="item" mode="aspectFit" class="loaded" width="100%" height="100%">
            <u-loading slot="loading"></u-loading>
          </u-image>
        </view>
      </swiper-item>
    </swiper>
    <view class="swiper-dots">{{ current }}/{{ video ? res.length + 1 : res.length }}</view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      current: 1,
      html: ""
    };
  },
  props: ["res", 'video'],
  watch: {
    video(val) {
      this.html = '<video muted="muted"   ref="videoPlay" style="width:100%; height:100%;" src=' + val + '  page-gesture show-mute-btn   autoplay  webkit-playsinline="" playsinline="" ></video>'
    }
  },
  methods: {
    // 轮播图对应的dot
    swiperChange(e) {
      this.current = e.detail.current + 1;
    },
  },
  mounted() {
    console.log(this.video)
  }
};
</script>
<style lang="scss" scoped>
.carousel {
  // #ifdef MP-WEIXIN
  margin-top: 44px;
  // #endif
  width: 750rpx;
  height: 750rpx;
  position: relative;

  swiper {
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
  }

  .swiper-item {
    display: flex;
    justify-content: center;
    align-content: center;
    height: 750rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
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

/deep/ .image-wrapper image {
  opacity: 1 !important;
}

.video {
  width: 100%;
  height: 100%;
}
</style>
