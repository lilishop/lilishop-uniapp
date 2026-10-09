<template>
	<view :style="themeStyle" class="container">
		<u-navbar :auto-back="false" :fixed="true" :placeholder="true" @leftClick="back" title="小程序登录"></u-navbar>
		<u-modal v-model:show="phoneAuthPopup" :mask-close-able="true" :title="projectName+'商城'"
			:show-confirm-button="false">
			<div class="tips">
				为了更好地用户体验，需要您授权手机号
			</div>
			<button class="register" type="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
				去授权
			</button>
		</u-modal>
		<view class="wx-auth-container">
			<div class="box">
				<view class="logo-info">
					<text class="title">欢迎进入{{ projectName }}</text>
				</view>
				<view class="small-tips">
					<view>为您提供优质服务,{{ projectName }}需要获取以下信息</view>
					<view>您的公开信息（昵称、头像）</view>
				</view>
				<view class="btns">
					<button type="primary" :disabled="logingFlag" bindtap="getUserProfile" @click="getUserProfile()"
						class="btn-auth">登录</button>
					<div @click="goMobileLogin" class="btn-callback">手机号登录</div>
				</view>
				<view class="privacy">
					<view class="privacy-row">
						<u-checkbox
							class="privacy-check"
							usedAlone
							shape="circle"
							v-model:checked="checked"
							:active-color="lightColor"
							:icon-size="18"
						></u-checkbox>
						<view class="privacy-text">
							阅读并同意
							<navigator class="privacy-link" url="/pages/mine/help/tips?type=PRIVACY_POLICY">《隐私协议》</navigator>
							<navigator class="privacy-link" url="/pages/mine/help/tips?type=USER_AGREEMENT">《用户协议》</navigator>
						</view>
					</view>
				</view>
			</div>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/store'
import { mpAutoLogin } from '@/api/connect.js'
import { whetherNavigate } from '@/utils/Foundation'
import { getUserInfo } from '@/api/members'
import storage from '@/utils/storage.js'
import config from '@/config/config'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)

const checked = ref(false)
const configs = config
const phoneAuthPopup = ref(false)
const projectName = ref(config.name)
const code = ref('')
const nickName = ref('')
const logingFlag = ref(false)
const image = ref('')

onMounted(() => {
  uni.showShareMenu({ withShareTicket: true })
  uni.login({
    success: (res) => {
      if (res.errMsg === 'login:ok') {
        code.value = res.code
      } else {
        uni.showToast({
          title: '系统异常，请联系管理员！',
        })
      }
    },
  })
})

function back() {
  whetherNavigate('wx')
}

function goMobileLogin() {
  uni.navigateTo({
    url: '/pages/passport/login',
  })
}

function completeLogin(accessToken: string, refreshToken: string) {
  storage.setAccessToken(accessToken)
  storage.setRefreshToken(refreshToken)
  uni.showToast({
    title: '登录成功!',
    icon: 'none',
  })
  getUserInfo().then((user) => {
    storage.setUserInfo(user.data.result)
    storage.setHasLogin(true)
    uni.navigateBack({ delta: 1 })
  })
}

function getUserProfile() {
  if (!checked.value) {
    uni.showToast({
      title: '请勾选协议',
      icon: 'none',
    })
    return
  }
  logingFlag.value = true

  if (!code.value) return

  uni.getUserProfile({
    desc: '用于完善会员资料',
    success: (res) => {
      nickName.value = res.userInfo.nickName
      image.value = res.userInfo.avatarUrl

      if (configs.enableFetchMobileLogin) {
        phoneAuthPopup.value = true
        return
      }

      mpAutoLogin({
        encryptedData: res.encryptedData,
        iv: res.iv,
        code: code.value,
        image: image.value,
        nickName: nickName.value,
      }).then((apiRes) => {
        completeLogin(apiRes.data.result.accessToken, apiRes.data.result.refreshToken)
      })
    },
    fail: (res) => {
      console.log('fail', res)
    },
  })

  logingFlag.value = false
}

function getPhoneNumber(e: any) {
  const { iv, encryptedData } = e.detail
  if (!encryptedData) {
    uni.showToast({
      title: '请授予手机号码权限，手机号码会和会员系统用户绑定！',
      icon: 'none',
    })
    return
  }

  mpAutoLogin({
    encryptedData,
    iv,
    code: code.value,
    image: image.value,
    nickName: nickName.value,
  }).then((res) => {
    completeLogin(res.data.result.accessToken, res.data.result.refreshToken)
  })
}
</script>
<style lang="scss" scoped>
	/*微信授权*/
	page {
		background-color: #ffffff;
	}

	.wx-auth-container {
		width: 100%;
		padding-top: 120rpx;
	}

	.logo-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: 0 20rpx;
		font-weight: bold;
	}

	image {
		width: 100px;
		height: 100px;
		text-align: center;
		-webkit-transform: scale(2.5);
		transform: scale(2.5);
	}

	.logo-info-img {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		border: none;
	}

	text.title,
	text.shop {
		display: inline-block;
		font-size: 60rpx;
		color: #333;
	}

	text.shop {
		display: inline-block;
		font-size: 55rpx;
		color: #333;
	}

	.box {
		margin: 0 32rpx;
	}

	/* 文字提示*/
	.small-tips {
		width: 94%;
		padding: 20rpx;
		font-size: 24rpx;
		margin: 0 0 20rpx;
		color: #999;
	}

	.auth-button {
		padding: 10px 20px;
		width: calc(100% - 20 * 4rpx);
	}

	.tips {
		width: 80%;
		text-align: left;
		margin: 6% 10%;
		margin-top: 48rpx;
		line-height: 1.75;
	}

	.register {
		color: $weChat-color !important;
		border: none !important;
		background: #fff !important;
	}

.btn-auth {
  width: 92%;
  margin: 0 auto 40rpx;
  border-radius: 100px;
  // animation: mymove 5s infinite;
  // -webkit-animation: mymove 5s infinite; /*Safari and Chrome*/
  // animation-direction: alternate; /*轮流反向播放动画。*/
  // animation-timing-function: ease-in-out; /*动画的速度曲线*/
  // /* Safari 和 Chrome */
  // -webkit-animation: mymove 5s infinite;
  // -webkit-animation-direction: alternate; /*轮流反向播放动画。*/
  // -webkit-animation-timing-function: ease-in-out; /*动画的速度曲线*/
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

	@keyframes mymove {
		0% {
			transform: scale(1);
			/*开始为原始大小*/
		}

		25% {
			transform: scale(1.1);
			/*放大1.1倍*/
		}

		50% {
			transform: scale(1);
		}

		75% {
			transform: scale(1.1);
		}
	}

.privacy {
  margin-top: 32rpx;
  width: 100%;
  display: flex;
  justify-content: center;
}

.privacy-row {
  display: flex;
  align-items: flex-start;
  width: 92%;
}

.privacy-check {
  flex-shrink: 0;
  margin-top: 4rpx;

  ::v-deep .u-checkbox {
    margin: 0;
  }
}

.privacy-text {
  flex: 1;
  margin-left: 12rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  color: #666;
}

.privacy-link {
  display: inline;
  color: $light-color;
}
</style>
