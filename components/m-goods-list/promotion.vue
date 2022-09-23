<template>
	<div>
		<div v-for="(item, index) in res" :key="index" class="goods-row" @click="navigateToDetailPage(item)">
			<div class="flex goods-col">
				<div class="goods-img">
					<u-image width="230rpx" border-radius='16' height="230rpx" :src="item.goodsImage || item.thumbnail">
						<u-loading slot="loading"></u-loading>
					</u-image>
				</div>
				<div class="goods-detail">
					<div class="title clamp3">{{ item.goodsName }}</div>
					<div class='flex flex-a-c flex-j-sb'>
						<view class="price-box">
							<!-- 秒杀 / 拼团 -->
							<div class="price" v-if="!type && item.price!=undefined">
								¥<span>{{ formatPrice(item.price )[0] }} </span>.{{
										formatPrice(item.price )[1]
									}}
							</div>
							<!-- 砍价 -->
							<div class="price" v-if="type && item.purchasePrice!=undefined">
								最低：
								¥<span>{{ formatPrice(item.purchasePrice )[0] }} </span>.{{
										formatPrice(item.purchasePrice )[1]
									}}
							</div>
						</view>
						<div>
							<image class='buy' :src="buy"></image>
						</div>
					</div>
					<div class='count-config' v-if="!type">
						<span>即将恢复{{ item.originalPrice}}元</span>
					</div>
				</div>
			</div>

		</div>
	</div>
</template>

<script>
	import commonTpl from '@/components/m-goods-list/common'
	export default {
		data() {
			return {
				lightColor: this.$mainColor,
				buy: require('@/static/buy.png')
			}
		},
		mixins: [commonTpl],
		props: {
			// 遍历的数据
			res: {
				type: Array,
				default: () => {
					return []
				}
			},
			type:{
				type:null,
				default:""
			}
		},
		methods: {
			// 跳转到商品详情
			navigateToDetailPage(item) {
				uni.navigateTo({
					url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
				});
			},
		}
	}
</script>

<style lang='scss' scoped>
	.buy {
		width: 152rpx;
		height: 108rpx;
	}
	.flex-j-sb {
		width: 100%;
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
			height: 84rpx;
			padding: 10rpx 0 0;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
		}

		.promotion {
			margin-top: 4rpx;
			display: flex;

			div {
				span {
					font-size: 24rpx;
					color: $light-color;
					margin-right: 10rpx;
					padding: 0 4rpx;
					border-radius: 2rpx;
				}
			}
		}

		.count-config {
			padding: 5rpx 0;
			color: #666;
			display: flex;
			font-size: 24rpx;
			letter-spacing:2rpx;
			padding-left: 10rpx;
		}



	}

	.price-box {
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

			/deep/ span:nth-of-type(1) {
				font-size: 48rpx;
			}
		}
	}
</style>
