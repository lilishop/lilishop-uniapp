<template>
	<div :style="themeStyle" class="wrapper">
		<div v-if="!wechatLogin" class="login-body">
			<u-navbar :auto-back="false" :border="false" :fixed="true" :placeholder="true" @leftClick="back"></u-navbar>
			<div class="login-header">
				<div class="title">{{ loginTitleWay[current].title }}</div>
				<div :class="current == 1 ? 'desc-light' : 'desc'">
					{{ loginTitleWay[current].desc
          }}<span v-if="current == 1">{{secrecyMobile(mobile) }}</span>
				</div>
			</div>
			<!-- 手机号 -->
			<div v-show="!enableUserPwdBox" class="login-form-block">
				<div v-show="current == 0">
					<u-input
						border="none"
						:custom-style="inputStyle"
						:placeholder-style="placeholderStyle"
						font-size="40rpx"
						color="#333"
						placeholder="请输入手机号 (11位)"
						class="mobile"
						focus
						v-model="mobile"
						type="number"
						maxlength="11"
					/>
					<div :class="!enableFetchCode ? 'disable' : 'fetch'" @click="fetchCode" class="btn">
						获取验证码
					</div>
				</div>
				<!-- 输入验证码 -->
				<div v-if="current == 1" class="box-code">
					<verifyCode
						type="bottom"
						@confirm="submit"
						boxActiveColor="#D8D8D8"
						v-model="code"
						:is-focus="true"
						boxNormalColor="#D8D8D8"
						cursorColor="#D8D8D8"
					/>

					<view class="fetch-btn" style="display: flex; align-items: center; justify-content: center; width: 370rpx; height: 80rpx; border-radius: 100rpx; background-color: #ff6a00">
						<text @tap="fetchCode" style="color: #fff; font-size: 28rpx; line-height: 80rpx">
							{{ displayCodeTip }}
						</text>
					</view>
				</div>
			</div>

			<!-- 帐号密码登录（小程序不展示） -->
			<!-- #ifndef MP-WEIXIN -->
			<div v-show="enableUserPwdBox">
				<u-input
					border="none"
					:custom-style="inputStyle"
					:placeholder-style="placeholderStyle"
					font-size="40rpx"
					color="#333"
					placeholder="请输入用户名"
					class="mobile"
					focus
					v-model="userData.username"
				/>
				<u-input
					border="none"
					:custom-style="inputStyle"
					:placeholder-style="placeholderStyle"
					font-size="40rpx"
					color="#333"
					placeholder="请输入密码"
					class="mobile"
					focus
					v-model="userData.password"
					type="password"
				/>

				<div :class="!enableUserBtnColor ? 'disable' : 'fetch'" @click="passwordLogin" class="btn">
					帐号密码登录
				</div>
			</div>
			<!-- #endif -->

			<div class="privacy-row" v-show="current != 1">
				<u-checkbox
					class="privacy-check"
					usedAlone
					shape="circle"
					v-model:checked="enablePrivacy"
					:active-color="lightColor"
					:icon-size="18"
				></u-checkbox>
				<div class="tips">
					未注册的手机号验证后将自动创建用户账号，登录即代表您已同意<span @click="navigateToPrivacy('PRIVACY_POLICY')">《隐私协议》</span>
					<span @click="navigateToPrivacy('USER_AGREEMENT')">
						《用户协议》
					</span>
				</div>
			</div>

			<!-- #ifndef MP-WEIXIN -->
			<div v-if="current != 1" class="user-password-tips" @click="enableUserPwdBox = !enableUserPwdBox">
				{{ !enableUserPwdBox ? "帐号密码" : "手机号" }}登录
			</div>
			<!-- #endif -->

			<!-- 第三方登录（小程序不展示微信登录入口） -->
			<!-- #ifndef MP-WEIXIN -->
			<div class="flex login-list">
				<template v-for="(item, index) in loginList" :key="index">
				<div v-if="item.code" :style="{ background: item.color }" class="login-item">
					<u-icon v-if="item.title != 'APPLE'" color="#fff" size="42" :name="item.icon"
						@click="navigateLogin(item)">
					</u-icon>
					<u-image v-else src="/pages/passport/static/appleidButton@2x.png" :lazy-load="false" @click="navigateLogin(item)"
						width="80" height="80" />
				</div>
				</template>
			</div>
			<!-- #endif -->
			<myVerification v-if="codeFlag" @send="handleVerification" class="verification" ref="verification"
				business="LOGIN" />
		</div>
		<view v-else>
			<wechatH5Login />
		</view>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { openIdLogin, loginCallback, webConnect } from '@/api/connect.js'
import api from '@/config/api.js'
import { sendMobile, smsLogin, userLogin } from '@/api/login'
import myVerification from '@/components/verification/verification.vue'
import verifyCode from '@/components/verify-code/verify-code'
import { getUserInfo } from '@/api/members'
import { whetherNavigate } from '@/utils/Foundation'
import storage from '@/utils/storage.js'
import wechatH5Login from './wechatH5Login.vue'
import { md5 } from '@/utils/md5.js'
import { secrecyMobile } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

interface LoginListItem {
	icon: string
	color: string
	title: string
	code: string
	appcode?: string
}

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const { proxy } = getCurrentInstance()!

const lightColor = computed(() => store.getters.lightColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const wechatLogin = ref(false)
const flage = ref(false)
const codeFlag = ref(true)
const tips = ref('')
const enableUserPwdBox = ref(false)
const current = ref(0)
const isCodeCountingDown = ref(false)
const seconds = 60
const remainingCodeSeconds = ref(60)
let codeCountdownTimer: ReturnType<typeof setInterval> | null = null
const displayCodeTip = computed(() => {
	if (isCodeCountingDown.value) return `验证码已发送（${remainingCodeSeconds.value}）`
	return tips.value || '获取验证码'
})
const loginTitleWay = [
	{ title: '欢迎登录', desc: '登录后更精彩，美好生活即将开始' },
	{ title: '请输入验证码', desc: '已经发送验证码至' },
]
const userData = reactive({ username: '', password: '' })
const enableFetchCode = ref(false)
const enableUserBtnColor = ref(false)
const enablePrivacy = ref(false)
const mobile = ref('')
const code = ref('')
const inputStyle = {
	height: '104rpx',
	'border-bottom': '1rpx solid #D8D8D8',
	'letter-spacing': '1rpx',
	padding: '0',
}
const placeholderStyle = 'font-size: 32rpx;line-height: 32rpx;color: #999999;'
const loginList = ref<LoginListItem[]>([
	{ icon: 'weixin-fill', color: '#00a327', title: '微信', code: 'WECHAT' },
	{ icon: 'apple-fill', color: '#000000', title: 'Apple', code: 'APPLE' },
])
const clientType = ref('')

const verification = ref<any>(null)

onBeforeUnmount(() => {
	if (codeCountdownTimer) {
		clearInterval(codeCountdownTimer)
		codeCountdownTimer = null
	}
})

onShow(() => {
	// 只要是app登录的全部清除内容
	// #ifdef APP-PLUS
	storage.setAccessToken('')
	storage.setRefreshToken('')
	storage.setUserInfo({})
	// #endif

	//#ifdef H5
	const isWXBrowser = /micromessenger/i.test(navigator.userAgent)
	if (isWXBrowser) {
		webConnect('WECHAT').then((res) => {
			const data = res.data
			if (data.success) {
				window.location = data.result
			}
		})
	}
	//#endif
})

onMounted(() => {
	// #ifdef H5
	// 判断是否微信浏览器（仅 H5 有 window.navigator）
	const ua = window.navigator.userAgent.toLowerCase()
	if (ua.match(/MicroMessenger/i) == 'micromessenger') {
		wechatLogin.value = true
		return
	}
	clientType.value = 'H5'
	// #endif
	/**
	 * 条件编译判断当前客户端类型
	 */

	//#ifdef APP-PLUS
	clientType.value = 'APP'
	/**如果是app 加载支持的登录方式*/
	uni.getProvider({
		service: 'oauth',
		success: (result) => {
			loginList.value = result.provider
				.filter((value) => value === 'weixin' || value === 'apple')
				.map((value) => {
					let title = ''
					let codeVal = ''
					let color = '#8b8b8b'
					let icon = ''
					switch (value) {
						case 'weixin':
							icon = 'weixin-circle-fill'
							color = '#00a327'
							title = '微信'
							codeVal = 'WECHAT'
							break
						case 'apple':
							icon = 'apple-fill'
							color = '#000000'
							title = 'Apple'
							codeVal = 'APPLE'
							break
					}
					return {
						title,
						code: codeVal,
						color,
						icon,
						appcode: value,
					}
				})
		},
		fail: (error) => {
			uni.showToast({
				title: '获取登录通道失败' + error,
				duration: 2000,
				icon: 'none',
			})
		},
	})
	//#endif

	//微信小程序：仅手机号登录，不展示账号密码/微信第三方入口
	// #ifdef MP-WEIXIN
	clientType.value = 'WECHAT_MP'
	enableUserPwdBox.value = false
	loginList.value = []
	// #endif
})

watch(
	userData,
	() => {
		enableUserBtnColor.value = !!(userData.username && userData.password)
	},
	{ deep: true }
)

watch(mobile, (val) => {
	if (val.length == 11) {
		enableFetchCode.value = true
	}
})

watch(flage, async (val) => {
	if (val) {
		if (enableUserPwdBox.value) {
			submitUserLogin()
			return
		}

		const canSendCode = current.value === 0 || !isCodeCountingDown.value
		if (!canSendCode) {
			proxy.$u.toast('请倒计时结束后再发送')
			return
		}

		uni.showLoading({})
		try {
			const res = await sendMobile(mobile.value)
			if (res.data.success) {
				code.value = ''
				current.value = 1
				startCodeCountdown()
			} else {
				uni.showToast({
					title: res.data.message,
					duration: 2000,
					icon: 'none',
				})
				flage.value = false
				verification.value?.getCode()
			}
		} finally {
			uni.hideLoading()
		}
	} else {
		verification.value?.hide()
	}
})

onLoad((options) => {
	if (options && options.state) {
		stateLogin(options.state as string)
	}
})

function stateLogin(state: string) {
	loginCallback(state).then((res) => {
		const data = res.data
		if (data.success) {
			storage.setAccessToken(data.result.accessToken)
			storage.setRefreshToken(data.result.refreshToken)
			uni.showToast({
				title: '登录成功!',
				icon: 'none',
			})
			getUserInfo().then((user) => {
				if (user.data.success) {
					storage.setUserInfo(user.data.result)
					storage.setHasLogin(true)
				} else {
					setTimeout(() => {
						uni.showToast({
							title: user.data.message,
							icon: 'none',
						})
						storage.setAccessToken('')
						storage.setRefreshToken('')
						uni.switchTab({
							url: '/pages/tabbar/user/my',
						})
					}, 500)
				}
			})
			getCurrentPages().length > 1
				? uni.navigateBack({
						delta: getCurrentPages().length - 2,
					})
				: uni.switchTab({
						url: '/pages/tabbar/home/index',
					})
		}
	})
}

function methodFilter(codes: string[]) {
	const way: LoginListItem[] = []
	loginList.value.forEach((item) => {
		if (codes.length != 0) {
			codes.forEach((val) => {
				if (item.code == val) {
					way.push(item)
				}
			})
		} else {
			uni.showToast({
				title: '配置有误请联系管理员',
				duration: 2000,
				icon: 'none',
			})
		}
	})
	loginList.value = way
}

async function nonH5OpenId(item: LoginListItem) {
	let loginRes: UniApp.LoginRes | null = null
	await uni.login({
		provider: item.appcode,
		// #ifdef MP-ALIPAY
		scopes: 'auth_user',
		// #endif
		success(res) {
			loginRes = res
			uni.setStorageSync('type', item.code)
			// #ifndef MP-WEIXIN
			uni.setStorageSync('openid', res.authResult.openid)
			res.authResult.unionId && uni.setStorageSync('unionId', res.authResult.unionId)
			// #endif
		},
		fail() {
			uni.showToast({
				title: '第三方登录暂不可用！',
				icon: 'none',
				duration: 3000,
			})
		},
		complete() {
			uni.getUserInfo({
				provider: item.appcode,
				success(infoRes) {
					uni.setStorageSync('nickname', infoRes.userInfo.nickName)
					uni.setStorageSync('avatar', infoRes.userInfo.avatarUrl)
					uni.setStorageSync('unionId', infoRes.userInfo.unionId || infoRes.userInfo.unionid)

					// #ifdef MP-WEIXIN
					if (loginRes) {
						weixinMPOpenID(loginRes).then(() => {
							goOpenidLogin('WECHAT_MP')
						})
					}
					// #endif

					// #ifndef MP-WEIXIN
					goOpenidLogin('APP')
					// #endif
				},
			})
		},
	})
}

function goOpenidLogin(loginClientType: string) {
	const params: Record<string, any> = {
		uuid: uni.getStorageSync('openid'),
		source: uni.getStorageSync('type'),
		nickname: uni.getStorageSync('nickname'),
		username: uni.getStorageSync('openid'),
		avatar: uni.getStorageSync('avatar'),
		uniAccessToken: uni.getStorageSync('uni_access_token'),
		type: clientType.value,
		token: { unionId: '', openId: uni.getStorageSync('openid') },
	}
	uni.getStorageSync('unionId')
		? (params.token.unionId = uni.getStorageSync('unionId'))
		: delete params.token

	openIdLogin(params, loginClientType).then((res) => {
		if (!res.data.success) {
			uni.showToast({
				title: '第三方登录暂不可用',
				icon: 'none',
				duration: 3000,
			})
			return
		}
		storage.setAccessToken(res.data.result.accessToken)
		storage.setRefreshToken(res.data.result.refreshToken)
		uni.showToast({
			title: '第三方登录成功!',
			icon: 'none',
		})
		getUserInfo().then((user) => {
			if (user.data.success) {
				storage.setUserInfo(user.data.result)
				storage.setHasLogin(true)
				uni.switchTab({
					url: '/pages/tabbar/home/index',
				})
				if (user.data.result.mobile) {
					whetherNavigate()
				} else {
					uni.navigateTo({
						url: '/pages/passport/bindUserPhone',
					})
				}
			} else {
				setTimeout(() => {
					uni.showToast({
						title: user.data.message,
						icon: 'none',
					})
					storage.setAccessToken('')
					storage.setRefreshToken('')
					uni.switchTab({
						url: '/pages/tabbar/user/my',
					})
				}, 500)
			}
		})
	})
}

async function weixinMPOpenID(res: UniApp.LoginRes) {
	await miniProgramLogin(res.code).then((loginRes) => {
		uni.setStorageSync('openid', loginRes.data)
	})
}

function navigateLogin(connectLogin: LoginListItem) {
	// #ifdef H5
	const codeVal = connectLogin.code
	const buyer = api.buyer
	window.open(buyer + `/passport/connect/connect/login/web/` + codeVal, '_self')
	// #endif
	// #ifdef APP-PLUS
	nonH5OpenId(connectLogin)
	// #endif
}

function submit() {
	storage.setHasLogin(false)
	storage.setAccessToken('')
	storage.setRefreshToken('')
	storage.setUserInfo({})
	smsLogin({ mobile: mobile.value, code: code.value }, clientType.value).then((res) => {
		getUserInfoMethods(res)
	})
}

function getUserInfoMethods(res: any) {
	if (res.data.success) {
		storage.setAccessToken(res.data.result.accessToken)
		storage.setRefreshToken(res.data.result.refreshToken)
		getUserInfo().then((user) => {
			if (user.data.success) {
				storage.setUserInfo(user.data.result)
				storage.setHasLogin(true)
				storage.setAutoCp(0)
				uni.showToast({
					title: '提示',
					content: '登录成功!',
					icon: 'none',
				})
				whetherNavigate()
			} else {
				setTimeout(() => {
					uni.showToast({
						title: user.data.message,
						icon: 'none',
					})
					storage.setAccessToken('')
					storage.setRefreshToken('')
					uni.switchTab({
						url: '/pages/tabbar/user/my',
					})
				}, 500)
			}
		})
	}
}

function handleVerification(val: string) {
	flage.value = val == store.state.verificationKey ? true : false
}

function back() {
	if (current.value === 1) {
		current.value = 0
		code.value = ''
		return
	}
	const pages = getCurrentPages()
	if (pages.length > 1) {
		uni.navigateBack({ delta: 1 })
		return
	}
	uni.switchTab({
		url: '/pages/tabbar/home/index',
	})
}

function navigateToPrivacy(val: string) {
	uni.navigateTo({
		url: '/pages/mine/help/tips?type=' + val,
	})
}

function startCodeCountdown() {
	if (codeCountdownTimer) clearInterval(codeCountdownTimer)
	isCodeCountingDown.value = true
	remainingCodeSeconds.value = seconds
	tips.value = `验证码已发送（${seconds}）`
	codeCountdownTimer = setInterval(() => {
		if (remainingCodeSeconds.value > 1) {
			remainingCodeSeconds.value -= 1
			return
		}
		clearInterval(codeCountdownTimer!)
		codeCountdownTimer = null
		isCodeCountingDown.value = false
		remainingCodeSeconds.value = 0
		tips.value = '重新获取验证码'
		codeFlag.value = true
	}, 1000)
	proxy.$u.toast('验证码已发送')
	flage.value = false
	codeFlag.value = false
	verification.value?.hide()
}

function passwordLogin() {
	if (!enablePrivacy.value) {
		uni.showToast({
			title: '请同意用户隐私',
			duration: 2000,
			icon: 'none',
		})
		return false
	}
	if (!userData.username) {
		uni.showToast({
			title: '请填写用户名',
			duration: 2000,
			icon: 'none',
		})
		return false
	}
	if (!userData.password) {
		uni.showToast({
			title: '请填写密码',
			duration: 2000,
			icon: 'none',
		})
		return false
	}
	if (!flage.value) {
		verification.value?.error()
		return false
	}
}

async function submitUserLogin() {
	const params = JSON.parse(JSON.stringify(userData))
	params.password = md5(params.password)
	try {
		const res = await userLogin(params, clientType.value)
		if (res.data.success) {
			getUserInfoMethods(res)
		} else {
			verification.value?.getCode()
			flage.value = false
		}
	} catch {
		verification.value?.getCode()
	}
}

function fetchCode() {
	if (!enablePrivacy.value) {
		uni.showToast({
			title: '请同意用户隐私',
			duration: 2000,
			icon: 'none',
		})
		return false
	}
	if (!proxy.$u.test.mobile(mobile.value)) {
		uni.showToast({
			title: '请填写正确手机号',
			duration: 2000,
			icon: 'none',
		})
		return false
	}
	if (!flage.value) {
		verification.value?.error()
		return false
	}
}

declare function miniProgramLogin(code: string | undefined): Promise<{ data: any }>
</script>
<style>
	page {
		background: #fff;
	}
</style>
<style lang="scss" scoped>
	.login-body {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.wrapper {
		padding: 0 80rpx;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.login-header {
		padding-top: 64rpx;
	}

	/* #ifdef MP-WEIXIN */
	.login-header {
		padding-top: 96rpx;
	}
	/* #endif */

	.title {
		padding-top: 0;
		font-style: normal;
		line-height: 1.2;
		font-weight: 500;
		font-size: 56rpx;
		color: #333;
	}

	.box-code {
		margin-top: 78rpx;
	}

	.desc,
	.desc-light {
		font-size: 32rpx;
		line-height: 44rpx;
		color: #333333;
		margin-top: 24rpx;
	}

	.desc {
		color: #333;
	}

	.desc-light {
		color: #999999;

		>span {
			color: #333;
			margin-left: 8rpx;
		}
	}

	.login-form-block {
		margin-top: 96rpx;
	}

	.mobile {
		margin-top: 0;
	}

	.disable {
		background: linear-gradient(90deg, #ffdcba 2.21%, #ffcfb2 99.86%);
	}

	.fetch {
		background: linear-gradient(57.72deg, #ff8a19 18.14%, #ff5e00 98.44%);
	}

	.btn {
		border-radius: 100px;
		width: 590rpx;
		margin-top: 97rpx;
		height: 80rpx;
		font-size: 30rpx;
		line-height: 80rpx;
		text-align: center;
		color: #ffffff;
	}

	.tips {
		flex: 1;
		font-size: 24rpx;
		line-height: 36rpx;
		margin-top: 0;
		color: #666;

		>span {
			color: $light-color;
		}
	}

	.privacy-row {
		display: flex;
		align-items: flex-start;
		margin-top: 32rpx;
	}

	.privacy-check {
		flex-shrink: 0;
		margin-top: 4rpx;

		:deep(.u-checkbox) {
			margin: 0;
		}
	}

	.fetch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 370rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background-color: #ff6a00;
		background: linear-gradient(57.72deg, #ff8a19 18.14%, #ff5e00 98.44%);
		border-radius: 100rpx;
		font-size: 28rpx;
		color: #fff;

		margin: 71rpx auto 0 auto;
	}

	.login-list {
		display: flex;
		width: 590rpx;
		margin-top: auto;
		margin-bottom: 80rpx;
		align-items: center;
		justify-content: center;
	}

	.login-item {
		width: 80rpx;
		border-radius: 10rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;

		margin: 0 20rpx;
	}

	.user-password-tips {
		text-align: center;
		color: $light-color;
		margin: 40rpx 0;
		font-size: 28rpx;
	}
</style>
