<template>
  <view class="page" :style="themeStyle">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <u-icon name="arrow-left" color="#fff" size="20" />
      </view>
      <view class="nav-title">分销员中心</view>
      <view class="nav-placeholder"></view>
    </view>

    <view v-if="checking" class="center-pending">加载中...</view>
    <template v-else-if="centerReady">
    <!-- 顶部用户信息 -->
    <view class="header">
      <view class="user-row" @click="goGrade">
        <view class="avatar-wrap">
          <image class="avatar" :src="userInfo.face || defaultAvatar" mode="aspectFill" />
          <view class="level-badge">V{{ currentGradeValue }}</view>
        </view>
        <view class="user-meta">
          <view class="user-name">{{ displayName }}</view>
          <view class="user-sub" v-if="userInfo.mobile">手机号：{{ userInfo.mobile }}</view>
        </view>
        <u-icon name="arrow-right" color="rgba(255,255,255,0.7)" size="16"></u-icon>
      </view>
      <view class="parent-row" v-if="parentDistributorVisible === true">
        <text class="parent-text">上级：{{ parentLabel }}</text>
      </view>
    </view>

    <!-- 等级升级条 -->
    <view class="level-bar" v-if="gradeVisible" @click="goGrade">
      <view class="level-bar-inner">
        <view class="level-info">
          <view class="level-title">
            <text>{{ currentGradeName }}</text>
            <text class="level-tag">V{{ currentGradeValue }}</text>
            <u-icon name="arrow-right" color="#8a5a28" size="12"></u-icon>
          </view>
          <view class="level-tip">{{ upgradeTip }}</view>
        </view>
      </view>
    </view>

    <view class="body">
      <!-- 收益卡片 -->
      <view class="earn-card" @click="goAchievement">
        <view class="earn-row">
          <view class="earn-item">
            <view class="earn-label">今日收益</view>
            <view class="earn-value">{{ formatMoney(todayEarnings) }}<text class="unit">元</text></view>
          </view>
          <view class="earn-item earn-item-right">
            <view class="earn-label">总收益</view>
            <view class="earn-value">{{ formatMoney(totalEarnings) }}<text class="unit">元</text></view>
            <view class="earn-sub" @click.stop="goAchievement">
              含待结算{{ formatMoney(pendingAmount) }}元
              <u-icon name="arrow-right" color="rgba(255,255,255,0.85)" size="12"></u-icon>
            </view>
          </view>
        </view>
      </view>

      <!-- 可提现 -->
      <view class="withdraw-card" @click="goWithdraw">
        <view class="withdraw-left">
          <text>可提现金额(元)</text>
        </view>
        <view class="withdraw-right">
          <text class="withdraw-amount">{{ formatMoney(withdrawableAmount) }}</text>
          <u-icon name="arrow-right" color="#ccc" size="14"></u-icon>
        </view>
      </view>

      <!-- 展开更多 -->
      <view class="expand-toggle" v-if="!expanded" @click="expanded = true">
        <text>展开更多</text>
        <u-icon name="arrow-down" color="#999" size="14"></u-icon>
      </view>

      <view class="stats-card" v-if="expanded">
        <view class="stats-row">
          <view class="stats-item" @click="goTodayOrders">
            <view class="stats-label">今日推广订单</view>
            <view class="stats-value">{{ todayOrderCount }}</view>
          </view>
          <view class="stats-item" @click="goOrders">
            <view class="stats-label">累计推广订单</view>
            <view class="stats-value">{{ totalOrderCount }}</view>
          </view>
        </view>
        <view class="stats-row">
          <view class="stats-item" @click="goTodayCustomers">
            <view class="stats-label">今日新增客户</view>
            <view class="stats-value">{{ todayCustomerCount }}</view>
          </view>
          <view class="stats-item" @click="goCustomers">
            <view class="stats-label">累计客户</view>
            <view class="stats-value">{{ totalCustomerCount }}</view>
          </view>
        </view>
        <view class="stats-row stats-row-last">
          <view class="stats-item" @click="goTodayInvites">
            <view class="stats-label">今日新增邀请</view>
            <view class="stats-value">{{ todayInviteCount }}</view>
          </view>
          <view class="stats-item" @click="goInvites">
            <view class="stats-label">累计邀请</view>
            <view class="stats-value">{{ totalInviteCount }}</view>
          </view>
        </view>
      </view>

      <!-- 收起 -->
      <view class="expand-toggle" v-if="expanded" @click="expanded = false">
        <text>收起</text>
        <u-icon name="arrow-up" color="#999" size="14"></u-icon>
      </view>

      <!-- 主推商品：由后台分销商品设置决定是否展示及商品规则 -->
      <view class="featured-section" v-if="featuredGoods.length">
        <view class="section-title featured-section-title">主推商品</view>
        <view class="featured-list">
          <view
            v-for="item in featuredGoods"
            :key="item.skuId || item.id"
            class="featured-item"
          >
            <image
              class="featured-image"
              :src="item.thumbnail"
              mode="aspectFill"
              @click="goFeaturedGoods(item)"
            ></image>
            <view class="featured-body">
              <view class="featured-name" @click="goFeaturedGoods(item)">{{ item.goodsName }}</view>
              <view class="featured-detail-row">
                <view class="featured-info" @click="goFeaturedGoods(item)">
                  <view class="featured-earn">赚 ¥{{ formatMoney(item.commission) }}</view>
                  <view class="featured-price">¥{{ formatMoney(item.price) }}</view>
                </view>
                <view class="featured-share-btn" @click.stop="shareFeaturedGoods(item)">
                  立即分享
                </view>
              </view>
              <view
                class="featured-sales"
                v-if="item.salesCount !== null && item.salesCount !== undefined"
                @click="goFeaturedGoods(item)"
              >
                已售 {{ item.salesCount }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推广卖货 -->
      <view class="promote-section">
        <view class="promote-title">推广卖货</view>
        <view class="tool-grid">
          <view class="tool-row">
            <view class="tool-item" @click="goGoodsList">
              <view class="tool-text">
                <view class="tool-name">推广商品</view>
                <view class="tool-desc">佣金赚不够</view>
              </view>
              <view class="tool-icon">
                <u-icon name="bag-fill" color="#ff8f3f" size="28"></u-icon>
              </view>
            </view>
            <view class="tool-item" @click="goPoster">
              <view class="tool-text">
                <view class="tool-name">推广海报</view>
                <view class="tool-desc">发圈快速获客</view>
              </view>
              <view class="tool-icon">
                <u-icon name="photo-fill" color="#ff6b6b" size="28"></u-icon>
              </view>
            </view>
          </view>
          <view class="tool-row">
            <view class="tool-item" @click="goInvite">
              <view class="tool-text">
                <view class="tool-name">邀请好友</view>
                <view class="tool-desc">可获得邀请佣金</view>
              </view>
              <view class="tool-icon">
                <u-icon name="email-fill" color="#9b7bff" size="28"></u-icon>
              </view>
            </view>
            <view class="tool-item" @click="goOrder">
              <view class="tool-text">
                <view class="tool-name">推广订单</view>
                <view class="tool-desc">查看推广订单</view>
              </view>
              <view class="tool-icon">
                <u-icon name="order" color="#ff8f3f" size="28"></u-icon>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import config from '@/config/config'
import { getThemeStyle } from '@/utils/theme'
import {
  getDistributionFeaturedGoods,
  getDistributionGrades,
  getDistributionCustomers,
  getDistributionInvitees,
  getDistributionOrders,
  getDistributionParent,
  getDistributionPerformance,
} from '@/api/distribution'
import { getUserInfo } from '@/api/members'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const defaultAvatar = config.defaultUserPhoto
const statusBarHeight = ref(20)
const expanded = ref(false)

const distributionData = ref<Record<string, any>>({})
const checking = ref(true)
const centerReady = ref(false)
const gradeList = ref<any[]>([])
const featuredGoods = ref<any[]>([])
const todayOrderCount = ref(0)
const todayEarnings = ref(0)
const todayCustomerCount = ref(0)
const todayInviteCount = ref(0)
const parentDistributorVisible = ref<boolean | undefined>(undefined)
const parentNickname = ref('')

const userInfo = computed(() => store.state.userInfo || {})
const displayName = computed(() => userInfo.value.nickName || distributionData.value.memberName || '分销员')

const withdrawableAmount = computed(() => Number(distributionData.value.canRebate || 0))
const pendingAmount = computed(() => Number(distributionData.value.commissionFrozen || 0))
const totalEarnings = computed(() => Number(distributionData.value.rebateTotal || 0))
const totalOrderCount = computed(() => Number(distributionData.value.distributionOrderCount || 0))
const totalCustomerCount = computed(() => Number(distributionData.value.validCustomerCount || 0))
const totalInviteCount = computed(() => Number(distributionData.value.inviteCount || 0))

const currentGradeValue = computed(() => {
  const val = Number(distributionData.value.gradeId)
  return Number.isFinite(val) && val > 0 ? val : 1
})

const currentGrade = computed(() => {
  return gradeList.value.find((g) => Number(g.sortOrder) === currentGradeValue.value) || null
})

const currentGradeName = computed(() => currentGrade.value?.gradeName || '普通分销员')

const nextGrade = computed(() => {
  return gradeList.value.find((g) => Number(g.sortOrder) === currentGradeValue.value + 1) || null
})

const gradeVisible = computed(() => gradeList.value.length > 0)

const parentLabel = computed(() => {
  const name = (parentNickname.value || '').trim()
  return name || '暂无'
})

const upgradeTip = computed(() => {
  if (!nextGrade.value) {
    return '当前已是最高等级，继续保持优秀业绩'
  }
  const sales = Number(distributionData.value.validSalesAmount || 0)
  const threshold = Number(nextGrade.value.salesThreshold || 0)
  if (threshold > 0 && sales < threshold) {
    const gap = (threshold - sales).toFixed(2)
    return `推广金额再增加${gap}元即可升级为${nextGrade.value.gradeName || '下一等级'}`
  }
  return `继续提升业绩即可升级为${nextGrade.value.gradeName || '下一等级'}`
})

onShow(() => {
  statusBarHeight.value = uni.getWindowInfo?.()?.statusBarHeight || 20
  refreshUserInfo()
  loadPageData()
})

function refreshUserInfo() {
  getUserInfo().then((res) => {
    if (res.data?.result) {
      store.commit('login', res.data.result)
    }
  })
}

function resetParentState() {
  parentDistributorVisible.value = undefined
  parentNickname.value = ''
}

function loadPageData() {
  checking.value = true
  centerReady.value = false
  distributionData.value = {}
  resetParentState()
  fetchDistribution()
    .then((active) => {
      if (!active) {
        return
      }
      centerReady.value = true
      Promise.all([
        fetchGrades(),
        fetchTodayOrders(),
        fetchTodayEarnings(),
        fetchTodayCustomers(),
        fetchTodayInvites(),
        fetchFeaturedGoods(),
        fetchParent(),
      ])
    })
    .finally(() => {
      if (centerReady.value) {
        checking.value = false
      }
    })
}

function fetchDistribution() {
  return assertActiveDistributor().then((result) => {
    if (!result) {
      return false
    }
    distributionData.value = result
    return true
  })
}

function fetchGrades() {
  return getDistributionGrades().then((res) => {
    const grades = res.data?.result?.grades
    gradeList.value = Array.isArray(grades) ? grades : []
  })
}

function fetchTodayOrders() {
  return getDistributionOrders({
    pageNumber: 1,
    pageSize: 1,
    orderType: 'PROMOTION',
    rangeType: 'TODAY',
  }).then((res) => {
    todayOrderCount.value = Number(res.data?.result?.total || 0)
  })
}

function fetchTodayEarnings() {
  return getDistributionPerformance({ rangeType: 'TODAY' }).then((res) => {
    todayEarnings.value = Number(res.data?.result?.totalEarnings || 0)
  })
}

function fetchTodayCustomers() {
  return getDistributionCustomers({
    pageNumber: 1,
    pageSize: 1,
    filterType: 'ALL',
    rangeType: 'TODAY',
  }).then((res) => {
    todayCustomerCount.value = Number(res.data?.result?.total || 0)
  })
}

function fetchTodayInvites() {
  return getDistributionInvitees({
    pageNumber: 1,
    pageSize: 1,
    rangeType: 'TODAY',
  }).then((res) => {
    todayInviteCount.value = Number(res.data?.result?.total || 0)
  })
}

function fetchFeaturedGoods() {
  featuredGoods.value = []
  return getDistributionFeaturedGoods().then((res) => {
    const result = res.data?.result
    featuredGoods.value = Array.isArray(result) ? result : []
  })
}

function fetchParent() {
  resetParentState()
  return getDistributionParent()
    .then((res) => {
      const result = res.data?.result
      parentDistributorVisible.value = result?.parentDistributorVisible
      parentNickname.value = result?.parentNickname || ''
    })
    .catch(() => {
      resetParentState()
    })
}

function formatMoney(val: number | string) {
  const num = Number(val || 0)
  return num.toFixed(2)
}

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/tabbar/user/my' })
  }
}

function distQuery() {
  const d = distributionData.value
  return `id=${d.id || ''}&name=${encodeURIComponent(d.memberName || '')}`
}

function goGrade() {
  navigateTo('/pages/mine/distribution/grade')
}

function goAchievement() {
  navigateTo('/pages/mine/distribution/achievement')
}

function goHistory() {
  navigateTo(`/pages/mine/distribution/history?type=0&${distQuery()}`)
}

function goWithdraw() {
  navigateTo('/pages/mine/distribution/withdrawal')
}

function goGoodsList() {
  navigateTo(`/pages/mine/distribution/list?${distQuery()}`)
}

function goFeaturedGoods(item: any) {
  if (!item?.skuId || !item?.goodsId) return
  navigateTo(`/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`)
}

function shareFeaturedGoods(item: any) {
  const distributionId = distributionData.value.id
  if (!item?.skuId || !item?.goodsId || !distributionId) {
    uni.showToast({ title: '分享信息不完整', icon: 'none' })
    return
  }
  navigateTo(
    `/pages/mine/distribution/share?skuId=${item.skuId}&goodsId=${item.goodsId}&distributionId=${distributionId}`
  )
}

function goPoster() {
  navigateTo('/pages/mine/distribution/poster')
}

function goInvite() {
  navigateTo('/pages/mine/distribution/invite-friends')
}

function goCustomers() {
  navigateTo('/pages/mine/distribution/customer-list')
}

function goTodayCustomers() {
  navigateTo('/pages/mine/distribution/customer-list?rangeType=TODAY')
}

function goInvites() {
  navigateTo('/pages/mine/distribution/invite-list')
}

function goTodayInvites() {
  navigateTo('/pages/mine/distribution/invite-list?rangeType=TODAY')
}

function goOrders() {
  navigateTo('/pages/mine/distribution/order-list?orderType=PROMOTION')
}

function goTodayOrders() {
  navigateTo('/pages/mine/distribution/order-list?orderType=PROMOTION&rangeType=TODAY')
}

function goOrder() {
  goOrders()
}

</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.status-bar {
  background: #1f2228;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 16rpx;
  background: #1f2228;
}

.nav-back {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
}

.nav-placeholder {
  width: 72rpx;
}

.center-pending {
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
  text-align: center;
}

.header {
  background: linear-gradient(180deg, #1f2228 0%, #2a2e36 100%);
  padding: 24rpx 32rpx 40rpx;
}

.user-row {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  margin-right: 24rpx;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: #eee;
}

.level-badge {
  position: absolute;
  right: -4rpx;
  bottom: -4rpx;
  min-width: 40rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: #5c3b00;
  font-size: 18rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  flex: 1;
  min-width: 0;
}

.user-name {
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.user-sub {
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
  line-height: 1.6;
}

.parent-row {
  margin-top: 16rpx;
}

.parent-text {
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
  line-height: 1.6;
}

.level-bar {
  margin: -24rpx 24rpx 0;
  position: relative;
  z-index: 2;
}

.level-bar-inner {
  padding: 24rpx 28rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #fff7ed 0%, #fdebd3 100%);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.level-info {
  min-width: 0;
}

.level-title {
  display: flex;
  align-items: center;
  gap: 10rpx;
  color: #5c3b12;
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.level-tag {
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  background: rgba(201, 122, 43, 0.12);
  font-size: 22rpx;
}

.level-tip {
  color: #8a6a45;
  font-size: 24rpx;
  line-height: 1.5;
}

.body {
  padding: 24rpx;
}

.earn-card {
  margin-top: 16rpx;
  padding: 36rpx 32rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #ff8f3f 0%, #ff6b35 55%, #ff5a2f 100%);
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 53, 0.28);
}

.earn-row {
  display: flex;
}

.earn-item {
  flex: 1;
}

.earn-item-right {
  text-align: right;
}

.earn-label {
  color: rgba(255, 255, 255, 0.88);
  font-size: 26rpx;
  margin-bottom: 12rpx;
}

.earn-value {
  color: #fff;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.2;
}

.unit {
  font-size: 28rpx;
  font-weight: 500;
  margin-left: 4rpx;
}

.earn-sub {
  margin-top: 12rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4rpx;
}

.expand-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 0 8rpx;
  color: #999;
  font-size: 26rpx;
}

.stats-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 8rpx 28rpx;
  margin-bottom: 0;
}

.stats-row {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}

.stats-row-last {
  border-bottom: none;
}

.stats-item {
  flex: 1;
  text-align: left;
}

.stats-label {
  color: #999;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.stats-value {
  color: #222;
  font-size: 40rpx;
  font-weight: 600;
}

.withdraw-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 28rpx;
  margin-top: 8rpx;
}

.withdraw-left {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #333;
  font-size: 28rpx;
}

.withdraw-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.withdraw-amount {
  color: #ff6b35;
  font-size: 36rpx;
  font-weight: 700;
}

.section-title {
  margin: 36rpx 0 20rpx;
  color: #222;
  font-size: 32rpx;
  font-weight: 600;
}

.promote-section {
  margin-top: 24rpx;
  margin-bottom: 40rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.promote-title {
  margin-bottom: 20rpx;
  color: #222;
  font-size: 32rpx;
  font-weight: 600;
}

.tool-grid {
  display: flex;
  flex-direction: column;
}

.tool-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.tool-row:last-child {
  margin-bottom: 0;
}

.tool-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 48%;
  padding: 24rpx 20rpx;
  box-sizing: border-box;
  border-radius: 12rpx;
  background: #f7f8fa;
}

.tool-text {
  flex: 1;
  min-width: 0;
  padding-right: 12rpx;
}

.tool-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
}

.tool-name {
  color: #222;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 8rpx;
}

.tool-desc {
  color: #999;
  font-size: 22rpx;
  line-height: 1.3;
}

.featured-section {
  margin-top: 36rpx;
  padding-bottom: 8rpx;
}

.featured-section-title {
  margin-top: 0;
  margin-bottom: 16rpx;
}

.featured-list {
  overflow: hidden;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.featured-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 20rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #f0f0f0;
}

.featured-item:last-child {
  border-bottom: none;
}

.featured-image {
  display: block;
  flex-shrink: 0;
  width: 176rpx;
  height: 176rpx;
  border-radius: 12rpx;
  background: #f4f4f4;
}

.featured-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding-left: 16rpx;
}

.featured-name {
  overflow: hidden;
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.featured-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.featured-info {
  flex: 1;
  min-width: 0;
}

.featured-earn {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  background: #fff0f0;
  color: #ff4d4f;
  font-size: 22rpx;
  line-height: 1.4;
}

.featured-price {
  margin-top: 10rpx;
  color: #222;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.2;
}

.featured-sales {
  margin-top: 8rpx;
  color: #b3b3b3;
  font-size: 22rpx;
  line-height: 1.2;
}

.featured-share-btn {
  flex-shrink: 0;
  margin-left: 12rpx;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8f3f 0%, #ff6b35 100%);
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  white-space: nowrap;
}

</style>
