<template>
  <div class="wrapper">
    <!-- 选择地址 -->
    <div
      class="address-box"
      @click="clickToAddress()"
      v-if="shippingText == 'LOGISTICS' && !hidePhysicalCheckout"
    >
      <div class="user-box flex">
        <div class="flex-8">
          <div v-if="!address.id">请选择地址</div>
          <div v-else>
            <div class="user-address">
              <!-- 省市区 -->
              <div class="flex flex-a-c">
                <span class="default" v-if="address.isDefault">默认</span>
                <div
                  class="address-list"
                  v-if="address.consigneeAddressPath.length != 0"
                >
                  <span
                    class="address-item"
                    v-for="(item, index) in address.consigneeAddressPath"
                    :key="index"
                  >
                    {{ item }}
                  </span>
                </div>
              </div>
              <!-- 详细地址 -->
              <div class="user-address-detail wes-2">
                {{ address.detail }}
              </div>
              <!-- 姓名 手机号 -->
              <div>
                <span>{{ address.name }}</span>
                <span class="mobile">{{secrecyMobile(address.mobile) }}</span>
              </div>
            </div>
          </div>
        </div>
        <u-icon name="arrow-right" style="color: #bababa"></u-icon>
      </div>
      <!-- 背景 -->
      <div class="bar"></div>
    </div>
    <!-- 选择自提点 -->
    <div class="address-box" v-if="shippingText == 'SELF_PICK_UP' && !hidePhysicalCheckout">
      <div @click="clickToStoreAddress()">
        <div class="user-box flex">
          <div class="flex-8">
            <div v-if="storeAddress">
              <div class="user-address">
                <!-- 自提点地址 -->
                <div class="user-address-detail wes-2">
                  {{ storeAddress.address }}
                </div>
                <!-- 联系手机号 -->
                <div></div>
              </div>
            </div>
            <div v-else>请选择自提点</div>
          </div>
          <u-icon name="arrow-right" style="color: #bababa"></u-icon>
        </div>
        <!-- 背景 -->
        <div class="bar"></div>
      </div>
    </div>

    <!-- 开团信息 -->
    <view class="group-box" v-if="isAssemble">
      <view class="group-title">
        <span v-if="pintuanFlage">你正在开团购买</span>
        <span v-else
          >为你加入仅差<span>{{ routerVal.parentOrder.toBeGroupedNum }}</span
          >人的团购买</span
        >
      </view>
      <view class="group">
        <view>
          <u-image
            borderRadius="50%"
            shape="square"
            class="head-img"
            width="81rpx"
            height="81rpx"
            :src="masterWay.face || userImage"
          ></u-image>
          <view class="btn-one">团长</view>
        </view>
        <view class="line"> </view>
        <view>
          <!-- 如果有最后一名，显示最后一名，没有最后一名，显示等待参团 -->
          <u-image
            class="head-img"
            v-if="endWay.face"
            :src="endWay.face"
            borderRadius="50%"
            shape="square"
            width="81rpx"
            height="81rpx"
          >
            <template #loading><view></view></template>
          </u-image>
          <u-image
            class="head-img"
            borderRadius="50%"
            shape="square"
            v-else
            width="81rpx"
            height="81rpx"
            :src="endWay.face || userImage"
          ></u-image>

          <view class="wait">{{ endWay.nickname || "等待参团" }}</view>
        </view>
      </view>
    </view>

    <!-- 店铺商品信息 -->
    <div
      class="box box2"
      v-for="(item, index) in orderMessage.cartList"
      :key="index"
    >
      <div v-if="item.checked">
        <div @click="navigateToStore(item)">
          <div class="store-name">
            <span>{{ item.storeName }}</span>
          </div>
        </div>
        <div class="promotionNotice">{{ item.promotionNotice || "" }}</div>
        <div
          class="flex goods-item"
          v-for="(val, i) in item.checkedSkuList"
          :key="i"
        >
          <div
            class="goods-image"
            @click="
              navigateTo(
                '/pages/product/goods?id=' +
                  val.goodsSku.id +
                  '&goodsId=' +
                  val.goodsSku.goodsId
              )
            "
            :span="3"
          >
            <u-image
              borderRadius="10rpx"
              width="200rpx"
              height="200rpx"
              :src="val.goodsSku.thumbnail"
              alt
            />
          </div>
          <div
            @click="
              navigateTo(
                '/pages/product/goods?id=' +
                  val.goodsSku.id +
                  '&goodsId=' +
                  val.goodsSku.goodsId
              )
            "
            class="goods-detail"
          >
            <div class="flex">
              <p class="goods-name">{{ val.goodsSku.goodsName }}</p>
              <span class="nums">x{{ val.num }}</span>
            </div>
            <p class="goods-prices">
              <span>￥</span>
              <span class="goods-price">{{
                goodsFormatPrice(val.purchasePrice)[0]
              }}</span>
              <span
                >.{{
                  goodsFormatPrice(val.purchasePrice)[1]
                }}</span
              >
            </p>
          </div>
        </div>
        <u-row>
          <u-col :offset="0" :span="4">发票信息</u-col>
          <u-col
            :span="8"
            class="tipsColor"
            textAlign="right"
            @click="invoice()"
          >
            <span v-if="receiptList"
              >{{ receiptList.receiptTitle }} -
              {{ receiptList.receiptContent }}</span
            >
            <span v-else>不开发票</span>
          </u-col>
        </u-row>
        <u-row>
          <u-col
            v-if="!hidePhysicalCheckout"
            :offset="0"
            :span="9"
            @click="shippingFlag = true"
            >配送
          </u-col>
          <u-col
            v-if="!hidePhysicalCheckout"
            :span="3"
            textAlign="right"
            @click="shippingFlag = true"
          >
            {{
              getShippingLabel()
            }}
          </u-col>
        </u-row>
        <u-row>
          <u-col :offset="0" :span="4" class="tl">备注信息</u-col>
          <u-col :span="8" textAlign="right" class="remark-col">
            <u-input
              class="uinput"
              v-model="remarkVal[index].remark"
              border="none"
              input-align="right"
              placeholder="请输入备注信息"
            />
          </u-col>
        </u-row>
      </div>
    </div>

    <!-- 发票信息 -->
    <invoices
      :res="receiptList"
      @callbackInvoice="callbackInvoice"
      v-if="invoiceFlag"
    />
    <u-picker
      v-model:show="shippingFlag"
      v-if="shippingMethod.length != 0"
      :columns="[shippingMethod]"
      keyName="label"
      valueName="value"
      title="配送方式"
      @confirm="confirmDistribution"
    ></u-picker>

    <div class="box box5" v-if="orderMessage.priceDetailDTO">
      <div>
        <u-row>
          <u-col :span="9">商品合计</u-col>
          <u-col :span="3" textAlign="right">
            <span
              >￥{{unitPrice(orderMessage.priceDetailDTO.goodsPrice) }}</span
            >
          </u-col>
        </u-row>
      </div>
      <div>
        <u-row v-if="shippingText == 'LOGISTICS'">
          <u-col v-if="!hidePhysicalCheckout" :span="7"
            >运费</u-col
          >
          <u-col
            v-if="!hidePhysicalCheckout"
            :span="5"
            class="tr tipsColor"
            textAlign="right"
          >
            <span v-if="orderMessage.priceDetailDTO.freightPrice == 0"
              >包邮</span
            >
            <span v-else
              >￥{{unitPrice(orderMessage.priceDetailDTO.freightPrice)
              }}</span
            >
          </u-col>
        </u-row>
      </div>
      <u-row
        v-if="
          orderMessage.priceDetailDTO.goodsPrice != 0 &&
          orderMessage.priceDetailDTO.goodsPrice != null
        "
      >
        <u-col :offset="0" :span="8" @click="GET_Discount()">优惠券</u-col>
        <u-col
          :span="4"
          v-if="
            orderMessage.priceDetailDTO &&
            orderMessage.priceDetailDTO.couponPrice
          "
          textAlign="right"
          @click="GET_Discount()"
        >
          <span class="main-color"
            >-￥{{unitPrice(orderMessage.priceDetailDTO.couponPrice) }}</span
          >
        </u-col>
        <!--unitPrice(orderMessage.priceDetailDTO.couponPrice)  -->
        <u-col :span="4" v-else textAlign="right" class="coupon-col" @click="GET_Discount()">
          <view class="coupon-col__content">
            <text>{{ orderMessage.canUseCoupons.length || "0" }} 张可用</text>
            <u-icon name="arrow-right" size="14" color="#909399"></u-icon>
          </view>
        </u-col>
      </u-row>
      <div>
        <u-row>
          <u-col :span="9">优惠金额</u-col>
          <u-col
            :span="3"
            textAlign="right"
            v-if="orderMessage.priceDetailDTO.couponPrice"
          >
            <span class="main-color">
              -￥{{unitPrice(orderMessage.priceDetailDTO.couponPrice) }}</span
            >
          </u-col>
          <u-col :span="3" textAlign="right" v-else>0.00</u-col>
        </u-row>
      </div>
      <div>
        <u-row>
          <u-col :span="6">活动优惠</u-col>
          <u-col :span="6" class="tr tipsColor" textAlign="right">
            <span v-if="orderMessage.priceDetailDTO.discountPrice"
              >-￥{{unitPrice(orderMessage.priceDetailDTO.discountPrice)
              }}</span
            >
            <span v-else>0.00</span>
          </u-col>
        </u-row>
      </div>
      <div v-if="giftCardList.length || giftCardDeductAmount > 0">
        <u-row>
          <u-col :span="6">礼品卡</u-col>
          <u-col :span="6" class="tr tipsColor" textAlign="right">
            <span v-if="giftCardDeductAmount > 0" class="main-color"
              >-￥{{ unitPrice(giftCardDeductAmount) }}</span
            >
            <span v-else @click="giftCardExpanded = !giftCardExpanded"
              >{{ giftCardList.length }} 张可用</span
            >
          </u-col>
        </u-row>
        <view v-if="giftCardExpanded && giftCardList.length" class="gift-card-list">
          <view
            class="gift-card-item"
            :class="{ 'gift-card-item--selected': isGiftCardSelected(item) }"
            v-for="item in giftCardList"
            :key="item.id"
            @click="toggleGiftCard(item)"
          >
            <view class="gift-card-item__name">{{ item.giftCardName || '礼品卡' }}</view>
            <view class="gift-card-item__meta">
              <text>余额 ￥{{ unitPrice(item.balance) }}</text>
              <text class="gift-card-item__no">{{ item.cardNo }}</text>
            </view>
          </view>
        </view>
      </div>
    </div>

    <!-- 配送地区没有提示 -->
    <div class="notSupportFreight" v-if="notSupportFreight.length != 0">
      <u-notice-bar
        style="width: 100%"
        icon=""
        :text="notSupportFreightNoticeText"
      >
      </u-notice-bar>
    </div>

    <!-- 结账 -->

    <div class="box6 mp-iphonex-bottom" v-if="orderMessage.priceDetailDTO">
      <div class="tabbar-left">
        <div v-if="!orderMessage.priceDetailDTO.payPoint" class="number">
          <span>¥</span>
          <span class="price">{{
            goodsFormatPrice(
              orderMessage.priceDetailDTO.flowPrice
            )[0]
          }}</span>
          <span
            >.{{
              goodsFormatPrice(
                orderMessage.priceDetailDTO.flowPrice
              )[1]
            }}
          </span>
        </div>
        <span v-else class="number"
          ><span style="margin-right: 10rpx">{{unitPrice(orderMessage.priceDetailDTO.payPoint)
          }}</span
          >积分</span
        >
      </div>
      <div class="navRiv" @click="createTradeFun()">
        <!-- #ifndef MP-WEIXIN -->
        <div class="tabbar-right">提交订单</div>
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        <div class="tabbar-right">微信支付</div>
        <!-- #endif -->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance } from 'vue'
import { onLoad, onShow, onBackPress } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import * as API_Address from '@/api/address'
import * as API_Order from '@/api/order'
import * as API_Trade from '@/api/trade'
import configs from '@/config/config'
import LiLiWXPay from '@/js_sdk/lili-pay/wx-pay.js'
import invoices from '@/pages/order/invoice/setInvoice'
import {
  unitPrice,
  goodsFormatPrice,
  secrecyMobile,
  isLogin,
} from '@/utils/filters.js'
import { hasECouponInCheckout } from '@/utils/goodsType.js'

const store = useStore()
const { proxy } = getCurrentInstance()!
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)
const remark = computed(() => store.state.remark)

interface ShippingOption {
  value: string
  label: string
}

const shippingWay: ShippingOption[] = [
  { value: 'LOGISTICS', label: '物流' },
  { value: 'SELF_PICK_UP', label: '自提' },
]

const userImage = configs.defaultUserPhoto
const invoiceFlag = ref(false)
const shippingText = ref('LOGISTICS')
const shippingFlag = ref(false)
const shippingMethod = ref<ShippingOption[]>([])
const isAssemble = ref(false)
const routerVal = ref<Record<string, any>>({})
const params = ref<Record<string, any>>({})
const couponList = ref('')
const address = ref<any>('')
const shopAddress = ref('')
const receiptList = ref<any>('')
const orderMessage = ref<any>('')
const data = ref('')
const remarkVal = ref<any[]>([])
const remarkVal1 = ref('')
const detail = ref('')
const endWay = ref<any>('')
const masterWay = ref<any>('')
const pintuanFlage = ref(true)
const notSupportFreight = ref<any[]>([])
const notSupportFreightNoticeText = ref('')
const storeAddress = ref<any>('')
const originOrderData = ref<any>('')

// E_COUPON 结算：免地址/免配送（hidePhysicalCheckout）；优惠券/活动/礼品卡可用（M-02）
const isECouponCheckout = computed(() => hasECouponInCheckout(orderMessage.value))
const isVirtualCheckout = computed(() => orderMessage.value?.cartTypeEnum === 'VIRTUAL')
const hidePhysicalCheckout = computed(
  () => isVirtualCheckout.value || isECouponCheckout.value
)

const giftCardList = computed(() => orderMessage.value?.canUseGiftCards || [])
const giftCardDeductAmount = computed(() => {
  const dto = orderMessage.value?.priceDetailDTO
  if (!dto) return 0
  if (orderMessage.value?.giftCardDeductTotal != null) {
    return Number(orderMessage.value.giftCardDeductTotal) || 0
  }
  return Number(dto.giftCardPrice) || 0
})
const selectedGiftCardIds = computed(() => orderMessage.value?.selectedGiftCardIds || [])
const giftCardExpanded = ref(false)

watch(
  remarkVal,
  (val) => {
    store.commit('setRemark', val)
  },
  { immediate: true, deep: true }
)

onLoad((val) => {
  routerVal.value = val || {}
})

onBackPress((e) => {
  if (e.from == 'backbutton') {
    const curRoute = getCurrentPages().slice(-1)[0]?.options || {}
    if (curRoute.addId) {
      uni.reLaunch({
        url: '/pages/tabbar/cart/cartList',
      })
    } else if (routerVal.value?.way === 'CART') {
      uni.switchTab({
        url: '/pages/tabbar/cart/cartList',
      })
    } else {
      uni.navigateBack()
    }
    return true
  }
  return false
})

onShow(async () => {
  uni.showLoading({
    mask: true,
  })
  try {
    await getOrderList()
    // E_COUPON 不需要配送方式
    if (!isECouponCheckout.value) {
      await getDistribution()
    }
    if (routerVal.value.way == 'PINTUAN') {
      isAssemble.value = true
      routerVal.value.parentOrder = JSON.parse(
        decodeURIComponent(routerVal.value.parentOrder)
      )
      pintuanWay()
    }
  } finally {
    uni.hideLoading()
  }
})

function getShippingLabel() {
  const item =
    shippingMethod.value.find((e) => e.value === shippingText.value) ||
    shippingWay.find((e) => e.value === shippingText.value)
  return item ? item.label : ''
}

async function callbackInvoice(val: any) {
  invoiceFlag.value = false
  if (!val) return
  receiptList.value = val
  const submit = {
    way: routerVal.value.way,
    ...receiptList.value,
  }
  const receipt = await API_Order.getReceipt(submit)
  if (receipt.data.success) {
    shippingFlag.value = false
    getOrderList()
  }
}

function navigateToStore(val: any) {
  uni.navigateTo({
    url: '/pages/product/shopPage?id=' + val.storeId,
  })
}

function clickToAddress() {
  navigateTo(
    `/pages/mine/address/address?from=cart&way=${
      routerVal.value.way
    }&parentOrder=${encodeURIComponent(
      JSON.stringify(routerVal.value.parentOrder)
    )}`
  )
}

function clickToStoreAddress() {
  navigateTo(
    `/pages/mine/address/storeAddress?from=cart&way=${routerVal.value.way}&storeId=${remarkVal.value[0].storeId}`
  )
}

function pintuanWay() {
  const { memberId } = routerVal.value.parentOrder
  const userInfo = isLogin()
  if (memberId) {
    endWay.value = userInfo
    masterWay.value = routerVal.value.parentOrder
    pintuanFlage.value = false
  } else {
    pintuanFlage.value = true
    masterWay.value = userInfo
  }
}

function invoice() {
  invoiceFlag.value = true
}

function isGiftCardSelected(item: any) {
  if (!item?.id) return false
  return (selectedGiftCardIds.value || []).map(String).includes(String(item.id))
}

function toggleGiftCard(item: any) {
  if (!item?.id) return
  API_Trade.selectGiftCard({
    way: routerVal.value.way,
    credentialId: String(item.id),
    used: !isGiftCardSelected(item),
  }).then((res) => {
    if (res.data.success) {
      getOrderList()
    } else {
      uni.showToast({
        title: res.data.message || '礼品卡选择失败',
        icon: 'none',
      })
    }
  })
}

function GET_Discount() {
  let storeIds: any[] = []
  let skus: any[] = []
  const selectedCoupon: any[] = []
  if (orderMessage.value.platformCoupon) {
    selectedCoupon.push(orderMessage.value.platformCoupon.memberCoupon.id)
  }
  if (
    orderMessage.value.storeCoupons &&
    Object.keys(orderMessage.value.storeCoupons)[0]
  ) {
    const storeMemberCouponsId = Object.keys(
      orderMessage.value.storeCoupons
    )[0]
    const storeCouponId =
      orderMessage.value.storeCoupons[storeMemberCouponsId].memberCoupon.id
    selectedCoupon.push(storeCouponId)
  }
  orderMessage.value.cartList.forEach((item: any) => {
    item.skuList.forEach((sku: any) => {
      storeIds.push(sku.storeId)
      skus.push(sku.goodsSku.id)
    })
  })
  storeIds = Array.from(new Set(storeIds))
  skus = Array.from(new Set(skus))
  uni.setStorage({
    key: 'totalPrice',
    data: orderMessage.value.priceDetailDTO.goodsPrice,
  })
  navigateTo(
    `/pages/cart/coupon/index?way=${routerVal.value.way}&storeId=${storeIds}&skuId=${skus}&selectedCoupon=${selectedCoupon}`
  )
}

function navigateTo(url: string) {
  uni.navigateTo({
    url,
  })
}

function createTradeFun() {
  proxy!.$u.throttle(() => {
    if (shippingText.value === 'SELF_PICK_UP') {
      if (!storeAddress.value.id) {
        uni.showToast({
          title: '请选择提货点',
          duration: 2000,
          icon: 'none',
        })
        return false
      }
    } else if (
      shippingText.value === 'LOGISTICS' &&
      !hidePhysicalCheckout.value
    ) {
      if (!address.value.id) {
        uni.showToast({
          title: '请选择地址',
          duration: 2000,
          icon: 'none',
        })
        return false
      }
    }

    let client
    // #ifdef H5
    client = 'H5'
    // #endif
    // #ifdef MP-WEIXIN
    client = 'WECHAT_MP'
    // #endif
    // #ifdef APP-PLUS
    client = 'APP'
    // #endif

    const submit: Record<string, any> = {
      client,
      way: routerVal.value.way,
      remark: remarkVal.value,
      parentOrderSn: '',
    }
    if (routerVal.value.parentOrder && routerVal.value.parentOrder.orderSn) {
      submit.parentOrderSn = routerVal.value.parentOrder.orderSn
    } else {
      delete submit.parentOrderSn
    }

    API_Trade.createTrade(submit).then((res) => {
      if (res.data.success) {
        uni.showToast({
          title: '创建订单成功!',
          duration: 2000,
          icon: 'none',
        })
        if (orderMessage.value.priceDetailDTO.billPrice == 0) {
          uni.navigateTo({
            url: '/pages/order/myOrder?status=0',
          })
        } else {
          // #ifdef MP-WEIXIN
          pay(res.data.result.sn)
          // #endif

          // #ifndef MP-WEIXIN
          navigateTo(
            `/pages/cart/payment/payOrder?trade_sn=${res.data.result.sn}`
          )
          // #endif
        }
      } else {
        uni.showToast({
          title: res.data.message,
          duration: 2000,
          icon: 'none',
        })
      }
    })
  }, 3000)
}

async function pay(sn: string) {
  new LiLiWXPay({
    sn,
    price: orderMessage.value.priceDetailDTO.billPrice,
  }).pay()
}

function getUserAddress() {
  API_Address.getAddressDefault().then((res) => {
    if (res.data.result) {
      res.data.result.consigneeAddressPath =
        res.data.result.consigneeAddressPath.split(',')
      address.value = res.data.result
    }
  })
}

async function getDistribution() {
  const shopRes = await API_Trade.shippingMethodList({
    way: routerVal.value.way,
  })
  if (shopRes.data.success) {
    const shopList = shopRes.data.result
    const way: ShippingOption[] = []
    console.log(shopList)
    shippingWay.forEach((item) => {
      shopList.forEach((child: string) => {
        if (item.value == child) {
          way.push(item)
        }
      })
    })
    shippingMethod.value = way
    if (way.length && !way.some((item) => item.value === shippingText.value)) {
      shippingText.value = way[0].value
    }
  }
}

async function confirmDistribution(val: any) {
  const selected = val?.value?.[0] || val?.[0]
  if (!selected?.value) {
    return
  }
  const res = await API_Trade.setShipMethod({
    shippingMethod: selected.value,
    way: routerVal.value.way,
  })

  shippingText.value = selected.value
  if (res.data.success) {
    getOrderList()
  }
}

function getSavedRemark(storeId: string, index: number, fallback = '') {
  const localAtIndex = remarkVal.value[index]
  if (localAtIndex?.storeId === storeId) {
    return localAtIndex.remark ?? ''
  }
  const localByStore = remarkVal.value.find((r) => r?.storeId === storeId)
  if (localByStore) {
    return localByStore.remark ?? ''
  }
  const fromStore = (remark.value || []).find((r: any) => r.storeId === storeId)
  if (fromStore) {
    return fromStore.remark ?? ''
  }
  return fallback ?? ''
}

function getOrderList() {
  notSupportFreight.value = []
  notSupportFreightNoticeText.value = ''
  return API_Trade.getCheckoutParams(routerVal.value.way).then((res) => {
    originOrderData.value = orderMessage.value
      ? JSON.parse(JSON.stringify(orderMessage.value))
      : null

    if (
      !res.data.result.checkedSkuList ||
      res.data.result.checkedSkuList.length === 0
    ) {
      if (!originOrderData.value?.checkedSkuList?.length) {
        uni.switchTab({
          url: '/pages/tabbar/cart/cartList',
        })
      }
    }
    if (res.data.result.skuList.length <= 0) {
      if (!originOrderData.value?.skuList?.length) {
        uni.navigateTo({
          url: '/pages/order/myOrder?status=0',
        })
      }
    }

    let repeatData
    res.data.result.cartList.forEach((item: any, index: number) => {
      repeatData = {
        remark: getSavedRemark(item.storeId, index, item.remark),
        storeId: item.storeId,
      }

      remarkVal.value[index] = repeatData
    })

    orderMessage.value = res.data.result
    ;(store.state as any).canUseCoupons = res.data.result.canUseCoupons
    ;(store.state as any).cantUseCoupons = res.data.result.cantUseCoupons

    // E_COUPON 免地址，不自动回填 memberAddress
    if (!hasECouponInCheckout(res.data.result)) {
      if (!res.data.result.memberAddress) {
        getUserAddress()
      } else {
        address.value = res.data.result.memberAddress
        res.data.result.memberAddress.consigneeAddressPath =
          res.data.result.memberAddress.consigneeAddressPath.split(',')
      }
    }
    if (res.data.result.storeAddress) {
      storeAddress.value = res.data.result.storeAddress
      console.log('storeAddress', storeAddress.value)
    }
    if (
      res.data.result.notSupportFreight &&
      res.data.result.notSupportFreight.length != 0
    ) {
      notSupportFreight.value = res.data.result.notSupportFreight
      notSupportFreightNoticeText.value = '以下商品超出配送范围：'
      res.data.result.notSupportFreight.forEach((item: any) => {
        notSupportFreightNoticeText.value += item.goodsSku.goodsName
      })
    }
  })
}
</script>
<style scoped>
page {
  background: #f7f7f7;
}
</style>
<style scoped lang="scss">
.flex-8 {
  flex: 8;
}

.main-color {
  color: $main-color;
  font-weight: bold;
}

.uinput {
  width: 100%;

  ::v-deep .u-input {
    width: 100%;
  }

  ::v-deep .u-input__content__field-wrapper__field {
    text-align: right;
    font-size: 28rpx;
  }
}

.remark-col {
  display: flex;
  justify-content: flex-end;
}

.promotionNotice {
  font-size: 24rpx;
  margin: 20rpx 0;
  color: $aider-light-color;
}

.nums {
  flex: 2;
  color: $light-color;

  text-align: center;
}

.wait {
  font-size: 22rpx;
  font-family: PingFang SC, PingFang SC-Regular;
  font-weight: 400;
  color: #cccccc;
  text-align: center;
}

.line {
  margin-left: 14rpx;
  margin-right: 14rpx;
  margin-bottom: 50rpx;
  width: 143rpx;
  border-bottom: 2px dotted #999;
}

.tabbar-left {
  margin-left: 32rpx;
}

.btn-one,
.wait {
  margin-top: 14rpx;
}

.btn-one {
  width: 100rpx;
  height: 40rpx;
  background: $light-color;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-family: PingFang SC, PingFang SC-Regular;
  font-weight: 400;
  text-align: left;
  color: #ffffff;
  text-align: center;
  line-height: 40rpx;
}

.head-img {
  width: 81rpx;
  height: 81rpx;
  margin: 0 auto;
}

.group-title {
  text-align: center;
  font-size: 28rpx;
  font-weight: 400;
  color: $light-color;
}

.group-box {
  height: 242rpx;
  align-items: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: #fff;
}

.group {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tr {
  text-align: right;
}

.tl {
  text-align: left;
}

::v-deep .u-col-3 {
  text-align: right;
}

.coupon-col__content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  gap: 4rpx;
  white-space: nowrap;
}

.bar {
  height: 4rpx;
  overflow: hidden;
  width: 100%;
  background: url("@/pages/order/imgs/line.png") no-repeat;
}

.box2 {
  margin-top: 20rpx;
}

.notSupportFreight {
  position: fixed;

  bottom: calc(100rpx + env(safe-area-inset-bottom));
  // #ifdef H5
  bottom: 100rpx;
  // #endif
  display: flex;
  align-items: center;
  left: 0;
  background: #fdf6ec;
  height: 100rpx;
  width: 100%;
  transition: 0.35s;

  > .tips {
    margin: 0 32rpx;
  }
}

::v-deep .u-notice-bar-wrap {
  width: 100% !important;
}

.box6 {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  overflow: hidden;
  line-height: 100rpx;
  margin-bottom: 0px !important;
  background: #fff;
  color: #333;
  display: flex;
  justify-content: space-between;
}

.tabbar-right {
  margin-top: 10rpx;
  height: 80rpx;
  color: #fff;
  line-height: 80rpx;
  background: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
  padding: 0 44rpx;
  text-align: center;
  border-radius: 400px;
  margin-right: 32rpx;
}

.sp_tag {
  display: inline;
  background: #f2f2f2;
  padding: 0 20rpx 0 10rpx;
  height: 20rpx;
  line-height: 20rpx;
  font-size: 24rpx;
  color: #262626;
  border-radius: 0.4em;
}

.goods-promotion {
  float: left;
  width: 75%;
  margin: 4rpx 0;
}

.sp_tag_plain {
  margin-left: 8rpx;
  padding: 0 6rpx 0 6rpx;
  background: #fff;
  border: 1px solid $main-color;
  font-size: 24rpx;
  color: $main-color;
  border-radius: 50px;
}

.sp_tag_plain:nth-of-type(1) {
  margin-left: 0;
}

.goods-name {
  flex: 8;
  font-size: 28rpx;
}

.sp_type {
  color: $u-tips-color;
  padding: 8rpx 0;
  font-size: 24rpx;
}

.number {
  color: $main-color;
  font-size: 26rpx;
  font-weight: bold;

  > span {
    font-size: 36rpx;
  }
}

.goods-prices {
  margin: 10rpx 0;
  color: $main-color;
  font-size: 28rpx;
  font-weight: bold;

  > .goods-price {
    font-size: 38rpx;
    padding: 0 2rpx;
  }
}

.box {
  border-radius: 40rpx;
  overflow: hidden;
  background: #fff;
  margin-bottom: 20rpx;
  color: #666;
  padding: 0 32rpx;
}

.wrapper {
  height: auto;
  background: #f7f7f7;
  padding-bottom: 200rpx;
  overflow: auto !important;
}

.store-name {
  margin-top: 32rpx;
  font-weight: 400;
  color: #333333;
}

::v-deep .u-col {
  padding: 36rpx 0 !important;
}

::v-deep .u-col-3,
.tipsColor {
  color: #333;
}

.goods-image {
  text-align: left;
  overflow: hidden;
}

.default {
  background: $main-color;
  font-size: 24rpx;
  border-radius: 8rpx;
  padding: 0rpx 12rpx;
  color: #fff;
  margin-right: 20rpx;
}

.address-box {
  border-radius: 40rpx;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  overflow: hidden;
  background: #fff;
  margin-bottom: 20rpx;
  color: #666;
}

.address-item {
  font-weight: normal;
  letter-spacing: 1rpx;
}

.user-box {
  padding: 32rpx;
}

.user-address-detail {
  color: #333;
  font-size: 38rpx;
  font-weight: bold;
  margin: 20rpx 0;
  letter-spacing: 1rpx;
}

.mobile {
  margin-left: 20rpx;
}

.price {
  font-size: 50rpx !important;
  margin: 0 2rpx;
}

.goods-detail {
  display: flex;
  flex-direction: column;

  justify-content: center;
  flex: 8;
  margin-left: 20rpx !important;

  > p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.goods-item {
  margin: 20rpx 0;
}

.gift-card-list {
  margin-top: 16rpx;
  padding: 0 8rpx 8rpx;
}

.gift-card-item {
  border: 1rpx solid #eceef2;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;
  background: #fff;

  &--selected {
    border-color: $main-color;
    background: rgba($main-color, 0.04);
  }
}

.gift-card-item__name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.gift-card-item__meta {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #666;
}

.gift-card-item__no {
  color: #999;
}
</style>
