<template>
  <view class="b-content" :style="themeStyle">
    <view class="coupon-tabs">
      <u-tabs
        :list="list"
        :scrollable="false"
        :inactiveStyle="{ color: '#333' }"
        v-model:current="current"
        :lineColor="lightColor"
        :activeStyle="{ color: lightColor }"
      ></u-tabs>
    </view>

    <scroll-view class="list-scroll-content" scroll-y>
      <u-empty
        mode="coupon"
        text="暂无优惠券"
        v-if="couponsList.length <= 0"
      ></u-empty>

      <view
        class="coupon-card"
        :class="{ 'coupon-used': current != 0 }"
        v-for="(item, index) in couponsList"
        :key="item.id || index"
      >
        <view class="coupon-card-left">
          <text class="coupon-price-symbol" v-if="item.couponType != 'DISCOUNT'">¥</text>
          <text class="coupon-price-value">
            {{ item.couponType == 'DISCOUNT' ? item.discount + '折' : unitPrice(item.price) }}
          </text>
        </view>
        <view class="coupon-divider"></view>
        <view class="coupon-card-right">
          <view class="coupon-info">
            <text class="coupon-card-name">
              <template v-if="item.scopeType == 'ALL' && item.storeId == '0'">全平台</template>
              <template v-else-if="item.scopeType == 'PORTION_GOODS_CATEGORY'">仅限品类</template>
              <template v-else>
                {{ item.storeName == 'platform' ? '全平台' : (item.storeName || '') + '店铺' }}
              </template>
              使用
            </text>
            <text class="coupon-card-desc">{{ item.consumeThreshold > 0 ? '满' + unitPrice(item.consumeThreshold) + '元可用' : '无门槛使用' }}</text>
            <text class="coupon-card-time" v-if="item.reason">{{ item.reason }}</text>
            <text class="coupon-card-time" v-if="item.endTime">有效期至:{{ item.endTime }}</text>
          </view>

          <view
            class="coupon-status-btn"
            v-if="current == 0 && !isSelected(item)"
            @click="clickWay(item)"
          >
            立即使用
          </view>
          <view
            class="coupon-status-btn cancel"
            v-else-if="current == 0 && isSelected(item)"
            @click="clickWay(item)"
          >
            取消使用
          </view>
          <view class="coupon-status-btn disabled" v-else>
            不可用
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { useCoupon } from '@/api/trade.js'
import { unitPrice } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const current = ref(0)
const list = [
  { name: '可用优惠券' },
  { name: '不可用优惠券' },
]
const couponsList = ref<any[]>([])
const routerVal = ref<Record<string, any>>({
  selectedCoupon: [],
  way: '',
})

onLoad((options) => {
  const selectedCoupon = options?.selectedCoupon
  let selected: string[] = []
  if (Array.isArray(selectedCoupon)) {
    selected = selectedCoupon
  } else if (typeof selectedCoupon === 'string' && selectedCoupon) {
    selected = selectedCoupon.split(',')
  }
  routerVal.value = {
    ...(options || {}),
    selectedCoupon: selected,
  }
})

watch(current, (val) => {
  couponsList.value = val == 0
    ? store.state.canUseCoupons
    : store.state.cantUseCoupons
})

onMounted(() => {
  couponsList.value = store.state.canUseCoupons || []
})

function isSelected(coupon: any) {
  return (routerVal.value.selectedCoupon || []).includes(coupon.id)
}

function clickWay(coupon: any) {
  useCoupon({
    memberCouponId: coupon.id,
    used: !isSelected(coupon),
    way: routerVal.value.way,
  }).then((res) => {
    if (res.data.success) {
      uni.navigateBack()
    } else {
      uni.showToast({
        title: res.data.message,
        duration: 2000,
        icon: 'none',
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

.coupon-tabs {
  background: #fff;
  height: 88rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

:deep(.u-tabs),
:deep(.u-tabs__wrapper),
:deep(.u-tabs__wrapper__scroll-view-wrapper),
:deep(.u-tabs__wrapper__scroll-view),
:deep(.u-tabs__wrapper__nav) {
  background: #fff;
  height: 88rpx;
}

:deep(.u-tabs__wrapper__nav__item) {
  min-height: 88rpx;
}

:deep(.u-tabs__wrapper__nav__item__text) {
  color: #333;
  font-size: 28rpx;
}

.list-scroll-content {
  flex: 1;
  height: 0;
  width: 100%;
  padding: 24rpx;
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

  &:active {
    transform: scale(0.98);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 32rpx;
    height: 32rpx;
    background: #f7f8fa;
    border-radius: 50%;
    left: 204rpx;
    z-index: 2;
    box-shadow: inset 0 0 0 1rpx #eceef2;
  }

  &::before {
    top: -16rpx;
  }

  &::after {
    bottom: -16rpx;
  }

  &.coupon-used {
    .coupon-card-left {
      background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
      color: #999;
    }
  }
}

.coupon-card-left {
  width: 220rpx;
  min-height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ff3b30;
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
}

.coupon-price-symbol {
  font-size: 32rpx;
  font-weight: 700;
  margin-right: 4rpx;
}

.coupon-price-value {
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1rpx;
}

.coupon-divider {
  position: absolute;
  left: 220rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 0;
  border-left: 2rpx dashed #eceef2;
}

.coupon-card-right {
  flex: 1;
  padding: 32rpx 32rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  background: #fff;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.coupon-card-name {
  font-size: 30rpx;
  color: #111;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.coupon-card-desc {
  font-size: 24rpx;
  color: #8a8f99;
  font-weight: 500;
}

.coupon-card-time {
  font-size: 22rpx;
  color: #b0b3bf;
}

.coupon-status-btn {
  flex-shrink: 0;
  padding: 16rpx 28rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--theme-light, #ff6b35), var(--theme-primary, #ff4b2b));

  &:active {
    opacity: 0.9;
  }

  &.cancel {
    background: #333;
  }

  &.disabled {
    background: #ccc;
  }
}
</style>
