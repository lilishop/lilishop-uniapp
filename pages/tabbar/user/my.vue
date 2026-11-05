<template>
  <view class="user-page" :style="themeStyle">
    <!-- 顶部沉浸式头部区域 -->
    <view class="hero-header" :style="heroHeaderStyle">
      <image
        v-if="gradeBackgroundUrl && !gradeBackgroundFailed"
        :key="gradeBackgroundUrl"
        class="grade-background"
        :class="{ 'is-loaded': gradeBackgroundLoaded }"
        :src="gradeBackgroundUrl"
        mode="aspectFill"
        @load="gradeBackgroundLoaded = true"
        @error="onGradeBackgroundError"
      />
      <!-- 用户信息区保持在微信胶囊安全区下方 -->
      <view class="user-profile" @click="userDetail">
        <view class="avatar-container">
          <image class="avatar-img" :src="userInfo.face || userImage" mode="aspectFill"></image>
        </view>

        <view class="user-detail-info">
          <view class="user-title-row">
            <text class="user-nickname">{{ userInfo.id ? userInfo.nickName : '登录 / 注册' }}</text>
          </view>
          <view class="user-sub-row">
            <view class="badge-tag" v-if="userInfo.id" @click.stop="navigateTo('/pages/mine/memberBenefits')">
              <image v-if="gradeIconUrl && !gradeIconFailed" :key="gradeIconUrl" class="grade-icon" :src="gradeIconUrl" mode="aspectFit" @error="gradeIconFailed = true" />
              <u-icon v-else name="level" size="16" :color="memberHeaderColor"></u-icon>
              <text class="grade-name">{{ memberGradeName }}</text>
            </view>
            <text class="user-sub-text" v-else>
              登录享受更多会员权益
            </text>
          </view>
        </view>

        <view class="profile-arrow">
            <u-icon name="arrow-right" size="14" :color="memberHeaderColor"></u-icon>
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
      <navigator v-if="showPaidMemberEntry" class="paid-entry" :style="{ color: paidEntryColor }" url="/pages/mine/paidMember" hover-class="none">
        <image v-if="paidEntryBackground" class="entry-bg" :src="paidEntryBackground" mode="aspectFill" />
        <view class="entry-content">
          <view><text class="entry-title">{{ paidEntryTitle }}</text><text class="entry-subtitle">{{ paidEntrySubtitle }}</text></view>
          <u-icon name="arrow-right" size="14" :color="paidEntryColor" />
        </view>
      </navigator>
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
      <tool :user-info="userInfo" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  onLoad,
  onShow,
  onPullDownRefresh,
  onNavigationBarButtonTap,
} from '@dcloudio/uni-app'
import tool from '@/pages/tabbar/user/utils/tool.vue'
import { getPaidMember } from '@/api/paid-member'
import { getCouponsNum, getFootprintNum } from '@/api/members.js'
import { getUserWallet } from '@/api/members'
import configs from '@/config/config'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { isLogin, navigateToLogin, unitPrice } from '@/utils/filters.js'

import { getCurrentMemberBenefits } from '@/api/members'
const memberGrade = ref<any>({})
const gradeOwnerId = ref('')
const gradeBackgroundLoaded = ref(false)
const gradeBackgroundFailed = ref(false)
const gradeIconFailed = ref(false)
let gradeRequestId = 0
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const userImage = configs.defaultUserPhoto
const userInfo = ref<any>({})
const paidMemberInfo = ref<any>(null)
let paidMemberRequestId = 0
const showPaidMemberEntry = computed(() => !!paidMemberInfo.value?.config
  && !!(paidMemberInfo.value.config.enabled || paidMemberInfo.value.active || paidMemberInfo.value.status === 'EXPIRED'))
const paidEntryTitle = computed(() => paidMemberInfo.value?.active
  ? paidMemberInfo.value.config?.openedText || '我的付费会员'
  : paidMemberInfo.value?.config?.unopenedText || '开通付费会员，享专属权益')
const paidEntryColor = computed(() => (paidMemberInfo.value?.active
  ? paidMemberInfo.value.config?.openedFontColor
  : paidMemberInfo.value?.config?.unopenedFontColor) || '#f4dfb9')
const paidEntryBackground = computed(() => paidMemberInfo.value?.active
  ? paidMemberInfo.value.config?.openedBackground
  : paidMemberInfo.value?.config?.unopenedBackground)
const paidEntrySubtitle = computed(() => paidMemberInfo.value?.active
  ? '有效期至 ' + paidMemberInfo.value.endTime
  : paidMemberInfo.value?.status === 'EXPIRED' ? '会员已到期，续费继续享权益' : '开通享商品优惠与专属权益')
const couponNum = ref<string | number>('')
const footNum = ref<string | number>('')
const walletNum = ref<string | number>('')

const currentGrade = computed(() =>
  userInfo.value.id && gradeOwnerId.value === String(userInfo.value.id) ? memberGrade.value : {}
)
const memberGradeName = computed(() => currentGrade.value.gradeName || '普通会员')
const gradeBackgroundUrl = computed(() => currentGrade.value.gradeBackground || '')
const gradeIconUrl = computed(() => currentGrade.value.gradeImage || '')
const memberHeaderColor = computed(() => {
  if (!gradeBackgroundUrl.value || !gradeBackgroundLoaded.value || gradeBackgroundFailed.value) return '#ffffff'
  const color = currentGrade.value.gradeFontColor || ''
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#333333'
})
const heroHeaderStyle = computed(() => ({
  paddingTop: headerPaddingTop.value + 'px',
  '--member-header-color': memberHeaderColor.value,
}))

watch(gradeBackgroundUrl, () => {
  gradeBackgroundLoaded.value = false
  gradeBackgroundFailed.value = false
}, { flush: 'sync' })
watch(gradeIconUrl, () => { gradeIconFailed.value = false }, { flush: 'sync' })

function resetMemberGrade() {
  gradeRequestId++
  gradeOwnerId.value = ''
  memberGrade.value = {}
  gradeBackgroundLoaded.value = false
  gradeBackgroundFailed.value = false
  gradeIconFailed.value = false
}

/** 个人中心显示时读取会员配置及资格；退出或切换账号后丢弃旧请求结果。 */
async function loadPaidMemberInfo() {
  const requestId = ++paidMemberRequestId
  const memberId = String(userInfo.value.id || '')
  paidMemberInfo.value = null
  if (!memberId) return
  try {
    const res = await getPaidMember()
    if (requestId !== paidMemberRequestId
      || String(userInfo.value.id || '') !== memberId
      || String((isLogin() || {}).id || '') !== memberId) return
    if (!res.data?.success) throw new Error(res.data?.message || '会员服务返回异常')
    paidMemberInfo.value = res.data.result || null
  } catch (error: any) {
    if (requestId === paidMemberRequestId) {
      console.warn('[付费会员] 入口加载失败', error?.message || '请求失败')
    }
  }
}

function onGradeBackgroundError() {
  gradeBackgroundFailed.value = true
  gradeBackgroundLoaded.value = false
}

async function loadMemberGrade() {
  const memberId = String(userInfo.value.id || '')
  if (!memberId) { resetMemberGrade(); return }
  if (gradeOwnerId.value !== memberId) resetMemberGrade()
  const requestId = ++gradeRequestId
  const stillCurrent = () => requestId === gradeRequestId
    && String((isLogin() || {}).id || '') === memberId
    && String(userInfo.value.id || '') === memberId
  try {
    const res = await getCurrentMemberBenefits()
    if (!stillCurrent()) return
    gradeOwnerId.value = memberId
    memberGrade.value = res.data?.success ? (res.data.result?.grade || {}) : {}
  } catch {
    if (stillCurrent()) resetMemberGrade()
  }
}

// 保留页在退出登录/切换账号时立即清除上一账号的等级展示。
watch(() => [store.state.userInfo?.id, store.state.hasLogin], () => {
  const account = store.state.hasLogin === false ? {} : (isLogin() || {})
  if (String(account.id || '') !== String(userInfo.value.id || '')) {
    userInfo.value = account
    resetMemberGrade()
    paidMemberRequestId++
    paidMemberInfo.value = null
    walletNum.value = 0
    couponNum.value = 0
    footNum.value = 0
  }
})

// 动态计算顶部安全留白，避免顶到灵动岛/状态栏
const headerPaddingTop = ref<number>(80)

function initSafeTop() {
  try {
    const sys = uni.getSystemInfoSync()
    const statusBar = sys.statusBarHeight || 44
    // #ifdef MP-WEIXIN
    const menu = uni.getMenuButtonBoundingClientRect()
    if (menu && menu.bottom) {
      // 胶囊下方保留 8px，减少空白且不遮挡用户信息
      headerPaddingTop.value = menu.bottom + 8
    } else {
      headerPaddingTop.value = statusBar + 44
    }
    // #endif
    // #ifndef MP-WEIXIN
    headerPaddingTop.value = statusBar + 20
    // #endif
  } catch (e) {
    headerPaddingTop.value = 80
  }
}

onLoad(() => {
  initSafeTop()
})

async function refreshUserPage() {
  userInfo.value = isLogin() || {}
  try {
    if (isLogin('auth')) {
      await Promise.allSettled([loadMemberGrade(), loadPaidMemberInfo(), getUserOrderNum()])
    } else {
      resetMemberGrade()
      paidMemberRequestId++
      paidMemberInfo.value = null
      walletNum.value = 0
      couponNum.value = 0
      footNum.value = 0
    }
  } finally {
    uni.stopPullDownRefresh()
  }
}

onShow(refreshUserPage)
onPullDownRefresh(refreshUserPage)

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
  const memberId = String(userInfo.value.id || '')
  try {
    // Each request can fail independently; a missing wallet must not break the other counts.
    const results = await Promise.allSettled([
      getCouponsNum(),
      getFootprintNum(),
      getUserWallet(),
    ])
    // The user may have logged out while these requests were running.
    if (String((isLogin() || {}).id || '') !== memberId || String(userInfo.value.id || '') !== memberId) return
    const targets = [couponNum, footNum, walletNum]
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled' || !result.value?.data?.success) return
      const data = result.value.data.result
      targets[index].value = index === 2 ? (data?.memberWallet ?? 0) : (data ?? 0)
    })
  } catch {
    // 等级与资产请求独立，接口异常不影响页面其它内容。
  }
}
</script>

<style lang="scss" scoped>
.paid-entry { position: relative; overflow: hidden; border-radius: 20rpx; background: linear-gradient(110deg, #423c36, #756149); margin-bottom: 20rpx; }
.entry-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.entry-content { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 25rpx 28rpx; }
.entry-title { font-size: 27rpx; font-weight: 600; display: block; }
.entry-subtitle { font-size: 21rpx; opacity: .75; display: block; margin-top: 8rpx; }
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
  padding-bottom: 44rpx;
  border-bottom-left-radius: 36rpx;
  border-bottom-right-radius: 36rpx;
  /* 静态兜底保留状态栏与导航操作区域 */
  padding-top: calc(var(--status-bar-height, 44px) + 72rpx);
  box-sizing: border-box;
  overflow: hidden;
}

.grade-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.grade-background.is-loaded {
  opacity: 1;
}

/* 紧凑用户信息行 */
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4rpx 6rpx;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.88;
  }

  .avatar-container {
    position: relative;
    flex-shrink: 0;

    .avatar-img {
      width: 104rpx;
      height: 104rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255, 255, 255, 0.92);
      box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.16);
      background-color: #ffffff;
      display: block;
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
        font-size: 34rpx;
        font-weight: 700;
        color: var(--member-header-color, #ffffff);
        letter-spacing: 0.5rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .user-sub-row {
      margin-top: 8rpx;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12rpx;

      .badge-tag {
        display: inline-flex;
        align-items: center;
        gap: 6rpx;
        max-width: 100%;
        min-height: 40rpx;
        box-sizing: border-box;
        font-size: 20rpx;
        color: var(--member-header-color, #ffffff);
        background: rgba(255, 255, 255, 0.22);
        padding: 2rpx 12rpx 2rpx 6rpx;
        border-radius: 20rpx;
        border: 1rpx solid rgba(255, 255, 255, 0.35);
        font-weight: 500;

        .grade-icon {
          width: 36rpx;
          height: 36rpx;
          flex-shrink: 0;
          display: block;
        }

        .grade-name {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .user-sub-text {
        font-size: 23rpx;
        color: var(--member-header-color, #ffffff);
        opacity: 0.88;
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

/* 核心资产栏 */
.hero-assets {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
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
      color: var(--member-header-color, #ffffff);

      .symbol {
        font-size: 22rpx;
        font-weight: 600;
        margin-right: 4rpx;
        opacity: 0.95;
      }

      .num {
        font-size: 36rpx;
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
      margin-top: 8rpx;
      font-size: 24rpx;
      color: var(--member-header-color, #ffffff);
      opacity: 0.88;
      line-height: 1;
    }
  }

  .asset-sep {
    width: 2rpx;
    height: 38rpx;
    background-color: var(--member-header-color, #ffffff);
    opacity: 0.22;
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
