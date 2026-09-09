<template>
  <view class="page" :style="themeStyle">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else>
    <view class="hero">
      <view class="hero-title">邀好友 赚奖励</view>
    </view>

    <view class="flow-card">
      <view class="flow-list">
        <view class="flow-item" v-for="(item, index) in flowSteps" :key="item.title">
          <view class="flow-icon-wrap" :style="{ background: item.bg }">
            <u-icon :name="item.icon" color="#fff" size="22" />
          </view>
          <view class="flow-text">
            <text class="flow-title">{{ item.title }}</text>
            <text class="flow-desc">{{ item.desc }}</text>
          </view>
          <view v-if="index < flowSteps.length - 1" class="flow-line"></view>
        </view>
      </view>

      <view class="card-btn" @click="goInviteCard">图文邀请卡</view>
    </view>

    <view class="invite-card">
      <view class="invite-title">
        <text class="invite-title-line">—</text>
        <text class="invite-title-text">我已邀请{{ inviteTotal }}人</text>
        <text class="invite-title-line">—</text>
      </view>

      <view v-if="loading && !inviteList.length" class="state-wrap">
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="!inviteList.length" class="state-wrap">
        <text class="state-text">还没有邀请好友，快去分享邀请卡吧</text>
      </view>

      <view v-else class="invite-list">
        <view class="invite-item" v-for="item in inviteList" :key="item.childDistributionId">
          <image
            class="invite-avatar"
            :src="resolveAvatar(item.memberAvatar)"
            mode="aspectFill"
          />
          <view class="invite-name">{{ displayInviteName(item) }}</view>
          <view class="invite-reward">
            获得
            <text class="reward-value">{{ formatMoney(item.inviteRewardAmount) }}</text>
            元
          </view>
        </view>
      </view>

      <view class="view-all" @click="goInviteList">查看我的邀请</view>
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
import { getDistributionInvitees } from '@/api/distribution'
import { parseGoodsImageUrl } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const defaultAvatar = config.defaultUserPhoto

const flowSteps = [
  {
    icon: 'account-fill',
    bg: 'linear-gradient(135deg, #ff9a8b, #ff6a88)',
    title: '邀请好友',
    desc: '成为分销员',
  },
  {
    icon: 'bag-fill',
    bg: 'linear-gradient(135deg, #84fab0, #8fd3f4)',
    title: '好友客户',
    desc: '下单购物',
  },
  {
    icon: 'red-packet-fill',
    bg: 'linear-gradient(135deg, #fccb90, #ff8f3f)',
    title: '邀请者获得',
    desc: '邀请奖励',
  },
]

const pageReady = ref(false)
const loading = ref(false)
const inviteTotal = ref(0)
const inviteList = ref<any[]>([])

onShow(() => {
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
    loadPreview()
  })
})

function loadPreview() {
  loading.value = true
  getDistributionInvitees({
    pageNumber: 1,
    pageSize: 5,
    rangeType: 'ALL',
  })
    .then((res) => {
      const result = res.data?.result || {}
      inviteTotal.value = Number(result.total || 0)
      inviteList.value = result.records || []
    })
    .finally(() => {
      loading.value = false
    })
}

function resolveAvatar(avatar?: string) {
  return parseGoodsImageUrl(avatar) || defaultAvatar
}

function displayInviteName(item: any) {
  const gradeName = (item.gradeName || '').trim()
  const memberName = (item.memberName || '分销员').trim()
  if (gradeName && !memberName.startsWith(gradeName)) {
    return `${gradeName}${memberName}`
  }
  return memberName
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function goInviteCard() {
  uni.navigateTo({ url: '/pages/mine/distribution/invite' })
}

function goInviteList() {
  uni.navigateTo({ url: '/pages/mine/distribution/invite-list' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff7f0;
  padding-bottom: 40rpx;
}

.hero {
  padding: 56rpx 40rpx 96rpx;
  background: linear-gradient(135deg, #ffb347 0%, #ff8f3f 45%, #ff6b35 100%);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.hero-title {
  color: #fff;
  font-size: 56rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  text-align: center;
  line-height: 1.3;
  position: relative;
  z-index: 1;
}

.flow-card {
  margin: -64rpx 24rpx 0;
  padding: 36rpx 28rpx 32rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 10rpx 30rpx rgba(255, 107, 53, 0.12);
  position: relative;
  z-index: 2;
}

.flow-list {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.flow-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.flow-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flow-text {
  margin-top: 16rpx;
  text-align: center;
}

.flow-title {
  display: block;
  color: #333;
  font-size: 24rpx;
  font-weight: 600;
  line-height: 1.4;
}

.flow-desc {
  display: block;
  color: #999;
  font-size: 22rpx;
  line-height: 1.4;
}

.flow-line {
  position: absolute;
  top: 44rpx;
  right: -20rpx;
  width: 40rpx;
  height: 2rpx;
  background: #f0f0f0;
}

.card-btn {
  margin-top: 36rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff9f3f, #ff6b35);
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}

.invite-card {
  margin: 24rpx;
  padding: 28rpx 24rpx 32rpx;
  border-radius: 20rpx;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.invite-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.invite-title-line,
.invite-title-text {
  color: #ff8f3f;
  font-size: 28rpx;
  font-weight: 600;
}

.state-wrap {
  padding: 48rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}

.invite-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.invite-item:last-child {
  border-bottom: none;
}

.invite-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f2f2f2;
  flex-shrink: 0;
}

.invite-name {
  flex: 1;
  margin: 0 20rpx;
  color: #333;
  font-size: 28rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-reward {
  color: #666;
  font-size: 24rpx;
  flex-shrink: 0;
}

.reward-value {
  color: #ff6b35;
  font-size: 30rpx;
  font-weight: 700;
  margin: 0 4rpx;
}

.view-all {
  margin-top: 28rpx;
  text-align: center;
  color: #ff8f3f;
  font-size: 28rpx;
  text-decoration: underline;
}
</style>
