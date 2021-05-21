<template>
	<view class="container">
		<view class="wrapper">
			<view class="input-content">
				<view class="input-item" v-if="step === 0">
					<view class="input-item-title">
						<image src="/static/login/user.png"></image>
					</view>
					<input type="text" v-model="form.account" placeholder="请输入账户名" placeholder-class="input-empty" maxlength="11"
					 />
				</view>
				<view class="input-item" v-if="step === 0">
					<view class="input-item-title">
						<image class="img-code-icon" src="/static/login/code.png"></image>
					</view> 
					<input  v-model="form.img_code" placeholder="请输入图片验证码" placeholder-class="input-empty" maxlength="4"
					 @confirm="toLogin" />
					<image :src="validate_url" class="img_code" mode="" @click="getValidImgUrl"></image>
				</view>
				<view class="input-item" v-if="step === 1">
					<view class="input-item-title">
						<image src="/static/login/user.png"></image>
						<view class="phone-number">+86</view>
						<image class="vertical" src="/static/vertical-line.svg"></image>
					</view>
					<input type="mobile" v-model="form.mobile" disabled="true" placeholder="请输入手机号码" placeholder-class="input-empty" maxlength="11"
					 />
				</view>
				<view class="input-item" v-if="step === 1">
					<view class="input-item-title">
						<image class="img-code-icon" src="/static/login/code.png"></image>
					</view>
					<input  v-model="form.img_code_phone" placeholder="请输入图片验证码" placeholder-class="input-empty"
					 maxlength="4" @confirm="toLogin" />
					<image :src="validate_url" class="img_code" mode="" @click="getValidImgUrl"></image>
				</view>
				<view class="input-item" v-if="step === 1">
					<view class="input-item-title">
						<image src="/static/login/pwd2.png"></image>
					</view>
					<input  v-model="form.sms_code" placeholder="请输入验证码" placeholder-class="input-empty" maxlength="4"
					 @confirm="toLogin" />
					<view class="get-captcha" @click="handleGetCapcha">{{ sendTime === 0 ? '获取验证码' : sendTime + 's后重新获取' }}</view>
				</view>
				<view class="input-item" v-if="step === 2">
					<view class="input-item-title">
						<image src="/static/login/pwd2.png"></image>
					</view>
					<input type="password" v-model="form.password" placeholder="请输入新密码" placeholder-class="input-empty" maxlength="20"
					 @confirm="toLogin" />
				</view>
				<view class="input-item" v-if="step === 2">
					<view class="input-item-title">
						<image src="/static/login/pwd2.png"></image>
					</view>
					<input type="password" v-model="form.rep_password" placeholder="请再次输入密码" placeholder-class="input-empty" maxlength="20"
					 @confirm="toLogin" />
				</view>
				<button class="confirm-btn" @click="toNext">{{ step === 0 ? '验证账号' : (step==1?'下一步':'确定') }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		validAccount,
		sendFindPasswordSms,
		validFindPasswordSms,
		changePassword
	} from '@/api/passport.js';
	import {
		getValidateCodeUrl
	} from '@/api/common.js';
	import * as RegExp from '@/utils/RegExp.js';
	export default {
		data() {
			return {
				validate_url: '',
				sendTime: 0,
				form: {},
				step: 0,
			}
		},
		onLoad() {
			this.$nextTick(this.getValidImgUrl)
		},
		methods: {
			handleGetCapcha() {
				if (this.sendTime == 0) {
					sendFindPasswordSms(this.form.uuid,this.form.img_code_phone).then(res => { //发送验证码
						if (res.statusCode == 200) {
							this.sendTime = 60;
							let timer = setInterval(() => {
								this.sendTime--;
								if (this.sendTime === 0) {
									clearInterval(timer);
								}
							}, 1000);
						}
					})
				}
			},
			getValidImgUrl() { //获取图片验证码
				const uuid = this.step === 0 ? '' : this.form.uuid
				this.validate_url = getValidateCodeUrl('FIND_PASSWORD',uuid)
			},
			toNext() {
				// TODO 验证
				if (this.step === 0) {
					const { account,img_code } = this.form
					validAccount(img_code, account).then(res=>{
						if(res.statusCode==200){
							this.step = 1
							this.form.mobile = res.data.mobile
							this.form.uname = res.data.uname
							this.form.uuid = res.data.uuid
						
							this.getValidImgUrl()
						}
						
					});
				} else if (this.step == 1) {
					const { uuid, sms_code } = this.form
					validFindPasswordSms(uuid,sms_code).then((res) => {
						if(res.statusCode==200){
							this.step = 2;
							this.sendTime = 0;
							this.getValidImgUrl()
						}
					  
					})
				}else{
					const { password,uuid,rep_password } = this.form
					if(!password){
						this.$api.msg('请输入密码')
						return;
					}
					if(!RegExp.password.test(password)){
						this.$api.msg('密码应为6-20位英文或数字！')
						return ;
					}
					if(password!=rep_password){
						this.$api.msg('两次输入密码不一致')
						return;
					}
					changePassword(password,uuid).then(res=>{
						if(res.statusCode==200){
							this.$api.msg('修改密码成功！')
							setTimeout(function() {
								uni.reLaunch({
									url:"/pages/passport/login"
								})
							}, 500);
							
						}
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	@import './login.scss';

	.container {
		padding-top: 0;

		.img_code {
			width: 140rpx;
			height: 48rpx;
			margin-right: 20rpx;
		}

		.img-code-icon {
			width: 44rpx;
			height: 35rpx;
		}

		.input-content {
			margin-top: 300rpx;
		}
	}
</style>
