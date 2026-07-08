<template>
  <div class="wrapper" :style="themeStyle">
    <u-navbar
      class="cart-navbar"
      :style="cartNavbarStyle"
      :auto-back="false"
      :fixed="true"
      :placeholder="true"
      :border="false"
      left-icon=""
      title="购物车"
      :right-text="isEdit ? '完成' : '编辑'"
      @rightClick="toggleEdit"
    ></u-navbar>
    <!-- 空白页-->
    <view v-if="!loading && (cartDetail.cartList == '' || cartDetail.cartList == [] || !cartDetail)" class="empty">
      <image src="/static/emptyCart.png" mode="aspectFit"></image>
      <view class="empty-tips">
        空空如也
        <navigator class="navigator" url="/pages/tabbar/home/index" open-type="switchTab">随便逛逛</navigator>
      </view>
    </view>
    <!-- 店铺商品信息 -->
    <div class="content">
      <div class="box box2" :class="{ invalid: isInvalid(item) }" v-for="(item, index) in cartDetail.cartList"
        :key="index">
        <view class="tab">
          <view class="store-line">
            <view class="store-line-check">
              <u-checkbox usedAlone shape="circle" :active-color="lightColor" v-model:checked="item.checked"
                :label-size="14" @change="(checked) => onStoreCheckChange(item, checked)"></u-checkbox>
            </view>
            <text class="store-name wes" @click.stop="navigateToStore(item)">{{ item.storeName }}</text>
          </view>
          <view class="right-col" v-if="item.canReceiveCoupon" @click="navigateToCoupon(item)">
            <div class="right-line"></div>
            <span>领劵</span>
          </view>
        </view>
        <u-swipe-action ref="swiperAction" class="cart-item" v-for="(skuItem, i) in item.skuList" :key="skuItem.goodsSku.id">
          <u-swipe-action-item :show="skuItem.selected" @open="openAction(skuItem)" :options="options"
          :name="i"
          @click="changeActionTab(skuItem)" @longpress="changeActionTab(skuItem)">
          <!-- 满减活动 -->
          <div v-if="Object.keys(skuItem.promotionMap).length != 0">
            <div v-if="getPromotion(skuItem).includes('FULL_DISCOUNT')">
              <div class="promotion-notice" v-if="item.promotionNotice">
                <span class="tips">满减</span>
                <span style="flex:10;">{{item.promotionNotice}}</span>
              </div>
            </div>
          </div>
          <view class="goods-row" :class="{ invalid: isInvalid(skuItem) }">
            <view class="goods-config">
              <view>
                <u-checkbox v-if="skuItem.invalid == 0 && !skuItem.errorMessage" usedAlone shape="circle"
                  :active-color="lightColor" class="c-left" v-model:checked="skuItem.checked"
                  @change="(checked) => onSkuCheckChange(skuItem, checked)"></u-checkbox>
                <span class="invalid" v-else style="font-size: 24rpx">失效</span>
              </view>
              <u-image border-radius="10" :fade="true" @click="navigateToGoods(skuItem)" width="160rpx" height="160rpx"
                mode="aspectFill" :src="getSkuThumbnail(skuItem.goodsSku.thumbnail)" />
            </view>
            <view class="goods-content">
              <!-- 商品名称 -->
              <p class="sp-name" @click="navigateToGoods(skuItem)">
                {{ skuItem.goodsSku.goodsName }}
              </p>
              <!-- 规格 -->
              <p class="sp-type" style="width:300rpx">{{skuItem.goodsSku.simpleSpecs}}</p>
              <p class="sp-type" v-if="skuItem.goodsSku.salesModel == 'WHOLESALE'">批发商品</p>
              <p class="sp-number">
                <view class="sp-price">
                  <div class="main-color">
                    ￥<span>{{ goodsFormatPrice(skuItem.goodsSku.price)[0] }}</span>
                    <span>.{{ goodsFormatPrice(skuItem.goodsSku.price)[1] }}</span>
                  </div>
                </view>
                <view>
                  <uni-number-box class="uNumber" :min="1" :max="999"  @change="numChange(skuItem)"	 v-model="skuItem.num"></uni-number-box>
                </view>
                <!-- 如果当有促销并且促销是 限时抢购 -->
                <div class="promotions-list" v-if="Object.keys(skuItem.promotionMap).length != 0"
                >
                  <div class="promotions-item-seckill" v-if="getPromotion(skuItem).includes('SECKILL')">
                    距秒杀结束: <u-count-down show-border :hide-zero-day="true" :color="$mainColor" border-color="#ededed"
                      font-size="24" :timestamp="getCountDownTime(skuItem)">
                    </u-count-down>
                  </div>
                </div>

                <div style='margin-left: 20rpx;' v-if="!skuItem.checked && skuItem.errorMessage">
                  {{skuItem.errorMessage}}
                </div>
              </p>
              
            </view>
          </view>
        </u-swipe-action-item>
        </u-swipe-action>
      </div>
    </div>
    <u-modal v-model:show="deleteShow" :confirm-style="{'color':lightColor}" @confirm="deleteConfirm" show-cancel-button
      :content="deleteContent" :async-close="true"></u-modal>
    <!-- 结账 -->
    <div class="box box6">
      <view class="navL">
        <u-checkbox class="checkout-all" usedAlone shape="circle" :active-color="lightColor" v-model:checked="checkout"
          :label-size="12" label="全选" @change="checkOut">
        </u-checkbox>
        <view class="checkout-total">
          <view class="checkout-total-main">
            <text class="checkout-total-label">总计:</text>
            <text class="checkout-total-price" v-if="cartDetail && cartDetail.priceDetailDTO">
              <text class="checkout-total-currency">¥</text>
              <text class="checkout-total-int">{{ goodsFormatPrice(cartDetail.priceDetailDTO.flowPrice)[0] }}</text>
              <text class="checkout-total-dec">.{{ goodsFormatPrice(cartDetail.priceDetailDTO.flowPrice)[1] }}</text>
            </text>
            <text class="checkout-total-price" v-else>¥0.00</text>
          </view>
          <view
            v-if="cartDetail.cartList && cartDetail.cartList.length != 0 && cartDetail.priceDetailDTO && cartDetail.priceDetailDTO.discountPrice != 0"
            class="checkout-total-discount"
          >
            <text>优惠减:￥{{ cartDetail.priceDetailDTO.goodsPrice - unitPrice(cartDetail.priceDetailDTO.flowPrice) }}</text>
            <text class="discount-details" @click="discountDetails">优惠明细</text>
          </view>
        </view>
      </view>
      <!-- 优惠详情 -->
      <u-popup z-index="3" close mode="bottom" height="50%" closeable v-model:show="discountDetailsFlag" border-radius="20">
        <div class="discount-list">
          <view class="discount-title">优惠明细</view>
          <div class="discount-way">
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">
              <span>商品总额</span>
              <span>￥{{unitPrice(cartDetail.priceDetailDTO.goodsPrice)}}</span>

            </div>
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">
              <span>优惠券</span>
              <span>-￥{{unitPrice(cartDetail.priceDetailDTO.couponPrice)}}</span>
            </div>
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">
              <span>其他优惠</span>
              <span>-￥{{unitPrice(cartDetail.priceDetailDTO.discountPrice)}}</span>
            </div>
          </div>
        </div>
      </u-popup>

      <view v-if="isEdit" @click="deleteGoods()">
        <div class="settlement">删除</div>
      </view>

      <view v-else @click="submitOrder()">
        <div class="settlement">去结算</div>
      </view>
    </div>
    <u-toast ref="uToast" />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import * as API_Trade from '@/api/trade'
import { debounce } from '@/utils/tools.js'
import uniNumberBox from '@/components/uni-number-box'
import config from '@/config/config'
import { useStore } from '@/store'
import { unitPrice, goodsFormatPrice, isLogin, forceLogin } from '@/utils/filters.js'

const store = useStore()
const uToast = ref()
const swiperAction = ref()

const lightColor = computed(() => store.getters.lightColor)
const loading = ref(false)
const discountDetailsFlag = ref(false)
// 商品栏右侧滑动按钮
const options = [
  {
    text: "删除",
    style: {
      backgroundColor: store.getters.lightColor,
    },
  },
]
const isInvalid = (val: any): boolean => {
  if (!val) return false
  if (val.invalid == 1 || (!val.checked && val.errorMessage)) {
    return true
  } else {
    return false
  }
}
const deleteShow = ref(false)
const deleteContent = "删除该商品？"
const cartDetail = ref<any>("")
const goodsVal = ref<any>("")
const isEdit = ref(false)
const checkout = ref(false)
const WEIXIN_num = ref("")
const defaultGoodsImage = config.logo
const capsuleInsetRight = ref(0)

const cartNavbarStyle = computed(() => {
  if (!capsuleInsetRight.value) {
    return {}
  }
  return {
    "--cart-capsule-inset": `${capsuleInsetRight.value}px`,
  }
})

onMounted(() => {
  setCapsuleInset()
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  // #endif
})

onPullDownRefresh(() => {
  getCardData()
})

onShow(() => {
  deleteShow.value ? (deleteShow.value = false) : true
  if (swiperAction.value) {
    (swiperAction.value as any[]).forEach((item: any) => {
      item.show = false
    })
    getCardData()
  } else {
    getCardData()
  }
})

function setCapsuleInset() {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const { windowWidth } = uni.getWindowInfo()
    capsuleInsetRight.value = windowWidth - menuButton.left + uni.upx2px(8)
  } catch (e) {
    capsuleInsetRight.value = 90
  }
  // #endif
}

function toggleEdit() {
  isEdit.value = !isEdit.value
}

function getSkuThumbnail(url: any) {
  if (url && /^(https?:)?\/\//.test(String(url))) {
    return url
  }
  return defaultGoodsImage
}

/**
 * 倒数计时
 */
function getCountDownTime(val: any) {
  if (val.promotionMap) {
    let key = Object.keys(val.promotionMap).find((child: string) => {
      return child.split("-")[0] == 'SECKILL'
    })
    return val.promotionMap[key].endTime / 1000 - (new Date().getTime() / 1000)
  }
}

/**
 * 优惠明细开关
 */
function discountDetails() {
  discountDetailsFlag.value = true
}
/**
 * 左滑打开删除
 */
function openAction(skuItem: any) {
  cartDetail.value.cartList.forEach((cartItem: any) => {
    if (cartItem.skuList) {
      cartItem.skuList.forEach((sku: any) => {
        sku["selected"] = false
      })
    }
  })
  skuItem["selected"] = true
}

/**
 * 滑动删除
 */
function changeActionTab(val: any) {
  deleteShow.value = true
  goodsVal.value = val
}

/**
 * 点击删除
 */
function deleteConfirm() {
  API_Trade.deleteSkuItem(goodsVal.value.goodsSku.id).then((res: any) => {
    if (res.statusCode == 200) {
      uni.showToast({
        title: "此商品删除成功",
        duration: 2000,
      })
      deleteShow.value = false
      getCardData()
    }
  })
}

/**
 * 删除商品
 */
function deleteGoods() {
  if (whetherChecked()) {
    var delGoodsData: any[] = []
    cartDetail.value.cartList.forEach((item: any) => {
      item.skuList.forEach((goodsItem: any) => {
        if (goodsItem.checked) {
          delGoodsData.push(goodsItem.goodsSku.id)
        }
      })
    })
    if (delGoodsData && delGoodsData.length > 0) {
      API_Trade.deleteSkuItem(delGoodsData).then((res: any) => {
        if (res.data.success) {
          uni.showToast({
            title: "删除成功!",
            icon: "none",
          })
          getCardData()
        }
      })
    } else {
      uni.showToast({
        title: "请选择删除商品，如果商品失效，请左滑无效商品删除",
        icon: "none",
      })
    }
  }
}

/**
 * 跳转到店铺
 */
function navigateToStore(val: any) {
  uni.navigateTo({
    url: "/pages/product/shopPage?id=" + val.storeId,
  })
}

/**
 * 跳转到优惠券
 */
function navigateToCoupon(val: any) {
  uni.navigateTo({
    url: "/pages/cart/coupon/couponCenter?storeId=" + val.storeId,
  })
}

/**
 * 跳转到商品
 */
function navigateToGoods(val: any) {
  uni.navigateTo({
    url:
      "/pages/product/goods?id=" +
      val.goodsSku.id +
      "&goodsId=" +
      val.goodsSku.goodsId,
  })
}

/**
 * 点击步进器回调
 */
const numChange = debounce(function (val: any) {
  updateSkuNumFun(val.goodsSku.id, val.num)
}, 1000)
/**
 * 去结算
 */
function submitOrder() {
  if (whetherChecked()) {
    navigateTo("/pages/order/fillorder?way=CART")
  }
}

/**
 * 验证是否选中商品
 */
function whetherChecked(): boolean {
  forceLogin()

  let canBuy = false
  cartDetail.value.cartList.forEach((item: any) => {
    if (item.checked) {
      canBuy = true
    } else {
      item.skuList.forEach((skuItem: any) => {
        if (skuItem.checked) {
          canBuy = true
        }
      })
    }
  })
  if (!canBuy) {
    uni.showToast({
      title: "您还没有选择商品",
      duration: 2000,
      icon: "none",
    })
    return false
  } else {
    return true
  }
}

/**
 * 跳转
 */
function navigateTo(url: string) {
  uni.navigateTo({
    url,
  })
}

/**
 * 全选
 */
function checkOut(checked?: boolean) {
  const selected = typeof checked === "boolean" ? checked : checkout.value
  API_Trade.checkAll(selected).then((result: any) => {
    if (result.data.success) {
      getCardData()
    }
  })
}

/**
 * 获取店铺选中信息
 */
function checkStoreFun(skuId: any, num: any) {
  API_Trade.checkStore(skuId, num).then((result: any) => {
    if (result.data.success) {
      getCardData()
    }
  })
}

function onStoreCheckChange(storeItem: any, checked: any) {
  checkStoreFun(storeItem.storeId, checked)
}

function onSkuCheckChange(skuItem: any, checked: any) {
  updateSkuCheckedFun(skuItem.goodsSku.id, checked)
}

/**
 * 获取购物车选中信息
 */
function updateSkuCheckedFun(skuId: any, num: any) {
  API_Trade.updateSkuChecked(skuId, num).then((result: any) => {
    if (result.data.success) {
      getCardData()
    }
  })
}

/**
 * 更新商品购物车数量
 */
function updateSkuNumFun(skuId: any, num: any) {
  API_Trade.updateSkuNum(skuId, num).then((result: any) => {
    if (result.statusCode == 200) {
      getCardData()
    } else {
      setTimeout(() => {
        getCardData()
      }, 1000)
    }
  })
}

// 数据去重一下
function getPromotion(item: any) {
  return Object.keys(item.promotionMap).map((child: string) => {
    return child.split("-")[0]
  })
}

/**
 * 获取购物车数据
 */
function getCardData() {
  if (isLogin("auth")) {
    uni.showLoading({
      title: "加载中",
    })
    API_Trade.getCarts()
      .then((result: any) => {
        loading.value = false
        uni.stopPullDownRefresh()
        if (result.data.success) {
          cartDetail.value = result.data.result
          let checkOuted = true
          for (let i = 0; i < cartDetail.value.cartList.length; i++) {
            let item = cartDetail.value.cartList[i]
            item.checked = item.checked == 1
            if (!item.checked) {
              checkOuted = false
            }
            item.skuList &&
              item.skuList.forEach((sku: any) => {
                sku.checked = sku.checked == 1
                if (!sku.checked) {
                  checkOuted = false
                }
                if(Object.keys(sku.promotionMap).length != 0)
                {
                  Object.keys(sku.promotionMap).forEach((pro: string, proIndex: number) => {
                    pro = pro.split('-')[0]
                    if (pro == "PINTUAN" ) {
                       Object.keys(sku.promotionMap).splice(proIndex, 1);
                    }
                  })
                }
              })
          }
          checkout.value = checkOuted
          uni.stopPullDownRefresh()
        }
      })
      .catch(() => { loading.value = false })
     if (store.state.isShowToast){ uni.hideLoading() }
  } else {
     if (store.state.isShowToast){ uni.hideLoading() }
  }
}
</script>

<style lang="scss">
page {
  background: #f2f2f2;
}
</style>
<style scoped lang="scss">
// #ifdef MP-WEIXIN
@import "./mp-carui.scss";
// #endif
.u-image {
  box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.05);
}

.cart-navbar {
  ::v-deep .u-navbar__content__right {
    padding-right: var(--cart-capsule-inset, 13px);
  }

  ::v-deep .u-navbar__content__right__text {
    color: $light-color;
    font-size: 28rpx;
  }
}
.promotion-notice {
  margin-top: 10px;
  margin-left: 68rpx;
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
  ::v-deep .tips {
    margin: 0 8rpx 0 0;
    background: $main-color;
    border-radius: 100px;
    display: block;
    flex: 1;
    padding: 2rpx 12rpx;
    color: #fff;
  }
}
.default-color {
  color: #333;
}
.goods-row {
  padding: 30rpx 0;

  display: flex;
  align-items: center;
}

.store-name {
  flex: 1;
  min-width: 0;
  font-weight: bold;
  font-size: 28rpx;
  margin-left: 8rpx;
}

.store-arrow {
  flex-shrink: 0;
  margin-left: 10rpx;
}
.invalid {
  filter: grayscale(1);
}

.cart-item {
  width: 100%;
  border-radius: 0.4em;
  transition: 0.35s;
  overflow: hidden;
}

/* 空白页 */
::v-deep .u-number-input {
  background: #fff !important;
  border: 1px solid #ededed;
  margin: 0 !important;
}

::v-deep .u-icon-minus,
::v-deep .u-icon-plus {
  background: #ffffff !important;
  border: 1px solid #ededed;
  color: #333 !important;
  width: 40rpx;
}

.empty {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 99;
  padding-bottom: var(--window-bottom);
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: #fff;

  image {
    width: 240rpx;
    height: 160rpx;
    margin-bottom: 30rpx;
  }

  .empty-tips {
    display: flex;
    font-size: $font-sm + 2rpx;
    color: $font-color-disabled;

    .navigator {
      color: $uni-color-primary;
      margin-left: 16rpx;
    }
  }
}

.settlement {
  width: 180rpx;
  height: 70rpx;
  line-height: 70rpx;
  background: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
  border-radius: 900rpx;
  text-align: center;
  color: #fff;
  margin-right: 10rpx;
}

.price {
  display: flex;
  align-items: center;

  ::v-deep .number {
    line-height: 1;
    font-size: 30rpx;
    > span {
      font-weight: bold;
    }
  }
}

.box2 {
  border-radius: 20rpx;
  padding: 0 16rpx 0;
  margin: 0 16rpx 20rpx;
  .u-checkbox {
    display: flex;
    align-items: center;
    text-align: center;
  }
  background: #fff;

}

.wrapper {
  height: 100%;
}

::v-deep .u-col {
  padding: 24rpx 0 !important;
}

.goods-content {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
  overflow: hidden;

  > p,
  .sp-name,
  .sp-type,
  .sp-number {
    padding-left: 0;
  }
}

.content {
  padding: 20rpx 0 20rpx 0;
  margin-bottom: 80rpx;
}

.line {
  float: left;
  width: 1px;
  height: 100%;
  border-right: 1px solid $light-color;
}

.store-line-check {
  flex-shrink: 0;

  ::v-deep .u-checkbox {
    margin: 0;
  }
}

.store-line {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.goods-config {
  display: flex;
  align-items: center;
  flex-shrink: 0;

  ::v-deep .invalid {
    display: block;
    width: 80rpx !important;
  }
}
.tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0 8rpx;
}

.right-col {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  text-align: center;
  color: $light-color;
  font-size: 26rpx;
  margin-left: 16rpx;

  > span {
    margin-left: 20rpx;
  }
}

.right-line {
  width: 2rpx;
  height: 40rpx;
  border-left: 1px solid #eeeeee;
  margin-right: 20rpx;
}

.box6 {
  justify-content: space-between;
  position: fixed;
  // #ifdef APP-PLUS || MP-WEIXIN
  bottom: 0;
  // #endif
  // #ifdef H5
  bottom: var(--window-bottom);
  // #endif
  left: 0;
  border-top: 1px solid #ededed;
  display: flex;
  height: 100rpx;
  overflow: hidden;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 1);
  color: #333;
  z-index: 99;
  > .navL {
    padding: 0 32rpx;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 24rpx;

    .checkout-all {
      flex-shrink: 0;
    }

    ::v-deep .u-checkbox {
      margin: 0;
    }
  }

  .checkout-total {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .checkout-total-main {
    display: flex;
    align-items: baseline;
    line-height: 1.2;
  }

  .checkout-total-label {
    font-size: 28rpx;
    color: #333;
    flex-shrink: 0;
  }

  .checkout-total-price {
    margin-left: 4rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: $main-color;
    line-height: 1.2;
  }

  .checkout-total-int {
    font-size: 38rpx;
    font-weight: bold;
  }

  .checkout-total-dec {
    font-size: 24rpx;
    font-weight: bold;
  }

  .checkout-total-discount {
    display: flex;
    align-items: center;
    margin-top: 4rpx;
    font-size: 24rpx;
    color: #c9c7c7;
    line-height: 1.2;
  }
}

.sp-type {
  color: $u-light-color;
  padding: 10rpx 0;
  font-size: 24rpx;
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.sp-number {
  font-weight: bold;

  display: flex;
  justify-content: space-between;
  > .sp-price {
    ::v-deep span:nth-of-type(1) {
      font-size: 38rpx;
    }
    ::v-deep span:nth-of-type(2) {
      font-size: 24rpx;
    }
  }
}
.priceDetail-flowPrice {
  font-weight: bold;
  padding-left: 20rpx;
  > span:nth-of-type(1) {
    font-size: 38rpx;
  }
}

.discount-details {
  margin-left: 10px;
  color: #666;
  padding: 4rpx 10rpx;
  border-radius: 100px;
  background: rgba(201, 199, 199, 0.3);
}
.discount-item {
  display: flex;
  margin: 40rpx 0;
  justify-content: space-between;
  > span:nth-of-type(1) {
    color: #666;
  }
  > span:nth-of-type(2) {
    color: #333;
    font-weight: bold;
  }
}
.discount-title {
  font-size: 36rpx;
  margin-top: 20rpx;
  text-align: center;
}
.discount-way {
  width: 94%;
  margin: 0 3%;
}
.discount-list {
  width: 100%;
}
.promotions-list {
  margin-left: 20rpx;
  > .promotions-item-seckill {
    background: rgba($color: $main-color, $alpha: 0.1);
    font-size: 24rpx;
    color: $main-color;
    display: inline;
    padding: 0rpx 10rpx;
    border-radius: 100px;
  }
}
</style>
