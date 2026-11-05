<template>
	<view>
		<!-- 一行两列商品展示 -->
		<view class="goods-list" :class="{ 'goods-list--embedded': !tabBarGap }" v-if="type == 'twoColumns'">
			<view v-for="(item, index) in res" :key="index" class="goods-item">
				<view class="image-wrapper" @click="navigateToDetailPage(item)">
					<u-image :src="item.thumbnail" width="100%" height='330rpx' mode="aspectFit">
						<template #loading><u-loading-icon></u-loading-icon></template>
					</u-image>
				</view>
				<view class="goods-detail">
					<div class="title clamp" v-html="lightSearchStr(keyword,item.goodsName)"
						@click="navigateToDetailPage(item)">

					</div>
					<view class="price-box" @click="navigateToDetailPage(item)">
						<div class="price" v-if="item.price!=undefined">
							¥<span class="price-int">{{ goodsFormatPrice(item.price )[0] }} </span>.{{
	            goodsFormatPrice(item.price )[1]
	          }}
						</div>
					</view>
					<PaidMemberPrice :quote="paidQuotes[item.id]" />
					<div class="promotion" @click="navigateToDetailPage(item)">
						<div v-for="(promotionItem,promotionIndex) in  getPromotion(item)" :key="promotionIndex">
							<span class="promotion-tag" v-if="promotionItem.indexOf('COUPON') != -1">劵</span>
							<span class="promotion-tag" v-if="promotionItem.indexOf('FULL_DISCOUNT') != -1">满减</span>
							<span class="promotion-tag" v-if="promotionItem.indexOf('SECKILL') != -1">秒杀</span>
						</div>
					</div>
					<div class="count-config" @click="navigateToDetailPage(item)">
						<span>已售 {{ item.buyCount || "0" }}</span>
						<span>{{ item.commentNum || "0" }}条评论</span>
					</div>
					<div class="store-seller-name" v-if="storeName" @click="navigateToStoreDetailPage(item)">
						<view class="store-name-row">
							<text class="self-tag" v-if="item.selfOperated">自营</text>
							<text class="store-name-text">{{ item.storeName || "暂无" }}</text>
							<text class="to-store">进店</text>
						</view>
						<u-icon name="arrow-right" size="12" color="#c5c5c5"></u-icon>
					</div>
				</view>
			</view>
		</view>
		<!-- 一行一列商品展示 -->
		<div v-if="type == 'oneColumns'" class="goods-one-row" :class="{ 'goods-one-row--embedded': !tabBarGap }">
			<div v-for="(item, index) in res" :key="index" class="goods-row">
				<div class="flex goods-col">
					<div class="goods-img" @click="navigateToDetailPage(item)">
						<u-image :width="!tabBarGap ? '170rpx' : '230rpx'" mode="aspectFit" :border-radius="!tabBarGap ? '12' : '16'" :height="!tabBarGap ? '170rpx' : '230rpx'" :src="item.thumbnail">
							<template #loading><u-loading-icon></u-loading-icon></template>
						</u-image>
					</div>
					<div class="goods-detail">
						<div class="title clamp2" @click="navigateToDetailPage(item)">
							<text class="self-tag" v-if="(!storeName || flag('selfTag')) && item.selfOperated">自营</text>
							{{ item.goodsName }}
						</div>
						<div class="selling-point" v-if="extra('subTitle') && item.sellingPoint">{{ item.sellingPoint }}</div>
						<div class="spec-summary" v-if="extra('spec') && specSummary(item)">{{ specSummary(item) }}</div>
						<div class="promotion" v-if="flag('tags')" @click="navigateToDetailPage(item)">
							<div v-for="(promotionItem,promotionIndex) in getPromotion(item)" :key="promotionIndex">
								<span class="promotion-tag" v-if="promotionItem.indexOf('COUPON') != -1">劵</span>
								<span class="promotion-tag" v-if="promotionItem.indexOf('FULL_DISCOUNT') != -1">满减</span>
								<span class="promotion-tag" v-if="promotionItem.indexOf('SECKILL') != -1">秒杀</span>
							</div>
						</div>
						<div style="overflow: hidden" v-if="flag('sales')" @click="navigateToDetailPage(item)" class="count-config">
							<span style="float: left; font-size: 22rpx">已售 {{ item.buyCount || '0' }}</span>
							<span style="float: right; font-size: 22rpx" v-if="item.commentNum">{{ item.commentNum }}条评论</span>
						</div>
						<view class="price-box" @click="navigateToDetailPage(item)">
							<div class="price" v-if="flag('price') && item.price!=undefined">
								¥<span class="price-int">{{ goodsFormatPrice(item.price )[0] }} </span>.{{
			            goodsFormatPrice(item.price )[1]
			          }}
							</div>
							<div class="market-price" v-if="extra('linePrice') && hasMarketPrice(item)">¥{{ item.marketPrice }}</div>
							<div class="cart-btn" v-if="extra('cart')" @click.stop="emit('addCart', item)">
								<u-icon name="shopping-cart" size="16" :color="mainColor"></u-icon>
							</div>
						</view>
						<PaidMemberPrice v-if="flag('price')" :quote="paidQuotes[item.id]" />
						<div class="store-seller-name" v-if="storeName" @click="navigateToStoreDetailPage(item)">
							<view class="store-name-row">
								<text class="self-tag" v-if="item.selfOperated && flag('selfTag')">自营</text>
								<text class="store-name-text">{{ item.storeName }}</text>
								<text class="to-store">进店</text>
							</view>
							<u-icon name="arrow-right" size="12" color="#c5c5c5"></u-icon>
						</div>
					</div>
				</div>
			</div>
		</div>
	</view>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PaidMemberPrice from '@/components/paid-member-price/index.vue'
import { getPaidMemberQuotes } from '@/api/paid-member'
import { isLogin } from '@/utils/filters'
import { useStore } from '@/store'
import { useGoodsListCommon } from './common'
import { goodsFormatPrice } from '@/utils/filters.js'

const store = useStore()
const mainColor = computed(() => (store && store.getters && store.getters.mainColor) || '#ff3c2a')

const { lightSearchStr, getPromotion, navigateToDetailPage, navigateToStoreDetailPage } = useGoodsListCommon()

const props = withDefaults(defineProps<{
	res?: any[]
	type?: string
	storeName?: boolean
	tabBarGap?: boolean
	keyword?: string | null
	showFields?: Record<string, boolean> | null
}>(), {
	res: () => [],
	type: 'twoColumns',
	storeName: true,
	tabBarGap: true,
	keyword: '',
	showFields: null
})

const emit = defineEmits(['addCart'])
const paidQuotes = ref<Record<string, any>>({})
let paidRequest = 0
async function loadPaidQuotes() {
  const request = ++paidRequest, memberId = String(isLogin()?.id || '')
  paidQuotes.value = {}
  if (!memberId) return
  const ids = [...new Set((props.res || []).map(item => String(item.id || '')).filter(Boolean))]
  try {
    const results = await Promise.all(Array.from({length:Math.ceil(ids.length/100)},(_,i)=>getPaidMemberQuotes(ids.slice(i*100,i*100+100))))
    if (request !== paidRequest || String(isLogin()?.id || '') !== memberId) return
    paidQuotes.value = Object.assign({}, ...results.filter(res=>res.data?.success).map(res=>res.data.result || {}))
  } catch {}
}
watch(() => [(props.res || []).map(item=>item.id).join(','), store.state.userInfo?.id, store.state.hasLogin], loadPaidQuotes, {immediate:true})
onShow(loadPaidQuotes)

// 存量字段(促销/销量/自营/价格):showFields 为 null 时维持现状渲染
const flag = (key: string) => props.showFields == null || props.showFields[key] !== false
// 新增字段(副标题/规格/划线价/购物车按钮):仅 showFields 提供时可渲染
const extra = (key: string) => props.showFields != null && props.showFields[key] !== false
const hasMarketPrice = (item: any) =>
	item.marketPrice != null && item.price != null && item.marketPrice > item.price
const specSummary = (item: any) =>
	Array.isArray(item.attrList)
		? item.attrList.slice(0, 2).map((a: any) => `${a.name}: ${a.value}`).join(' · ')
		: ''

watch(() => props.keyword, (val) => {
	if (val) {
		lightSearchStr(val as string, '')
	}
})
</script>

<style lang='scss' scoped>
		.goods-one-row{
			padding-bottom: 250rpx;
		}
		/* 商品列表 */
		.goods-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			margin: 10rpx 20rpx 284rpx;
			width: calc(100% - 40rpx);
			box-sizing: border-box;

			&.goods-list--embedded {
				margin-bottom: 20rpx;
			}

			>.goods-item {
				background-color: #ffffff;
				display: flex;
				border-radius: 16rpx;
				flex-direction: column;
				width: calc(50% - 10rpx);
				margin-bottom: 20rpx;
				padding-bottom: 20rpx;


				.image-wrapper {
					width: 100%;
					height: 330rpx;
					border-radius: 16rpx 16rpx 0 0;
					overflow: hidden;
					padding: 0;
				}
			}

			.count-config,
			.store-seller-name {
				font-size: $font-sm;
			}

			.store-seller-name {
				color: #666;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 4rpx;
				font-size: 24rpx;
			}

			.store-name-row {
				flex: 1;
				min-width: 0;
				display: flex;
				align-items: center;
				overflow: hidden;
			}

			.store-name-text {
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-size: 24rpx;
				color: #999;
			}

			.to-store {
				flex-shrink: 0;
				font-size: 24rpx;
				color: #333;
				margin-left: 8rpx;
			}

			.self-tag {
				flex-shrink: 0;
				margin-right: 8rpx;
				padding: 2rpx 10rpx;
				border-radius: 8rpx;
				background: $main-color;
				color: #fff;
				font-size: 20rpx;
				line-height: 1.4;
			}

			.count-config {
				padding: 5rpx 0;
				color: #666;
				display: flex;
				font-size: 24rpx;
				justify-content: space-between;
			}
		}

		.goods-one-row--embedded {
			.goods-row {
				padding: 20rpx 16rpx;
				border-bottom: 1rpx solid #f6f6f6;
				background: #ffffff;

				>.goods-col {
					display: flex;
					align-items: stretch;

					>.goods-img {
						flex: 0 0 170rpx;
						width: 170rpx;
						height: 170rpx;
						border-radius: 12rpx;
						overflow: hidden;
						background: #f8f8f8;
					}

					>.goods-detail {
						flex: 1;
						min-width: 0;
						margin: 0 0 0 16rpx;
						display: flex;
						flex-direction: column;
						justify-content: space-between;

						>.title {
							font-size: 26rpx;
							color: #222;
							line-height: 1.4;
							max-height: 74rpx;
							padding: 0;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							overflow: hidden;
							text-overflow: ellipsis;

							.self-tag {
								display: inline-block;
								margin-right: 8rpx;
								padding: 1rpx 8rpx;
								border-radius: 6rpx;
								background: $main-color;
								color: #fff;
								font-size: 20rpx;
								line-height: 1.4;
								vertical-align: middle;
							}
						}

						.selling-point {
							font-size: 22rpx;
							color: #999;
							line-height: 1.3;
							margin-top: 4rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.spec-summary {
							font-size: 22rpx;
							color: #999;
							line-height: 1.3;
							margin-top: 2rpx;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}

						.count-config {
							font-size: 22rpx;
							color: #999;
							margin-top: 4rpx;
						}

						.price-box {
							display: flex;
							align-items: flex-end;
							justify-content: space-between;
							margin-top: auto;
							padding-top: 8rpx;

							.price {
								font-size: 22rpx;
								color: $main-color;
								font-weight: 500;
								line-height: 1;

								.price-int {
									font-size: 34rpx;
									font-weight: bold;
								}
							}

							.market-price {
								font-size: 22rpx;
								color: #bbb;
								text-decoration: line-through;
								margin-left: 8rpx;
							}

							.cart-btn {
								width: 48rpx;
								height: 48rpx;
								border-radius: 50%;
								background: #ffffff;
								border: 2rpx solid $main-color;
								display: flex;
								align-items: center;
								justify-content: center;
								box-sizing: border-box;
								box-shadow: 0 2rpx 8rpx rgba(255, 60, 42, 0.12);
							}
						}
					}
				}
			}
		}

		.goods-row {
			background: #fff;
			padding: 16rpx;

			>.goods-col {
				display: flex;

				>.goods-img {
					overflow: hidden;
					flex: 4;
				}

				>.goods-detail {
					flex: 7;
				}
			}
		}

		.goods-detail {
			margin: 0 20rpx;

			>.title {
				font-size: $font-base;
				color: $font-color-dark;
				line-height: 1.5;
				height: 86rpx;
				padding: 10rpx 0 0;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}

			.selling-point {
			font-size: 22rpx;
			color: #999;
			line-height: 1.4;
			margin-top: 4rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.spec-summary {
			font-size: 22rpx;
			color: #999;
			line-height: 1.4;
			margin-top: 4rpx;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.market-price {
			font-size: 22rpx;
			color: #999;
			text-decoration: line-through;
			margin-left: 8rpx;
		}

		.cart-btn {
			width: 48rpx;
			height: 48rpx;
			border-radius: 50%;
			background: #ffffff;
			border: 2rpx solid $main-color;
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
			box-sizing: border-box;
			box-shadow: 0 2rpx 8rpx rgba(255, 60, 42, 0.12);
		}

		.promotion {
				margin-top: 4rpx;
				display: flex;

				.promotion-tag {
					font-size: 24rpx;
					color: $light-color;
					margin-right: 10rpx;
					padding: 0 4rpx;
					border-radius: 2px;
				}
			}

			.store-seller-name {
				color: #666;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-top: 4rpx;
				font-size: 24rpx;
			}

			.store-name-row {
				flex: 1;
				min-width: 0;
				display: flex;
				align-items: center;
				overflow: hidden;
			}

			.store-name-text {
				flex: 1;
				min-width: 0;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				font-size: 24rpx;
				color: #999;
			}

			.to-store {
				flex-shrink: 0;
				font-size: 24rpx;
				color: #333;
				margin-left: 8rpx;
			}

			.self-tag {
				flex-shrink: 0;
				margin-right: 8rpx;
				padding: 2rpx 10rpx;
				border-radius: 8rpx;
				background: $main-color;
				color: #fff;
				font-size: 20rpx;
				line-height: 1.4;
			}

			.count-config {
				padding: 5rpx 0;
				color: #666;
				display: flex;
				font-size: 24rpx;
				justify-content: space-between;
			}

			>.price-box {
				margin-top: 10rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding-right: 10rpx;
				font-size: 24rpx;
				color: $font-color-light;

				>.price {
					font-size: 26rpx;
					line-height: 1;
					color: $main-color;
					font-weight: bold;

					.price-int {
						font-size: 38rpx;
					}
				}
			}
		}
</style>
