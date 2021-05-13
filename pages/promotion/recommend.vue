<template>
	<view class="recommend" :style="styleWay">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>

		<view class="prohibition" style="overscroll-behavior: unset;">
			<view class="header" :style="'height:' + header.height + 'px;'">
				<view class="left">
					<u-icon @click="goMainPage" size="40" name="arrow-left"></u-icon>
				</view>
				{{ title }}
				<view @click="goCart" class="right"><text class="alifont icon-gouwuche1" style="font-size: 40rpx;"></text></view>
			</view>
		</view>
		<view class="recommend-head" :style="'margin-top:' + header.height + 'px;'">
			<image src="/pages/floor/imgs/recommend/head-sample.png" mode="aspectFill"></image>
		</view>

		<view class="index-navs">
			<ms-dropdown-item class="index-nav" :class="{ 'index-nav-active': nav == 1 }" v-model="sortType" @click.native="handledropdown(1)"
			 :hasSlot="true" :title="sortType || '综合排序'" ref="dropdownItem1">
				<view class="dropdown-item-content">
					<view class="dropdown-list" :class="{ 'dropdown-list-active': sortType == '综合排序' }" @click="setSortType('综合排序')">综合排序</view>
					<view class="dropdown-list" :class="{ 'dropdown-list-active': sortType == '新品排序' }" @click="setSortType('新品排序')">新品排序</view>
				</view>
			</ms-dropdown-item>
			<view class="index-nav-divider"></view>
			<view class="index-nav" :class="{ 'index-nav-active': nav == 3 }" @click="setNav(3)">
				销量
				<view class="index-nav-arrows">
					<view class="index-nav-arrow">
						<image class="img" src="/static/index/arrow-up-1.png" v-if="sale === 'asc'" mode="aspectFit"></image>
						<image class="img" src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
					</view>
					<view class="index-nav-arrow">
						<image class="img" src="/static/index/arrow-down.png" v-if="sale === 'dec'" mode="aspectFit"></image>
						<image class="img" src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
					</view>
				</view>
			</view>
			<view class="index-nav-divider"></view>
			<view class="index-nav" :class="{ 'index-nav-active': nav == 4 }" @click="setNav(4)">
				价格
				<view class="index-nav-arrows">
					<view class="index-nav-arrow">
						<image class="img" src="/static/index/arrow-up-1.png" v-if="price === 'asc'" mode="aspectFit"></image>
						<image class="img" src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
					</view>
					<view class="index-nav-arrow">
						<image class="img" src="/static/index/arrow-down.png" v-if="price === 'dec'" mode="aspectFit"></image>
						<image class="img" src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
					</view>
				</view>
			</view>
			<view class="index-nav-divider"></view>
			<ms-dropdown-item class="index-nav" :class="{ 'index-nav-active': nav == 2 }" @click.native="handledropdown(2)"
			 v-model="current_tag" :hasSlot="true" :title="current_tag || '分类'" ref="dropdownItem2">

				<view class="dropdown-tags">
					<view class="dropdown-tag" :class="{ 'dropdown-tag-active': current_tag == item }" @click="setTags(item)" v-for="(item, index) in tags">{{ item }}</view>
					<view class="dropdown-tag cancel-btn" @click="setTags('分类')">取消</view>
				</view>
			</ms-dropdown-item>
		</view>

		<view class="index-items">
			<view class="index-item" v-for="(item, index) in goods" :key="index">
				<view class="index-item-img" @click="toProduct(item.goods_id)">
					<image :src="item.thumbnail" mode="aspectFill"></image>
					<view class="index-item-title">{{ item.goodsName }}</view>
					<view class="index-item-price">
						¥{{ item.price | unitPrice }}
						<!-- ¥{{ item.price | unitPrice }}{{ item.point ? '+' + item.point + '积分' : '' }} -->
						<span class="tipsMkt">¥{{ item.mktprice }}</span>
					</view>
					<view class="index-item-title-desc">
						<view>已售 {{ item.buy_count }}</view>
						<view>好评率 {{ item.grade }}%</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import msDropdownItem from '@/components/ms-dropdown/dropdown-item.vue';
	import {
		getTagGoods
	} from '@/api/goods.js';
	import storage from '@/utils/storage.js';
	export default {
		components: {
			msDropdownItem
		},
		data() {
			return {
				styleWay: {
					'height': "100%",
					'overflow': 'auto',

				},
				style_flag: false,
				header: {
					top: 0,
					height: 40
				},
				originalGoods: [],

				oldOriginalGoods: [],
				// 分类的数据
				sortData: [],
				goods: [],
				title: '',
				mark: 'hot',
				nav: 1,
				sale: '',
				price: '',
				sortType: '',
				tags: [],
				current_tag: '',
				typeSort1: true,
				typeSort2: false,

			};
		},
		async onLoad(options) {
			if (options.title) {
				this.title = options.title;
			}
			if (options.mark) {
				this.mark = options.mark;
			}
			let response = await getTagGoods(-1, this.mark, 9999);
			this.originalGoods = response.data;
			this.reRank();
			this.initCategory();
		},

		onNavigationBarButtonTap() {
			uni.switchTab({
				url: '/pages/tabbar/cart/cartList'
			});
		},

		methods: {

			handledropdown(val) {

				if (!this.style_flag) {
					
					this.styleWay = {
						'overflow': "hidden",
						'height': "100vh"
					}
				} else {
					
					this.styleWay = {
						'overflow': "auto",
						'height': "100%"
					}
				}

				this.style_flag = !this.style_flag
				// 如果没有值的话就是全部关闭
				if (!val) {
					this.$refs.dropdownItem2.closePopup()
					this.$refs.dropdownItem1.closePopup()

				}
				this.sale = '';
				this.price = '';
				// 如果等于1点击综合排序
				if (val == 1) {
					this.nav = 1
					this.$refs.dropdownItem2.closePopup()

				} else {
					this.nav = 2
					this.$refs.dropdownItem1.closePopup()

				}

				
			},

			async getData() {
				let response = await getTagGoods(-1, this.mark, 9999);
				this.originalGoods = response.data;
				this.reRank();
				this.initCategory();
			},
			toProduct(goods_id) {
				uni.navigateTo({
					url: '/pages/product/goods?id=' + goods_id
				});
			},
			goMainPage() {
				uni.navigateBack()
			},
			goCart() {
				let obj = {
					from: 'recommend',
					id: ''
				};
				storage.setCartBackbtn(obj);
				uni.switchTab({
					url: '/pages/tabbar/cart/cartList'
				});
			},
			// 销量排序
			saleSort(type) {
				type == 'asc' ? this.originalGoods.sort(this.sortAsc('buy_count')) : this.originalGoods.sort(this.sortDec(
					'buy_count'));
			},

			// 价格排序
			priceSort(type) {
				type == 'asc' ? this.originalGoods.sort(this.sortAsc('price')) : this.originalGoods.sort(this.sortDec('price'));
			},

			// 按照分类
			cateSort(type) {
				this.sortData = [];
				// this.originalGoods =[]
				for (let i = 0; i < this.originalGoods.length; i++) {
					if (this.originalGoods[i].category_name == type) {
						this.sortData.push(this.originalGoods[i]);
					}
				}
				this.goods = this.sortData;
			},

			// 降序
			sortDec(prop) {
				return function(obj1, obj2) {
					var val1 = obj1[prop];
					var val2 = obj2[prop];
					if (val1 < val2) {
						return 1;
					} else if (val1 > val2) {
						return -1;
					} else {
						return 0;
					}
				};
			},

			// 升序
			sortAsc(prop) {
				return function(obj1, obj2) {
					var val1 = obj1[prop];
					var val2 = obj2[prop];
					if (val1 < val2) {
						return -1;
					} else if (val1 > val2) {
						return 1;
					} else {
						return 0;
					}
				};
			},

			setNav(type) {
				this.handledropdown();
				this.nav = type;
				if (type == 3) {
					// 销量 默认降序
					this.typeSort1 ? this.setSort('sale', 'dec') : this.setSort('sale', 'asc');

					this.typeSort1 = !this.typeSort1;
				} else if (type == 4) {
					// 价格 默认升序
					this.typeSort2 ? this.setSort('price', 'asc') : this.setSort('price', 'dec');

					this.typeSort2 = !this.typeSort2;
				}
			},
			setSort(key, type) {
				this.handledropdown();
				if (key === 'sale') {
					this.nav = 3;
					this.saleSort(type);

					this.$set(this, 'price', '');
				}
				if (key === 'price') {
					this.nav = 4;
					this.priceSort(type);

					this.$set(this, 'sale', '');
				}

				if (this[key] === type) {
					this.$set(this, key, '');
				} else {
					this.$set(this, key, type);
				}
			},

			//
			setSortType(value) {

				this.nav = 1;
				this.sortType = value;
				// 新品排序
				if (value == '新品排序') {
					this.originalGoods.sort(this.sortDec('goods_id'));
				} else {
					this.getData();
				}

				this.$refs.dropdownItem1.closePopup();

			},
			setTags(value) {



				this.current_tag = value;
				this.$refs.dropdownItem2.closePopup();


				if (value === '分类') {
					this.nav = 1;
					this.reRank();

				} else {
					this.nav = 2;
					this.cateSort(value);

				}
			},
			initCategory() {
				let goods = this.goods;
				let result = [];
				for (var i = 0; i < goods.length; i++) {
					result.push(goods[i].category_name);
				}
				this.tags = this.unique(result);
			},
			unique(arr) {
				for (var i = 0; i < arr.length; i++) {
					for (var j = i + 1; j < arr.length; j++) {
						if (arr[i] == arr[j]) {
							//第一个等同于第二个，splice方法删除第二个
							arr.splice(j, 1);
							j--;
						}
					}
				}
				return arr;
			},
			reRank() {
				this.goods = this.originalGoods;
			}
		}
	};
</script>

<style lang="less" scoped>
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

	.tipsMkt {
		float: right;
		color: #c0c4cc;
		text-decoration: line-through;
		margin-right: 20rpx;
		font-size: 24rpx;
		line-height: 40rpx;
	}

	.img {
		width: 13px !important;
		height: 13px !important;
	}

	.recommend {
		width: 100%;
		padding-top: var(--status-bar-height);
	}

	.recommend-head {
		image {
			width: 3710 rpx;
			height: 280 rpx;
		}
	}

	.index-navs {
		height: 80 rpx;
		padding: 0 52 rpx;
		background-color: #f7f7f7;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
		justify-content: space-between;
	}

	.index-nav {
		color: #999;
		font-size: 28 rpx;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;

		&-active {
			color: #1abc9c;
			font-weight: 700;

			.index-nav-desc {
				color: #1abc9c;
			}
		}
	}

	.index-nav-desc {
		margin-top: 8 rpx;
		font-size: 22 rpx;
		color: #999;
	}

	.index-nav-divider {
		height:  64 rpx;
		border-left: 1px solid #dddcdf;
	}

	.index-items {
		margin-top: 20 rpx;
		padding-left: 20 rpx;
		background-color: #f7f7f7;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
		flex-wrap: wrap;
	}

	.index-item {
		width: 346 rpx;
		background-color: #fff;
		margin: 0 18 rpx 20 rpx 0;
		border-radius: 16 rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.index-item-img {
		image {
			width: 346 rpx;
			height: 320 rpx;
			border-radius: 8rpx 8rpx 0 0;
		}
	}

	.index-item-title {
		font-size: 26 rpx;
		color: #333333;
		padding: 10 rpx 0 0 20 rpx;
		box-sizing: border-box;
		overflow: hidden;

		text-overflow: ellipsis;

		white-space: nowrap;
	}

	.index-item-title-desc {
		font-size: 25 rpx;
		color: #c0c4cc;
		margin: 10rpx 20rpx;
		display: flex;
		justify-content: space-between;
	}

	.index-item-price {
		overflow: hidden;
		font-size: 110 rpx;
		color: #ff5a10;
		padding: 20 rpx 0 0 20 rpx;
	}

	.index-nav-arrows {
		margin-top: 4 rpx;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;
		flex-direction: column;
	}

	.index-nav-arrow {
		image {
			width: 32 rpx;
			height: 32 rpx;
		}
	}

	.index-nav-arrow:last-child {
		margin-top: - 14 rpx;
	}

	.index-nav-arrow:first-child {
		margin-bottom: - 14 rpx;
	}

	.dropdown-list {
		width: 100%;
		height:  88 rpx;
		padding-left: 40 rpx;
		font-size: 110 rpx;
		color: #999;
		font-weight: normal;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;

		&-active {
			color: #1abc9c;
		}
	}

	.dropdown-tags {
		padding: 110 rpx;
		box-sizing: border-box;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
		flex-wrap: wrap;
		z-index: 9;
	}

	.dropdown-tag {
		// width: 710 rpx;
		padding: 10rpx 20rpx;
		height:  60 rpx;
		margin: 0 22 rpx 22 rpx 0;
		border-radius:  60 rpx;
		background-color: #f9f9f9;
		font-size: 110 rpx;
		color: #999;
		  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: center;
  align-items: center;

		&-active {
			background-color: #fff;
			border: 1px solid #ed4743;
			color: #ed4743;
		}
	}

	.cancel-btn {
		background-color: #e4e1e6;
	}
</style>
