<template>
  <view class="tool-wrapper">
    <!-- 卡片 1: 资产与常用 -->
    <view class="service-card">
      <view class="service-title-bar">
        <text class="service-title-text">资产与常用</text>
      </view>

      <view class="service-grid">
        <view class="service-grid-item" @click="navigateTo('/pages/cart/coupon/couponCenter')">
          <image class="grid-icon" src="/static/mine/couponcenter.png" mode="aspectFit"></image>
          <text class="grid-label">领券中心</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/point/myPoint')">
          <image class="grid-icon" src="/static/mine/mypoint.png" mode="aspectFit"></image>
          <text class="grid-label">我的积分</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/signIn')">
          <image class="grid-icon" src="/static/mine/sign.png" mode="aspectFit"></image>
          <text class="grid-label">每日签到</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/cart/coupon/myCoupon')">
          <image class="grid-icon" src="/static/mine/mycoupon.png" mode="aspectFit"></image>
          <text class="grid-label">优惠券</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/address/addressManage')">
          <image class="grid-icon" src="/static/mine/myaddress.png" mode="aspectFit"></image>
          <text class="grid-label">地址管理</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/myTracks')">
          <image class="grid-icon" src="/static/mine/logistics.png" mode="aspectFit"></image>
          <text class="grid-label">我的足迹</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/myCollect')">
          <image class="grid-icon" src="/static/mine/myfavorite.png" mode="aspectFit"></image>
          <text class="grid-label">我的关注</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/order/evaluate/myEvaluate')">
          <image class="grid-icon" src="/static/mine/feedback.png" mode="aspectFit"></image>
          <text class="grid-label">我的评价</text>
        </view>
      </view>
    </view>

    <!-- 卡片 2: 更多服务 -->
    <view class="service-card">
      <view class="service-title-bar">
        <text class="service-title-text">更多服务</text>
      </view>

      <view class="service-grid">
        <view class="service-grid-item" @click="distribution">
          <image class="grid-icon" src="/static/mine/distribution.png" mode="aspectFit"></image>
          <text class="grid-label">我的分销</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/cart/gift-card/myGiftCards')">
          <image class="grid-icon" src="/static/mine/pointgift.png" mode="aspectFit"></image>
          <text class="grid-label">礼品卡</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/promotion/bargain/log')">
          <image class="grid-icon" src="/static/mine/kanjia.png" mode="aspectFit"></image>
          <text class="grid-label">砍价记录</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/passport/entry/seller/index')">
          <image class="grid-icon" src="/static/mine/feedback.png" mode="aspectFit"></image>
          <text class="grid-label">店铺入驻</text>
        </view>

        <view class="service-grid-item" @click="linkMsgDetail()">
          <image class="grid-icon" src="/static/mine/mycommit.png" mode="aspectFit"></image>
          <text class="grid-label">我的消息</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/order/complain/complainList')">
          <image class="grid-icon" src="/static/mine/shensu.png" mode="aspectFit"></image>
          <text class="grid-label">我的投诉</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/set/feedBack')">
          <image class="grid-icon" src="/static/mine/feedback.png" mode="aspectFit"></image>
          <text class="grid-label">意见反馈</text>
        </view>

        <view class="service-grid-item" @click="navigateTo('/pages/mine/set/setUp')">
          <image class="grid-icon" src="/static/mine/setting.png" mode="aspectFit"></image>
          <text class="grid-label">系统设置</text>
        </view>
      </view>
    </view>

    <!-- 分享二维码弹窗（保留原有能力） -->
    <u-popup v-model:show="sharingShow" mode="bottom" border-radius="14">
      <view style="margin: 10px; text-align: center;">请邀请用户扫描二维码或者将地址复制转发给其他用户</view>
      <view class="qrcode">
        <uqrcode v-if="sharingLink" ref="uqrcode" canvas-id="qrcode" :value="sharingLink" :options="{ margin: 10 }"></uqrcode>
      </view>
      <view class="copy-text" @click="getDetail(sharingLink)">
        {{ sharingLink }}
      </view>
      <view class="confrim-btn">
        <u-button @click="sharingShow = false;">关闭</u-button>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { distribution as fetchDistribution } from '@/api/distribution'
import configs from '@/config/config'
import storage from '@/utils/storage'
import { tipsToLogin, setClipboard } from '@/utils/filters.js'
import {
  checkSelfRecruitEntry,
  DISTRIBUTION_CLOSE_MESSAGE,
  DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
  DISTRIBUTION_RETREAT_MESSAGE,
  DISTRIBUTION_STATUS,
} from '@/utils/distributionStatus'

const sharingShow = ref(false)
const sharingLink = ref('')

function handleNavigate(url: string) {
  uni.navigateTo({ url })
}

function inviter() {
  if (storage.getUserInfo().id) {
    sharingLink.value = configs.shareLink + '?inviter=' + storage.getUserInfo().id
    sharingShow.value = true
  } else {
    uni.showToast({
      title: '请先登录',
      duration: 2000,
      icon: 'none',
    })
  }
}

function getDetail(link: string) {
  setClipboard(link)
}

function navigateTo(url: string) {
  const ignores = [
    '/pages/mine/set/setUp',
    '/pages/mine/set/editionIntro',
    '/pages/mine/set/feedBack',
  ]
  if (!ignores.includes(url)) {
    if (tipsToLogin('normal')) {
      handleNavigate(url)
    }
  } else {
    handleNavigate(url)
  }
}

function linkMsgDetail() {
  if (tipsToLogin('normal')) {
    uni.navigateTo({
      url: '/pages/tabbar/home/title',
    })
  }
}

function goRecruitJoin() {
  uni.navigateTo({
    url: '/pages/mine/distribution/join',
  })
}

function enterSelfRecruitOrToast() {
  checkSelfRecruitEntry().then((gate) => {
    if (gate === 'distribution_closed') {
      uni.showToast({
        title: DISTRIBUTION_CLOSE_MESSAGE,
        duration: 2000,
        icon: 'none',
      })
      return
    }
    if (gate === 'entry_closed') {
      uni.showToast({
        title: DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
        duration: 2000,
        icon: 'none',
      })
      return
    }
    goRecruitJoin()
  })
}

function distribution() {
  if (!tipsToLogin('normal')) {
    return
  }
  fetchDistribution().then((res) => {
    if (res.data.result) {
      const type = res.data.result.distributionStatus
      if (type == DISTRIBUTION_STATUS.PASS) {
        uni.navigateTo({
          url: '/pages/mine/distribution/home',
        })
      } else if (type == DISTRIBUTION_STATUS.REFUSE) {
        enterSelfRecruitOrToast()
      } else if (type == DISTRIBUTION_STATUS.RETREAT) {
        uni.showToast({
          title: DISTRIBUTION_RETREAT_MESSAGE,
          duration: 2000,
          icon: 'none',
        })
      } else {
        uni.showToast({
          title: '您的信息正在审核',
          duration: 2000,
          icon: 'none',
        })
      }
    } else if (!res.data.success && res.data.code == 22000) {
      uni.showToast({
        title: '分销功能暂未开启',
        duration: 2000,
        icon: 'none',
      })
    } else {
      enterSelfRecruitOrToast()
    }
  })
}
</script>

<style lang="scss" scoped>
.tool-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.service-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 16rpx 20rpx;
  box-shadow: 0 4rpx 18rpx rgba(17, 30, 79, 0.04);

  .service-title-bar {
    padding: 0 12rpx 20rpx;
    border-bottom: 1rpx solid #f6f7fa;

    .service-title-text {
      font-size: 29rpx;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 0.5rpx;
    }
  }

  .service-grid {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding-top: 14rpx;

    .service-grid-item {
      width: 25%;
      flex: 0 0 25%;
      box-sizing: border-box;
      height: 146rpx;
      padding: 12rpx 4rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s, opacity 0.15s;

      &:active {
        transform: scale(0.92);
        opacity: 0.8;
      }

      .grid-icon {
        width: 52rpx;
        height: 52rpx;
        margin-bottom: 12rpx;
      }

      .grid-label {
        font-size: 24rpx;
        color: #444444;
        line-height: 1.2;
      }
    }
  }
}

.copy-text {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px;
  line-break: anywhere;
}

.qrcode {
  margin: 0 auto;
  width: 200px;
}
</style>