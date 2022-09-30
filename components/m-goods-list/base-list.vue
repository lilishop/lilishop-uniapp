<template>
	<div>
		<div v-for="(item, index) in res" :key="index" class="goods-row">
			<div class="flex goods-col">
				<div class="goods-img" @click="navigateToDetailPage(item)">
					<u-image width="230rpx" border-radius='16' height="230rpx" :src="item.goodsImage || item.thumbnail">
						<u-loading slot="loading"></u-loading>
					</u-image>
				</div>
				<div class="goods-detail">
					<div class="title clamp3" @click="navigateToDetailPage(item)">{{ item.goodsName }}</div>
					<view class="price-box" @click="navigateToDetailPage(item)">
						<div class="price" v-if="item.price!=undefined">
							¥<span>{{ formatPrice(item.price )[0] }} </span>.{{
			            formatPrice(item.price )[1]
			          }}
						</div>
					</view>
					<div class="promotion" @click="navigateToDetailPage(item)">
						<div v-if="item.salesModel == 'WHOLESALE'">
							<span>批</span>
						</div>
						<div v-for="(promotionItem,promotionIndex) in  getPromotion(item)" :key="promotionIndex">
							<span v-if="promotionItem.indexOf('COUPON') != -1">劵</span>
							<span v-if="promotionItem.indexOf('FULL_DISCOUNT') != -1">满减</span>
							<span v-if="promotionItem.indexOf('SECKILL') != -1">秒杀</span>
						</div>
					</div>
					<div style="overflow: hidden" @click="navigateToDetailPage(item)" class="count-config">
						<span style="float: left; font-size: 22rpx">已售 {{ item.buyCount || '0' }}</span>
						<span style="float: right; font-size: 22rpx">{{ item.commentNum || '0' }}条评论</span>
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
				lightColor: this.$mainColor
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
		},
		methods:{
			// 跳转到商品详情
			navigateToDetailPage(item) {
				uni.navigateTo({
					url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
				});
			},
		}
	}
</script>

<style lang='scss' scoped>
.goods-list {
			display: flex;
			flex-wrap: wrap;
			margin: 10rpx 20rpx 284rpx;
			width: 100%;
	
			>.goods-item {
				background-color: #ffffff;
				display: flex;
				border-radius: 16rpx;
				flex-direction: column;
				width: calc(50% - 30rpx);
				margin-bottom: 20rpx;
				padding-bottom: 20rpx;
	
				&:nth-child(2n + 1) {
					margin-right: 20rpx;
				}
	
	
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
	
			.text-hidden {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
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
	
			.store-seller-name {
				color: #666;
				overflow: hidden;
				display: flex;
				justify-content: space-between;
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
	
					/deep/ span:nth-of-type(1) {
						font-size: 38rpx;
					}
				}
			}
	
		}
</style>
