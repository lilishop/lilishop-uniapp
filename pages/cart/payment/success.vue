<template>
  <div :style="themeStyle" class="wrapper">
    <div class="pay-wrapper">
      <div class="pay-money">
        ￥{{unitPrice(Number(payPrice)) }}
      </div>
      <div class="pay-btns">
        <div v-show="!from" @click="checkOrder">查看{{ orderType == "RECHARGE" ? '余额' : '订单' }}</div>
        <div @click="navigateTo('/pages/tabbar/home/index', 'switch')">回到首页</div>
      </div>
    </div>
    <div class="pay-box">
      <div class="pay-tag-box">
        <h2>订单支付成功!</h2>
        <div class="pay-item">
          <div>
            支付方式：
          </div>
          <div>{{ paymentTypeFilter(paymentMethod) }}</div>
        </div>
      </div>
    </div>
    <goodsRecommend />
  </div>

</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsRecommend from '@/components/m-goods-recommend'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const paymentMethod = ref('')
const from = ref('')
const payPrice = ref<number | string>(0)
const orderType = ref('')

onLoad((options) => {
  paymentMethod.value = options.paymentMethod || ''
  from.value = options.from || ''
  payPrice.value = options.payPrice || 0
  orderType.value = options.orderType || ''
})

function paymentTypeFilter(val: string) {
  switch (val) {
    case 'WECHAT':
      return '微信'
    case 'ALIPAY':
      return '支付宝'
    case 'WALLET':
      return '余额支付'
    default:
      return ''
  }
}

function checkOrder() {
  if (orderType.value == 'RECHARGE') {
    uni.reLaunch({
      url: '/pages/mine/deposit/operation',
    })
    return
  }
  uni.reLaunch({
    url: '/pages/order/myOrder?status=0',
  })
}

function navigateTo(url: string, type?: string) {
  if (type === 'switch') {
    uni.switchTab({ url })
  } else {
    uni.redirectTo({ url })
  }
}
</script><style scoped lang="scss">
.subscribe {
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 40rpx auto;
  padding: 0 20rpx 20rpx;
  width: 80%;
}

.pay-btns {
  display: flex;
  width: 50%;
  justify-content: space-between;
  margin: 0 auto;
  color: #fff;

  >div {
    padding: 6px 12px;
    border: 1px solid #fff;
    border-radius: 100px;
  }
}

.pay-money {
  line-height: 1;
  font-size: 50rpx;
  color: #fff;
  margin-bottom: 100rpx;
}

.pay-item {
  font-weight: bold;
  margin: 32rpx 0;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: var(--theme-primary-70, rgba(255, 60, 42, 0.7));
}

.pay-box {
  overflow: hidden;
}

.pay-tag-box {
  width: 80%;
  margin: 80rpx auto 40rpx auto;
  padding: 20rpx;
  border-radius: 20rpx;
  background: var(--theme-primary-20, rgba(255, 60, 42, 0.2));

  >h2 {
    margin-top: 20rpx;
    font-size: 40rpx;
    color: $main-color;
  }
}

.pay-wrapper {
  background-image: linear-gradient(90deg, $main-color, $light-color, $aider-light-color);
  height: 480rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.pay-box {
  transform: translateY(-100rpx);
  width: 100%;
  background: #fff;
  border-top-right-radius: 100rpx;
}
</style>
