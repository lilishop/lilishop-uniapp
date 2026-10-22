<template>
  <view class="user-page" :style="themeStyle">
    <!-- 顶部沉浸式头部区域 -->
    <view class="hero-header" :style="{ paddingTop: headerPaddingTop + 'px' }">
      <!-- 用户信息区（沉降至胶囊安全区下方，舒展大气） -->
      <view class="user-profile" @click="userDetail">
        <view class="avatar-container">
          <image class="avatar-img" :src="userInfo.face || userImage" mode="aspectFill"></image>
          <view class="vip-tag-icon" v-if="userInfo.id">
            <u-icon name="level" size="10" color="#ffffff"></u-icon>
          </view>
        </view>

        <view class="user-detail-info">
          <view class="user-title-row">
            <text class="user-nickname">{{ userInfo.id ? userInfo.nickName : '登录 / 注册' }}</text>
          </view>
          <view class="user-sub-row">
            <view class="badge-tag" v-if="userInfo.id">
              <text>普通会员</text>
            </view>
            <text class="user-sub-text" v-else>
              登录享受更多会员特权与折扣
            </text>
          </view>
        </view>

        <view class="profile-arrow">
          <u-icon name="arrow-right" size="14" color="rgba(255, 255, 255, 0.75)"></u-icon>
        </view>
      </view>

      <!-- 沉浸式核心资产栏（纯白字，融入顶部主色调） -->
      <view class="hero-assets">
        <view class="asset-col" @click="navigateTo('/pages/mine/deposit/operation')">
          <view class="asset-number-row">
            <text class="symbol">¥</text>
            <text class="num money">{{ unitPrice(walletNum) }}</text>
          </view>
          <view class="asset-title">预存款</view>
        </view>
        <view class="asset-sep"></view>
        <view class="asset-col" @click="navigateTo('/pages/cart/coupon/myCoupon')">
          <view class="asset-number-row">
            <text class="num">{{ couponNum || 0 }}</text>
            <text class="unit">张</text>
          </view>
          <view class="asset-title">优惠券</view>
        </view>
        <view class="asset-sep"></view>
        <view class="asset-col" @click="navigateTo('/pages/mine/myTracks')">
          <view class="asset-number-row">
            <text class="num">{{ footNum || 0 }}</text>
            <text class="unit">条</text>
          </view>
          <view class="asset-title">浏览足迹</view>
        </view>
      </view>
    </view>

    <!-- 下方主内容卡片区域 -->
    <view class="main-container">
      <!-- 我的订单卡片 -->
      <view class="card-box order-box">
        <view class="card-title-bar">
          <text class="card-title-text">我的订单</text>
          <view class="card-more-btn" @click="navigateTo('/pages/order/myOrder?status=0')">
            <text>全部订单</text>
            <u-icon name="arrow-right" size="11" color="#a0a0a0"></u-icon>
          </view>
        </view>

        <view class="order-action-row">
          <view class="order-action-item" @click="navigateTo('/pages/order/myOrder?status=1')">
            <view class="icon-wrap">
              <u-icon name="bag-fill" size="27" color="#ff7a00"></u-icon>
            </view>
            <text class="order-action-label">待支付</text>
          </view>

          <view class="order-action-item" @click="navigateTo('/pages/order/myOrder?status=2')">
            <view class="icon-wrap">
              <u-icon name="gift-fill" size="27" color="#ff4d4f"></u-icon>
            </view>
            <text class="order-action-label">待发货</text>
          </view>

          <view class="order-action-item" @click="navigateTo('/pages/order/myOrder?status=3')">
            <view class="icon-wrap">
              <u-icon name="car-fill" size="27" color="#1677ff"></u-icon>
            </view>
            <text class="order-action-label">待收货</text>
          </view>

          <view class="order-action-item" @click="navigateTo('/pages/order/myOrder?status=4')">
            <view class="icon-wrap">
              <u-icon name="star-fill" size="27" color="#13c2c2"></u-icon>
            </view>
            <text class="order-action-label">待评价</text>
          </view>

          <view class="order-action-item" @click="navigateTo('/pages/order/myOrder?status=5')">
            <view class="icon-wrap">
              <u-icon name="server-fill" size="27" color="#20b286"></u-icon>
            </view>
            <text class="order-action-label">退款/售后</text>
          </view>
        </view>
      </view>

      <!-- 服务工具卡片（分组化重构） -->
      <tool />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  onLoad,
  onShow,
  onPullDownRefresh,
  onNavigationBarButtonTap,
} from '@dcloudio/uni-app'
import tool from '@/pages/tabbar/user/utils/tool.vue'
import { getCouponsNum, getFootprintNum } from '@/api/members.js'
import { getUserWallet } from '@/api/members'
import configs from '@/config/config'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { isLogin, navigateToLogin, unitPrice } from '@/utils/filters.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const userImage = configs.defaultUserPhoto
const userInfo = ref<any>({})
const couponNum = ref<string | number>('')
const footNum = ref<string | number>('')
const walletNum = ref<string | number>('')

// 动态计算顶部安全留白，避免顶到灵动岛/状态栏
const headerPaddingTop = ref<number>(88)

function initSafeTop() {
  try {
    const sys = uni.getSystemInfoSync()
    const statusBar = sys.statusBarHeight || 44
    // #ifdef MP-WEIXIN
    const menu = uni.getMenuButtonBoundingClientRect()
    if (menu && menu.bottom) {
      // 头像整行落到微信胶囊下方，预留 16px 呼吸空隙，彻底消除压迫感
      headerPaddingTop.value = menu.bottom + 16
    } else {
      headerPaddingTop.value = statusBar + 54
    }
    // #endif
    // #ifndef MP-WEIXIN
    headerPaddingTop.value = statusBar + 32
    // #endif
  } catch (e) {
    headerPaddingTop.value = 88
  }
}

onLoad(() => {
  initSafeTop()
})

onShow(() => {
  userInfo.value = isLogin() || {}
  if (isLogin('auth')) {
    getUserOrderNum()
  } else {
    walletNum.value = 0
    couponNum.value = 0
    footNum.value = 0
  }
})

onPullDownRefresh(() => {
  getUserOrderNum()
  userInfo.value = isLogin()
})

// #ifndef MP
onNavigationBarButtonTap((e) => {
  if (e.index === 0) {
    navigateTo('/pages/mine/set/setUp')
  }
})
// #endif

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function userDetail() {
  userInfo.value.id
    ? navigateTo('/pages/mine/set/personMsg')
    : navigateToLogin()
}

async function getUserOrderNum() {
  uni.stopPullDownRefresh()

  Promise.all([
    getCouponsNum(),
    getFootprintNum(),
    getUserWallet(),
  ]).then((res: any[]) => {
    couponNum.value = res[0].data.result
    footNum.value = res[1].data.result
    walletNum.value = res[2].data.result.memberWallet
  })
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f6f9;
  padding-bottom: 40rpx;
  box-sizing: border-box;
}

/* 顶部沉浸式头部 */
.hero-header {
  position: relative;
  width: 100%;
  background: linear-gradient(175deg, #e53238 0%, #eb4448 45%, #ff5e62 100%);
  padding-left: 28rpx;
  padding-right: 28rpx;
  padding-bottom: 64rpx;
  border-bottom-left-radius: 36rpx;
  border-bottom-right-radius: 36rpx;
  /* CSS 静态兜底：状态栏高度 + 充足的沉降留白 */
  padding-top: calc(var(--status-bar-height, 44px) + 88rpx);
  box-sizing: border-box;
}

/* 用户信息行（移到胶囊下方，拥有充裕横纵向空间） */
.user-profile {
  display: flex;
  align-items: center;
  padding: 8rpx 6rpx;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.88;
  }

  .avatar-container {
    position: relative;
    flex-shrink: 0;

    .avatar-img {
      width: 124rpx;
      height: 124rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.92);
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.16);
      background-color: #ffffff;
      display: block;
    }

    .vip-tag-icon {
      position: absolute;
      right: -2rpx;
      bottom: 2rpx;
      width: 34rpx;
      height: 34rpx;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: 2rpx solid #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .user-detail-info {
    flex: 1;
    margin-left: 24rpx;
    min-width: 0;

    .user-title-row {
      display: flex;
      align-items: center;

      .user-nickname {
        font-size: 38rpx;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.5rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .user-sub-row {
      margin-top: 12rpx;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12rpx;

      .badge-tag {
        font-size: 20rpx;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.22);
        padding: 3rpx 14rpx;
        border-radius: 20rpx;
        border: 1rpx solid rgba(255, 255, 255, 0.35);
        font-weight: 500;
      }

      .user-sub-text {
        font-size: 23rpx;
        color: rgba(255, 255, 255, 0.88);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .profile-arrow {
    flex-shrink: 0;
    margin-left: 16rpx;
    opacity: 0.85;
  }
}

/* 核心资产栏（沉浸在红色背景中） */
.hero-assets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 44rpx;
  padding: 0 12rpx;

  .asset-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s, opacity 0.15s;

    &:active {
      transform: scale(0.96);
      opacity: 0.85;
    }

    .asset-number-row {
      display: flex;
      align-items: baseline;
      color: #ffffff;

      .symbol {
        font-size: 22rpx;
        font-weight: 600;
        margin-right: 4rpx;
        opacity: 0.95;
      }

      .num {
        font-size: 40rpx;
        font-weight: 700;
        letter-spacing: 0.5rpx;
      }

      .unit {
        font-size: 21rpx;
        margin-left: 4rpx;
        opacity: 0.85;
      }

      .money {
        max-width: 230rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .asset-title {
      margin-top: 10rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.88);
      line-height: 1;
    }
  }

  .asset-sep {
    width: 2rpx;
    height: 38rpx;
    background-color: rgba(255, 255, 255, 0.22);
  }
}

/* 主内容区（上浮自然压在红底圆角上） */
.main-container {
  position: relative;
  margin-top: -36rpx;
  padding: 0 24rpx;
  z-index: 2;
}

/* 通用白底圆角卡片 */
.card-box {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 18rpx rgba(17, 30, 79, 0.04);
}

/* 订单卡片 */
.order-box {
  .card-title-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 22rpx;
    border-bottom: 1rpx solid #f6f7fa;

    .card-title-text {
      font-size: 29rpx;
      font-weight: 700;
      color: #1a1a1a;
    }

    .card-more-btn {
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 23rpx;
      color: #999999;
      padding: 4rpx 0;

      &:active {
        opacity: 0.7;
      }
    }
  }

  .order-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24rpx;

    .order-action-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s, opacity 0.15s;

      &:active {
        transform: scale(0.93);
        opacity: 0.85;
      }

      .icon-wrap {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12rpx;
      }

      .order-action-label {
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        line-height: 1;
      }
    }
  }
}
</style>