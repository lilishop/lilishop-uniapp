<template>
	<view class="wrapper">
		<u-navbar :border-bottom="false"  :title="title">
			<!-- 中间 -->
			<view class="slot-wrap container-wrap">
				<view v-if="search">
					<u-search @search="searchFun()" @custom="searchFun()" v-model="params.goodsName"></u-search>
				</view>
			</view>
			<!-- 右侧 -->
			<view slot="right">
				<view style="margin-right: 24rpx;" @click="searchFlag()">
					<view v-if="search">取消</view>
					<u-icon v-if="!search" size="44rpx" name="search"></u-icon>
				</view>
			</view>
		</u-navbar>
		<!-- 顶部栏 -->
		<div class='header-wraper'>
			<image  src="/static/join-buy.png"></image>
		</div>
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
				val ? (this.title = "") : (this.title = "拼团活动");
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
	.header-wraper {
		background: url('/static/bg.png');
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		>image{
			width: 188rpx;
			height: 60rpx;
		}
	}
	
</style>
