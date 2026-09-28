<template>
  <view class="b-content" :style="themeStyle">
    <scroll-view class="list-scroll-content" scroll-y>
      <u-empty
        mode="coupon"
        text="暂无可用礼品卡"
        v-if="!cardList.length"
      ></u-empty>

      <view class="coupon-card" v-for="item in cardList" :key="item.id">
        <view class="coupon-card-left">
          <view class="price-row">
            <text class="coupon-price-symbol">¥</text>
            <text class="coupon-price-value">{{ unitPrice(item.balance) }}</text>
          </view>
        </view>
        <view class="coupon-divider"></view>
        <view class="coupon-card-right">
          <text class="coupon-card-name">{{ item.giftCardName || '礼品卡' }}</text>
          <view class="coupon-card-foot">
            <view
              class="coupon-status-btn"
              :class="{ cancel: item.selected }"
              @click="clickWay(item)"
            >
              {{ item.selected ? '取消使用' : '立即使用' }}
            </view>
          </view>
        </view>
      </view>

      <view class="notice" v-if="cardList.length">{{ GIFT_CARD_PAY_NOTICE }}</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { selectGiftCard } from '@/api/trade.js'
import { unitPrice } from '@/utils/filters.js'
import { decorateGiftCard, GIFT_CARD_PAY_NOTICE } from '@/utils/giftCard.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const way = ref('')
const cardList = ref<any[]>([])

onLoad((options) => {
  way.value = options?.way || ''
})

onShow(() => {
  const selectedIds = (store.state as any).selectedGiftCardIds || []
  const cards = (store.state as any).canUseGiftCards || []
  cardList.value = cards.map((item: any) => decorateGiftCard(item, selectedIds))
})

function clickWay(item: any) {
  if (!item?.id) return
  selectGiftCard({
    way: way.value,
    credentialId: String(item.id),
    used: !item.selected,
  }).then((res) => {
    if (res.data.success) {
      uni.navigateBack()
    } else {
      uni.showToast({
        title: res.data.message || '礼品卡选择失败',
        icon: 'none',
        duration: 2000,
      })
    }
  })
}
</script>

<style lang="scss" scoped>
.b-content {
  background: #f7f8fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.list-scroll-content {
  flex: 1;
  height: 100vh;
  width: 100%;
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.coupon-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
  border: 1rpx solid #f0f1f5;
  overflow: hidden;
}

.coupon-card-left {
  width: 200rpx;
  min-height: 148rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ff3b30;
  background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
}

.price-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.coupon-price-symbol {
  font-size: 26rpx;
  font-weight: 700;
  margin-right: 2rpx;
}

.coupon-price-value {
  font-size: 44rpx;
  font-weight: 900;
  line-height: 1;
}

.coupon-price-label {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #ff8a80;
}

.coupon-divider {
  position: absolute;
  left: 200rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 0;
  border-left: 2rpx dashed #f0d6d6;
}

.coupon-card-right {
  flex: 1;
  min-width: 0;
  padding: 24rpx 24rpx 20rpx 28rpx;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.coupon-card-name {
  font-size: 28rpx;
  color: #111;
  font-weight: 700;
  line-height: 1.4;
}

.coupon-card-desc,
.coupon-card-time {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8a8f99;
  line-height: 1.4;
}

.coupon-card-time {
  word-break: break-all;
}

.coupon-card-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16rpx;
}

.coupon-status-btn {
  flex-shrink: 0;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
  background: linear-gradient(135deg, var(--theme-light, #ff6b35), var(--theme-primary, #ff4b2b));

  &.cancel {
    background: #333;
  }
}

.notice {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}
</style>
