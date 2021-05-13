<template>
	<view class="storeNew">
		<view class="storeNew-item" v-for="(value, key, index) in upGoodsMap" :key="key">
			<view class="storeNew-item-title">{{ key }}</view>

			<view class="index-items">
				<view class="index-item" v-for="(item, _index) in value" :key="_index" @click="gotoGoodsDetail(item.goods_id)">
					<view class="index-item-img">
						<u-image height="160px" width="173px" class="index-item-store-img" :src="item.thumbnail">
							<u-loading slot="loading"></u-loading>
						</u-image>
						<view class="index-item-title">
							{{ item.name }}
							<view class="index-item-title-desc">{{ item.storeName }}</view>
						</view>
						<!-- <view class="index-item-price">{{ '￥' + item.price }}{{ item.point ? '+'+item.point + '积分' : '' }}</view> -->
						<view class="index-item-price">{{ '￥' + item.price }}</view>
						<!-- <view class="index-item-tags">
							<view class="index-item-tag"><uni-tag text="限购" type="error" :inverted="true" size="small"></uni-tag></view>
							<view class="index-item-tag"><uni-tag text="秒杀" type="error" :inverted="true" size="small"></uni-tag></view>
						</view> -->
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniTag from '@/components/uni-tag/uni-tag.vue';
import { getGoodsListUplog } from '@/api/goods.js';

export default {
	props: {
		storeId: {
			value: Number
		}
	},
	components: {
		uniTag
	},
	data() {
		return {
			params: {
				pageNumber: 1,
				pageSize: 10,
				storeId: this.storeId
			},
			upGoodsMap: {}
		};
	},
	mounted(options) {
		this.initUpGoodsInfo();
	},
	methods: {
		gotoGoodsDetail(id) {
			uni.navigateTo({
				url: `/pages/product/goods?id=${id}`
			});
		},
		initUpGoodsInfo() {
			getGoodsListUplog(this.params).then(res => {
				this.upGoodsMap = res.data;
			})
		}
	}
};
</script>

<style lang="less" scoped>


.storeNew {
	width: 100%;
}

.storeNew-item {
	background-color: #fff;
}
.storeNew-item-title {
	height: 132rpx;
	line-height: 132rpx;
	font-size: 32rpx;
	text-align: center;
	position: relative;
	&:before,
	&:after {
		content: '';
		width: 44rpx;
		height: 6rpx;
		position: absolute;
		background: #f0f1fc;
	}
	&:before {
		top: 63rpx;
		left: 216rpx;
	}
	&:after {
		border-radius: 22rpx 22rpx 0 0;
		top: 63rpx;
		right: 216rpx;
	}
}

.index-items {
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
	min-height: 2610 rpx;
	background-color: #fff;
	margin: 0 18 rpx 20 rpx 0;
	border-radius: 16 rpx;
	box-sizing: border-box;
	overflow: hidden;
}
.index-item-store-img{
	width: 346 rpx !important;
	height: 320 rpx !important;
}
.index-item-img {
	image {
		width: 346 rpx;
		height: 320 rpx;
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
	color: #999999;
	margin-top: 10 rpx;
}
.index-item-price {
	font-size: 110 rpx;
	color: #ff5a10;
	padding: 10 rpx 0 0 20 rpx;
}
.index-item-tags {
	padding-left: 20 rpx;
	padding-top: 10 rpx;
	  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  align-items: center;
	flex-wrap: wrap;
}
.index-item-tag {
	width: 100 rpx;
	margin-right: 10 rpx;
}
</style>
