<template>
	<view class="index">
		<view v-model="show" class="slot-content">
			<image @click="downLoad()" class="img" :src="imgUrl" />
			<div class="canvas-hide">
				<!-- #ifdef MP-WEIXIN -->
				<canvas id="canvas" type="2d" style="width: 560px; height: 800px" />
				<!-- #endif -->
				<!-- #ifndef MP-WEIXIN -->
				<canvas canvas-id="canvas" id="canvas" style="width: 560px; height: 800px" />
				<!-- #endif -->
			</div>
		</view>
	</view>
</template>
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
// 引入绘制插件
import DrawPoster from "@/js_sdk/u-draw-poster"
// 生成二维码
import uQRCode from '@/components/Sansnn-uQRCode/uqrcode.js'
import logoImg from "@/pages/passport/static/logo-title.png"
import myFaceImg from "@/pages/passport/static/missing-face.png"

const instance = getCurrentInstance()

const props = defineProps<{
	res?: any
}>()

const imgUrl = ref("")
const show = ref(false)
const dp = ref<any>({})
const logo = logoImg
const myFace = myFaceImg
const sharingLink = ref('')

/** 解决微信小程序中图片模糊问题 */
// #ifdef MP-WEIXIN
const st2 = (size: number) => size * 2
// #endif

// #ifndef MP-WEIXIN
const st2 = (size: number) => size
// #endif

/** 保存图片 */
const downLoad = () => {
	uni.saveImageToPhotosAlbum({
		filePath: imgUrl.value,
		success: function () {
			uni.showToast({title: "保存成功！",icon: "none"})
		},
		fail: function () {
			uni.showToast({title: "保存失败，请稍后重试！",icon: "none"})
		},
	})
}

/** 创建canvas */
const init = async () => {
	show.value = true
	dp.value = await DrawPoster.build({
		selector: "canvas",
		componentThis: instance?.proxy,
		loading: true,
		debugging: true,
	})
	let dpVal = dp.value
	// #ifdef MP-WEIXIN
	// 用于微信小程序中画布错乱问题
	dpVal.canvas.width = st2(560)
	dpVal.canvas.height = st2(800)
	// #endif
	await showQRCode(dpVal)
}

/** 生成二维码 */
const showQRCode = async (dp: any) => {
	await uQRCode.make({
		canvasId: 'canvas',
		componentInstance: instance?.proxy,
		text: props.res.bottom.code,
		size: 130,
		margin: 5,
		backgroundColor: '#ffffff',
		foregroundColor: '#000000',
		fileType: 'jpg',
		errorCorrectLevel: 0,
		success: (res: any) => {
			sharingLink.value = res
			draw(dp)
		},
		fail: (_res: any) => {
			// console.log('失败',res)
		}
	})
}

const draw = async (dp: any) => {
	const { face, nickName, desc } = props.res.memberInfo
	const { width, height, background, title } = props.res.container
	const { img, price } = props.res.bottom

	/** 绘制背景 */
	await dp.draw((ctx: any) => {
		ctx.fillStyle = background
		ctx.fillRoundRect(st2(0), st2(0), st2(width), st2(height), st2(12))
		ctx.clip()
	})
	/** 绘制圆角矩形 */
	await dp.draw(async (ctx: any) => {
		ctx.fillStyle = "#ffffff"
		ctx.strokeStyle = "#ffffff"
		ctx.lineWidth = st2(1)
		ctx.fillRoundRect(30, 150, 500, 620, 0)
	})
	/** 绘制图片 */
	dp.draw(async (ctx: any) => {
		await Promise.all([
			ctx.drawImage(face ? face : myFace, st2(30), st2(30), st2(90), st2(90)),
			ctx.drawImage(img, st2(60), st2(170), st2(440), st2(440)),
			ctx.drawImage(sharingLink.value, st2(375), st2(625), st2(130), st2(130))
		])
	})
	/** 绘制顶部文字（昵称 简述） */
	await dp.draw((ctx: any) => {
		ctx.fillStyle = "#666"
		ctx.font = `${st2(24)}px PingFang SC`
		ctx.fillText(nickName, st2(150), st2(65))
		ctx.fillStyle = "#666"
		ctx.font = `${st2(24)}px PingFang SC`
		ctx.fillText(desc, st2(150), st2(105))
	})
	/** 绘制中间文字（商品名称 价格） */
	await dp.draw((ctx: any) => {
		ctx.fillStyle = "#333"
		ctx.font = `bold ${st2(24)}px PingFang SC`
		ctx.textAlign = "left"
		ctx.fillWarpText({
			text: title,
			lineHeight: st2(32),
			maxWidth: st2(280),
			x: st2(60),
			y: st2(710),
			layer: 2,
		})
		ctx.fillStyle = "#ff3c2a"
		ctx.font = `${st2(38)}px PingFang SC`
		ctx.textAlign = "left"
		ctx.fillText(price, st2(60), st2(665))
	})

	// 绘制生成本地地址
	imgUrl.value = await dp.createImagePath()
}

onMounted(() => {
	init()
})
</script>

<style lang="scss" scoped>
page,
.index {
  height: 100%;
}
.canvas-hide {
  /* 1 */
  position: fixed;
  right: 100vw;
  bottom: 100vh;
  /* 2 */
  z-index: -9999;
  /* 3 */
  opacity: 0;
}
.index {
  position: relative;
  text-align: center;
  background: rgba($color: grey, $alpha: 0.2);
}

image {
  display: block;
}
.img {
  width: 560rpx;
  height: 800rpx;
}

.qrcode-content {
	width: 100rpx;
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
