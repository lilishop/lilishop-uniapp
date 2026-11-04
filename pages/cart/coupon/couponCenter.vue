<template>
	<view class="coupon-center">
		<view class="coupon-list">
			<u-empty mode="coupon" style='margin-top: 20%;' text="没有优惠券了" v-if="whetherEmpty"></u-empty>
			<view v-else class="coupon-card" v-for="(item, index) in couponList" :key="index">
				<view class="coupon-card-left">
					<text class="coupon-price-symbol">¥</text>
					<text class="coupon-price-value">{{ item.couponType == 'DISCOUNT' ? item.couponDiscount + '折' : unitPrice(item.price) }}</text>
				</view>
				<view class="coupon-divider"></view>
				<view class="coupon-card-right">
					<view class="coupon-info">
						<text class="coupon-card-name">{{ item.storeName == 'platform' ? '全平台' : item.storeName + '店铺' }}使用</text>
						<text class="coupon-card-desc">{{ item.consumeThreshold > 0 ? '满' + unitPrice(item.consumeThreshold) + '元可用' : '无门槛使用' }}</text>
						<text class="coupon-card-time" v-if="item.endTime">有效期至：{{ item.endTime.split(" ")[0] }}</text>
					</view>
					<view class="coupon-claim-btn" @click="receive(item)">
						领取
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { receiveCoupons } from '@/api/members.js'
import { getAllCoupons } from '@/api/promotions.js'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import {
	onLoad,
	onNavigationBarButtonTap,
	onPullDownRefresh,
	onReachBottom,
} from '@dcloudio/uni-app'
import { getCurrentInstance, ref } from 'vue'

const store = useStore()
const { proxy } = getCurrentInstance()!

const loadStatus = ref('more')
const whetherEmpty = ref(false)
const couponList = ref<any[]>([])
const params = ref({
  pageNumber: 1,
  pageSize: 10,
})
const storeId = ref('')
const couponData = ref<any>(null)

onLoad((option) => {
  storeId.value = option.storeId || ''
  getCoupon()
})

onReachBottom(() => {
  loadMore()
})

onPullDownRefresh(() => {
  params.value.pageNumber = 1
  couponList.value = []
  getCoupon()
})

onNavigationBarButtonTap(() => {
  uni.navigateTo({
    url: '/pages/cart/coupon/couponIntro',
  })
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function getCoupon() {
  uni.showLoading({ title: '加载中' })
  const submitData = storeId.value
    ? { ...params.value, storeId: storeId.value }
    : { ...params.value }

  getAllCoupons(submitData)
    .then((res) => {
      hideLoadingIfNeeded()
      uni.stopPullDownRefresh()
      if (res.data.code == 200) {
        couponData.value = res.data.result
        if (couponData.value.total == 0) {
          whetherEmpty.value = true
        } else {
          couponList.value.push(...couponData.value.records)
          loadStatus.value = 'noMore'
        }
      }
    })
    .catch(() => {
      hideLoadingIfNeeded()
    })
}

function receive(val: any) {
  proxy.$u.throttle(() => {
    fetchCoupon(val)
  }, 1500)
}

function fetchCoupon(val: any) {
  receiveCoupons(val.id).then((res) => {
    if (res.data.code == 200) {
      uni.showToast({ title: '领取成功', icon: 'none' })
    } else {
      uni.showToast({ title: res.data.message, icon: 'none' })
    }
  })
}

function loadMore() {
  if (couponData.value?.total > params.value.pageNumber * params.value.pageSize) {
    params.value.pageNumber++
    getCoupon()
  }
}
</script>

<style lang="scss" scoped>
.coupon-center {
  min-height: 100vh;
  background: #f7f8fa;
}

.coupon-list {
  padding: 24rpx;
}

.coupon-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
  box-shadow: none;
  border: 1rpx solid #f0f1f5;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &::before,
  &::after {
    content: "";
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

.coupon-claim-btn {
  flex-shrink: 0;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b35, #ff4b2b);
  box-shadow: 0 8rpx 16rpx rgba(255, 75, 43, 0.25);

  &:active {
    opacity: 0.9;
  }
}
</style>
