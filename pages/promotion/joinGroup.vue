<template>
	<view class="wrapper">
		<u-navbar
			:border="false"
			:fixed="true"
			:placeholder="true"
			left-icon="arrow-left"
			:auto-back="false"
			@left-click="back"
		>
			<template #center>
				<view v-if="search" class="search-wrap">
					<u-search
						@search="searchFun()"
						@custom="searchFun()"
						v-model="params.goodsName"
					></u-search>
				</view>
				<text v-else class="nav-title">{{ title }}</text>
			</template>
			<template #right>
				<view class="nav-right" @click="searchFlag()">
					<text v-if="search">取消</text>
					<u-icon v-else size="22" name="search"></u-icon>
				</view>
			</template>
		</u-navbar>
		<!-- 顶部栏 -->
		<view class="header-wraper">
			<image class="header-banner" mode="aspectFit" src="/static/join-buy.png"></image>
		</view>
		<!-- 商品栏 -->
		<div class="swiper">
			<goodsTemplate v-if="goodsList.length" :res="goodsList" />
			
			<u-empty v-else style="margin-top:20%" text="暂无拼团活动" mode="data"></u-empty>
		</div>

	</view>
</template>

<script>
	import * as API_Promotions from "@/api/promotions";
	import * as API_Goods from "@/api/goods";
	import goodsTemplate from '@/components/m-goods-list/promotion.vue'
	export default {
		components: {
			goodsTemplate
		},
		data() {
			return {
				is_empty: false,
				search: false,
				title: "拼团活动",

				empty: false,
				params: {
					pageNumber: 1,
					pageSize: 10,
					categoryPath: "",
					goodsName: "",
				},
				goodsList: [],
			};
		},
		mounted() {},
		watch: {
			search(val) {
				if (!val && !this.title) {
					this.title = "拼团活动";
				}
			},
		},
		onReachBottom() {
			this.loadMore();
		},
		// 点击搜索按钮
		onNavigationBarButtonTap(e) {
			this.popupFlag = !this.popupFlag;
		},
		async onLoad() {
			this.GET_AssembleGoods();
		},

		methods: {
			back() {
				if (this.search) {
					this.search = false;
					this.params.goodsName = "";
					this.goodsList = [];
					this.params.pageNumber = 1;
					this.GET_AssembleGoods();
					return;
				}
				const pages = getCurrentPages();
				if (pages.length > 1) {
					uni.navigateBack();
				} else {
					uni.switchTab({
						url: "/pages/tabbar/home/index",
					});
				}
			},
			loadMore() {
				this.params.pageNumber++;
				this.GET_AssembleGoods();
			},
			searchFlag() {
				this.search = !this.search;
			},

			toHref(goods) {
				uni.navigateTo({
					url: `/pages/product/goods?id=${goods.skuId}&goodsId=${goods.goodsId}`,
				});
			},
			searchFun() {
				this.goodsList = [];
				this.GET_AssembleGoods();
			},
			// 请求拼团数据
			GET_AssembleGoods() {

				const params = JSON.parse(JSON.stringify(this.params));
				if (params.category_id === 0) delete params.category_id;

				API_Promotions.getAssembleList(params)
					.then((response) => {
						const data = response.data.result.records;

						if (!data || !data.length) {
							this.is_empty = true;

						} else {
							if (data.length <= this.params.pageSize) {

							} else {

							}
							this.is_empty = false;
							this.goodsList.push(...(data || []));
						}
					})
					.catch(() => {});
			},
		},
	};
</script>

<style lang="scss" scoped>
	.search-wrap {
		width: 100%;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.nav-title {
		font-size: 32rpx;
		color: #303133;
	}

	.nav-right {
		margin-right: 24rpx;
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #303133;
	}

	.header-wraper {
		background: url('/static/bg.png') no-repeat center center;
		background-size: cover;
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.header-banner {
			width: 188rpx;
			height: 60rpx;
			display: block;
		}
	}
</style>
