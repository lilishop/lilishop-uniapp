<template>
	<view class="uni-load-more">
		<view class="uni-load-more__img" v-show="status === 'loading' && showIcon">
			<view class="load1">
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
			</view>
			<view class="load2">
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
			</view>
			<view class="load3">
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
				<view class="load-item" :style="{ background: color }"></view>
			</view>
		</view>
		<text class="uni-load-more__text" :style="{ color: color }" v-if="showText">
			{{ status === 'more' ? contentText.contentdown : status === 'loading' ? contentText.contentrefresh : contentText.contentnomore }}
		</text>
	</view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	status?: string
	showIcon?: boolean
	showText?: boolean
	color?: string
	contentText?: {
		contentdown: string
		contentrefresh: string
		contentnomore: string
	}
}>(), {
	status: 'more',
	showIcon: true,
	showText: true,
	color: '#777777',
	contentText: () => ({
		contentdown: '上拉显示更多',
		contentrefresh: '正在加载...',
		contentnomore: '没有更多数据了',
	}),
})
</script>

<style>
@charset "UTF-8";

.uni-load-more {
	display: flex;
	flex-direction: row;
	height: 80rpx;
	align-items: center;
	justify-content: center;
}

.uni-load-more__text {
	font-size: 28rpx;
	color: #999;
}

.uni-load-more__img {
	height: 24px;
	width: 24px;
	margin-right: 10px;
}

.load1,
.load2,
.load3 {
	position: absolute;
}

.load-item {
	width: 6px;
	height: 2px;
	border-top-left-radius: 1px;
	border-bottom-left-radius: 1px;
	background: #999;
	position: absolute;
	opacity: 0.2;
	transform-origin: 50%;
	animation: load 1.56s ease infinite;
}

.load-item:nth-child(1) {
	transform: rotate(90deg);
	top: 2px;
	left: 9px;
}

.load-item:nth-child(2) {
	transform: rotate(180deg);
	top: 11px;
	right: 0;
}

.load-item:nth-child(3) {
	transform: rotate(270deg);
	bottom: 2px;
	left: 9px;
}

.load-item:nth-child(4) {
	top: 11px;
	left: 0;
}

.load1,
.load2,
.load3 {
	height: 24px;
	width: 24px;
}

.load2 {
	transform: rotate(30deg);
}

.load3 {
	transform: rotate(60deg);
}

.load1 .load-item:nth-child(1) {
	animation-delay: 0s;
}

.load2 .load-item:nth-child(1) {
	animation-delay: 0.13s;
}

.load3 .load-item:nth-child(1) {
	animation-delay: 0.26s;
}

.load1 .load-item:nth-child(2) {
	animation-delay: 0.39s;
}

.load2 .load-item:nth-child(2) {
	animation-delay: 0.52s;
}

.load3 .load-item:nth-child(2) {
	animation-delay: 0.65s;
}

.load1 .load-item:nth-child(3) {
	animation-delay: 0.78s;
}

.load2 .load-item:nth-child(3) {
	animation-delay: 0.91s;
}

.load3 .load-item:nth-child(3) {
	animation-delay: 1.04s;
}

.load1 .load-item:nth-child(4) {
	animation-delay: 1.17s;
}

.load2 .load-item:nth-child(4) {
	animation-delay: 1.3s;
}

.load3 .load-item:nth-child(4) {
	animation-delay: 1.43s;
}

@-webkit-keyframes load {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0.2;
	}
}
</style>
