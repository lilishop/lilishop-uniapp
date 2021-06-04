<template>
	<view class="sale">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>

		<view class="prohibition" :style="'overscroll-behavior: unset;height:' + header.height + 'px;'">
			<view class="header">
				<view class="left">
					<u-icon @click="goMainPage()" size="40" name="arrow-left"></u-icon>
				</view>
				特惠推荐
				<view @click="goCart" class="right"><text class="alifont icon-gouwuche1"
						style="font-size: 40rpx;"></text></view>
			</view>
		</view>
		<view class="sale-head">
			<image :style="'margin-top:' + header.height + 'px;'" src="/pages/floor/imgs/recommend/head-sample.png"
				mode="aspectFill"></image>
		</view>
		<view class="sale-title">
			<view>今日特惠</view>
		</view>
		<view class="sale-items">
			<view class="sale-item" v-for="item in goods" @click="navigateTo(item)">
				<view class="sale-item-img">
					<image :src="item.thumbnail" mode="aspectFill"></image>
				</view>
				<view class="sale-item-content">
					<view class="sale-item-title">
						{{ item.name }}
						<view class="sale-item-title-desc">{{ item.category }}</view>
					</view>
					<view class="sale-item-price">
						<text class="sale-item-price-now">¥{{ item.price | unitPrice }}
							<!-- <text v-if="item.point">+{{ item.point || 0 }}积分</text> -->
						</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getPlateformTagGoods
	} from '@/api/goods.js';
	import storage from '@/utils/storage.js';
	export default {
		data() {
			return {
				header: {
					top: 0,
					height: 40
				},
				goods: [],
				tag_id: 1,
				loadStatus: 'more'
			};
		},
		async onLoad(options) {
			if (options.title) {
				uni.setNavigationBarTitle({
					title: options.title
				});
			}
			let response = await getPlateformTagGoods(this.tag_id);
			this.goods = response.data;
		},
		onBackPress() {
		
		},
		methods: {
			// 跳转
			navigateTo(item) {
				uni.navigateTo({
					url: '/pages/product/goods?id=' + item.goods_id
				});
			},
			goCart() {
				//跳转购物车
				let obj = {
					from: 'sale',
					id: ''
				};
				storage.setCartBackbtn(obj);
				uni.preloadPage({
					url: '/pages/tabbar/cart/cartList'
				});
			},
			goMainPage() {
				//莫名其妙的，无法后退，尝试追加参数解决缓存问题
				uni.switchTab({
					url: '/pages/tabbar/home/index'
				});
			}
		}
	};
</script>

<style lang="less" scoped>
	.sale {
		width: 100%;
		min-height: 100vh;
		background-color: #f7f7f7;
	}

	.index {
		padding-top: var(--status-bar-height);
	}

	.prohibition {
		position: fixed;
		width: 100%;
		z-index: 100;
		top: var(--status-bar-height);
	}

	.status_bar {
		position: fixed;
		top: 0px;
		height: var(--status-bar-height);
		width: 100%;
		background: #1abc9c;
		z-index: 100;
	}

	.header {
		background: #1abc9c;
		position: relative;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		font-size: 34rpx;
		height: 80rpx;

		.left,
		.right {
			position: absolute;
			width: max-content;
			height: max-content;
			top: 0;
			bottom: 0;
			margin: auto;
		}

		.left {
			float: left;
			top: 0;
			bottom: 0;
			left: 20rpx;
		}

		.right {
			float: right;
			right: 20rpx;
		}
	}

	.sale-head {
		padding-top: var(--status-bar-height);

		image {
			width: 750 rpx;
			height: 280 rpx;
			border-radius: 0px;
		}

		margin-bottom: 20 rpx;
	}

	.sale-title {
		width: 710 rpx;
		height: 100 rpx;
		margin: 0 auto;
		font-size: 28 rpx;
		color: #666;
		border-radius: 14 rpx 14 rpx 0 0;
		background-color: #f1f1f1;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		justify-content: center;
		align-items: center;
		justify-content: start;

		view {
			margin-left: 40 rpx;
			font-size: 28rpx;
			font-family: PingFang SC, PingFang SC-Regular;
			font-weight: 400;
		}
	}

	.sale-items {
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		align-items: center;

		flex-direction: column;
		margin: 0 20rpx;
		background-color: #fff;
	}

	.sale-item {
		width: 710 rpx;
		padding: 0 20rpx;
		height: 180 rpx;
		border-bottom: 1px solid #eeeeee;
		// position: relative;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		align-items: center;
		justify-content: start;
	}

	.sale-item-img {
		margin-right: 20 rpx;

		image {
			width: 124 rpx;
			height: 124 rpx;
			border-radius: 8 rpx;
		}
	}

	.sale-item-content {
		line-height: 1.5em;
	}

	.sale-item-title {
		font-size: 28 rpx;
		color: #333;
	}

	.sale-item-title-desc {
		font-size: 25 rpx;
		color: #ccc;
	}

	.sale-item-price-now {
		font-size: 28 rpx;
		color: #ff5a10;
		margin: 0;
	}
</style>
