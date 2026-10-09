<template>
  <view :style="themeStyle" class="container">
    <u-navbar
      title="扫码登录授权"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>
    <view class="wx-auth-container">
      <div class="box">
        <!-- <div v-if="!errorMsg"> -->
        <div>
          <view class="small-tips flex flex-center">
            <u-image
              width="400rpx"
              height="300rpx"
              src="https://lili-system.oss-cn-beijing.aliyuncs.com/confirm.png"
            ></u-image>
            <div>电脑端登录确认</div>
            <div>为确保帐号安全，请确认是您本人操作</div>
          </view>

          <view class="btns">
            <button @click="confirmLogin()" class="btn-auth">确认登录</button>
            <div @click="cancelLogin()" class="btn-callback">取消登录</div>
          </view>
        </div>
      </div>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { forceLogin } from '@/utils/filters.js'
import { scannerCodeLogin, scannerCodeLoginConfirm } from '@/api/login'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const errorMsg = ref('')
const token = ref('')

watch(errorMsg, (val) => {
  if (val) {
    uni.showToast({
      title: val,
      icon: 'none',
    })
  }
})

onLoad((params) => {
  token.value = params.token || ''
  if (!token.value) {
    errorMsg.value = '信息异常'
  }
})

onShow(() => {
  forceLogin()
  scannerCodeLogin({ token: token.value }).then((res) => {
    if (res.data.code == 200) {
      const code = res.data.result
      switch (code) {
        case 0:
        case 1:
          errorMsg.value = ''
          break
        case 2:
        case 3:
          errorMsg.value = '请勿重复扫码'
          break
        case 4:
          errorMsg.value = '二维码已过期，重新扫码'
          break
        default:
          errorMsg.value = '状态异常'
      }
    } else {
      errorMsg.value = res.data.message
    }
  })
})

function confirmLogin() {
  submitLoginConfirm(1)
}

function cancelLogin() {
  submitLoginConfirm(0)
}

function submitLoginConfirm(code: number) {
  scannerCodeLoginConfirm({ token: token.value, code }).then((res) => {
    const title = res.data.success ? '操作成功' : '操作失败'
    uni.showToast({
      title,
      duration: 1500,
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  })
}
</script>
<style lang="scss" scoped>
page {
  background: #fff;
}
</style>
<style lang="scss" scoped>
.container {
  background-color: #fff;
  width: 100vw;
  height: 100vh;
}
.wx-auth-container {
  width: 100%;
  background: #fff;
  margin-top: 20%;
}
text.title,
text.shop {
  display: inline-block;
  font-size: 60rpx;
  color: #333;
}

.box {
  margin: 0 32rpx;
}

/* 文字提示*/
.small-tips {
  width: 100%;

  padding: 20rpx;
  font-size: 29rpx;
  margin: 0 0 20rpx;
  color: #999;
}

.btn-auth {
  width: 92%;
  background: $main-color;
  color: #fff;
  margin: 0 auto 40rpx;
  border-radius: 100px;
}
.btn-callback {
  text-align: center;
  font-size: 30rpx;
  background: #ededed;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 100px;
  width: 92%;
  margin: 0 auto;
}

.btns {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
}
</style>
