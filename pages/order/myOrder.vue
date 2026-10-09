<template>
	<view class="content" :style="themeStyle">
		<scroll-view class="navbar" scroll-x :show-scrollbar="false">
			<view class="navbar-inner">
				<view v-for="(item, index) in navList" :key="index" class="nav-item"
					:class="{ current: tabCurrentIndex === index }" @click="tabClick(index)">{{ item.text }}</view>
			</view>
		</scroll-view>
		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData(tabIndex)">
					<!-- 空白页 -->
					<u-empty :text="tabItem.kind === 'afterSale' ? '暂无售后记录' : '暂无订单'" mode="list"
						v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></u-empty>
					<!-- 订单列表 -->
					<view class="seller-view" :key="orderIndex" v-for="(order, orderIndex) in tabItem.orderList">
						<template v-if="order.isAfterSale">
							<view class="seller-info u-flex u-row-between">
								<view class="seller-name wes">
									<view class="name">{{ order.storeName }}</view>
								</view>
								<view class="order-sn">{{ orderCardStatus(order) }}</view>
							</view>
							<view class="after-sale-sn">售后单号：{{ order.serviceSn }}</view>
							<view class="goods-item-view" @click="openOrder(order)">
								<view class="goods-img">
									<u-image border-radius="6" width="131rpx" height="131rpx" mode="aspectFill"
										:src="getOrderItemImage(order.orderItems[0], order, 0)"></u-image>
								</view>
								<view class="goods-info">
									<view class="goods-title u-line-2">{{ order.groupName }}</view>
									<view class="goods-price">申请退款 ￥{{ unitPrice(order.applyRefundPrice) }}</view>
								</view>
								<view class="goods-num">
									<view>x{{ order.groupNum }}</view>
								</view>
							</view>
							<view class="btn-view u-flex u-row-between">
								<view class="description">{{ afterSaleTypeText(order.serviceType) }}</view>
								<view class="goods-btn flex flex-a-c">
									<view class="pay-btn" @click="openOrder(order)">售后详情</view>
								</view>
							</view>
						</template>
						<template v-else>
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
							<view class="order-sn">{{ orderCardStatus(order) }}</view>
						</view>
						<view>
							<view>
								<view class="goods-item-view" @click="openOrder(order)">
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
								</view>
							</view>
						</view>
						</template>
					</view>
					<uni-load-more v-if="tabItem.orderList.length > 0" :status="tabItem.loadStatus"></uni-load-more>
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
import { getThemeStyle } from '@/utils/theme'
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue'
import { getOrderList, cancelOrder, confirmReceipt } from '@/api/order.js'
import { getClearReason, getAfterSaleList } from '@/api/after-sale.js'
import LiLiWXPay from '@/js_sdk/lili-pay/wx-pay.js'
import {
	unitPrice,
	parseGoodsImageUrl,
	tipsToLogin,
	orderStatusList,
} from '@/utils/filters.js'
// E_COUPON 订单不展示确认收货、退款/售后（FR-B-04）
import { isECouponOrder, isAppointmentOrder } from '@/utils/goodsType.js'
import { appointmentOrderStatusText, getAppointmentAllowOperation } from '@/utils/appointmentGoods.js'

const store = useStore()
const { proxy } = getCurrentInstance()!
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)

interface NavTabItem {
	state: number
	text: string
	tag: string
	commentStatus?: string
	kind?: 'order' | 'afterSale'
	loadStatus: string
	orderList: any[]
	pageNumber: number
	loaded?: boolean
}

const tabCurrentIndex = ref(0)
const navList = reactive<NavTabItem[]>([
	{ state: 0, text: '全部', tag: 'ALL', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 1, text: '待支付', tag: 'WAIT_PAY', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 2, text: '待发货', tag: 'WAIT_SHIP', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 3, text: '待收货/使用', tag: 'WAIT_USE', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 4, text: '评价', tag: 'ALL', commentStatus: 'UNFINISHED', loadStatus: 'more', orderList: [], pageNumber: 1 },
	{ state: 5, text: '售后', tag: 'ALL', kind: 'afterSale', loadStatus: 'more', orderList: [], pageNumber: 1 },
])

const status = ref<number>(0)

const afterSaleStatusText: Record<string, string> = {
	APPLY: '申请中',
	PASS: '已通过',
	REFUSE: '已拒绝',
	BUYER_RETURN: '待卖家收货',
	SELLER_CONFIRM: '卖家确认收货',
	SELLER_TERMINATION: '卖家终止售后',
	BUYER_CANCEL: '买家取消售后',
	WAIT_REFUND: '等待平台退款',
	COMPLETE: '完成',
}

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
	navList.forEach((res) => {
		res.pageNumber = 1
		res.loadStatus = 'more'
		res.orderList = []
		res.loaded = false
	})
	loadData(val)
})

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
	navList[index].loaded = false
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
	const tab = navList[index]
	if (!tab || tab.loadStatus === 'noMore') {
		return
	}
	const pageNumber = tab.pageNumber
	const request = tab.kind === 'afterSale'
		? getAfterSaleList({
			pageNumber,
			pageSize: 10,
			sort: 'createTime',
			order: 'desc',
		})
		: getOrderList({
			pageNumber,
			pageSize: 10,
			tag: tab.tag,
			...(tab.commentStatus ? { commentStatus: tab.commentStatus } : {}),
		})
	request.then((res) => {
		uni.stopPullDownRefresh()
		tab.loaded = true
		if (!res.data.success) {
			tab.loadStatus = 'noMore'
			return false
		}
		let records = res.data.result.records || []
		if (tab.kind === 'afterSale') {
			records = records.map(mapAfterSaleOrder)
		}
		if (records.length < 10) {
			tab.loadStatus = 'noMore'
		}
		if (records.length > 0) {
			tab.orderList = tab.orderList.concat(records)
			tab.pageNumber += 1
		}
	})
}

const afterSaleTypeTextMap: Record<string, string> = {
	RETURN_MONEY: '仅退款',
	RETURN_GOODS: '退货退款',
	EXCHANGE_GOODS: '换货',
	SUPPLY_AGAIN_GOODS: '补发商品',
	CANCEL: '取消订单',
}

function afterSaleTypeText(type: string) {
	return afterSaleTypeTextMap[type] || '售后'
}

function mapAfterSaleOrder(item: any) {
	return {
		...item,
		isAfterSale: true,
		serviceSn: item.sn,
		sn: item.orderSn,
		orderStatus: item.serviceStatus,
		groupName: item.goodsName,
		groupNum: item.num,
		groupImages: item.goodsImage,
		applyRefundPrice: item.applyRefundPrice,
		orderItems: [
			{
				image: item.goodsImage,
				name: item.goodsName,
				num: item.num,
			},
		],
		allowOperationVO: {},
	}
}

function orderCardStatus(order: any) {
	if (order?.isAfterSale) {
		return afterSaleStatusText[order.serviceStatus] || '售后'
	}
	if (isAppointmentOrder(order?.orderType)) {
		return appointmentOrderStatusText(order.orderStatus)
	}
	return orderStatusList(order.orderStatus)
}

function openOrder(order: any) {
	if (order?.isAfterSale) {
		uni.navigateTo({
			url: './afterSales/applyDetail?sn=' + order.serviceSn,
		})
		return
	}
	navigateToOrderDetail(order.sn)
}

function changeTab(e: any) {
	// H5 的 swiper change 把下标放在 detail.current。
	// 读 target.current 会得到 undefined，选中态被清掉，列表就停在「全部」。
	const current = Number(e?.detail?.current ?? e?.target?.current)
	if (!Number.isInteger(current) || current < 0 || current >= navList.length) return
	tabCurrentIndex.value = current
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
		height: 40px;
		background: #fff;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
		position: relative;
		z-index: 10;
		white-space: nowrap;

		.navbar-inner {
			display: inline-flex;
			align-items: stretch;
			height: 40px;
			min-width: 100%;
		}

		.nav-item {
			flex: none;
			display: inline-flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			padding: 0 24rpx;
			font-size: 26rpx;
			color: $font-color-light;
			position: relative;
			white-space: nowrap;

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

		.after-sale-sn {
			padding: 0 32rpx 8rpx;
			font-size: 24rpx;
			color: #999;
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