<template>
	<view class="content">
		<view class="con" :style="{width: windowWidth + 'px',height: windowHeight + 'px' }"><image :src="imgSrc" mode="scaleToFill" > </image></view>
		<view class="btn" id="timer">
			<view id="info"> </view>
			<view class="circleProgress_wrapper btn">
				<view class="wrapper right"><view class="circleProgress rightcircle"></view></view>
				<view class="wrapper left"><view class="circleProgress leftcircle"></view></view>
			</view>
		</view>
	</view>
</template>

<script>
import { getAdvertisement } from '@/api/home.js';
function getRandom(start, end, fixed = 0) {
	let differ = end - start;
	let random = Math.random();
	return (start + differ * random).toFixed(fixed);
}
export default {
	data() {
		return {
			imgSrc: '',
			windowWidth: 0,
			windowHeight: 0
		};
	},
	onLoad() {
		const res = uni.getSystemInfoSync();
		this.windowWidth = res.windowWidth;
		this.windowHeight = res.windowHeight;
		this.init();
	},
	methods: {
		init() {
			getAdvertisement().then(res => {
				if (res.statusCode === 200) {
					const ads = res.data[getRandom(0, res.data.length - 1)];
					this.imgSrc = ads.pic_url;
					console.warn(this.imgSrc);
				}
			});
		}
	}
};
</script>

<style lang="less" scoped>
.content {
	width: 100%;
	height: 100%;

	.con {
		display: flex;
		align-items: center;

		image {
			width: 100%;
			height: 100%;
		}
	}
}

#timer {
	display: inline-block;
	position: fixed;
	top: 40px;
	right: 10px;
}

#info {
	position: absolute;
	top: 0;
	left: 0;
	width: 36px;
	height: 36px;
	line-height: 36px;
	border-radius: 50%;
	background-color: rgba(0, 0, 0, 0.3);
	text-align: center;
	color: #ffffff;
	font-size: 12px;
}

.circleProgress_wrapper {
	width: 36px;
	height: 36px;
	position: relative;
}

.wrapper {
	width: 18px;
	height: 36px;
	position: absolute;
	top: 0;
	overflow: hidden;
}

.right {
	right: 0;
}

.left {
	left: 0;
}

.circleProgress {
	width: 32px;
	height: 32px;
	border: 2px solid #ffffff;
	border-radius: 50%;
	position: absolute;
	top: 0;
	-webkit-transform: rotate(45deg);
}

.rightcircle {
	border-top: 2px solid #03a9f4;
	border-right: 2px solid #03a9f4;
	right: 0;
	-webkit-animation: circleProgressLoad_right 4s linear;
	/*动画停留在最后一帧*/
	animation-fill-mode: forwards;
	-moz-animation-fill-mode: forwards;
	-webkit-animation-fill-mode: forwards;
	-o-animation-fill-mode: forwards;
}

.leftcircle {
	border-bottom: 2px solid #03a9f4;
	border-left: 2px solid #03a9f4;
	left: 0;
	-webkit-animation: circleProgressLoad_left 4s linear;
	/*动画停留在最后一帧*/
	animation-fill-mode: forwards;
	-moz-animation-fill-mode: forwards;
	-webkit-animation-fill-mode: forwards;
	-o-animation-fill-mode: forwards;
}

@-webkit-keyframes circleProgressLoad_right {
	0% {
		border-top: 2px solid #03a9f4;
		border-right: 2px solid #03a9f4;
		-webkit-transform: rotate(45deg);
	}

	50% {
		border-top: 2px solid #03a9f4;
		border-right: 2px solid #03a9f4;
		border-left: 2px solid #ffffff;
		border-bottom: 2px solid #ffffff;
		-webkit-transform: rotate(225deg);
	}

	100% {
		border-left: 2px solid #ffffff;
		border-bottom: 2px solid #ffffff;
		-webkit-transform: rotate(225deg);
	}
}

@-webkit-keyframes circleProgressLoad_left {
	0% {
		border-bottom: 2px solid #03a9f4;
		border-left: 2px solid #03a9f4;
		-webkit-transform: rotate(45deg);
	}

	50% {
		border-bottom: 2px solid #03a9f4;
		border-left: 2px solid #03a9f4;
		border-top: 2px solid #ffffff;
		border-right: 2px solid #ffffff;
		-webkit-transform: rotate(45deg);
	}

	100% {
		border-top: 2px solid #ffffff;
		border-right: 2px solid #ffffff;
		-webkit-transform: rotate(225deg);
	}
}
</style>
