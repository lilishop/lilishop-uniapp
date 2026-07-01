<template>
  <div class="wrapper">
    <div class="box">
      <div class="block block-1">
        <image class="img" src="@/pages/cart/static/pay.png" />
        <p class="ptips">收银台</p>

        <view class="ptips ptips-countdown">
          剩余支付时间：
          <u-count-down
            v-if="autoCancelTime > 0"
            :time="autoCancelTime"
            format="HH:mm:ss"
            @finish="onPayTimeout"
          >
            <template #default="{ hours, minutes, seconds }">
              <view class="countdown-box">
                <text class="countdown-num">{{ padTime(hours) }}</text>
                <text class="countdown-colon">:</text>
                <text class="countdown-num">{{ padTime(minutes) }}</text>
                <text class="countdown-colon">:</text>
                <text class="countdown-num">{{ padTime(seconds) }}</text>
              </view>
            </template>
          </u-count-down>
          <view v-else class="countdown-box">
            <text class="countdown-num">00</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">00</text>
            <text class="countdown-colon">:</text>
            <text class="countdown-num">00</text>
          </view>
        </view>
        <view class="ptips ptips-price">
          支付金额
          <text class="price-text">¥{{ unitPrice(cashierParams.price) }}</text>
        </view>
      </div>
    </div>
    <div class="__pay_form__">
    </div>
    <div class="block-4" v-if="cashierParams.price > 0">
      <div class="payItem payItem-title">支付方式</div>
      <div
        class="payItem payItem-method"
        v-for="(item, index) in payList"
        :key="index"
        @click="awaitPay(item, index)"
      >
        <view class="method-left">
          <template v-if="item == 'ALIPAY'">
            <u-icon class="method_icon" name="zhifubao-circle-fill" color="#008ffa" size="44"></u-icon>
            <text class="method_name">支付宝</text>
          </template>
          <template v-if="item == 'WECHAT'">
            <u-icon class="method_icon" name="weixin-circle-fill" color="#00c98b" size="44"></u-icon>
            <text class="method_name">微信</text>
          </template>
          <template v-if="item == 'WALLET'">
            <u-icon class="method_icon" name="red-packet-fill" color="#dd6161" size="44"></u-icon>
            <text class="method_name">余额支付(当前余额：¥{{ unitPrice(walletValue) }})</text>
          </template>
        </view>
        <u-icon size="28" color="#b1b1b1" name="arrow-right"></u-icon>
      </div>
    </div>
  </div>
</template>
<script>
	import * as API_Trade from "@/api/trade";
	import {payCallback} from '@/api/members'
	export default {
		data() {
			return {
				//路径传参
				routerVal: "",
				//收银台参数
				cashierParams: "",
				//支付方式集合
				payList: "",
				//支付sn
				sn: "",
				//订单类型
				orderType: "",
				//支付异常
				exception: {},
				//支付表单
				payForm: {},
				//支付类型 APP/WECHAT_MP/H5/NATIVE app/微信小程序/h5/二维码
				paymentType: "",
				// 支付客户端 APP/NATIVE/JSAPI/H5
				paymentClient: "",
				//余额
				walletValue: 0.0,
				// 支付倒计时（毫秒）
				autoCancelTime: 0,
			
			};
		},
		onLoad(val) {
			this.routerVal = val;

			//初始化参数
			// #ifdef APP-PLUS
			this.paymentType = "APP";
			this.paymentClient = "APP";
			//#endif
			// #ifdef MP-WEIXIN
			this.paymentType = "WECHAT_MP";
			this.paymentClient = "MP";
			//#endif
			// #ifdef H5
			this.paymentType = "H5";
			//如果是微信浏览器，则使用公众号支付，否则使用h5，
			// 区别是：h5是通过浏览器外部调用微信app进行支付，而JSAPI则是 在微信浏览器内部，或者小程序 调用微信支付
			this.paymentClient = this.isWeiXin() ? "JSAPI" : "H5";
			//#endif



			// 
		},
		onBackPress(e) {
			if (e.from == "backbutton") {
							if(this.routerVal.recharge_sn){
								uni.switchTab({
									 url: '/pages/tabbar/user/my'
								});
							}
							else{
							uni.navigateTo({
								url: "/pages/order/myOrder?status=0",
							});
							}
							return true; //阻止默认返回行为
							}
		},
		mounted() {
			this.cashierData();
		},
		methods: {

			/**
			 * 支付成功后跳转
			 */
			callback(paymentMethod){
				uni.navigateTo({
					url: "/pages/cart/payment/success?paymentMethod=" +
					paymentMethod +
					"&payPrice=" +
					this.cashierParams.price+
					"&orderType="+this.orderType 
				});
			},
			
			/**
			 * 获取收银详情
			 */
			cashierData() {
				let parms = {};

				if (this.routerVal.recharge_sn) {
					// 判断当前是否是充值
					this.sn = this.routerVal.recharge_sn;
					this.orderType = "RECHARGE";
					
				} else if (this.routerVal.trade_sn) {
					this.sn = this.routerVal.trade_sn;
					this.orderType = "TRADE";
				} else {
					this.sn = this.routerVal.order_sn;
					this.orderType = "ORDER";
				}
				parms.sn = this.sn;
				parms.orderType = this.orderType;
				parms.clientType = this.paymentType;

				API_Trade.getCashierData(parms).then((res) => {
				
					if(res.data.success){
					this.cashierParams = res.data.result;

					// #ifdef MP-WEIXIN
					this.payList = res.data.result.support.filter((item) => {
						return item != "ALIPAY";
					});
					// #endif

					
				  if(this.routerVal.recharge_sn){
						this.payList = res.data.result.support.filter((item) => {
						return item != "WALLET";
					})
					}
					 else{
						this.payList = res.data.result.support;
					}
					// #ifdef H5
					//判断是否微信浏览器
					var ua = window.navigator.userAgent.toLowerCase();
					if (ua.match(/MicroMessenger/i) == 'micromessenger') {
					
						this.payList = res.data.result.support.filter((item) => {
							return item != "ALIPAY";
						});
						// 充值的话仅保留微信支付
						if(this.orderType == "RECHARGE"){
							this.payList = res.data.result.support.filter((item) => {
								return item == "WECHAT";
							});
						}
						
					}
					// #endif
					
				
					

					this.walletValue = res.data.result.walletValue;
					const cancelAt = Number(res.data.result.autoCancel);
					this.autoCancelTime = cancelAt > 0 ? Math.max(cancelAt - Date.now(), 0) : 0;
					}
					else if(res.data.code == 32000){
						setTimeout(()=>{
							uni.redirectTo({
							 url: `/pages/order/myOrder?status=0`
						});
						},500)
						
					}
				});
			},


			awaitPay(payment){
				this.$u.throttle(()=>{
					this.pay(payment)
				}, 2000)
			},

			padTime(val) {
				return String(val ?? 0).padStart(2, '0');
			},

			onPayTimeout() {
				uni.showToast({
					title: '支付超时，请重新下单',
					icon: 'none',
				});
				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/order/myOrder?status=0',
					});
				}, 1500);
			},

			//订单支付
			async pay(payment) {
				
				// 支付编号
				const sn = this.sn;
				// 交易类型【交易号|订单号】
				const orderType = this.orderType;

				const clientType = this.paymentType;
				let params = {
					sn,
					orderType,
					clientType,
				};

				//支付方式 WECHAT/ALIPAY
				const paymentMethod = payment;
				// 客户端类型 APP/NATIVE/JSAPI/H5
				const paymentClient = this.paymentClient;
				
				uni.showLoading({
				  title: "正在唤起支付...",
				  mask:true
				});
				
				// #ifdef APP-PLUS
				//APP pay
				// 初始化支付签名
				await API_Trade.initiatePay(paymentMethod, paymentClient, params).then(
					(signXml) => {
						 if (this.$store.state.isShowToast){ uni.hideLoading() };
						//如果支付异常
						if (!signXml.data.success) {
							uni.showToast({
								title: signXml.data.message,
								duration: 2000
							});
							return;
						}
						
						let payForm = signXml.data.result;
						
						let paymentType = paymentMethod === "WECHAT" ? "wxpay" : "alipay";
						
						if(paymentMethod === "WALLET"){
							uni.showToast({
								icon: "none",
								title: "支付成功!",
							});
							this.callback(paymentMethod)
						}
						else{
							uni.requestPayment({
								provider: paymentType,
								orderInfo: payForm || '',
								success: (e) => {
									uni.showToast({
										icon: "none",
										title: "支付成功!",
									});
									this.callback(paymentMethod)
								},
								fail: (e) => {
									console.log(this);
									this.exception = e;
									uni.showModal({
										content: "支付失败,如果您已支付，请勿反复支付",
										showCancel: false,
									});
								},
							});
						}
					}
				);
				//APP pay
				// #endif

				//#ifdef H5
				//H5 pay
				await API_Trade.initiatePay(paymentMethod, paymentClient, params).then(
					(res) => {
						let response = res.data;
						//如果非支付宝支付才需要进行判定，因为支付宝h5支付是直接输出的，没有返回所谓的消息状态
						if(paymentMethod !== "ALIPAY"){
							//如果支付异常
							if (!response.success) {
								uni.showToast({
									title: response.message,
									duration: 2000,
									icon:"none"
								});
								return;
							}
						}
						if (paymentMethod === "ALIPAY") {
							document.write(response);
						} else if (paymentMethod === "WECHAT") {
							if (this.isWeiXin()) {
								//微信公众号支付
								WeixinJSBridge.invoke(
									"getBrandWCPayRequest",
									response.result,
									(res) => {
										if (res.err_msg == "get_brand_wcpay_request:ok") {
											// 使用以上方式判断前端返回,微信团队郑重提示：
											//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
											uni.showToast({
												icon: "none",
												title: "支付成功!",
											});
											this.callback(paymentMethod)
											 
										} else {
											uni.showModal({
												content: "支付失败,如果您已支付，请勿反复支付",
												showCancel: false,
											});
										}
									}
								);
								 if (this.$store.state.isShowToast){ uni.hideLoading() };
							} else {
								window.location.href = JSON.parse(response.result).h5_url;
								const searchParams = {
									...params,
									price:this.cashierParams,
								}
								const timer = setInterval(()=>{
									payCallback(searchParams).then(res=>{
									if(res.data.result){
										clearTimeout(timer);
										uni.navigateTo({
											url:"/pages/order/myOrder"
										})
									}
								})
								},3000)
								
								 if (this.$store.state.isShowToast){ uni.hideLoading() };		
							}
						} else if (paymentMethod === "WALLET") {
							uni.showToast({
								title: response.message,
								icon: "none",
							});
							if (response.success) {
								this.callback(paymentMethod)
							}
						}
					}
				);
				//H5pay
				// #endif

				//#ifdef MP-WEIXIN
				//微信小程序
				await API_Trade.initiatePay(paymentMethod, paymentClient, params).then(
					(res) => {
						let response = res.data.result;
						//如果支付异常
						if (!res.data.success) {
							uni.showModal({
								content: res.data.message,
								showCancel: false,
							})
							return;
						}
						if (paymentMethod === "WECHAT") {
							uni.requestPayment({
								provider: "wxpay",
								appid: response.appid,
								timeStamp: response.timeStamp,
								nonceStr: response.nonceStr,
								package: response.package,
								signType: response.signType,
								paySign: response.paySign,
								success: (e) => {
									console.log(e);
									uni.showToast({
										icon: "none",
										title: "支付成功!",
									});
									this.callback(paymentMethod)
									 
								},
								fail: (e) => {
									console.log(e);
									this.exception = e;
									uni.showModal({
										content: "支付失败,如果您已支付，请勿反复支付",
										showCancel: false,
									});
								},
							});
						} else {
							uni.showToast({
								icon: "none",
								title: "支付成功!",
							});
							this.callback(paymentMethod)
							 
						}
					}
				);
				// #endif
			},
			isWeiXin() {
				var ua = window.navigator.userAgent.toLowerCase();
				if (ua.match(/MicroMessenger/i) == "micromessenger") {
					return true;
				} else {
					return false;
				}
			},
		},
	};
</script>
<style scoped lang="scss">
.method_icon {
  flex-shrink: 0;
}

.method-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.method_name {
  font-size: 28rpx;
  color: #333;
  padding-left: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payItem {
  padding: 0 30rpx;
  border-top: 1px solid #f5f5f5;
  color: #333;
}

.payItem-title {
  font-size: 28rpx;
  color: #999;
  padding-top: 24rpx;
  padding-bottom: 16rpx;
  border-top: none;
}

.payItem-method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100rpx;
  padding-top: 24rpx;
  padding-bottom: 24rpx;
}

.ptips {
  font-size: 32rpx;
  margin: 20rpx 0;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.ptips-countdown {
  gap: 8rpx;
}

.ptips-price {
  .price-text {
    font-size: 40rpx;
    color: $main-color;
    font-weight: 600;
    margin-left: 10rpx;
  }
}

.countdown-box {
  display: inline-flex;
  align-items: center;
}

.countdown-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44rpx;
  height: 44rpx;
  padding: 0 8rpx;
  font-size: 28rpx;
  color: #008ffa;
  border: 1rpx solid #008ffa;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.countdown-colon {
  margin: 0 6rpx;
  font-size: 28rpx;
  color: #008ffa;
  font-weight: 600;
}

.img {
  width: 392rpx !important;
  height: 296rpx !important;
}

.wrapper {
  min-height: 100vh;
  height: auto;
  background: #f9f9f9;
}

.block-4 {
  background: #fff;
  color: $u-tips-color;

  > p {
    padding: 8rpx;
  }
}

.box {
  background: #fff;
  padding: 40rpx 0;
  //   justify-content: center; //这个是X轴居中
  //   align-items: center; //这个是 Y轴居中
}

.block {
  text-align: center;
  display: block;
  width: 100%;

  image {
    width: 200rpx;
    height: 200rpx;
  }
}

.block-1 {
  margin-top: 80rpx;
}

.btns {
  margin: 0 20rpx;
}
</style>
