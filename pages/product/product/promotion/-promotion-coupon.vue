<template>
	<view class="wrapper">
		<view class="coupon-empty" v-if="!couponRes.length">暂无优惠券</view>
		<view class="coupon-List" v-for="(item, index) in couponRes" :key="item.id || index">
			<view class="coupon-item">
				<view class="top">
					<view class="price">
						<text class="price-num" v-if="item.couponType == 'DISCOUNT'">{{ item.couponDiscount }}折</text>
						<text class="price-num" v-else-if="item.couponType == 'PRICE'">￥{{ unitPrice(item.price) }}</text>
					</view>
					<view class="text">
						<view class="coupon-List-title">
							<text v-if="item.scopeType == 'ALL' && item.storeId == '0'">全平台</text>
							<text v-else-if="item.scopeType == 'PORTION_GOODS_CATEGORY'">仅限品类</text>
							<text v-else-if="item.scopeType == 'PORTION_GOODS'">部分商品</text>
							<text v-else>{{ item.storeName == 'platform' ? '全平台' : item.storeName + '店铺' }}使用</text>
						</view>
						<text>{{ item.consumeThreshold > 0 ? '满' + unitPrice(item.consumeThreshold) + '可用' : '无门槛使用' }}</text>
					</view>
					<view class="lingqu-btn" @tap="getCoupon(item, index)">
						<view class="lingqu-text" :class="{ cur: yhqFlag[index] }">
							{{ yhqFlag[index] ? '已领取或领完' : '立即领取' }}
						</view>
					</view>
				</view>
				<view class="line"></view>
				<view class="time">{{ formatCouponTime(item.startTime) }} - {{ formatCouponTime(item.endTime) }}</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { unitPrice, unixToDate } from '@/utils/filters.js'

const props = defineProps<{
  res?: any
}>()

const emit = defineEmits<{
  getCoupon: [item: any]
}>()

const yhqFlag = ref<boolean[]>([])
const couponRes = ref<any[]>([])

function formatCouponTime(val: any) {
	if (val == null || val === '') return ''
	const text = String(val).trim()
	if (!text) return ''
	if (text.includes('-') || text.includes('/')) {
		return text.length > 10 ? text.slice(0, 16) : text
	}
	const num = Number(text)
	if (!Number.isFinite(num)) return text
	const seconds = num < 1e12 ? num : Math.floor(num / 1000)
	return unixToDate(seconds, 'yyyy-MM-dd')
}

watch(
  () => props.res,
  (res) => {
    const list: any[] = []
    if (res && typeof res === 'object') {
      Object.keys(res).forEach((item) => {
        if (item.split('-')[0] === 'COUPON') {
          list.push(res[item])
        }
      })
    }
    couponRes.value = list
    yhqFlag.value = list.map(() => false)
  },
  { immediate: true, deep: true }
)

function getCoupon(item: any, index: number) {
  if (yhqFlag.value[index]) return
  yhqFlag.value[index] = true
  yhqFlag.value = [...yhqFlag.value]
  emit('getCoupon', item)
}
</script>

<style lang="scss" scoped>
	.coupon-empty {
		color: #999;
		font-size: 26rpx;
		padding: 20rpx 0;
	}

	.coupon-item {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.coupon-List {
		display: flex;
		flex-direction: column;
		min-height: 230rpx;
		background: var(--theme-primary-10, #ffe8e5);
		margin: 30rpx 0;
		padding: 10rpx 30rpx;
		border-radius: 12rpx;
		box-sizing: border-box;

		.line {
			height: 1px;
			background: #fff;
			margin: 0 20rpx;
			position: relative;

			&:before,
			&:after {
				content: "";
				display: block;
				width: 15rpx;
				height: 30rpx;
				background: #fff;
				position: absolute;
				top: -15rpx;
			}

			&:before {
				left: -50rpx;
			}

			&:after {
				right: -50rpx;
			}
		}

		.time {
			flex: 1;
			font-size: 24rpx;
			color: #666;
			display: flex;
			align-items: center;
			padding: 12rpx 0 8rpx;
		}
	}

	.top {
		min-height: 140rpx;
		display: flex;
		align-items: center;

		.price {
			width: 33%;
			justify-content: center;
			color: $price-color;
			font-size: 40rpx;
			display: flex;
			height: 100%;
			align-items: center;
			flex-shrink: 0;

			.price-num {
				font-size: 50rpx;
				line-height: 1.2;
			}
		}

		.text {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			font-size: 26rpx;
			color: #333;
			margin-left: 20rpx;
			min-width: 0;

			.coupon-List-title {
				font-size: 28rpx;
				font-weight: bold;
				margin-bottom: 8rpx;
				line-height: 1.4;
			}
		}

		.lingqu-btn {
			display: flex;
			align-items: center;
			flex-shrink: 0;
			margin-left: 16rpx;

			.lingqu-text {
				min-width: 140rpx;
				height: 56rpx;
				padding: 0 16rpx;
				text-align: center;
				line-height: 56rpx;
				color: #fff;
				background: $price-color;
				border-radius: 28rpx;
				font-size: 24rpx;
				box-sizing: border-box;

				&.cur {
					background: #ccc;
					color: #fff;
					transform: none;
				}
			}
		}
	}
</style>
