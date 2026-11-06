<template>
  <view class="page">
    <view class="bind-section">
      <view class="section-title">兑换礼品卡</view>
      <view class="bind-row">
        <text class="bind-label">卡号</text>
        <u-input
          v-model="bindForm.cardNo"
          border="none"
          maxlength="64"
          placeholder="请输入卡号"
          clearable
        />
      </view>
      <view class="bind-row">
        <text class="bind-label">兑换码</text>
        <u-input
          v-model="bindForm.cardSecret"
          border="none"
          maxlength="128"
          placeholder="请输入兑换码（卡密）"
          clearable
        />
      </view>
      <view class="bind-btn" :class="{ disabled: bindSubmitting }" @click="submitBind">
        {{ bindSubmitting ? '兑换中...' : '兑换' }}
      </view>
    </view>

    <view class="tabs-wrap">
      <u-tabs
        :list="tabList"
        keyName="text"
        :scrollable="false"
        :inactiveStyle="{ color: '#333' }"
        v-model:current="tabCurrentIndex"
        :lineColor="lightColor"
        :activeStyle="{ color: lightColor }"
      />
    </view>

    <scroll-view class="list-scroll" scroll-y @scrolltolower="loadMore">
      <u-empty v-if="!loading && !list.length" mode="coupon" text="暂无礼品卡" />
      <view
        class="gcc-card"
        :class="{ 'is-disabled': statusTab === 'UNAVAILABLE' }"
        v-for="item in list"
        :key="item.id || item.cardNo"
      >
        <view class="gcc-header">
          <view class="gcc-header-pattern" />
          <view class="gcc-header-inner">
            <view class="gcc-header-left">
              <view class="gcc-title">{{ item.giftCardName || '礼品卡' }}</view>
              <view class="gcc-face">{{ item.cardType === 'PICKUP' ? '兑换 ' + item.pickupCount + ' 种商品' : '面值' + item.faceText + '元' }}</view>
              <view class="gcc-cardno">{{ item.cardNo }}</view>
            </view>
            <view class="gcc-header-right">
              <view class="gcc-type">{{ item.cardType === 'PICKUP' ? '提货卡' : '现金卡' }}</view>
              <view class="gcc-expire">{{ item.expireText }}</view>
            </view>
          </view>
        </view>
        <view class="gcc-body">
          <view v-if="item.cardType === 'PICKUP'" class="gcc-row">每种一件 · 一次兑完 · 免邮</view>
          <view v-else class="gcc-row">
            当前余额：
            <text class="gcc-strong" v-if="item.balance != null">￥{{ unitPrice(item.balance) }}</text>
            <text class="gcc-strong" v-else>—</text>
          </view>
          <view
            class="gcc-action"
            :class="{ 'is-disabled': actionDisabled || isActivating(item) }"
            @click="onCardPrimaryAction(item)"
          >
            <text v-if="isActivating(item)">提交中...</text>
            <text v-else>{{ actionLabel }}</text>
          </view>
        </view>
      </view>
      <view class="load-more" v-if="list.length">{{ loadStatusText }}</view>
      <view class="notice">{{ useNotice }}</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import {
  activateGiftCardCashMemberCard,
  bindGiftCardCashMemberCard,
  getGiftCardCashMemberCardPage,
} from '@/api/promotions.js'
import { unitPrice } from '@/utils/filters.js'
import {
  decorateGiftCard,
  GIFT_CARD_STATUS,
  GIFT_CARD_USE_NOTICE,
  giftCardActionLabel,
  resolveMemberCardId,
} from '@/utils/giftCard.js'
import { useStore } from '@/store'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const useNotice = GIFT_CARD_USE_NOTICE

const tabList = [
  { text: '可用', status: GIFT_CARD_STATUS.AVAILABLE },
  { text: '不可用', status: GIFT_CARD_STATUS.UNAVAILABLE },
  { text: '待激活', status: GIFT_CARD_STATUS.PENDING_ACTIVATION },
]
const tabCurrentIndex = ref(0)
const statusTab = computed(() => tabList[tabCurrentIndex.value].status)
const actionLabel = computed(() => giftCardActionLabel(statusTab.value))
const actionDisabled = computed(() => statusTab.value === GIFT_CARD_STATUS.UNAVAILABLE)

const bindForm = ref({ cardNo: '', cardSecret: '' })
const bindSubmitting = ref(false)
const loading = ref(false)
const list = ref<any[]>([])
const pageNumber = ref(1)
const loadStatus = ref('more')
const activatingId = ref('')

const loadStatusText = computed(() => (loadStatus.value === 'noMore' ? '没有更多了' : ''))

onShow(() => {
  resetAndLoad()
})

watch(tabCurrentIndex, () => {
  resetAndLoad()
})

function resetAndLoad() {
  pageNumber.value = 1
  list.value = []
  loadStatus.value = 'more'
  getList()
}

function getList() {
  if (loadStatus.value === 'noMore' && pageNumber.value > 1) return
  loading.value = true
  getGiftCardCashMemberCardPage({
    pageNumber: pageNumber.value,
    pageSize: 10,
    sort: 'createTime',
    order: 'desc',
    memberCardStatus: statusTab.value,
  }).then((res) => {
    loading.value = false
    if (!res.data.success) return
    const records = ((res.data.result && res.data.result.records) || []).map((item: any) =>
      decorateGiftCard(item)
    )
    if (pageNumber.value === 1) {
      list.value = records
    } else {
      list.value = list.value.concat(records)
    }
    loadStatus.value = records.length < 10 ? 'noMore' : 'more'
  }).catch(() => {
    loading.value = false
  })
}

function loadMore() {
  if (loadStatus.value === 'noMore' || loading.value) return
  pageNumber.value += 1
  getList()
}

function submitBind() {
  const cardNo = String(bindForm.value.cardNo || '').trim()
  const cardSecret = String(bindForm.value.cardSecret || '').trim()
  if (!cardNo) {
    uni.showToast({ title: '请输入卡号', icon: 'none' })
    return
  }
  if (!cardSecret) {
    uni.showToast({ title: '请输入兑换码', icon: 'none' })
    return
  }
  if (bindSubmitting.value) return
  bindSubmitting.value = true
  bindGiftCardCashMemberCard({ cardNo, cardSecret })
    .then((res) => {
      bindSubmitting.value = false
      if (!res.data.success) return
      uni.showToast({ title: res.data.message || '兑换成功', icon: 'none' })
      bindForm.value = { cardNo: '', cardSecret: '' }
      const pendingIndex = tabList.findIndex((item) => item.status === GIFT_CARD_STATUS.PENDING_ACTIVATION)
      if (pendingIndex >= 0 && tabCurrentIndex.value !== pendingIndex) {
        tabCurrentIndex.value = pendingIndex
        return
      }
      resetAndLoad()
    })
    .catch(() => {
      bindSubmitting.value = false
    })
}

function isActivating(item: any) {
  const id = resolveMemberCardId(item)
  return !!activatingId.value && activatingId.value === id
}

function onCardPrimaryAction(item: any) {
  if (actionDisabled.value) return
  if (statusTab.value === GIFT_CARD_STATUS.PENDING_ACTIVATION) {
    const memberCardId = resolveMemberCardId(item)
    if (!memberCardId) {
      uni.showToast({ title: '卡片信息异常，无法激活', icon: 'none' })
      return
    }
    if (activatingId.value) return
    activatingId.value = memberCardId
    activateGiftCardCashMemberCard(memberCardId)
      .then((res) => {
        if (res.data.success) {
          uni.showToast({ title: res.data.message || '激活成功', icon: 'none' })
          const availableIndex = tabList.findIndex((item) => item.status === GIFT_CARD_STATUS.AVAILABLE)
          if (availableIndex >= 0 && tabCurrentIndex.value !== availableIndex) {
            tabCurrentIndex.value = availableIndex
            return
          }
          resetAndLoad()
        }
      })
      .finally(() => {
        activatingId.value = ''
      })
    return
  }
  if (statusTab.value === GIFT_CARD_STATUS.AVAILABLE) {
    if (item.cardType === 'PICKUP') uni.navigateTo({ url: '/pages/cart/gift-card/pickupCard?id=' + encodeURIComponent(resolveMemberCardId(item)) })
    else uni.switchTab({ url: '/pages/tabbar/home/index' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.bind-section {
  margin: 24rpx;
  padding: 28rpx 24rpx 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.bind-row {
  display: flex;
  align-items: center;
  min-height: 88rpx;
  border-bottom: 1rpx solid #f0f1f5;
}

.bind-label {
  width: 110rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  color: #333;
}

.bind-btn {
  margin-top: 24rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #ff6b35, #ff4b2b);

  &.disabled {
    opacity: 0.6;
  }
}

.tabs-wrap {
  background: #fff;
}

.list-scroll {
  flex: 1;
  height: 0;
  padding: 24rpx;
  box-sizing: border-box;
}

.gcc-card {
  border-radius: 20rpx;
  overflow: hidden;
  background: #fff;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);

  &.is-disabled {
    opacity: 0.72;
  }
}

.gcc-header {
  position: relative;
  min-height: 180rpx;
  background: linear-gradient(125deg, #ff9a4a 0%, #ff7729 42%, #ff8f3d 100%);
}

.gcc-header-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    -36deg,
    transparent,
    transparent 10rpx,
    rgba(255, 255, 255, 0.45) 10rpx,
    rgba(255, 255, 255, 0.45) 12rpx
  );
}

.gcc-header-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 28rpx 24rpx 24rpx;
  color: #fff;
}

.gcc-header-left {
  flex: 1;
  min-width: 0;
  padding-right: 16rpx;
}

.gcc-title {
  font-size: 32rpx;
  font-weight: 700;
}

.gcc-face {
  margin-top: 12rpx;
  font-size: 24rpx;
  opacity: 0.95;
}

.gcc-cardno {
  margin-top: 28rpx;
  font-size: 22rpx;
  opacity: 0.75;
  word-break: break-all;
}

.gcc-header-right {
  text-align: right;
  flex-shrink: 0;
}

.gcc-type {
  font-size: 32rpx;
  font-weight: 700;
}

.gcc-expire {
  margin-top: 16rpx;
  font-size: 22rpx;
  opacity: 0.9;
}

.gcc-body {
  padding: 24rpx;
}

.gcc-row {
  font-size: 26rpx;
  color: #333;
}

.gcc-strong {
  color: #ff6b22;
  font-weight: 600;
}

.gcc-action {
  margin-top: 24rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #e95b6c;
  background: #faf4f5;

  &.is-disabled {
    color: #c5c8ce;
    background: #f7f7f7;
  }
}

.load-more,
.notice {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
  padding: 8rpx 8rpx 40rpx;
}

.notice {
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
