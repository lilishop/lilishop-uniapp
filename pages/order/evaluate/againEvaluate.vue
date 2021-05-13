<template>
	<view class="page-main">
		<view class="after-sales-goods-detail-view">
			<view>
				<view class="goods-item-view">
					<view class="goods-img"><u-image width="131rpx" height="131rpx" :src="order.goods_img"></u-image></view>
					<view class="goods-info">
						<view class="goods-title u-line-2">{{ order.goodsName }}</view>
						<view class="goods-specs">/</view>
						<view class="goods-price"></view>
					</view>
					<view class="goods-num"><view></view></view>
				</view>
			</view>
		</view>
		<view class="info-evaluate-view">
			<view class="info-cell">
				<view class="info-cell-title">初评日期：{{ $u.timeFormat(order.create_time, 'yyyy-mm-dd') }}</view>
			</view>
			<view class="info-cell">
				<view class="info-cell-title">初评评价：{{ order.grade_str }}</view>
			</view>
			<view class="info-cell">
				<view class="info-cell-title">初评内容：{{ order.content }}</view>
			</view>
			<view class="info-cell"><view class="info-cell-title">初评审核状态：您的初评审核通过</view></view>
		</view>
		<view class="info-evaluate-view">
			<view class="input-view">
				<u-input
					height="200"
					placeholder-style="font-size:12px;color:#CCCCCC"
					v-model="form[0].content"
					:type="type"
					maxlength="500"
					:border="border"
					:maxlength="maxlength"
					:placeholder="placeholder"
				/>
			</view>
			<view class="input-num">
				<text>{{ form[0].content.length }}/{{ maxlength }}</text>
			</view>
		</view>
		<view class="info-evaluate-view">
			<view class="images-view"><u-upload :action="action" width="150" @on-uploaded="onUploaded" :max-count="5"></u-upload></view>
		</view>
		<view class="submit-view"><u-button shape="circle" style="background-color: #1abc9c;color: #ffffff;" @click="onSubmit">提交</u-button></view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
import { commentsOrder, AppendCommentsOrder } from '@/api/members.js';
import { upload } from '@/api/common.js';

export default {
	data() {
		return {
			value: '',
			type: 'textarea',
			border: false,
			maxlength: 500,
			placeholder: '对评价进行补充，更客观，更全面',
			order: {},
			form: [],
			action: upload
		};
	},
	onLoad(options) {
		this.order = JSON.parse(options.order);
		console.log(this.order);
		let sku = {
			comment_id: this.order.comment_id,
			content: '',
			grade: this.order.grade,
			images: [],
			sku_id: this.order.sku_id
		};
		this.form.push(sku);
	},
	methods: {
		onSubmit() {
			AppendCommentsOrder(this.form).then(res => {
				if(res.statusCode == 200){
					this.$refs.uToast.show({
						title: '发布追评成功',
						type: 'success',
						url: '/pages/order/evaluate/myEvaluate'
					});
				}
			});
		},
		onUploaded(lists) {
			let images = [];
			lists.forEach(item => {
				images.push(item.response.url);
			});
			this.form[0].images = images;
		}
	}
};
</script>

<style lang="scss">
page,
.content {
	background: #f1f1f1;
	height: 100%;
	margin-bottom: 100rpx;
}
.after-sales-goods-detail-view {
	background-color: #f4f4f5;
	.header {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding-bottom: 20rpx;
		.header-text {
			background-color: #f4f4f5;
			padding: 10rpx 30rpx;
			border-radius: 50rpx;
			.seller-name {
				color: #fa3534;
				font-weight: 600;
			}
		}
	}
	.goods-item-view {
		display: flex;
		flex-direction: row;
		padding: 30rpx 30rpx;
		background-color: #eef1f2;
		.goods-img {
		}
		.goods-info {
			padding-left: 30rpx;
			flex: 1;
			.goods-title {
				margin-bottom: 10rpx;
				color: $font-color-dark;
			}
			.goods-specs {
				font-size: 24rpx;
				margin-bottom: 10rpx;
				color: #cccccc;
			}
			.goods-price {
				font-size: 28rpx;
				margin-bottom: 10rpx;
				color: #ff5a10;
			}
		}
		.goods-num {
			width: 60rpx;
			color: $main-color;
		}
	}
	.after-num {
		margin: 0rpx 30rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		height: 80rpx;
	}
}
.goods-evaluate-view {
	margin-top: 8rpx;
	padding: 30rpx;
	margin-bottom: 5rpx;
	background-color: #fff;
	display: flex;
	flex-direction: row;
	align-items: center;
	.goods-view {
		width: 250rpx;
	}
	.rate-view {
		display: flex;
		flex-direction: row;
		align-items: center;
		.rate-btn {
			margin: 0rpx 35rpx;
		}
	}
}
.info-evaluate-view {
	margin: 20rpx 0;
	padding: 30rpx;
	background-color: #fff;
	color: #666666;
	align-items: center;
	.input-view {
		width: 100%;
	}
	.input-num {
		color: #cccccc;
		text-align: right;
	}
	.images-view {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;
	}
	.info-header {
		font-size: 33rpx;
		margin-bottom: 10rpx;
	}
	.seller-rate-view {
		display: flex;
		flex-direction: row;
		align-items: center;
		.rate-title {
			width: 150rpx;
			font-size: 33rpx;
		}
	}
	.info-cell {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin: 8rpx 0rpx;
	}
}
.submit-view {
	margin-top: 100rpx;
	height: 100rpx;
	width: 750rpx;
	align-items: center;
	padding: 10rpx 20rpx;
}
.uni-textarea-wrapper {
	font-size: 24rpx;
}
.u-hairline-border:after{
	border: none;
}
</style>
