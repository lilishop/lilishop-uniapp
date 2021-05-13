<template>
	<view class="container">
		<u-modal v-model="showWxAuth" :title="projectName+'商城'" :show-confirm-button="false">

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
					<text class="title">欢迎进入{{ projectName }}商城</text>

				</view>
				<view class="small-tips">
					<view>为您提供优质服务,{{ projectName }}需要获取以下信息</view>
					<view>您的公开信息（昵称、头像等）</view>
				</view>
				<view class="btns">
					<button type="primary" open-type="getUserInfo" class="btn-auth"
						@getuserinfo="hidenWxAuth()">确认微信授权</button>
				</view>
			</div>
		</view>
	</view>
</template>

<script>
	import {
		mpAutoLogin
	} from "@/api/connect.js";

	import {
		getUserInfo
	} from "@/api/members";
	import storage from "@/utils/storage.js";
	export default {
		data() {
			return {
				show: true,
				// 默认不显示
				showWxAuth: false,
				// 授权信息展示，商城名称
				projectName: "LiLi",
				//微信返回信息，用于揭秘信息，获取sessionkey
				code: '',
				//微信昵称
				nickName: '',
				//微信头像
				image: '',
			};
		},

		components: {},
		props: {},

		methods: {
			hidenWxAuth() {
				this.showWxAuth = true;
				let that = this;
				//------执行Login---------
				uni.login({
					success: (res) => {
						that.code = res.code;
						uni.getUserInfo({
							provider: "weixin",
							success: function(infoRes) {
								that.nickName = infoRes.userInfo.nickName;
								that.image = infoRes.userInfo.avatarUrl;
							},
						});
					},
				});
			},
			getPhoneNumber(e) {
				let iv = e.detail.iv;
				let encryptedData = e.detail.encryptedData;
				if (!e.detail.encryptedData) {
					uni.showToast({
						title: "请授予手机号码获取权限！",
						icon: "none",
					});
					return;
				}
				let code = this.code;
				let image = this.image;
				let nickName = this.nickName;
				mpAutoLogin({
					encryptedData,
					iv,
					code,
					image,
					nickName,
				}).then((res) => {
					storage.setAccessToken(res.data.result.accessToken);
					storage.setRefreshToken(res.data.result.refreshToken);
					// 登录成功
					uni.showToast({
						title: "登录成功!",
						icon: "none",
					});
					//获取用户信息
					getUserInfo().then((user) => {
						storage.setUserInfo(user.data.result);
						storage.setHasLogin(true);
						setTimeout(() => {
							uni.navigateBack({
								delta: 1,
							});
						}, 500);
					});

				});


			},
		},
	};
</script>
<style>
	/*微信授权*/
	page {
		background-color: #ffffff;
	}

	.wx-auth-container {
		width: 100%;
		margin-top: 20%;
	}

	.logo-info {
		display: flex;
		flex-wrap: nowrap;
		justify-content: flex-start;
		flex-direction: row;
		align-items: flex-start;
		padding: 20rpx;

		flex-direction: column;
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
		color: #00a327 !important;
		border: none !important;
		background: #fff !important;
	}

	.btn {
		width: 100%;
		text-align: center;
	}

	.btn-auth {
		width: 92%;
		margin: 0 auto 100rpx;

		border-radius: 100px;
	}

	.btns {
		margin-top: 100rpx;
		display: flex;
		width: 100%;
		justify-content: center;
	}
</style>
