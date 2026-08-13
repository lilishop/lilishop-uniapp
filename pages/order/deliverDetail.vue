<template>
	<view class="logistics-detail">
		<view v-if="loading" class="loading-wrap">
			<u-loading mode="circle" />
		</view>

		<view v-else-if="loadError" class="error-wrap">
			<u-empty text="加载失败，请重试" mode="list" />
			<u-button size="medium" shape="circle" @click="retryLoad">重试</u-button>
		</view>

		<view v-else class="card">
			<view v-if="orderStatus === 'PARTS_DELIVERED'" class="parts-tip">
				其余商品待商家继续发货
			</view>

			<!-- 包裹列表 -->
			<view
				v-for="(packageItem, index) in packageList"
				:key="packageItem.packageNo || index"
				class="package-card"
			>
				<view class="package-title">{{ getPackageTitle(packageItem, index) }}</view>

				<template v-if="isNoDelivery(packageItem)">
					<view v-if="packageItem.logisticsTime" class="info-row">
						<text class="label">完成时间：</text>
						<text class="value">{{ packageItem.logisticsTime }}</text>
					</view>
					<view v-if="packageItem.deliveryRemark" class="info-row">
						<text class="label">商家说明：</text>
						<text class="value">{{ packageItem.deliveryRemark }}</text>
					</view>
				</template>

				<template v-else>
					<view class="info-row">
						<text class="label">物流公司：</text>
						<text class="value">{{ packageItem.logisticsName || '-' }}</text>
					</view>
					<view class="info-row">
						<text class="label">运单号：</text>
						<text class="value">{{ packageItem.logisticsNo || '-' }}</text>
					</view>
					<view v-if="packageItem.logisticsTime" class="info-row">
						<text class="label">发货时间：</text>
						<text class="value">{{ packageItem.logisticsTime }}</text>
					</view>
				</template>

				<view
					v-if="packageItem.orderPackageItemList && packageItem.orderPackageItemList.length"
					class="div-express-log goods-block"
				>
					<view
						class="goods-row"
						v-for="(item, gIndex) in packageItem.orderPackageItemList"
						:key="item.orderItemSn || gIndex"
					>
						<text class="goods-name">{{ item.goodsName }}</text>
						<text class="goods-meta">x{{ item.deliverNumber }}</text>
					</view>
				</view>

				<view v-if="!isNoDelivery(packageItem)" class="div-express-log">
					<ul class="express-log" v-if="packageItem.traces && packageItem.traces.traces && packageItem.traces.traces.length">
						<li v-for="(item, tIndex) in packageItem.traces.traces" :key="tIndex">
							<span class="time">{{ item.AcceptTime || item.acceptTime }}</span>
							<span class="detail">{{ item.AcceptStation || item.remark }}</span>
						</li>
					</ul>
					<ul class="express-log" v-else>
						<li>物流信息同步中</li>
					</ul>
				</view>
			</view>

			<!-- 历史订单降级：主表物流 -->
			<view v-if="!packageList.length && legacyTraces" class="package-card">
				<view class="package-title">整单发货</view>
				<view class="info-row">
					<text class="label">物流公司：</text>
					<text class="value">{{ legacyTraces.shipper || '-' }}</text>
				</view>
				<view class="info-row">
					<text class="label">运单号：</text>
					<text class="value">{{ legacyTraces.logisticCode || '-' }}</text>
				</view>
				<view class="div-express-log">
					<ul class="express-log" v-if="legacyTraces.traces && legacyTraces.traces.length">
						<li v-for="(item, index) in legacyTraces.traces" :key="index">
							<span class="time">{{ item.AcceptTime || item.acceptTime }}</span>
							<span class="detail">{{ item.AcceptStation || item.remark }}</span>
						</li>
					</ul>
					<ul class="express-log" v-else>
						<li>物流信息同步中</li>
					</ul>
				</view>
			</view>

			<u-empty
				v-if="!packageList.length && !legacyTraces"
				class="empty"
				text="物流信息同步中"
				mode="list"
			/>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getPackage, getExpress } from '@/api/trade.js'
import { getOrderDetail } from '@/api/order.js'
import { isNoDelivery, getPackageTitle } from '@/utils/orderDelivery.js'

const packageList = ref<any[]>([])
const legacyTraces = ref<any>(null)
const orderSn = ref('')
const orderStatus = ref('')
const loading = ref(true)
const loadError = ref(false)

onLoad((option) => {
	orderSn.value = option?.order_sn || ''
	if (orderSn.value) {
		loadData(orderSn.value)
	} else {
		loading.value = false
		loadError.value = true
	}
})

function retryLoad() {
	if (orderSn.value) loadData(orderSn.value)
}

async function loadData(sn: string) {
	loading.value = true
	loadError.value = false
	packageList.value = []
	legacyTraces.value = null

	try {
		const orderRes = await getOrderDetail(sn)
		if (orderRes.data?.success) {
			orderStatus.value = orderRes.data.result?.order?.orderStatus || ''
		}

		const packageRes = await getPackage(sn)
		if (!packageRes.data?.success) {
			loadError.value = true
			return
		}

		const packages = packageRes.data.result || []
		if (packages.length) {
			packageList.value = packages
			return
		}

		const traceRes = await getExpress(sn)
		if (traceRes.data?.success && traceRes.data.result) {
			legacyTraces.value = traceRes.data.result
		}
	} catch {
		loadError.value = true
	} finally {
		loading.value = false
	}
}
</script>

<style>
page {
	background: #f1f1f1;
}
</style>

<style lang="scss" scoped>
.logistics-detail {
	margin-top: 20rpx;
	padding: 0 16rpx 40rpx;
}

.loading-wrap,
.error-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 80rpx 0;
	gap: 24rpx;
}

.card {
	background: #fff;
	border-radius: 20rpx;
	width: 100%;
	padding: 16rpx 0;
}

.parts-tip {
	margin: 0 20rpx 16rpx;
	padding: 16rpx 20rpx;
	background: #fff7e6;
	color: #fa8c16;
	font-size: 24rpx;
	border-radius: 8rpx;
}

.package-card {
	padding: 20rpx;
	border-bottom: 1rpx solid #f5f5f5;

	&:last-child {
		border-bottom: none;
	}
}

.package-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 16rpx;
}

.info-row {
	display: flex;
	font-size: 26rpx;
	line-height: 44rpx;
	padding: 4rpx 0;

	.label {
		color: #999;
		flex-shrink: 0;
	}

	.value {
		color: #333;
		word-break: break-all;
	}
}

.goods-block {
	padding: 16rpx 20rpx;
}

.goods-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 24rpx;
	line-height: 44rpx;
	color: #666;

	.goods-name {
		flex: 1;
		margin-right: 16rpx;
	}

	.goods-meta {
		flex-shrink: 0;
		color: #999;
	}
}

.express-log {
	padding: 20rpx;
	list-style-type: none;

	li {
		display: flex;
		margin-top: 18rpx;

		&:first-child {
			margin-top: 0;
		}
	}

	.time {
		width: 180rpx;
		flex-shrink: 0;
		font-size: 24rpx;
		line-height: 40rpx;
		color: #999;
	}

	.detail {
		flex: 1;
		margin-left: 20rpx;
		font-size: 24rpx;
		line-height: 40rpx;
		color: #333;
	}
}

.div-express-log {
	border: solid 2rpx #e7e7e7;
	background: #fafafa;
	border-radius: 10rpx;
	margin-top: 16rpx;
}

.empty {
	padding: 40rpx 0;
}
</style>
