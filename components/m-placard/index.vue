<template>
	<div class="index">
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
	</div>
</template>
<script>
// 引入绘制插件
import DrawPoster from "@/js_sdk/u-draw-poster";
// 生成二维码
import uQRCode from '@/components/Sansnn-uQRCode/uqrcode.js';
import logoImg from "@/pages/passport/static/logo-title.png";
import myFaceImg from "@/pages/passport/static/missing-face.png";

export default {
  data: () => ({
    imgUrl: "", //绘制出来的图片路径
    show: false, //是否展示模态框
    dp: {}, //绘制的dp对象，用于存储绘制等一些方法。
    logo: logoImg, 	// 本地logo地址
	myFace: myFaceImg,	// 本地默认头像
	sharingLink: '',	// 二维码链接
  }),
  props: {
    /**
     * 父级传参的数据
     */
    res: {
      type: null,
      default: "",
    },
  },
  onUnload() {},
  onReady() {},
  methods: {
    /** 解决微信小程序中图片模糊问题 */
    // #ifdef MP-WEIXIN
    st2: (size) => size * 2,
    // #endif

    // #ifndef MP-WEIXIN
    st2: (size) => size,
    // #endif

    /** 保存图片 */
	downLoad() {
		uni.saveImageToPhotosAlbum({
			filePath: this.imgUrl,
			success: function () {
				uni.showToast({title: "保存成功！",icon: "none",});
			},
			fail: function () {
				uni.showToast({title: "保存失败，请稍后重试！",icon: "none",});
			},
		});
	},
    /** 创建canvas */
    async init() {
		this.show = true;
		this.dp = await DrawPoster.build({
			selector: "canvas",
			componentThis: this,
			loading: true,
			debugging: true,
		});
		let dp = this.dp;
		// #ifdef MP-WEIXIN
		// 用于微信小程序中画布错乱问题
		dp.canvas.width = this.st2(560);
		dp.canvas.height = this.st2(800);
		// #endif
		this.showQRCode(dp);
    },
	/** 生成二维码 */
	async showQRCode(dp){
		await uQRCode.make({
			canvasId: 'canvas', // canvas画布
			componentInstance: this, 
			text: this.res.bottom.code, // 二维码内容
			size: 130, // 二维码大小 
			margin: 5, // 二维码内边距
			backgroundColor: '#ffffff', // ！ 二维码背景颜色
			foregroundColor: '#000000', // ！二维码色块颜色
			fileType: 'jpg',
			errorCorrectLevel: 0, // <== 关键 容错率，M:0,L:1,H:2,Q:3,
			// errorCorrectLevel: uQRCode.errorCorrectLevel.M, // <== 关键 容错率，M:0,L:1,H:2,Q:3,
			success: res => {
				this.sharingLink = res; // res => 图片路径
				// 对画布进行绘制
				this.draw(dp);
			},
			fail: res => {
				// console.log('失败',res)
			}
		})
	},
    async draw(dp) {
		const { face, nickName, desc } = this.res.memberInfo;
		const { width, height, background, title } = this.res.container;
		const { code, img, price } = this.res.bottom;

		/** 绘制背景 */
		await dp.draw((ctx) => {
			ctx.fillStyle = background;
			ctx.fillRoundRect( this.st2(0), this.st2(0), this.st2(width), this.st2(height), this.st2(12));
			ctx.clip();
		});
		/** 绘制圆角矩形 */
		await dp.draw(async (ctx)=>{
			// 设置矩形色彩
			ctx.fillStyle = "#ffffff";
			// 设置图形轮廓的颜色。默认情况下，线条和填充颜色都是黑色（CSS 颜色值 #000000）
			ctx.strokeStyle = "#ffffff";
			// 这个属性设置当前绘线的粗细。属性值必须为正数。描述线段宽度的数字。 0、 负数、 Infinity 和 NaN 会被忽略。默认值是1.0。
			ctx.lineWidth = this.st2(1);
			// 进行绘制
			ctx.fillRoundRect(30, 150, 500, 620, 0);
			// ctx.strokeRoundRect(30, 150, 500, 620, 0);
			// ctx.strokeRect(30, 150, 500, 620, 0);
		})
		/** 绘制图片 */
		dp.draw(async (ctx) => {
			await Promise.all([
				// 绘制头像face
				ctx.drawImage(face?face:this.myFace, this.st2(30), this.st2(30), this.st2(90), this.st2(90)),
				// 绘制Logo
				// ctx.drawImage( this.logo, this.st2(175), this.st2(0), this.st2(256), this.st2(144)),
				// 中间图片
				ctx.drawImage(img, this.st2(60), this.st2(170), this.st2(440), this.st2(440)),
				// 二维码
				ctx.drawImage(this.sharingLink, this.st2(375), this.st2(625), this.st2(130), this.st2(130))
			]);
		});
		/** 绘制顶部文字（昵称 简述） */
		await dp.draw((ctx) => {
			ctx.fillStyle = "#666";
			ctx.font = `${this.st2(24)}px PingFang SC`;
			ctx.fillText(nickName, this.st2(150), this.st2(65));
			ctx.fillStyle = "#666";
			ctx.font = `${this.st2(24)}px PingFang SC`;
			ctx.fillText(desc, this.st2(150), this.st2(105));
		});
		/** 绘制中间文字（商品名称 价格） */
		await dp.draw((ctx) => {
			ctx.fillStyle = "#333";
			ctx.font = `bold ${this.st2(24)}px PingFang SC`;
			ctx.textAlign = "left";
			ctx.fillWarpText({
				text: title,
				lineHeight: this.st2(32),
				maxWidth: this.st2(280),
				x: this.st2(60),
				y: this.st2(710),
				layer: 2,
			});
			ctx.fillStyle = "#ff3c2a";
			ctx.font = `${this.st2(38)}px PingFang SC`;
			ctx.textAlign = "left";
			ctx.fillText(price, this.st2(60), this.st2(665));
		});
		/** 绘制底部文字 */
		// await dp.draw((ctx) => {
		// 	ctx.fillStyle = "#666";
		// 	ctx.font = `${this.st2(24)}px PingFang SC`;
		// 	ctx.fillText("长按图片，识别二维码", this.st2(200), this.st2(866));
		// 	ctx.fillStyle = "#666";
		// 	ctx.font = `${this.st2(24)}px PingFang SC`;
		// 	ctx.fillText("查看商品详情", this.st2(200), this.st2(900));
		// });
		
		// 绘制生成本地地址
		this.imgUrl = await dp.createImagePath();
    },
  },

  async mounted() {
    this.init();
  },
};
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
