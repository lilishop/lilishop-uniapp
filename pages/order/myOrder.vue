<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item"
				:class="{ current: tabCurrentIndex === index }" @click="tabClick(index)">{{ item.text }}</view>
		</view>
		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData(tabIndex)">
					<!-- 空白页 -->
					<u-empty text="暂无订单" mode="list"
						v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></u-empty>
					<!-- 订单列表 -->
					<view class="seller-view" :key="orderIndex" v-for="(order, orderIndex) in tabItem.orderList">
						<!-- 店铺名称 -->
						<view class="seller-info u-flex u-row-between">
							<view class="seller-name wes" @click="navigateToStore(order)">
								<view class="name">{{ order.storeName }}</view>

								<view class="name" v-if="renderOrderTag(order.orderPromotionType)">
									<u-tag
										:text="renderOrderTag(order.orderPromotionType)"
										:type="renderOrderTagType(order.orderPromotionType)"
										size="mini"
									/>
								</view>

							</view>
							<view class="order-sn">{{orderStatusList(order.orderStatus)
							  }}</view>
						</view>
						<view>
							<view>
								<view class="goods-item-view" @click="navigateToOrderDetail(order.sn)">
									<view class="goods-img" v-for="(goods, goodsIndex) in order.orderItems"
										:key="goodsIndex">
										<u-image border-radius="6" width="131rpx" height="131rpx" mode="aspectFill"
											:src="getOrderItemImage(goods, order, goodsIndex)"></u-image>
									</view>
									<view class="goods-info">
										<view v-if="order.orderItems.length <= 1" class="goods-title u-line-2">
											{{ order.groupName }}</view>
										<view v-if="order.orderItems.length <= 1" class="goods-price">
											￥{{unitPrice(order.flowPrice) }}
										</view>
									</view>
									<view v-if="order.orderItems.length <= 1" class="goods-num">
										<view>x{{ order.groupNum }}</view>
									</view>
								</view>
							</view>
							<view class="btn-view u-flex u-row-between">
								<view class="description">
									<!-- 等待付款 -->
									<div v-if="order.payStatus === 'PAID'">已付金额:</div>
									<div v-else>应付金额:</div>
									<div class="price">￥{{unitPrice(order.flowPrice) }}</div>
								</view>
								<view class="goods-btn flex flex-a-c">
									<!-- 全部 -->
									<view ripple class="pay-btn" shape="circle" size="mini"
										v-if="order.allowOperationVO.pay" @click="waitPay(order)">立即付款</view>
									<!-- 取消订单 -->
									<view ripple class="cancel-btn" shape="circle" size="mini"
										v-if="showOrderCancel(order)" @click="onCancel(order.sn)">
										取消订单
									</view>
									<!-- 等待收货 -->
									<view ripple shape="circle" class="pay-btn" size="mini"
										v-if="order.allowOperationVO.rog && !isECouponOrder(order.orderType)" @click="onRog(order.sn)">
										确认收货
									</view>
									<view ripple shape="circle" class="cancel-btn" size="mini"
										v-if="showOrderAfterSale(order)"
										@click="applyService(order)">
										退款/售后
									</view> 
								</view>
							</view>
						</view>
					</view>
					<uni-load-more :status="tabItem.loadStatus"></uni-load-more>
				</scroll-view>
			</swiper-item>
		</swiper>
		<u-popup class="cancel-popup" v-model:show="cancelShow" mode="bottom" length="60%">
			<view class="header">取消订单</view>
			<view class="body">
				<view class="title">取消订单后，本单享有的优惠可能会一并取消，是否继续？</view>
				<view>
					<u-radio-group v-model="reason">
						<view class="value">
							<view class="radio-view" :key="index" v-for="(item, index) in cancelList">
								<u-radio :active-color="lightColor" shape="circle" :name="item.reason"
									:label="item.reason" @change="reasonChange"></u-radio>
							</view>
						</view>
					</u-radio-group>
				</view>
			</view>
			<view class="footer">
				<u-button size="medium" ripple v-if="reason" shape="circle" @click="submitCancel">提交</u-button>
			</view>
		</u-popup>
		<u-toast ref="uToast" />
		<u-modal :confirm-color="lightColor" v-model:show="rogShow" :show-cancel-button="true" :content="'是否确认收货?'"
			@confirm="confirmRog"></u-modal>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, getCurrentInstance } from 'vue'
import { onLoad, onShow, onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
import { getOrderList, cancelOrder, confirmReceipt } from '@/api/order.js'
import { getClearReason } from '@/api/after-sale.js'
import LiLiWXPay from '@/js_sdk/lili-pay/wx-pay.js'
import {
	unitPrice,
	parseGoodsImageUrl,
	tipsToLogin,
	orderStatusList,
} from '@/utils/filters.js'
// E_COUPON 订单不展示确认收货、退款/售后（FR-B-04）
import { isECouponOrder, isAppointmentOrder } from '@/utils/goodsType.js'
import { getAppointmentAllowOperation } from '@/utils/appointmentGoods.js'

const store = useStore()
const { proxy } = getCurrentInstance()!
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)

interface NavTabItem {
	state: number
	text: string
	loadStatus: string
	orderList: any[]
	pageNumber: number
	loaded?: boolean
}

const tabCurrentIndex = ref(0)
const navList = reactive<NavTabItem[]>([
	{ state: 0, text: '全部', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 1, text: '待付款', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 2, text: '待发货', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 3, text: '待收货', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 4, text: '已完成', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 5, text: '已取消', loadStatus: 'more', orderList: [], pageNumber: 1 },
])

const status = ref<number>(0)
const params = reactive({
	pageNumber: 1,
	pageSize: 10,
	tag: 'ALL',
})

const orderStatus = [
	{ orderStatus: 'ALL' },
	{ orderStatus: 'WAIT_PAY' },
	{ orderStatus: 'WAIT_SHIP' },
	{ orderStatus: 'WAIT_ROG' },
	{ orderStatus: 'COMPLETE' },
	{ orderStatus: 'CANCELLED' },
	{ orderStatus: 'STAY_PICKED_UP' },
]

const cancelShow = ref(false)
const orderSn = ref('')
const reason = ref('')
const cancelList = ref<any[]>([])
const rogShow = ref(false)

function hideLoadingIfNeeded() {
	if (store.state.isShowToast) uni.hideLoading()
}

onBackPress((e) => {
	if (e.from == 'backbutton') {
		uni.switchTab({ url: '/pages/tabbar/user/my' })
		return true
	}
	return false
})

onPullDownRefresh(() => {
	if (tabCurrentIndex.value) {
		initData(tabCurrentIndex.value)
	} else {
		initData(0)
	}
})

onShow(() => {
	if (tipsToLogin()) {
		if (!tabCurrentIndex.value) {
			initData(0)
		}
	}
})

onLoad((options) => {
	const statusNum = Number(options?.status)
	status.value = statusNum
	tabCurrentIndex.value = statusNum
})

watch(tabCurrentIndex, (val) => {
	params.tag = orderStatus[val].orderStatus
	navList.forEach((res) => {
		res.pageNumber = 1
		res.loadStatus = 'more'
		res.orderList = []
	})
	loadData(val)
})

function applyService(order: any) {
	uni.navigateTo({
		url: `/pages/order/afterSales/afterSales?orderSn=${order.sn}`,
	})
}

function navigateToStore(val: any) {
	uni.navigateTo({
		url: '/pages/product/shopPage?id=' + val.storeId,
	})
}

function renderOrderTag(orderPromotionType: string) {
	switch (orderPromotionType) {
		case 'NORMAL':
			return ''
		case 'PINTUAN':
			return '拼团订单'
		case 'GIFT':
			return '赠品订单'
		case 'POINTS':
			return '积分订单'
		case 'KANJIA':
			return '砍价订单'
		default:
			return ''
	}
}

function renderOrderTagType(orderPromotionType: string) {
	switch (orderPromotionType) {
		case 'PINTUAN':
			return 'error'
		case 'GIFT':
			return 'primary'
		case 'POINTS':
			return 'info'
		case 'KANJIA':
			return 'warning'
		default:
			return 'info'
	}
}

function getOrderItemImage(goods: any, order: any, index: number) {
	let image = goods.image
	if (!image && order.groupImages) {
		const images = String(order.groupImages).split(',')
		image = images[index] || images[0]
	}
	return parseGoodsImageUrl(image)
}

function onCancel(sn: string) {
	orderSn.value = sn
	cancelShow.value = true
	uni.showLoading({ title: '加载中' })
	getClearReason().then((res) => {
		if (res.data.result.length >= 1) {
			cancelList.value = res.data.result
		}
		hideLoadingIfNeeded()
	})
}

function initData(index: number) {
	navList[index].pageNumber = 1
	navList[index].loadStatus = 'more'
	navList[index].orderList = []
	loadData(index)
}

function waitPay(val: any) {
	proxy?.$u?.debounce?.(() => pay(val), 3000, true)?.()
}

function pay(val: any) {
	if (val.sn) {
		uni.navigateTo({
			url: '/pages/cart/payment/payOrder?order_sn=' + val.sn,
		})
	}
}

function loadData(index: number) {
	params.pageNumber = navList[index].pageNumber
	getOrderList(params).then((res) => {
		uni.stopPullDownRefresh()
		if (!res.data.success) {
			navList[index].loadStatus = 'noMore'
			return false
		}
		const records = res.data.result.records
		if (records.length == 0) {
			navList[index].loadStatus = 'noMore'
		} else if (records.length < 10) {
			navList[index].loadStatus = 'noMore'
		}
		if (records.length > 0) {
			navList[index].orderList = navList[index].orderList.concat(records)
			navList[index].pageNumber += 1
		}
	})
}

function changeTab(e: any) {
	tabCurrentIndex.value = e.target.current
}

function tabClick(index: number) {
	tabCurrentIndex.value = index
}

function deleteOrder(index: number) {
	uni.showLoading({ title: '请稍后' })
	setTimeout(() => {
		navList[tabCurrentIndex.value].orderList.splice(index, 1)
		hideLoadingIfNeeded()
	}, 600)
}

function cancelOrderLocal(item: any) {
	uni.showLoading({ title: '请稍后' })
	setTimeout(() => {
		const { stateTip, stateTipColor } = orderStateExp(9)
		Object.assign(item, {
			state: 9,
			stateTip,
			stateTipColor,
		})
		const list = navList[1].orderList
		const idx = list.findIndex((val) => val.id === item.id)
		if (idx !== -1) list.splice(idx, 1)
		hideLoadingIfNeeded()
	}, 600)
}

function orderStateExp(state: number) {
	let stateTip = ''
	let stateTipColor = lightColor.value
	switch (+state) {
		case 1:
			stateTip = '待付款'
			break
		case 2:
			stateTip = '待发货'
			break
		case 9:
			stateTip = '订单已关闭'
			stateTipColor = '#909399'
			break
	}
	return { stateTip, stateTipColor }
}

function showOrderCancel(order: any) {
	if (isAppointmentOrder(order?.orderType)) {
		return !!getAppointmentAllowOperation(order)?.cancel
	}
	return !!order?.allowOperationVO?.cancel
}

function showOrderAfterSale(order: any) {
	if (isECouponOrder(order?.orderType)) return false
	if (isAppointmentOrder(order?.orderType)) {
		const allow = getAppointmentAllowOperation(order)
		if (!allow?.afterSale) return false
	}
	const status = order?.groupAfterSaleStatus
	return status && (status.includes('NOT_APPLIED') || status.includes('PART_AFTER_SALE'))
}

function navigateToOrderDetail(sn: string) {
	uni.navigateTo({
		url: './orderDetail?sn=' + sn,
	})
}

function reasonChange(val: string) {
	reason.value = val
}

function submitCancel() {
	cancelOrder(orderSn.value, { reason: reason.value }).then((res) => {
		if (res.data.success) {
			uni.showToast({
				title: '订单已取消',
				duration: 2000,
				icon: 'none',
			})
			initData(tabCurrentIndex.value)
			cancelShow.value = false
		} else {
			uni.showToast({
				title: res.data.message,
				duration: 2000,
				icon: 'none',
			})
			cancelShow.value = false
		}
	})
}

function onRog(sn: string) {
	orderSn.value = sn
	rogShow.value = true
}

function confirmRog() {
	confirmReceipt(orderSn.value).then((res) => {
		if (res.data.code == 200) {
			uni.showToast({
				title: '已确认收货',
				duration: 2000,
				icon: 'none',
			})
			initData(tabCurrentIndex.value)
			rogShow.value = false
		}
	})
}

function onComment(_sn: string) {
	uni.navigateTo({
		url: './evaluate/myEvaluate',
	})
}

function reBuy(order: any) {
	const goods = order.orderItems?.[0]
	if (!goods) return
	uni.navigateTo({
		url: '/pages/product/goods?id=' + goods.id + '&goodsId=' + goods.goodsId,
	})
}
</script>

<style lang="scss" scoped>
	page,
	.content {
		background: $page-color-base;
		height: 100%;
	}

	.swiper-box {
		height: calc(100vh - 40px);
		// #ifdef H5
		height: calc(100vh - 40px - 44px);
		// #endif
	}

	.list-scroll-content {
		height: 100%;
		padding: 16rpx 20rpx 0;
	}

	.navbar {
		display: flex;
		height: 40px;
		padding: 0 5px;
		background: #fff;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
		position: relative;
		z-index: 10;

		.nav-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 26rpx;
			color: $font-color-light;
			position: relative;

			&.current {
				color: $main-color;

				&:after {
					content: "";
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 44px;
					height: 0;
					border-bottom: 2px solid $main-color;
				}
			}
		}
	}

	.uni-swiper-item {
		height: auto;
	}

	.seller-view {
		border-radius: 20rpx;
		background-color: #fff;
		margin: 16rpx 0;

		.seller-info {
			padding: 24rpx 20rpx 16rpx;
			align-items: center;

			.seller-name {
				flex: 10;
				font-size: 28rpx;
				font-weight: 600;
				display: flex;
				flex-direction: row;
					text-align: center;
				.name {
					margin-left: 15rpx;
				}
			}

			.order-sn {
				flex: 2;
				width: 120rpx;
				text-align: center;
				color: $aider-light-color;
				font-size: 26rpx;
			}
		}

		.goods-item-view {
			display: flex;
			flex-wrap: wrap;
			flex-direction: row;
			padding: 10rpx 20rpx;

			.goods-img {
				width: 131rpx;
				height: 131rpx;
				margin-right: 10rpx;
				margin-bottom: 10rpx;
			}

			.goods-info {
				padding-left: 30rpx;
				flex: 1;

				.goods-title {
					margin-bottom: 10rpx;
					color: #333333;
				}

				.goods-specs {
					font-size: 24rpx;
					margin-bottom: 10rpx;
					color: #cccccc;
				}

				.goods-price {
					font-size: 28rpx;
					margin-bottom: 10rpx;
					color: $aider-light-color;
				}
			}

			.goods-num {
				width: 60rpx;
				color: $main-color;
			}
		}

		.btn-view {
			padding: 25rpx 30rpx;
			font-size: 26rpx;

			.description {
				display: flex;
				color: #909399;
				size: 24rpx;
				flex: 1;

				.price {
					color: $main-color;

				}
			}
		}
	}

	.cancel-popup {
		.header {
			display: flex;
			flex-direction: row;
			justify-content: center;
			margin: 15rpx 0rpx;
		}

		.body {
			padding: 30rpx;

			.title {
				font-weight: 600;
			}

			.value {
				display: flex;
				flex-direction: column;
				margin: 20rpx 0;

				.radio-view {
					margin: 20rpx 0rpx;
				}
			}
		}

		.footer {
			text-align: center;
		}
	}

	.goods-btn {
		display: flex;
	}

	.cancel-btn,
	.pay-btn,
	.rebuy-btn {
		text-align: center;
		margin-left: 15rpx;
		font-size: 24rpx;
		padding: 14rpx 20rpx;
		border-radius: 100px;

	}

	.cancel-btn {
		color: #333639 !important;
		background: rgba(46, 51, 56, .05) !important;
	}

	.pay-btn {

		background-color: $light-color !important;

		color: #ffffff !important;
	}

	.rebuy-btn {
		color: $light-color !important;
		border-color: $light-color !important;
		background-color: #ffffff !important;
	}
</style>