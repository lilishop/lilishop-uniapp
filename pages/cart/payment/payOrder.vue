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
<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import * as API_Trade from '@/api/trade'
import { payCallback } from '@/api/members'
import { unitPrice } from '@/utils/filters.js'

const store = useStore()
const { proxy } = getCurrentInstance()!

const routerVal = ref<Record<string, string>>({})
const cashierParams = ref<Record<string, any>>({ price: 0 })
const payList = ref<string[]>([])
const sn = ref('')
const orderType = ref('')
const paymentType = ref('')
const paymentClient = ref('')
const walletValue = ref(0)
const autoCancelTime = ref(0)

onLoad((val) => {
  routerVal.value = val || {}
  // #ifdef APP-PLUS
  paymentType.value = 'APP'
  paymentClient.value = 'APP'
  // #endif
  // #ifdef MP-WEIXIN
  paymentType.value = 'WECHAT_MP'
  paymentClient.value = 'MP'
  // #endif
  // #ifdef H5
  paymentType.value = 'H5'
  paymentClient.value = isWeiXin() ? 'JSAPI' : 'H5'
  // #endif
})

onBackPress((e) => {
  if (e.from == 'backbutton') {
    if (routerVal.value.recharge_sn) {
      uni.switchTab({ url: '/pages/tabbar/user/my' })
    } else {
      uni.navigateTo({ url: '/pages/order/myOrder?status=0' })
    }
    return true
  }
  return false
})

onMounted(() => {
  cashierData()
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function callback(paymentMethod: string) {
  uni.redirectTo({
    url:
      '/pages/cart/payment/success?paymentMethod=' +
      paymentMethod +
      '&payPrice=' +
      cashierParams.value.price +
      '&orderType=' +
      orderType.value,
  })
}

function cashierData() {
  const parms: Record<string, string> = {}

  if (routerVal.value.recharge_sn) {
    sn.value = routerVal.value.recharge_sn
    orderType.value = 'RECHARGE'
  } else if (routerVal.value.trade_sn) {
    sn.value = routerVal.value.trade_sn
    orderType.value = 'TRADE'
  } else {
    sn.value = routerVal.value.order_sn
    orderType.value = 'ORDER'
  }
  parms.sn = sn.value
  parms.orderType = orderType.value
  parms.clientType = paymentType.value

  API_Trade.getCashierData(parms).then((res) => {
    if (res.data.success) {
      cashierParams.value = res.data.result

      // #ifdef MP-WEIXIN
      payList.value = res.data.result.support.filter((item: string) => item != 'ALIPAY')
      // #endif

      if (routerVal.value.recharge_sn) {
        payList.value = res.data.result.support.filter((item: string) => item != 'WALLET')
      } else {
        payList.value = res.data.result.support
      }

      // #ifdef H5
      const ua = window.navigator.userAgent.toLowerCase()
      if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        payList.value = res.data.result.support.filter((item: string) => item != 'ALIPAY')
        if (orderType.value == 'RECHARGE') {
          payList.value = res.data.result.support.filter((item: string) => item == 'WECHAT')
        }
      }
      // #endif

      walletValue.value = res.data.result.walletValue
      const cancelAt = Number(res.data.result.autoCancel)
      autoCancelTime.value = cancelAt > 0 ? Math.max(cancelAt - Date.now(), 0) : 0
    } else if (res.data.code == 32000) {
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/order/myOrder?status=0' })
      }, 500)
    }
  })
}

function awaitPay(payment: string) {
  proxy.$u.throttle(() => {
    pay(payment)
  }, 2000)
}

function padTime(val: number) {
  return String(val != null ? val : 0).padStart(2, '0')
}

function onPayTimeout() {
  uni.showToast({ title: '支付超时，请重新下单', icon: 'none' })
  setTimeout(() => {
    uni.redirectTo({ url: '/pages/order/myOrder?status=0' })
  }, 1500)
}

function goPayError(message = '支付失败，如果您已支付，请勿反复支付') {
  const query = [`orderSn=${encodeURIComponent(sn.value)}`, `message=${encodeURIComponent(message)}`]
  uni.navigateTo({ url: `/pages/cart/payment/error?${query.join('&')}` })
}

async function pay(payment: string) {
  const params = {
    sn: sn.value,
    orderType: orderType.value,
    clientType: paymentType.value,
  }
  const paymentMethod = payment
  const client = paymentClient.value

  uni.showLoading({ title: '正在唤起支付...', mask: true })

  // #ifdef APP-PLUS
  await API_Trade.initiatePay(paymentMethod, client, params).then((signXml) => {
    hideLoadingIfNeeded()
    if (!signXml.data.success) {
      uni.showToast({ title: signXml.data.message, duration: 2000 })
      return
    }
    const payForm = signXml.data.result
    const provider = paymentMethod === 'WECHAT' ? 'wxpay' : 'alipay'
    if (paymentMethod === 'WALLET') {
      uni.showToast({ icon: 'none', title: '支付成功!' })
      callback(paymentMethod)
    } else {
      uni.requestPayment({
        provider,
        orderInfo: payForm || '',
        success: () => {
          uni.showToast({ icon: 'none', title: '支付成功!' })
          callback(paymentMethod)
        },
        fail: () => {
          goPayError()
        },
      })
    }
  })
  // #endif

  // #ifdef H5
  await API_Trade.initiatePay(paymentMethod, client, params).then((res) => {
    const response = res.data
    if (paymentMethod !== 'ALIPAY' && !response.success) {
      uni.showToast({ title: response.message, duration: 2000, icon: 'none' })
      return
    }
    if (paymentMethod === 'ALIPAY') {
      document.write(response)
    } else if (paymentMethod === 'WECHAT') {
      if (isWeiXin()) {
        WeixinJSBridge.invoke('getBrandWCPayRequest', response.result, (payRes: any) => {
          if (payRes.err_msg == 'get_brand_wcpay_request:ok') {
            uni.showToast({ icon: 'none', title: '支付成功!' })
            callback(paymentMethod)
          } else {
            goPayError()
          }
        })
        hideLoadingIfNeeded()
      } else {
        window.location.href = JSON.parse(response.result).h5_url
        const searchParams = { ...params, price: cashierParams.value }
        const timer = setInterval(() => {
          payCallback(searchParams).then((cbRes) => {
            if (cbRes.data.result) {
              clearInterval(timer)
              uni.navigateTo({ url: '/pages/order/myOrder' })
            }
          })
        }, 3000)
        hideLoadingIfNeeded()
      }
    } else if (paymentMethod === 'WALLET') {
      uni.showToast({ title: response.message, icon: 'none' })
      if (response.success) callback(paymentMethod)
    }
  })
  // #endif

  // #ifdef MP-WEIXIN
  await API_Trade.initiatePay(paymentMethod, client, params).then((res) => {
    const response = res.data.result
    if (!res.data.success) {
      uni.showModal({ content: res.data.message, showCancel: false })
      return
    }
    if (paymentMethod === 'WECHAT') {
      uni.requestPayment({
        provider: 'wxpay',
        appid: response.appid,
        timeStamp: response.timeStamp,
        nonceStr: response.nonceStr,
        package: response.package,
        signType: response.signType,
        paySign: response.paySign,
        success: () => {
          uni.showToast({ icon: 'none', title: '支付成功!' })
          callback(paymentMethod)
        },
        fail: () => {
          goPayError()
        },
      })
    } else {
      uni.showToast({ icon: 'none', title: '支付成功!' })
      callback(paymentMethod)
    }
  })
  // #endif
}

function isWeiXin() {
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.match(/MicroMessenger/i) == 'micromessenger'
}
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
