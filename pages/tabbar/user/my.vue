<template>
  <view class="user" :style="themeStyle">
    <!-- 个人信息 -->
    <view class="status_bar">
      <!-- 这里是状态栏 -->
    </view>
    <view class="header" @click="userDetail">
      <view class="head-1">
        <image class="head-avatar" :src="userInfo.face || userImage"></image>
      </view>
      <view class="head-2" v-if="userInfo.id">
        <view class="user-name">{{ userInfo.nickName }}</view>
      </view>
      <view class="head-2" v-else>
        <view class="user-name">登录/注册</view>
      </view>
      <u-icon class="header-arrow" name="arrow-right"></u-icon>
    </view>
    <!-- 积分，优惠券，关注， -->
    <div class="pointBox box">
      <view class="point">
        <view class="point-item" @click="navigateTo('/pages/mine/deposit/operation')">
          <view class="point-label">预存款</view>
          <view class="point-value money">{{ unitPrice(walletNum) }}</view>
        </view>
        <view class="point-item" @click="navigateTo('/pages/cart/coupon/myCoupon')">
          <view class="point-label">优惠券</view>
          <view class="point-value">{{ couponNum || 0 }}</view>
        </view>
        <view class="point-item" @click="navigateTo('/pages/mine/myTracks')">
          <view class="point-label">足迹</view>
          <view class="point-value">{{ footNum || 0 }}</view>
        </view>
      </view>
      <!-- 我的订单 -->
      <view class="order">
        <view class="order-head">
          <text class="order-head-title">我的订单</text>
          <view class="order-head-all" @click="navigateTo('/pages/order/myOrder?status=0')">
            <text>全部</text>
            <u-icon name="arrow-right" size="12" color="#999"></u-icon>
          </view>
        </view>
        <view class="order-row">
          <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=1')">
            <view class="bag bag2">
              <u-icon name="bag-fill" size="22" color="#fff"></u-icon>
            </view>
            <view class="order-item-label">待支付</view>
          </view>
          <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=2')">
            <view class="bag bag1">
              <u-icon name="gift-fill" size="22" color="#fff"></u-icon>
            </view>
            <view class="order-item-label">待发货</view>
          </view>
          <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=3')">
            <view class="bag bag3">
              <u-icon name="car-fill" size="22" color="#fff"></u-icon>
            </view>
            <view class="order-item-label">待收货</view>
          </view>
          <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=4')">
            <view class="bag bag4">
              <u-icon name="star-fill" size="22" color="#fff"></u-icon>
            </view>
            <view class="order-item-label">待评价</view>
          </view>
          <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=5')">
            <view class="bag bag5">
              <u-icon name="server-fill" size="22" color="#fff"></u-icon>
            </view>
            <view class="order-item-label">售后</view>
          </view>
        </view>
      </view>
    </div>
    <!-- 常用工具 -->

    <tool />

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

onLoad(() => {})

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
html,
body {
  overflow: auto;
}

.money {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.user {
  .header {
    max-width: 100%;
    padding: calc(50rpx + var(--status-bar-height)) 30rpx 0 6%;
    height: calc(var(--status-bar-height) + 360rpx);
    background-size: cover;
    border-bottom-left-radius: 30rpx;
    border-bottom-right-radius: 30rpx;
    background-image: url("https://lilishop-uniapp.oss-cn-beijing.aliyuncs.com/main-bg.png");
    background-position: bottom;
    background-repeat: no-repeat;
    color: #ffffff;
    display: flex;
    align-items: center;

    .head-1 {
      flex-shrink: 0;
      width: 152rpx;

      .head-avatar {
        width: 152rpx;
        height: 144rpx;
        border-radius: 50%;
        border: 3px solid #fff;
        display: block;
      }

      .edti-head {
        position: absolute;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        top: 100rpx;
        right: 0;

        .head-avatar {
          width: 100%;
          height: 100%;
        }
      }
    }

    .head-2 {
      flex: 1;
      margin-left: 30rpx;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .header-arrow {
      flex-shrink: 0;
      margin-left: 20rpx;
    }
  }

  .pointBox {
    width: 94%;
    margin: 0 3%;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 24rpx 0 rgba($color: #f6f6f6, $alpha: 1);
  }

  .point {
    display: flex;
    align-items: center;
    text-align: center;
    height: 160rpx;
    font-size: $font-sm;
    // #ifdef MP-WEIXIN
    padding: 24rpx;
    // #endif

    .point-item {
      flex: 1;
      text-align: center;
    }

    .point-label {
      color: $u-main-color;
      font-size: 28rpx;
    }

    .point-value {
      margin-top: 8rpx;
      color: $main-color;
      font-size: $font-lg;
    }
  }

  .order {
    padding: 8rpx 16rpx 24rpx;
    color: #333;

    .order-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8rpx 12rpx 20rpx;
    }

    .order-head-title {
      font-size: 26rpx;
      font-weight: 600;
      color: #111;
    }

    .order-head-all {
      display: flex;
      align-items: center;
      gap: 4rpx;
      font-size: 24rpx;
      color: #999;
    }

    .order-row {
      display: flex;
      align-items: center;
    }

    .order-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .order-item-label {
      margin-top: 12rpx;
      line-height: 1.4;
      font-size: 24rpx;
      color: #333;
    }
  }
}

.box {
  transform: translateY(-30rpx);
}

.user-name {
  font-size: 34rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bag {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bag1 {
  background: #ff4a48;
}

.bag2 {
  background: #ff992f;
}

.bag3 {
  background: #009ee0;
}

.bag4 {
  background: #00d5d5;
}

.bag5 {
  background: #28ccb0;
}
</style>
