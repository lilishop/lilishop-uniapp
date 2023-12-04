<template>
	<view class="box">
		<view class="box-tips">
			<h2 class='h2'>
				绑定手机号码
			</h2>
			<view class="verification"></view>
		</view>
		<view class="form">
			<u-form :model="codeForm" ref="validateCodeForm">
				<view v-if="!validateFlage">
					<u-form-item label-width="120" label="手机号" prop="mobile">
						<u-input maxlength="11" v-model="codeForm.mobile" placeholder="请输入您的手机号" />
					</u-form-item>
					
					<u-form-item class="sendCode" label-width="120" prop="code" label="验证码">
						<u-input v-model="codeForm.code" placeholder="请输入验证码" />
						<u-verification-code unique-key="page-edit" :seconds="seconds" @end="end" @start="start"
							ref="uCode" @change="codeChange"></u-verification-code>
						<view @tap="getCode" class="text-tips">{{ tips }}</view>
					</u-form-item>

					<view class="submit" @click="validatePhone">绑定</view>
					<myVerification keep-running @send="verification" class="verification" ref="verification"
						business="BIND_MOBILE" />
				</view>
			</u-form>
		</view>
	</view>
</template>

<script>
	import {
		sendMobile,
		bindMobile
	} from "@/api/login";

	import myVerification from "@/components/verification/verification.vue"; //验证
	import uuid from "@/utils/uuid.modified.js";
	export default {
		components: {
			myVerification,
		},
		data() {
			return {
				uuid,
				validateFlage: false, //是否进行了手机号验证
				step: 0, //当前验证步骤
				flage: false, //是否验证码验证
				codeForm: {
					mobile: "", //手机号
					code: "", //验证码
					username: "", //用户名
				},
				tips: "", //提示
				seconds: 69, // 60s等待时间

				// 验证码登录校验
				codeRules: {
					mobile: [{
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: "手机号码不正确",
						trigger: ["blur"],
					}, ],
					code: [{
						min: 4,
						max: 6,
						required: true,
						message: "请输入验证码",
						trigger: ["blur"],
					}, ],
				},
			};
		},
		onLoad(options) {
		  this.codeForm.username = options.username;
		},
		onReady() {
			// 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
			this.$refs.validateCodeForm.setRules(this.codeRules);
		},
		watch: {
			flage(val) {
				if (val) {
					if (this.$refs.uCode.canGetCode) {
						uni.showLoading({
							title: "正在获取验证码",
						});
						sendMobile(this.codeForm.mobile, "BIND_MOBILE").then((res) => {
							 if (this.$store.state.isShowToast){ uni.hideLoading() };
							// 这里此提示会被this.start()方法中的提示覆盖
							if (res.data.success) {
								this.$refs.uCode.start();
							} else {
								uni.showToast({
									title: res.data.message,
									duration: 2000,
									icon: "none",
								});
								this.flage = false;
								this.$refs.verification.getCode();
							}
						})
					} else {
						this.$u.toast("请倒计时结束后再发送");
					}
				}
			},
		},

		methods: {
			// 验证码验证
			verification(val) {
				this.flage = val == this.$store.state.verificationKey ? true : false;
			},

			// 验证手机号
			validatePhone() {
				this.$refs.validateCodeForm.validate((valid) => {
					if (valid) {
						bindMobile(this.codeForm).then((res) => {
							if (res.data.success) {
								this.validateFlage = !this.validateFlage;
								// 登录成功
								uni.showToast({
									title: "绑定成功!",
									duration: 2000,
									icon: "none",
								});
								setTimeout(() => {
									uni.navigateBack({
										delta: 1,
									});
								}, 1000);
							}
						});
					}
				});
			},

			codeChange(text) {
				this.tips = text;
			},
			end() {
				
				this.flage = false;
					this.$refs.verification.getCode()
			},

			/**获取验证码 */
			getCode() {
				if (this.tips == "重新获取") {
					this.$refs.verification.error(); //发送
				}
				if (!this.$u.test.mobile(this.codeForm.mobile)) {
					uni.showToast({
						title: "请输入正确手机号",
						icon: "none",
					});
					return false;
				}
				if (!this.flage) {
					this.$refs.verification.error(); //发送
					return false;
				}
			},
			start() {
				this.$u.toast("验证码已发送");
				this.flage = true;

				this.$refs.verification.hide();
			},
		},
	};
</script>
<style lang="scss" scoped>
	@import url("@/pages/passport/login.scss");

	/deep/ .u-form-item {
		margin: 40rpx 0;
	}

	.sendCode {
		/deep/ .u-form-item--right__content__slot {
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
