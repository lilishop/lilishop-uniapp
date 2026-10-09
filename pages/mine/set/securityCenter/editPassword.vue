<template>
	<view :style="themeStyle" class="box">
		<view class="box-tips">
			<h2 class="h2">{{ verificationTitle[phoneVerified ? 1 : 0].title }}</h2>
			<view class="verification">{{ verificationTitle[step].desc }}</view>
		</view>
		<view class="form">
			<up-form
        :model="codeForm"
        ref="validateCodeForm"
        label-position="left"
        label-width="180rpx"
      >
				<view v-if="!phoneVerified">
					<up-form-item label-width="180rpx" label="手机号" prop="mobile">
						<u-input maxlength="11" v-model="codeForm.mobile" placeholder="请输入您的手机号" />
					</up-form-item>

					<up-form-item class="sendCode" label-width="180rpx" prop="code" label="验证码">
						<u-input v-model="codeForm.code" placeholder="请输入验证码" />
						<u-code
							unique-key="page-edit"
							:seconds="seconds"
							@end="onCodeCountdownEnd"
							@start="onCodeCountdownStart"
							ref="uCodeRef"
							@change="onCodeTextChange"
						></u-code>
						<view @tap="requestSmsCode" class="text-tips">{{ codeTips }}</view>
					</up-form-item>

					<view class="submit" @click="verifyMobile">验证</view>
					<myVerification
						keep-running
						@send="onVerificationPassed"
						class="verification"
						ref="verificationRef"
						business="FIND_USER"
					/>
				</view>
				<view v-if="phoneVerified">
					<up-form-item label-width="180rpx" label="密码">
						<u-input type="password" v-model="password" placeholder="请输入您的密码" />
					</up-form-item>

					<up-form-item label-width="180rpx" label="确认密码">
						<u-input type="password" v-model="confirmPassword" placeholder="请再次输入您的密码" />
					</up-form-item>

					<view class="submit" @click="updatePassword">修改密码</view>
				</view>
			</up-form>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, watch, getCurrentInstance, computed } from 'vue'
import { onReady } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { isLogin } from '@/utils/filters.js'
import { sendMobile, resetByMobile, resetPassword } from '@/api/login'
import { md5 } from '@/utils/md5.js'
import MyVerification from '@/components/verification/verification.vue'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const { proxy } = getCurrentInstance()!

const phoneVerified = ref(false)
const verificationPassed = ref(false)
const verificationTitle = [
	{ title: '安全验证', desc: '请输入当前手机号进行安全验证' },
	{ title: '修改密码', desc: '请输入新密码' },
]
const step = ref(0)
const codeForm = reactive({ mobile: '', code: '' })
const password = ref('')
const confirmPassword = ref('')
const codeTips = ref('')
const seconds = 69

const validateCodeForm = ref<any>(null)
const uCodeRef = ref<any>(null)
const verificationRef = ref<any>(null)

const codeRules = {
	mobile: [
		{
			validator: (_rule: any, value: string) => proxy.$u.test.mobile(value),
			message: '手机号码不正确',
			trigger: ['blur'],
		},
	],
	code: [
		{
			min: 4,
			max: 6,
			required: true,
			message: '请输入验证码',
			trigger: ['blur'],
		},
	],
}

onReady(() => {
	validateCodeForm.value?.setRules(codeRules)
})

watch(verificationPassed, (val) => {
	if (!val) return
	if (!uCodeRef.value?.canGetCode) {
		proxy.$u.toast('请倒计时结束后再发送')
		return
	}
	uni.showLoading({ title: '正在获取验证码' })
	sendMobile(codeForm.mobile, 'FIND_USER').then((res) => {
		if (store.state.isShowToast) uni.hideLoading()
		if (res.data.success) {
			uCodeRef.value?.start()
		} else {
			uni.showToast({ title: res.data.message, duration: 2000, icon: 'none' })
			verificationPassed.value = false
			verificationRef.value?.getCode()
		}
	})
})

function onVerificationPassed(val: string) {
	verificationPassed.value = val === store.state.verificationKey
}

function updatePassword() {
	if (password.value !== confirmPassword.value) {
		uni.showToast({ title: '两次输入密码不一致!', icon: 'none' })
		return
	}
	resetPassword({ password: md5(password.value) }).then((res) => {
		if (res.data.success) {
			uni.showToast({ title: '修改成功!', duration: 2000, icon: 'none' })
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 1000)
		}
	})
}

function verifyMobile() {
	validateCodeForm.value?.validate((valid: boolean) => {
		if (!valid) return
		resetByMobile(codeForm).then((res) => {
			if (res.data.success) {
				phoneVerified.value = true
				uni.showToast({ title: '验证成功!', icon: 'none' })
			}
		})
	})
}

function onCodeTextChange(text: string) {
	codeTips.value = text
}

function onCodeCountdownEnd() {
	verificationPassed.value = false
	verificationRef.value?.getCode()
}

function isCurrentUserPhone() {
	const user = isLogin()
	if (user?.mobile !== codeForm.mobile) {
		uni.showToast({ title: '请输入当前绑定手机号', icon: 'none' })
		return false
	}
	return true
}

function requestSmsCode() {
	if (!isCurrentUserPhone()) return
	if (codeTips.value === '重新获取') {
		verificationRef.value?.error()
	}
	if (!proxy.$u.test.mobile(codeForm.mobile)) {
		uni.showToast({ title: '请输入正确手机号', icon: 'none' })
		return
	}
	if (!verificationPassed.value) {
		verificationRef.value?.error()
	}
}

function onCodeCountdownStart() {
	proxy.$u.toast('验证码已发送')
	verificationPassed.value = true
	verificationRef.value?.hide()
}
</script>

<style lang="scss" scoped>
@import url("@/pages/passport/login.scss");

::v-deep .u-form-item {
	margin: 40rpx 0;
}

.sendCode {
	::v-deep .u-form-item__body__right__content__slot {
		display: flex;
	}
}

.h2 {
	font-size: 40rpx;
	font-weight: bold;
}

page {
	background: #fff;
}

.box {
	padding: 80rpx 0;
	border-radius: 20rpx;
}

.submit {
	background: $light-color;
}

.box-tips {
	margin: 0 72rpx;
}

.verification {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}
</style>
