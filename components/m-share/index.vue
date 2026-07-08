<template>
  <!-- 遮罩层 -->
  <u-popup @close="close" v-model:show="show" mode="bottom" border-radius="30" height="260rpx">

    <view class="share-title">
      <span>分享至</span>
    </view>
    <view class="share-list">
      <!-- #ifdef MP-WEIXIN -->
      <view class="share-item">
        <button class="share-btn" @click="weChatShare" open-type="share">
          <u-icon color="#04BE02" size="80" name="weixin-fill"></u-icon>微信好友
        </button>
      </view>
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <view class="share-item" @click="handleShare(item)" v-for="(item, index) in list" :key="index">
        <u-icon class="share-icon" :color="item.color" size="80" :name="item.icon"></u-icon>
        <view class="share-label">{{ item.title }}</view>
      </view>
      <!-- #endif -->
      <!-- #ifdef H5 -->  
      <view class="share-item" @click="copyLink()">
        <u-icon class="share-icon" color="#b4aee8" size="80" name="share-fill"></u-icon>
        <view class="share-label">{{ '复制链接' }}</view>
      </view>
      <!-- #endif -->
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import configs from "@/config/config"
import mpShare from "@/utils/mpShare.js"
import { setClipboard } from "@/utils/filters.js"

// mixin 处理：mpShare 提供小程序分享能力
mpShare

const props = defineProps<{
  thumbnail?: string
  goodsName?: string
  type?: string
  goodsId?: string | number
  link?: string
}>()

const emit = defineEmits(['close'])

const show = ref(true)
const config = configs
const list = ref([
  {
    color: "#04BE02",
    title: "微信好友",
    icon: "weixin-fill",
    type: 0,
  },
  {
    color: "#04BE02",
    title: "朋友圈",
    icon: "weixin-circle-fill",
    type: 1,
  },
])

const close = () => {
  emit("close")
}

const weChatShare = () => {
  // @ts-ignore
  const proxy = getCurrentInstance()?.proxy
  if (proxy) {
    // @ts-ignore
    proxy.$u.mpShare = {
      title: shareTitle(),
      path: '',
      imageUrl: props.thumbnail || ''
    }
  }
}

// h5复制链接
// #ifdef H5
const copyLink = () => {
  let content: string
  if (props.link) {
    content = config.shareLink + props.link
  } else {
    content =
      config.shareLink +
      getCurrentPages()[getCurrentPages().length - 1].__page__.fullPath
  }
  setClipboard(content)
}
// #endif

const shareTitle = (): string => {
  let shareTitle: string = ''
  if (props.type == "goods") {
    shareTitle = `[好友推荐]${props.goodsName}快来跟我一起看看吧`
  } else if (props.type == "shops") {
    shareTitle = `[好友发现]${props.goodsName}快来跟我一起看看吧`
  } else if (props.type == "pintuan") {
    shareTitle = `[好友邀请]${props.goodsName}快来跟我一起抢购吧!`
  } else if (props.type == "kanjia") {
    shareTitle = `[好友邀请]请快来帮我砍一刀${props.goodsName}`
  }
  return shareTitle
}

// #ifdef APP-PLUS
const handleShare = (val: any) => {
  console.log("12312312")
  if (val.type <= 1) {
    let scene: string //  "WXSenceTimeline 朋友圈   WXSceneSession 微信好友"
    val.type == 1
      ? (scene = "WXSenceTimeline")
      : (scene = "WXSceneSession")
    uni.share({
      provider: "weixin",
      scene: scene,
      href: config.shareLink + props.link,
      imageUrl: props.thumbnail,
      type: 0,
      summary: props.goodsName,
      title: shareTitle(),
      success: function () {
        uni.showToast({
          title: "分享成功!",
          duration: 2000,
          icon: "none",
        })
        emit("close")
      },
      fail: function () {
        uni.showToast({
          title: "分享失败!",
          duration: 2000,
          icon: "none",
        })
        emit("close")
      },
    })
  }
}
// #endif
</script>
<style lang="scss" scoped>
@import "./mp-share.scss";
.share-title {
  position: relative;
  height: 90rpx;
  font-size: 32rpx;
  line-height: 90rpx;
  text-align: center;
  > .share-close {
    position: absolute;
    right: 0;
    right: 20rpx;
    top: 30rpx;
  }
}
.share-btn:after {
  border: none;
}

.share-list {
  padding: 0 32rpx;
  display: flex;
  text-align: center;
  align-items: center;
  > .share-item {
    width: 25%;
    font-size: 24rpx;
    color: #666;
    > .share-icon,
    > .share-label {
      margin: 8rpx 0;
    }
  }
}
</style>
