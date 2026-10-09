<template>
	<view :style="themeStyle" class="box">
		<view class="box-tips">
			<h2 class="h2">{{ verificationTitle.title }}</h2>
			<view class="verification">{{ verificationTitle.desc }}</view>
		</view>
		<view class="form">
			<up-form
        :model="codeForm"
        ref="validateCodeForm"
        label-position="left"
        label-width="180rpx"
      >
				<up-form-item label-width="180rpx" label="旧密码">
					<u-input type="password" v-model="oldPassword" placeholder="请输入您的旧密码" />
				</up-form-item>

				<up-form-item label-width="180rpx" label="密码">
					<u-input type="password" v-model="password" placeholder="请输入您的密码" />
				</up-form-item>

				<up-form-item label-width="180rpx" label="确认密码">
					<u-input type="password" v-model="confirmPassword" placeholder="请再次输入您的密码" />
				</up-form-item>

				<view class="submit" @click="updatePassword">修改密码</view>
			</up-form>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { modifyPass } from '@/api/login'
import { md5 } from '@/utils/md5.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const verificationTitle = {
	title: '修改密码',
	desc: '请验证并输入密码',
}
const codeForm = reactive({ mobile: '', code: '' })
const oldPassword = ref('')
const password = ref('')
const confirmPassword = ref('')

function updatePassword() {
	if (password.value !== confirmPassword.value) {
		uni.showToast({ title: '两次输入密码不一致!', icon: 'none' })
		return
	}
	modifyPass({
		password: md5(oldPassword.value),
		newPassword: md5(password.value),
	}).then((res) => {
		if (res.data.success) {
			uni.showToast({ title: '修改成功!', duration: 2000, icon: 'none' })
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 1000)
		}
	})
}
</script>

<style lang="scss" scoped>
@import url("@/pages/passport/login.scss");

::v-deep .u-form-item {
	margin: 40rpx 0;
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
