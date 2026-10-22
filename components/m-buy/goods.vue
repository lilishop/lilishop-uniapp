<template>
	<div class="wrapper">
		<u-popup class="popup" :show="buyMask" :height="setup.height" closeable :mode="setup.mode" :border-radius="setup.radius" @close="closeMask()">
			<!-- 商品 -->
			<view class="goods-box bottom">
				<view class="goods-header">
					<view class="goods-img">
						<u-image width="200rpx" border-radius="20" class="uimage" height="200rpx" :src="selectedSpecImg ? selectedSpecImg : goodsDetail.thumbnail"></u-image>
					</view>
					<view class="goods-skus">
						<!-- 有活动商品价格 -->
						<view class="goods-price" v-if="goodsDetail.promotionPrice && ((isGroup && buyType === 'PINTUAN') || !isGroup)">
							<span v-if="goodsDetail.promotionPrice && !pointDetail">
								￥
								<span class="goods-price-promotionShow goods-price-bigshow">{{ goodsFormatPrice(goodsDetail.promotionPrice)[0] }}</span>
								.{{ goodsFormatPrice(goodsDetail.promotionPrice)[1] }}
							</span>
							<span v-if="pointDetail.points">
								<span class="goods-price-promotionShow goods-price-bigshow">{{ pointDetail.points }}</span>
								积分
							</span>
							<div class="promotion-box">
								￥
								<span class="goods-price-bigshow">{{ goodsFormatPrice(goodsDetail.price)[0] }}</span>
								.{{ goodsFormatPrice(goodsDetail.price)[1] }}
							</div>
						</view>
						<!-- 正常商品的价格 -->
						<view v-else>
							<div class="goods-price">
								<span>
									￥
									<span class="goods-price-bigshow">{{ goodsFormatPrice(goodsDetail.price)[0] }}</span>
									.{{ goodsFormatPrice(goodsDetail.price)[1] }}
								</span>
							</div>
						</view>
						<view class="goods-check-skus">
							已选
							<span class="goods-check-skus-name">
								{{ selectName }}
								<span>，{{ num }}个</span>
							</span>
						</view>
						<view class="goods-check-skus" v-if="isAppointmentGoods(goodsDetail?.goodsType)">
							可预约
							<span class="goods-check-skus-name">按时段选择</span>
						</view>
						<view class="goods-check-skus" v-else>
							库存
							<span class="goods-check-skus-name">
								<span>{{ availableStock }}</span>
							</span>
						</view>
					</view>
				</view>
				<!-- 商品信息 -->
				<scroll-view class="goods-skus-box" :scroll-y="true">
					<!-- 规格 -->
					<view class="goods-skus-view" :key="specIndex" v-for="(spec, specIndex) in formatList">
						<view class="skus-view-list">
							<view class="view-class-title">{{ spec.name }}</view>

							<!-- 正常逻辑 循环出sku -->
							<view
								v-if="!parentOrder"
								:class="{ active: spec_val.value == currentSelected[specIndex] }"
								class="skus-view-item"
								v-for="(spec_val, spec_index) in spec.values"
								:key="spec_index"
								@click="handleClickSpec(spec, specIndex, spec_val)"
							>
								{{ spec_val.value }}
							</view>

							<!-- 拼团购买，仅筛选出当前拼团类型商品 -->
							<template v-for="(spec_val, spec_index) in spec.values" :key="spec_index">
								<view
									v-if="parentOrder && spec_val.skuId == goodsDetail.id"
									:class="{ active: spec_val.value == currentSelected[specIndex] }"
									class="skus-view-item"
									@click="handleClickSpec(spec, specIndex, spec_val)"
								>
									{{ spec_val.value }}
								</view>
							</template>
						</view>
					</view>
					<div class="soldout" v-if="availableStock === 0">
						<u-alert type="warning" title="商品已售罄" :description="'当前商品库存为0'"></u-alert>
					</div>
					<!-- 数量 -->
					<view v-if="availableStock !== 0" class="goods-skus-number flex flex-a-c flex-j-sb">
						<view class="view-class-title">数量</view>
						<uni-number-box class="uNumber" :min="1" :max="maxBuyNum" :disabled="availableStock === 0"  v-model="num"></uni-number-box>
					</view>
				</scroll-view>
				<!-- 按钮 -->
				<view class="btns" v-if="availableStock !== 0">
					<view class="box-btn card" v-if="showAddToCart" @click="addToCartOrBuy('cart')">加入购物车</view>
					<view class="box-btn buy" @click="addToCartOrBuy('buy')">
						{{ isAppointmentGoods(goodsDetail?.goodsType) ? '立即预约' : '立即购买' }}
					</view>
				</view>
			</view>
		</u-popup>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as API_trade from '@/api/trade.js'
import setup from './popup.js'
import uniNumberBox from '@/components/uni-number-box.vue'
import { goodsFormatPrice } from '@/utils/filters.js'
import {
	isECoupon,
	isVirtualGoods,
	isAppointmentGoods,
	getECouponStock,
	getECouponMaxBuyNum,
	getAppointmentStock,
	getAppointmentMaxBuyNum,
} from '@/utils/goodsType.js'

const props = withDefaults(defineProps<{
	buyMask?: boolean
	isGroup?: boolean
	goodsDetail?: any
	selectedSku?: any | null
	goodsSpec?: any | null
	addr?: any | null
	pointDetail?: any | null
}>(), {
	buyMask: false,
	isGroup: false,
	goodsDetail: () => ({}),
	selectedSku: '',
	goodsSpec: '',
	addr: '',
	pointDetail: ''
})

const emit = defineEmits(['closeBuy', 'changed', 'handleClickSku', 'queryCart'])

const num = ref(1)

const selectName = ref('')
const selectSkuList = ref<any>('')
const selectedSpecImg = ref('')
const buyType = ref('')
const parentOrder = ref<any>('')
const formatList = ref<any[]>([])
const currentSelected = ref<string[]>([])
const skuList = ref('')

// E_COUPON 读 SKU quantity；预约商品 quantity 固定 0，库存走时段
const availableStock = computed(() => {
	if (isECoupon(props.goodsDetail?.goodsType)) {
		return getECouponStock(props.goodsDetail)
	}
	if (isAppointmentGoods(props.goodsDetail?.goodsType)) {
		return getAppointmentStock(props.goodsDetail)
	}
	return Number(props.goodsDetail?.quantity) || 0
})

const maxBuyNum = computed(() => {
	if (isECoupon(props.goodsDetail?.goodsType)) {
		return getECouponMaxBuyNum(props.goodsDetail)
	}
	if (isAppointmentGoods(props.goodsDetail?.goodsType)) {
		return getAppointmentMaxBuyNum(props.goodsDetail)
	}
	return 999
})

// 电子卡券/预约商品禁止加购
const showAddToCart = computed(() => {
	return (
		buyType.value != 'PINTUAN' &&
		!isVirtualGoods(props.goodsDetail?.goodsType) &&
		!isECoupon(props.goodsDetail?.goodsType) &&
		!isAppointmentGoods(props.goodsDetail?.goodsType)
	)
})

watch(num, (val) => {
	val == 0 ? num.value = 1 : ''
	if (val && val > maxBuyNum.value) {
		num.value = maxBuyNum.value
	}
})

watch(() => props.isGroup, (val) => {
	if (val) {
		buyType.value = 'PINTUAN'
	}
}, { immediate: true })

watch(selectSkuList, (_val) => {
	emit('changed', selectSkuList.value)
}, { deep: true })

watch(
	() => availableStock.value,
	(val) => {
		if (val == 0) {
			uni.showToast({
				title: '商品已售罄',
				duration: 2000,
				icon: 'none',
			})
			num.value = 1
		} else if (num.value > maxBuyNum.value) {
			num.value = maxBuyNum.value
		}
	}
)



const closeMask = () => {
	emit('closeBuy', false)
}

/**点击规格 */
const handleClickSpec = (val: any, index: number, specValue: any) => {
	currentSelected.value[index] = specValue.value
	let selectedSkuId = props.goodsSpec.find((i: any) => {
		let matched = true
		let specValues = i.specValues.filter((j: any) => j.specName !== 'images')
		for (let n = 0; n < specValues.length; n++) {
			if (specValues[n].specValue !== currentSelected.value[n]) {
				matched = false
				return
			}
		}
		if (matched) {
			return i
		}
	})
	if (selectedSkuId?.skuId) {
		currentSelected.value[index] = specValue.value
		selectSkuList.value = {
			spec: {
				specName: val.name,
				specValue: specValue.value
			},
			data: props.goodsDetail
		}
		selectName.value = specValue.value

		emit('handleClickSku', {
			skuId: selectedSkuId.skuId,
			goodsId: props.goodsDetail.goodsId
		})
	} else {
		uni.showToast({
			title: '暂无该商品!',
			duration: 2000,
			icon: 'none'
		})
	}
}

/**
 * 活动页/父组件直接调用购买（POINTS / KANJIA 等显式 cartType）
 */
const buy = (data: any) => {
	uni.hideLoading()
	API_trade.addToCart(data).then((res) => {
		if (res.data.success) {
			const way = data.cartType || 'BUY_NOW'
			uni.navigateTo({
				url: `/pages/order/fillorder?way=${way}&addr=${''}&parentOrder=${encodeURIComponent(JSON.stringify(parentOrder.value || ''))}`,
			})
		} else {
			uni.showToast({
				title: res.data.message || '购买失败',
				icon: 'none',
			})
		}
	}).finally(() => {
		uni.hideLoading()
	})
}

/** 解析 cartType：拼团 PINTUAN；核销 VIRTUAL；其余含 E_COUPON 为 BUY_NOW */
function resolveCartType() {
	if (buyType.value === 'PINTUAN') {
		return 'PINTUAN'
	}
	if (isVirtualGoods(props.goodsDetail?.goodsType)) {
		return 'VIRTUAL'
	}
	return 'BUY_NOW'
}

/**
 * 添加到购物车或购买
 */
const addToCartOrBuy = (val: string) => {
	if (!selectSkuList.value) {
		uni.showToast({
			title: '请选择规格商品',
			icon: 'none',
		})
		return
	}
	const data: Record<string, any> = {
		skuId: props.goodsDetail.id,
		num: num.value,
	}

	if (val == 'cart') {
		API_trade.addToCart(data).then((res) => {
			if (res.data.success) {
				uni.showToast({
					title: '商品已添加到购物车',
					icon: 'none',
				})
				emit('queryCart')
				closeMask()
			} else {
				uni.showToast({
					title: res.data.message || '加购失败',
					icon: 'none',
				})
			}
		})
	} else {
		if (isAppointmentGoods(props.goodsDetail?.goodsType)) {
			const goodsId = props.goodsDetail.goodsId || ''
			uni.navigateTo({
				url: `/pages/order/appointment/appointmentCheckout?skuId=${props.goodsDetail.id}&goodsId=${goodsId}&num=${num.value}`,
			})
			closeMask()
			return
		}
		data.cartType = resolveCartType()
		API_trade.addToCart(data).then((res) => {
			if (res.data.success) {
				uni.navigateTo({
					url: `/pages/order/fillorder?way=${data.cartType}&addr=${props.addr?.id || ''}&parentOrder=${encodeURIComponent(JSON.stringify(parentOrder.value || ''))}`,
				})
			} else {
				uni.showToast({
					title: res.data.message || '购买失败',
					icon: 'none',
				})
			}
		})
	}
}

const formatSku = (list: any[]) => {
	// 格式化数据
	let arr: any[] = [{}]

	if (!Array.isArray(list)) {
		return false
	}
	list.forEach((_item, _index) => {
		let item = list[_index]
		item.specValues.forEach((spec: any, specIndex: number) => {
			let name = spec.specName
		let values = {
			value: spec.specValue,
			quantity: item.quantity,
			skuId: item.skuId
		}
		if (name === 'images') {
			return
		}

		arr.forEach((arrItem, arrIndex) => {
			if (
				arrItem.name == name &&
				arrItem.values &&
				!arrItem.values.find((i: any) => {
					return i.value === values.value
				})
			) {
				arrItem.values.push(values)
			}

			let keys = arr.map(key => {
				return key.name
			})
			if (!keys.includes(name)) {
				arr.push({
					name: name,
					values: [values]
				})
			}
		})
		})
	})

	arr.shift()
	formatList.value = arr

	list.forEach(item => {
		// 默认选中
		if (item.skuId === props.goodsDetail.id) {
			item.specValues
				.filter(i => i.specName !== 'images')
				.forEach((value, _index) => {
					currentSelected.value[_index] = value.specValue

					selectName.value = value.specValue

					selectSkuList.value = {
						spec: value,
						data: props.goodsDetail
					}
				})
		}
	})

	skuList.value = list
}

onMounted(() => {
	formatSku(props.goodsSpec)
})

defineExpose({
	buy,
	buyType,
	parentOrder,
})
</script>

<style lang="scss" scoped>
@import './popup.scss';

.price-row {
	text-align: center;
}

.buy {
	background-image: linear-gradient(135deg, $main-color, $light-color);
	box-shadow: 0 2px 6px 0 rgba(255, 65, 66, 0.2);
}

.card {
	background-image: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
	box-shadow: 0 2px 6px 0 rgba(255, 65, 66, 0.2);
}

::v-deep .u-icon-plus,
::v-deep .u-icon-minus,
::v-deep .u-icon-disabled {
	height: 30rpx !important;
	background: #fff !important;
}

.goods-skus-number {
	justify-content: space-between;
	display: flex;

	> .view-class-title {
		flex: 8;
	}

	> .view-class-input {
		flex: 1;
	}
}

::v-deep .uni-scroll-view {
	overflow: hidden !important;
}

.active {
	background: $price-light-color !important;
	border: 2rpx solid $price-color;
	font-weight: bold;
	color: $price-color !important;
	box-sizing: border-box;
}

.goods-skus-box {
	overflow-y: auto;
	height: 610rpx;
	// #ifdef MP-WEIXIN
	height: 570rpx;
	// #endif
	margin-bottom: 10rpx;
}
.soldout{
	margin: 20rpx 0;
}

.goods-skus-view {
	overflow: hidden;

	.skus-view-list {
		> .skus-view-item {
			flex: 1;
			padding: 0 36rpx;

			overflow: hidden;
			height: 60rpx;
			line-height: 60rpx;
			float: left;
			text-align: center;
			margin-left: 24rpx;
			margin-bottom: 20rpx;
			font-size: 22rpx;
			color: #262626;
			background: #f2f2f2;
			border-radius: 30rpx;
		}
	}
}


.goods-header {
	height: 200rpx;
	display: flex;
	align-items: center;
	margin-bottom: 36rpx;
}

.goods-box {
	padding: 50rpx 36rpx 0 36rpx;
}

.goods-skus {
	padding: 0 20rpx;
}

.goods-price {
	color: $price-color;
	line-height: 80rpx;
	margin-right: 20rpx;
}

.promotion-box {
	line-height: 1;
	display: flex;
	align-items: center;
	text-decoration: line-through;
	color: #999;
	margin-left: 10rpx;

	.goods-price-bigshow {
		font-size: 30rpx;
	}
}

.promotion {
	font-size: 30rpx;
}

.goods-price-promotionShow {
	font-size: 48rpx;
}

.goods-check-skus {
	font-size: 24rpx;
	color: #999;

	> .goods-check-skus-name {
		margin-left: 4rpx;
		color: #333;
	}
}
</style>
