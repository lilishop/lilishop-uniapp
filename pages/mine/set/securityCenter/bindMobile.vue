<template>
	<view :style="themeStyle" class="box">
		<view class="box-tips">
			<h2 class="h2">绑定手机号码</h2>
			<view class="verification"></view>
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

					<view class="submit" @click="submitBindMobile">绑定</view>
					<myVerification
						keep-running
						@send="onVerificationPassed"
						class="verification"
						ref="verificationRef"
						business="BIND_MOBILE"
					/>
				</view>
			</up-form>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, watch, getCurrentInstance, computed } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { sendMobile, bindMobile } from '@/api/login'
import { getUserInfo } from '@/api/members.js'
import storage from '@/utils/storage.js'
import MyVerification from '@/components/verification/verification.vue'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const { proxy } = getCurrentInstance()!

const phoneVerified = ref(false)
const verificationPassed = ref(false)
const codeForm = reactive({
	mobile: '',
	code: '',
})
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

onLoad(() => {})

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
	sendMobile(codeForm.mobile, 'BIND_MOBILE').then((res) => {
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

function submitBindMobile() {
	validateCodeForm.value?.validate((valid: boolean) => {
		if (!valid) return
		bindMobile(codeForm).then((res) => {
			if (res.data.success) {
				phoneVerified.value = true
				getUserInfo().then((userRes) => {
					if (userRes.data.success) {
						storage.setUserInfo(userRes.data.result)
					}
					uni.showToast({ title: '绑定成功!', duration: 2000, icon: 'none' })
					setTimeout(() => {
						uni.navigateBack({ delta: 1 })
					}, 1000)
				})
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

function requestSmsCode() {
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
