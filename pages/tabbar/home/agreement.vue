<template>
	<view class="container">
		<view class="status_bar"><!-- 这里是状态栏 --></view>
		<view class="header">{{ agreement.article_name }}</view>
		<view class="u-update-content">
			<view class="about-us"><view v-html="agreement.content"></view></view>
		</view>
		<view class="bottom-btn">
			<view class="disagree-btn">不同意</view>
			<view class="agree-btn" @click="closeModal">同意</view>
		</view>
		<u-loading mode="flower" size="100" :show="loading"></u-loading>
	</view>
</template>

<script>
0;
import { getArticleDetail } from '@/api/article.js';
export default {
	data() {
		return {
			show: true,
			loading: true,
			agreement: {}
		};
	},
	onReady() {
		this.show = true;
	},
	onLoad(options) {
		this.init();
	},
	methods: {
		init() {
			getArticleDetail(111).then(res => {
				if (res.statusCode === 200) {
					this.agreement = res.data;
					this.loading = false;
				}
			});
		},
		cancel() {
			this.closeModal();
		},
		confirm() {
			this.closeModal();
		},
		closeModal() {
			uni.setStorage({
				key: 'launchFlag',
				data: true
			});
			uni.switchTab({
				url: '/pages/tabbar/home/index'
			});
		}
	}
};
</script>

<style scoped lang="scss">
.container {
	background-color: #ffffff;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.status_bar {
	position: fixed;
	top: 0px;
	height: var(--status-bar-height);
	width: 100%;
	background: #1abc9c;
}
.header {
	width: 100%;
	margin-top: var(--status-bar-height);
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 34rpx;
	font-weight: 400;
	height: 100rpx;
}
.u-full-content {
	background-color: #00c777;
}
.bottom-btn {
	position: fixed;
	z-index: 999;
	bottom: 0px;
	left: 0px;
	width: 100%;
	height: 100rpx;
	background-color: #ffffff;
	display: flex;
	align-items: center;
	justify-content: center;

	view {
		width: 50%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.agree-btn {
		background-color: #1abc9c;
		color: #ffffff;
	}
}

.u-update-content {
	padding: 10rpx;
	font-size: 26rpx;
}
</style>
