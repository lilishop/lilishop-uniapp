<template>
	<view class="sale">
		<u-navbar title='限时抢购'></u-navbar>
		<view class="header-wraper">
				<image mode="widthFix" src="/static/seckill.png"></image>
		</view>
		<scroll-view scroll-x>
			<view class="index-navs">
				<view class="index-nav-v">
					<view class="index-nav" :class="{ 'index-nav-active': nav == index }"
						@click="clickNavigateTime(index)" v-for="(item, index) in timeLine" :key="index">
						{{ item.timeLine }}:00
						<view class="index-nav-desc">{{ index === 0 && item.distanceStartTime === 0 ? '抢购中' : '即将开始' }}
						</view>
					</view>
				</view>
			</view>
			
		</scroll-view>
		<view class="sale-items" v-if="goodsList.length > 0">
			<goodsTemplate :res="goodsList" />

		</view>
		<view v-else>
			<view class="nodata">
				<image style="height: 240rpx;width: 320rpx;" src="/static/nodata.png" alt="" />
				<div>暂无商品</div>
			</view>
		</view>

	</view>
</template>

<script>
	import {
		getSeckillTimeLine,
		getSeckillTimeGoods
	} from "@/api/promotions.js";
	import Foundation from "@/utils/Foundation.js";
	import goodsTemplate from '@/components/m-goods-list/promotion.vue'
	export default {
		components: {
			goodsTemplate
		},
		data() {
			return {
				nav: 0, //默认选择第一个时间
				timeLine: "", //获取几个点活动
				resTime: 0, //当前时间
				time: 0, //距离下一个活动的时间值
				times: {}, //时间集合
				onlyOne: "", //是否最后一个商品
				goodsList: [], //商品集合
				params: {
					pageNumber: 1,
					pageSize: 10,
				},
			};
		},

		/**
		 * 显示时间活动
		 */
		async onShow() {
			await this.getTimeLine();
			if (!this.timeLine) {
				await uni.showToast({
					icon: "none",
					duration: 2000,
					title: "今天没有活动，明天再来吧",
				});
			}
			this._setTimeInterval = setInterval(() => {
				if (this.time <= 0) {
					clearInterval(this._setTimeInterval);
					this.getGoodsList();
					this.getTimeLine();
				} else {
					this.times = Foundation.countTimeDown(this.time);
					this.time--;
				}
			}, 1000);
		},

		onUnload() {
			this._setTimeInterval && clearInterval(this._setTimeInterval);
		},
		methods: {
			/**
			 * 获取时间线商品
			 */
			async getTimeLine() {
				let res = await getSeckillTimeLine();
				if (res.data.success && res.data.result.length > 0) {
					let timeLine = res.data.result.sort(
						(x, y) => Number(x.timeLine) - Number(y.timeLine)
					);
					this.timeLine = timeLine.slice(0, 5);
					this.resTime = parseInt(new Date().getTime() / 1000);
					this.onlyOne = res.data.result.length === 1;
					this.diffTime = parseInt(new Date().getTime() / 1000) - this.resTime;

					this.time =
						this.timeLine[this.nav].distanceStartTime ||
						(this.timeLine[this.nav + 1] &&
							this.timeLine[this.nav + 1].distanceStartTime) ||
						Foundation.theNextDayTime() - this.diffTime;
					this.times = Foundation.countTimeDown(this.time);

					this.getGoodsList();
				}
			},

			/**
			 * 获取商品集合
			 */
			async getGoodsList() {
				this.params.timeLine = this.timeLine[this.nav].timeLine;
				let res = await getSeckillTimeGoods(this.params.timeLine);
				if (res.data.success && res.data.result.length != 0) {
					this.goodsList = res.data.result;
				} else {
					this.goodsList = [];
				}
			},

    /**
     * 跳转到商品详情
     */
    navigateToGoodsDetail(item) {
      if (
        item.sold_num === item.quantity ||
        this.timeLine[this.nav].distanceStartTime !== 0
      ) {
        return;
      } else {
        uni.navigateTo({
          url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
        });
      }
    },

			/**
			 * 单击导航时间
			 */
			clickNavigateTime(type) {
				this.nav = type;
				this.goodsList = [];
				this.diffTime = parseInt(new Date().getTime() / 1000) - this.resTime;
				this.time =
					this.timeLine[this.nav].distanceStartTime ||
					(this.timeLine[this.nav + 1] &&
						this.timeLine[this.nav + 1].distanceStartTime) ||
					Foundation.theNextDayTime() - this.diffTime;

				this.times = Foundation.countTimeDown(this.time);
				this.getGoodsList();
			},
		},
	};
</script>

<style lang="scss" scoped>
	.sale {
		width: 100%;
		min-height: 100vh;
		background-color: #f7f7f7;
	}

	.nodata {
		flex-direction: column;
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;

		>div {
			font-size: 24rpx;
			margin-top: 20rpx;
			color: #666;
		}
	}

	.header-wraper {
		background: url('/static/bg.png');
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		>image{
			width: 300rpx;
			height: 100rpx;
		}
	}

	.sale-items {
		padding-top: 20rpx;
	}

	.index-navs {
		background: #fff;
		background-color: #f7f7f7;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.index-nav-v {
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.index-nav {
		font-size: 28rpx;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 150rpx;
		flex-direction: column;
		color: #bababa;
		height: 115rpx;
		line-height: 1em;
		position: relative;
		font-size: 32rpx;
		font-weight: bold;

		&-active {
			color: $main-color;
			position: relative;
			z-index: 30;
			.index-nav-desc {
				color: #fff;
				font-weight: bold;
				background: $main-color;
				padding: 6rpx 16rpx;
				border-radius: 50px;
			}
		}
	}

	.index-nav-desc {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #bababa;
	}
</style>
