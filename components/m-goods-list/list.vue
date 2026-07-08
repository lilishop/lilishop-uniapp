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
					<div class="promotion" @click="navigateToDetailPage(item)">
						<div v-if="item.salesModel == 'WHOLESALE'">
							<span class="promotion-tag">批</span>
						</div>
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
		<div v-if="type == 'oneColumns'"  class="goods-one-row">
			<div v-for="(item, index) in res" :key="index" class="goods-row">
				<div class="flex goods-col">
					<div class="goods-img" @click="navigateToDetailPage(item)">
						<u-image width="230rpx" mode="aspectFit" border-radius='16' height="230rpx" :src="item.thumbnail">
							<template #loading><u-loading-icon></u-loading-icon></template>
						</u-image>
					</div>
					<div class="goods-detail">
						<div class="title clamp3" @click="navigateToDetailPage(item)">{{ item.goodsName }}</div>
						<view class="price-box" @click="navigateToDetailPage(item)">
							<div class="price" v-if="item.price!=undefined">
								¥<span class="price-int">{{ goodsFormatPrice(item.price )[0] }} </span>.{{
			            goodsFormatPrice(item.price )[1]
			          }}
							</div>
						</view>
						<div class="promotion" @click="navigateToDetailPage(item)">
							<div v-if="item.salesModel == 'WHOLESALE'">
								<span class="promotion-tag">批</span>
							</div>
							<div v-for="(promotionItem,promotionIndex) in  getPromotion(item)" :key="promotionIndex">
								<span class="promotion-tag" v-if="promotionItem.indexOf('COUPON') != -1">劵</span>
								<span class="promotion-tag" v-if="promotionItem.indexOf('FULL_DISCOUNT') != -1">满减</span>
								<span class="promotion-tag" v-if="promotionItem.indexOf('SECKILL') != -1">秒杀</span>
							</div>
						</div>
						<div style="overflow: hidden" @click="navigateToDetailPage(item)" class="count-config">
							<span style="float: left; font-size: 22rpx">已售 {{ item.buyCount || '0' }}</span>
							<span style="float: right; font-size: 22rpx">{{ item.commentNum || '0' }}条评论</span>
						</div>
						<div class="store-seller-name" @click="navigateToStoreDetailPage(item)">
							<view class="store-name-row" v-if="storeName">
								<text class="self-tag" v-if="item.selfOperated">自营</text>
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
import { watch } from 'vue'
import { useGoodsListCommon } from './common'
import { goodsFormatPrice } from '@/utils/filters.js'

const { lightSearchStr, getPromotion, navigateToDetailPage, navigateToStoreDetailPage } = useGoodsListCommon()

const props = withDefaults(defineProps<{
	res?: any[]
	type?: string
	storeName?: boolean
	tabBarGap?: boolean
	keyword?: string | null
}>(), {
	res: () => [],
	type: 'twoColumns',
	storeName: true,
	tabBarGap: true,
	keyword: ''
})

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
