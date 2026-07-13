<template>

  <div class="index">
    <u-modal v-model:show="show" :show-title="false" :show-confirm-button="false" mask-close-able>
      <view class="slot-content">
        <image @click="downLoad()" class="img" :src="imgUrl" />
        <div class="canvas-hide">
          <!-- #ifdef MP-WEIXIN -->
          <canvas id="canvas" type="2d" style="width: 600px; height: 960px" />
          <!-- #endif -->
          <!-- #ifndef MP-WEIXIN -->
          <canvas canvas-id="canvas" id="canvas" style="width: 600px; height: 960px" />
          <!-- #endif -->
        </div>
      </view>
    </u-modal>

  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
// 引入绘制插件
import DrawPoster from "@/js_sdk/u-draw-poster"
import logoImg from "@/pages/passport/static/logo-title.png"

const instance = getCurrentInstance()

const props = defineProps<{
	res?: any
}>()

const imgUrl = ref("")
const show = ref(false)
const dp = ref<any>({})
const logo = logoImg

/**
 * 解决微信小程序中图片模糊问题
 */
// #ifdef MP-WEIXIN
const st2 = (size: number) => size * 2
// #endif

// #ifndef MP-WEIXIN
const st2 = (size: number) => size
// #endif

/**
 * 保存图片
 */
const downLoad = () => {
  uni.saveImageToPhotosAlbum({
    filePath: imgUrl.value,
    success: function () {
      uni.showToast({
        title: "保存成功！",
        icon: "none",
      })
    },
    fail: function () {
      uni.showToast({
        title: "保存失败，请稍后重试！",
        icon: "none",
      })
    },
  })
}

/**
 * 创建canvas
 */
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
  dpVal.canvas.width = st2(600)
  dpVal.canvas.height = st2(960)
  // #endif
  await draw(dpVal)
}

const draw = async (dp: any) => {
  const { width, height, background, title } = props.res.container
  const { code, img, price } = props.res.bottom

  // /** 绘制背景 */
  await dp.draw((ctx: any) => {
    ctx.fillStyle = background
    ctx.fillRoundRect(
      st2(0),
      st2(0),
      st2(width),
      st2(height),
      st2(12)
    )
    ctx.clip()
  })
  /** 绘制图片 */
  dp.draw(async (ctx: any) => {
    await Promise.all([
      // 绘制Logo
      ctx.drawImage(
        logo,
        st2(175),
        st2(0),
        st2(256),
        st2(144)
      ),
      // 中间图片
      ctx.drawImage(
        img,
        st2(100),
        st2(150),
        st2(400),
        st2(400)
      ),
      // 二维码
      ctx.drawImage(
        code,
        st2(39),
        st2(750),
        st2(150),
        st2(150)
      ),
    ])
  })

  /** 绘制中间文字*/
  await dp.draw((ctx: any) => {
    ctx.fillStyle = "#333"
    ctx.font = `bold ${st2(24)}px PingFang SC`
    ctx.textAlign = "center"
    ctx.fillWarpText({
      text: title,
      maxWidth: st2(500),
      x: st2(300),
      y: st2(600),
      layer: 1,
    })

    ctx.fillStyle = "#ff3c2a"
    ctx.font = `${st2(38)}px PingFang SC`
    ctx.textAlign = "center"
    ctx.fillText(price, st2(300), st2(680))
  })

  // /** 绘制底部文字 */
  await dp.draw((ctx: any) => {
    ctx.fillStyle = "#666"
    ctx.font = `${st2(24)}px PingFang SC`
    ctx.fillText("长按图片，识别二维码", st2(200), st2(866))
    ctx.fillStyle = "#666"
    ctx.font = `${st2(24)}px PingFang SC`
    ctx.fillText("查看商品详情", st2(200), st2(900))
  })

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
  width: 600rpx;
  height: 960rpx;
}
</style>
