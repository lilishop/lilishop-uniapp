<template>
	<view class="content">
		<u-navbar
			:fixed="true"
			:placeholder="true"
			:border="false"
			:auto-back="true"
			title=""
		>
			<template #center>
				<view class="slot-wrap">
					<u-tabs
						:lineColor="lightColor"
						:activeStyle="{ color: lightColor }"
						class="collect-tabs"
						:list="navList"
						:scrollable="true"
						v-model:current="tabCurrentIndex"
					></u-tabs>
				</view>
			</template>
		</u-navbar>
		<view class="collect-body">
			<!-- 显示商品栏 -->
			<view v-if="tabCurrentIndex == 0" class="tab-content">
				<scroll-view class="list-scroll-content" scroll-y>
					<u-empty style="margin-top: 40rpx" text="暂无收藏商品数据" mode="favor" v-if="goodsEmpty"></u-empty>
					<template v-else>
						<u-swipe-action
							v-for="(item, index) in goodList"
							:key="index"
							class="collect-swipe"
						>
							<u-swipe-action-item
								@open="openLeftChange(item, 'goods')"
								:show="item.selected"
								:options="LeftOptions"
								@click="clickGoodsSwiperAction(item, index)"
								:name="index"
							>
								<view class="goods" @click="goGoodsDetail(item)">
									<u-image width="131rpx" height="131rpx" :src="item.image" mode="aspectFit">
										<template #loading><u-loading></u-loading></template>
									</u-image>
									<view class="goods-intro">
										<view class="goods-name">{{ item.goodsName }}</view>
										<view class="goods-sn">{{ item.goods_sn }}</view>
										<view class="goods-price">￥{{ unitPrice(item.price) }}</view>
									</view>
								</view>
							</u-swipe-action-item>
						</u-swipe-action>
					</template>
				</scroll-view>
			</view>
			<!-- 显示收藏的店铺栏 -->
			<view v-else class="tab-content">
				<scroll-view class="list-scroll-content" scroll-y>
					<u-empty style="margin-top: 40rpx" text="暂无收藏店铺数据" mode="favor" v-if="storeEmpty"></u-empty>
					<template v-else>
						<u-swipe-action
							v-for="(item, index) in storeList"
							:key="index"
							class="collect-swipe"
						>
							<u-swipe-action-item
								@open="openLeftChange(item, 'store')"
								:show="item.selected"
								:options="LeftOptions"
								@click="clickStoreSwiperAction(item)"
								:name="index"
							>
								<view class="store" @click="goStoreMainPage(item.id)">
									<view class="intro">
										<view class="store-logo">
											<u-image width="102rpx" height="102rpx" :src="item.storeLogo" :alt="item.storeName"
												mode="aspectFit">
												<template #loading><u-loading></u-loading></template>
											</u-image>
										</view>
										<view class="store-name">
											<view>{{ item.storeName }}</view>
											<u-tag size="mini" type="error" :color="$mainColor" v-if="item.selfOperated"
												text="自营" mode="plain" shape="circle" />
										</view>
										<view class="store-collect">
											<view>进店逛逛</view>
										</view>
									</view>
								</view>
							</u-swipe-action-item>
						</u-swipe-action>
					</template>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getGoodsCollection,
		getStoreCollection,
		deleteGoodsCollection,
		deleteStoreCollection,
	} from "@/api/members.js";
	export default {
		data() {
			return {
        lightColor:this.$lightColor,
				// 商品左滑侧边栏
				LeftOptions: [{
					text: "取消",
					style: {
						backgroundColor: this.$lightColor,
					},
				}, ],
				tabCurrentIndex: 0, //tab的下标默认为0，也就是说会默认请求商品
				navList: [
					//tab显示数据
					{
						name: "商品(0)",
					
						params: {
							pageNumber: 1,
							pageSize: 10,
						},
					},
					{
						name: "店铺(0)",
					
						params: {
							pageNumber: 1,
							pageSize: 10,
						},
					},
				],
			
				goodsEmpty: false, //商品数据是否为空
				storeEmpty: false, //店铺数据是否为空
				goodList: [], //商品集合
				storeList: [], //店铺集合
			};
		},
		onShow() {
			this.fetchReloadOrNextPage('reload')
		},
		onReachBottom() {
			this.fetchReloadOrNextPage('next')
		},

		methods: {
			// 刷新或者下一页
			fetchReloadOrNextPage(type) {
				if(type == 'next'){
					this.navList[this.tabCurrentIndex].params.pageNumber ++;
					if (this.tabCurrentIndex == 0) {
					this.getGoodList();
					} else {
						this.getStoreList();
					}
				}
				else{
					this.navList[0].params.pageNumber = 1;
					this.navList[1].params.pageNumber = 1;
					this.goodList = [];
					this.storeList = [];
					this.getGoodList();
					this.getStoreList();
				}
			},

			/**
			 * 打开商品左侧取消收藏
			 */
			openLeftChange(val, type) {
				const way = type === "goods" ? this.goodList : this.storeList;
				way.forEach((item) => {
					item.selected = false;
				});
				val.selected = true;
			},

			/**
			 * 点击商品左侧取消收藏
			 */
			clickGoodsSwiperAction(val) {
				deleteGoodsCollection(val.skuId).then((res) => {
					if (res.statusCode == 200) {
						this.storeList = [];
						this.goodList = [];
						this.getGoodList();
					}
				});
			},

			/**
			 * 点击店铺左侧取消收藏
			 */
			clickStoreSwiperAction(val) {
				deleteStoreCollection(val.id).then((res) => {
					if (res.statusCode == 200) {
						this.storeList = [];
						this.getStoreList();
					}
				});
			},

			/**
			 * 查看商品详情
			 */
			goGoodsDetail(val) {
				//商品详情
				uni.navigateTo({
					url: "/pages/product/goods?id=" + val.skuId + "&goodsId=" + val.goodsId,
				});
			},

			/**
			 * 查看店铺详情
			 */
			goStoreMainPage(id) {
				//店铺主页
				uni.navigateTo({
					url: "/pages/product/shopPage?id=" + id,
				});
			},

			/**
			 * 获取商品集合
			 */
			getGoodList() {
				uni.showLoading({
					title: "加载中",
				});
				getGoodsCollection(this.navList[0].params, "GOODS").then((res) => {
					 if (this.$store.state.isShowToast){ uni.hideLoading() };
					uni.stopPullDownRefresh();
					if (res.data.success) {
						let data = res.data.result;
						data.selected = false;
						  this.navList[0].name = `商品(${data.total})`;
          
						if (data.total == 0) {
							this.goodsEmpty = true;
						} else if (data.total < 10) {
							this.goodsLoad = "noMore";
							this.goodList.push(...data.records);
						} else {
							this.goodList.push(...data.records);
							if (data.total.length < 10) this.goodsLoad = "noMore";
						}
					}
				});
			},

			/**
			 * 获取店铺集合
			 */
			getStoreList() {
				uni.showLoading({
					title: "加载中",
				});
				getStoreCollection(this.navList[1].params, "STORE").then((res) => {
					 if (this.$store.state.isShowToast){ uni.hideLoading() };
					uni.stopPullDownRefresh();
					if (res.data.success) {
						let data = res.data.result;
						data.selected = false;
						 this.navList[1].name = `店铺(${data.total})`;
						if (data.total == 0) {
							this.storeEmpty = true;
						} else if (data.total < 10) {
						
							this.storeList.push(...data.records);
						} 
					}
				});
			},
		},

		/**
		 * 下拉刷新时
		 */
		onPullDownRefresh() {
			if (this.tabCurrentIndex == 0) {
				this.navList[0].params.pageNumber = 1;
				this.goodList = [];
				this.getGoodList();
			} else {
				this.navList[1].params.pageNumber = 1;
				this.storeList = [];
				this.getStoreList();
			}
		},
	};
</script>

<style lang="scss">
	page,
	.content {
		background: $page-color-base;
		height: 100%;
	}

	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.slot-wrap {
		flex: 1;
		display: flex;
		justify-content: center;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.collect-tabs {
		width: 100%;
	}

	.collect-body {
		flex: 1;
		min-height: 0;
	}

	.tab-content {
		height: 100%;
	}

	.list-scroll-content {
		height: 100%;
		width: 100%;
	}

	.collect-swipe,
	:deep(.u-swipe-action),
	:deep(.u-swipe-action-item),
	:deep(.u-swipe-action-item__content) {
		width: 100%;
	}

	:deep(.u-swipe-action-item__content) {
		overflow: hidden;
	}

	.goods {
		background-color: #fff;
		border-bottom: 1px solid $border-color-light;
		min-height: 190rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		margin-top: 20rpx;
		width: 100%;

		.goods-intro {
			flex: 1;
			min-width: 0;
			font-size: $font-base;
			line-height: 48rpx;
			margin-left: 30rpx;

			.goods-name {
				line-height: 1.4em;
				font-size: 24rpx;
				max-height: 2.8em;
				overflow: hidden;
				color: #666;
			}

			.goods-sn {
				color: #cccccc;
				font-size: 24rpx;
			}

			.goods-price {
				color: $light-color;
			}
		}
	}

	.store {
		background-color: #fff;
		border: 1px solid $border-color-light;
		border-radius: 16rpx;
		margin: 20rpx 10rpx;
		width: calc(100% - 20rpx);
		box-sizing: border-box;

		.intro {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 30rpx 0 40rpx;
			min-height: 170rpx;

			.store-logo {
				width: 102rpx;
				height: 102rpx;
				border-radius: 50%;
				overflow: hidden;
				flex-shrink: 0;
			}

			.store-name {
				flex: 1;
				min-width: 0;
				margin-left: 30rpx;
				line-height: 2em;

				:first-child {
					font-size: $font-base;
				}
			}

			.store-collect {
				flex-shrink: 0;
				border-left: 1px solid $border-color-light;
				padding-left: 20rpx;
				text-align: center;
				color: #999;
				font-size: $font-sm;
			}
		}
	}
</style>
