<template>
	<view class="new-goods">
		<view class="status_bar">
			<!-- 这里是状态栏 -->
		</view>
		<!-- 标题栏 -->
		<view class="header">
			<u-icon @click="leftBackBtn" size="40" name="arrow-left"></u-icon>
			<view class="head-bar">
				<view @click="currentIndex=0" :class="{'bar-active':currentIndex==0}">新品</view>
				<view @click="currentIndex=1" :class="{'bar-active':currentIndex==1}">预告</view>
			</view>
			<view @click="goCart" class="alifont icon-gouwuche1" style="font-weight: bold;"></view>
		</view>
		<swiper :current="currentIndex" class="swiper-box" @change="ontabchange" :interval="3000" :duration="500">
			<swiper-item>
				<scroll-view class="scroll-v" lower-threshold="200" enableBackToTop="true" scroll-with-animation scroll-y @scrolltolower="loadMore">
					<!-- 推荐商品图 -->
					<image class="recommend-img" src="/pages/floor/imgs/recommend/head-sample.png"></image>
					<!-- 排序 start-->
					<view class="index-navs">
						<ms-dropdown-item class="index-nav" :class="{ 'index-nav-active': nav == 1 }" v-model="sortType" @click.native="handledropdown(1)"
						 :hasSlot="true" :title="sortType || '综合排序'" :contentTopReduse="44" ref="dropdownItem1">
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
						 v-model="current_tag" :hasSlot="true" :title="current_tag || '分类'" :contentTopReduse="44" ref="dropdownItem2">
							<view class="dropdown-tags">
								<view class="dropdown-tag" :class="{ 'dropdown-tag-active': current_tag == item }" @click="setTags(item)" v-for="(item, index) in tags"
								 :key="index">{{ item }}</view>
								<view class="dropdown-tag cancel-btn" @click="setTags('分类')">取消</view>
							</view>
						</ms-dropdown-item>
					</view>
					<!-- 排序 end-->
					<!-- 商品列表 -->
					<view class="index-items">
						<view class="index-item" v-for="(item, index) in goods" :key="index">
							<view class="index-item-tag">新品</view>
							<view class="index-item-img" @click="toProduct(item.goods_id)">
								<image :src="item.thumbnail" mode="aspectFill"></image>
								<view class="index-item-title">{{ item.goodsName }}</view>
								<view class="index-item-price">
									<!-- ¥{{ item.price | unitPrice }}{{ item.point ? '+' + item.point + '积分' : '' }} -->
									¥{{ item.price | unitPrice }}
									<span class="tipsMkt">¥{{ item.mktprice }}</span>
								</view>
								<view class="index-item-title-desc">
									<view>已售 {{ item.buy_count }}</view>
									<view>好评率 {{ item.grade }}%</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
			
			<swiper-item>
				<scroll-view class="scroll-v" lower-threshold="200" enableBackToTop="true" scroll-with-animation scroll-y @scrolltolower="loadMore">
					<!-- 推荐商品图 -->
					<image class="recommend-img" src="/pages/floor/imgs/recommend/head-sample.png"></image>
					<!-- 排序 start-->
					<view class="index-navs">
						<ms-dropdown-item class="index-nav" :class="{ 'index-nav-active': nav == 1 }" v-model="sortType" @click.native="handledropdown(1)"
						 :hasSlot="true" :title="sortType || '综合排序'" :contentTopReduse="44" ref="dropdownItem11">
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
						 v-model="current_tag" :hasSlot="true" :title="current_tag || '分类'" :contentTopReduse="44" ref="dropdownItem22">
							<view class="dropdown-tags">
								<view class="dropdown-tag" :class="{ 'dropdown-tag-active': current_tag == item }" @click="setTags(item)" v-for="(item, index) in tags"
								 :key="index">{{ item }}</view>
								<view class="dropdown-tag cancel-btn" @click="setTags('分类')">取消</view>
							</view>
						</ms-dropdown-item>
					</view>
					<!-- 排序 end-->
					<!-- 商品列表 -->
					<view class="index-items">
						<view class="index-item" v-for="(item, index) in goods" :key="index">
							<view class="index-item-tag">即将上架</view>
							<view class="index-item-img" @click="toProduct(item.goods_id)">
								<image :src="item.thumbnail" mode="aspectFill"></image>
								<view class="index-item-title">{{ item.goodsName }}</view>
								<view class="index-item-price">
									<!-- ¥{{ item.price | unitPrice }}{{ item.point ? '+' + item.point + '积分' : '' }} -->
									¥{{ item.price | unitPrice }}
									<span class="tipsMkt">¥{{ item.mktprice }}</span>
								</view>
								<view class="index-item-title-desc">
									<view>已售 {{ item.buy_count }}</view>
									<view>好评率 {{ item.grade }}%</view>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
		
	</view>
</template>

<script>
	import msDropdownItem from '@/components/ms-dropdown/dropdown-item.vue';
	import {
		getCategory,
		getTagGoods
	} from '@/api/goods.js';
	import storage from '@/utils/storage.js';
	export default {
		components: {
			msDropdownItem
		},
		data() {
			return {
				currentIndex: 0,
				goods: [],
				originalGoods:[],
				nav: 1,
				sale: '',
				price: '',
				sortType: '',
				tags: [],
				current_tag: '',
				typeSort1: true,
				typeSort2: false
			};
		},
		watch:{
			currentIndex(val,oVal){
				this.nav = 1;
				this.originalGoods = []
				this.getData()
			}
		},
		onLoad(options) {
			this.getData()
			this.initCategory();
		},
		methods: {
			leftBackBtn() { 
				uni.navigateBack()
			},
			toProduct(goods_id) {//跳转商品详情
				uni.navigateTo({
					url: '/pages/product/goods?id=' + goods_id
				});
			},
			goCart() { //跳转购物车
				let obj = {
					from: 'newGoods',
					id: ''
				};
				storage.setCartBackbtn(obj);
				uni.switchTab({
					url: '/pages/tabbar/cart/cartList'
				});
			},
			ontabchange(e){ //swiper切换
				this.currentIndex = e.detail.current
			},
			handledropdown(val) {
				// 如果没有值的话就是全部关闭
				if (!val) {
					this.$refs.dropdownItem2.closePopup()
					this.$refs.dropdownItem1.closePopup()
					this.$refs.dropdownItem22.closePopup()
					this.$refs.dropdownItem11.closePopup()
				}
				this.sale = '';
				this.price = '';
				// 如果等于1点击综合排序
				if (val == 1) {
					this.nav = 1
					this.$refs.dropdownItem2.closePopup()
					this.$refs.dropdownItem22.closePopup()
				} else {
					this.nav = 2
					this.$refs.dropdownItem1.closePopup()
					this.$refs.dropdownItem11.closePopup()
				}
			},
			
			async getData() { //获取数据
				let response = await getTagGoods(-1, this.mark, 9999);
				this.originalGoods.push(...response.data);
				this.reRank();
			},
			loadMore(){ //加载更多
				// this.getData()
			},
			
			cateSort(type) { //按照所选分类过滤，返回过滤后展示列表
				let sortData = [];
				for (let i = 0; i < this.originalGoods.length; i++) {
					if (this.originalGoods[i].category_name == type) {
						sortData.push(this.originalGoods[i]);
					}
				}
				this.goods = sortData;
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

			setNav(type) { //销量，价格的点击方法，升降序
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
			// 销量排序
			saleSort(type) {
				type == 'asc' ? this.originalGoods.sort(this.sortAsc('buy_count')) : this.originalGoods.sort(this.sortDec(
					'buy_count'));
			},
			
			// 价格排序
			priceSort(type) {
				type == 'asc' ? this.originalGoods.sort(this.sortAsc('price')) : this.originalGoods.sort(this.sortDec('price'));
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
				this.$refs.dropdownItem11.closePopup()
			},
			setTags(value) {
				this.current_tag = value;
				this.$refs.dropdownItem2.closePopup();
				this.$refs.dropdownItem22.closePopup()

				if (value === '分类') {
					this.nav = 1;
					this.reRank();
				} else {
					this.nav = 2;
					this.cateSort(value);
				}
			},
			async initCategory() { //初始化分类列表项
				let res = await getCategory();
				if(res.statusCode != 200) return ;
				console.log(res)
				let tags = res.data;
				let result = [];
				for (let i = 0; i < tags.length; i++) {
					result.push(tags[i].name);
				}
				this.tags = this.unique(result);
			},
			unique(arr) { //去重
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
			reRank() { //重置列表数据
				this.goods = this.originalGoods;
			}
		}
	}
</script>
<style>
	page{
		height: 100%;
	}
</style>
<style lang="scss" scoped>
	.status_bar {
		height: var(--status-bar-height);
		width: 100%;
		position: relative;
		background: #1abc9c;
		z-index: 100;
	}

	.new-goods {
		width: 100%;
		height: 100%;
	}

	.header {
		display: flex;
		height: 88rpx;
		width: 750rpx;
		justify-content: space-between;
		align-items: center;
	
		// padding-top: var(--status-bar-height);
		position: relative;
		.u-icon,
		.alifont {
			width: 40rpx;
			margin: 20rpx;
			color: #FFFFFF;
		}

		.head-bar {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;

			view {
				width: 150rpx;
				height: 50rpx;
				line-height: 50rpx;
				text-align: center;
				background-color: #8DDBCB;
				font-size: 28rpx;
			}

			view:nth-child(1) {
				border-radius: 24rpx 0 0 24rpx;
			}

			view:nth-child(2) {
				border-radius: 0 24rpx 24rpx 0;
			}

			.bar-active {
				background-color: #FFFFFF;
			}
		}
	}
	
	.swiper-box {
		height: calc(100% - 88rpx - var(--status-bar-height));
		.scroll-v {
			width: 750rpx;
			height: 100%;
		}
	}
	
	.recommend-img {
		width: 100%;
		height: 280rpx;
	}

	.index-navs {
		height: 80rpx;
		padding: 0 52rpx;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.index-nav {
		color: #999;
		font-size: 28rpx;
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
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #999;
	}

	.index-nav-divider {
		height: 64rpx;
		border-left: 1px solid #dddcdf;
	}

	.index-items {
		margin-top: 20rpx;
		padding-left: 20rpx;
		background-color: #f7f7f7;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.index-item {
		width: 346rpx;
		background-color: #fff;
		margin: 0 18rpx 20rpx 0;
		border-radius: 8rpx;
		box-sizing: border-box;
		// overflow: hidden;
		position: relative;
		&-tag{
			position: absolute;
			right: -8rpx;
			top: -7rpx;
			z-index: 1;
			width: 98rpx;
			height: 40rpx;
			color: #FFFFFF;
			text-align: center;
			font-size: 22rpx;
			line-height: 40rpx;
			background: linear-gradient(194deg,#ff9f0e 7%, #ffbb00 92%);
			border-radius: 0 0 0  20rpx;
			&::after{
				content: "";
				position: absolute;
				top: 40rpx;
				right: 0;
				z-index: 1;
				width: 0;
				height: 0;
				border-top: 8rpx solid #D95E00;
				border-right: 8rpx solid transparent;
			}
		}
	}

	.index-item-img {
		image {
			width: 346rpx;
			height: 320rpx;
			border-radius: 8rpx 8rpx 0 0 ;
		}
	}

	.index-item-title {
		font-size: 26rpx;
		color: #333333;
		padding: 20rpx 0 0 20rpx;
		box-sizing: border-box;
		overflow: hidden;

		text-overflow: ellipsis;

		white-space: nowrap;
	}

	.index-item-title-desc {
		font-size: 24rpx;
		color: #c0c4cc;
		margin: 10rpx 20rpx;
		display: flex;
		justify-content: space-between;
	}

	.index-item-price {
		overflow: hidden;
		font-size: 30rpx;
		color: #ff5a10;
		padding: 20rpx 0 0 20rpx;
	}
	
	.tipsMkt {
		float: right;
		color: #c0c4cc;
		text-decoration: line-through;
		margin-right: 20rpx;
		font-size:24rpx;
		line-height:40rpx;
	}
	
	.index-nav-arrows {
		margin-top: 4rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	.index-nav-arrow {
		image {
			width: 32rpx;
			height: 32rpx;
		}
	}

	.index-nav-arrow:last-child {
		margin-top: -14rpx;
	}

	.index-nav-arrow:first-child {
		margin-bottom: -14rpx;
	}

	.dropdown-list {
		width: 100%;
		height: 88rpx;
		padding-left: 40rpx;
		font-size: 30rpx;
		color: #999;
		font-weight: normal;
		display: flex;
		align-items: center;
		&-active {
			color: #1abc9c;
		}
	}

	.dropdown-tags {
		padding:30rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.dropdown-tag {
		padding: 10rpx 20rpx;
		height: 60rpx;
		margin:0 22rpx 22rpx 0;
		border-radius: 60rpx;
		background-color: #f9f9f9;
		font-size: 30rpx;
		color: #999;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
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
