<template>
  <div class="main-page" :style="themeStyle">
    <!-- #ifdef APP-PLUS -->
    <view class="status_bar"></view>
    <!-- #endif -->
    <!-- 仅h5有效 打开App -->

    <!-- 分享 -->
    <shares v-if="enableShare && goodsDetail.id" :skuId="routerVal.id" :goodsId="routerVal.goodsId" :link="
      '/pages/product/goods?id=' +
      routerVal.id +
      '&goodsId=' +
      routerVal.goodsId
    " :thumbnail="goodsDetail.thumbnail" :goodsName="goodsDetail.goodsName" type="goods"
      @close="enableShare = false" />
    <view class="index">
      <!-- topBar -->
      <u-navbar
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="true"
        :border="false"
        :bg-color="navbar.background"
        :auto-back="false"
        :class="headerFlag ? 'header' : 'header bg-none scroll-hide'"
        @leftClick="back"
      >
        <template #center>
          <view class="headerList" :class="headerFlag ? 'tab-bar' : 'tab-bar scroll-hide'">
            <view class="headerRow headerRow--tabs">
              <view
                class="nav-item"
                v-for="header in headerList"
                :key="header.id"
                :class="{ cur: scrollId === header.id }"
                @tap.stop="headerTab(header.id)"
              >
                {{ header.text }}
              </view>
            </view>
          </view>
        </template>
      </u-navbar>

      <u-navbar
        :border="false"
        v-show="!headerFlag"
        :fixed="true"
        :placeholder="false"
        :safe-area-inset-top="true"
        class="header-only-back"
        :bg-color="navbarOnlyBack.background"
        :auto-back="false"
        @leftClick="back"
      >
      </u-navbar>
    </view>

    <view class="product-container" id="productRef">
      <scroll-view
        enableBackToTop="true"
        scroll-with-animation
        scroll-y
        class="scroll-page"
        :scroll-top="tabScrollTop"
        @scroll="pageScroll"
      >
        <view class="scroll-inner">
          <!-- 轮播图 -->
         
          <GoodsSwiper id="main1" :res="imgList" :video="goodsDetail.goodsVideo" />

          <!-- 促销活动条（秒杀/限时直降/拼团等，M-02 含 E_COUPON） -->
          <PromotionAssembleLayout v-if="PromotionList" :detail="goodsDetail" :res="PromotionList" />

          <view class="card-box top-radius-0" id="main2">
            <!-- 活动不显示价钱 -->
            <view v-if="isSeckill || isGroup" class="desc-bold -goods-msg">
              <view class="-goods-flex">
                <view class="desc-bold">
                  {{ goodsDetail.goodsName || "" }}
                </view>
                <view class="favorite" @click="clickFavorite(goodsDetail.id)">
                  <u-icon size="30" :color="favorite ? '#f2270c' : '#262626'" :name="favorite ? 'heart-fill' : 'heart'">
                  </u-icon>
                  <view :style="{ color: favorite ? '#f2270c' : '#262626' }">{{
                    favorite? "已收藏": "收藏"
                  }}</view>
                </view>
              </view>
              <!-- 商品描述 -->
              <view class="-goods-desc">
                {{ goodsDetail.sellingPoint || "" }}
              </view>
            </view>
            <view v-else class="-goods-msg">
              <!-- 没有拼团，秒杀等活动的情况下 -->
              <view>
                <view class="-goods-flex">
                  <!-- 如果有积分显示积分 -->
                  <view class="-goods-price" v-if="goodsDetail.price != undefined">

                    <span>
                      <span>
                        <span>¥</span><span class="price">{{
                          goodsFormatPrice(goodsDetail.price)[0]
                        }}</span>.{{ goodsFormatPrice(goodsDetail.price)[1] }}
                      </span>
                    </span>
                  </view>
                  <view class="-goods-price" v-else>
                    <div v-if="takeDownFromSale" class="price down-goods">
                      暂无报价
                    </div>
                    <span v-else>
                    ¥<span class="price">0 </span>.00
                    </span>
                  </view>

                  <view class="icons share" @click="shareChange()">
                    <u-icon size="30" name="share-fill"></u-icon>
                    <view>分享</view>
                  </view>
                  <view class="icons" @click="clickFavorite(goodsDetail.id)">
                    <u-icon size="30" :color="favorite ? '#f2270c' : '#262626'"
                      :name="favorite ? 'heart-fill' : 'heart'"></u-icon>
                    <view :style="{ color: favorite ? '#f2270c' : '#262626' }">{{
                      favorite? "已收藏": "收藏"
                    }}</view>
                  </view>
                </view>
                <view class="-goods-name desc-bold">
                  {{ goodsDetail.goodsName || "" }}
                </view>
                <view class="-goods-desc">
                  {{ goodsDetail.sellingPoint || "" }}
                </view>
              </view>
            </view>
          </view>

          <!-- 促销/领券入口 -->
          <view class="card-box">
            <view class="card-flex" @click="shutMask(1)">
              <view class="card-title"> 促销 </view>
              <view class="card-content">
                <span v-if="PromotionList && emptyPromotion()">暂无促销信息</span>
                <PromotionLayout v-else @shutMasks="shutMask" :res="PromotionList" />
              </view>
              <view class="card-bottom">
                <u-icon name="more-dot-fill"></u-icon>
              </view>
            </view>
          </view>

          <!-- 拼团用户列表 -->
          <PromotionAssembleListLayout v-if="isGroup" @to-assemble-buy-now="toAssembleBuyNow" :res="PromotionList" />

          <!-- 实物配送地址；E_COUPON / VIRTUAL_GOODS 均不展示 -->
          <view class="card-box" v-if="!isNonPhysicalGoodsType">
            <view class="card-flex" @click="shutMask(4)">
              <view class="card-title"> 已选 </view>
              <view class="card-content">
                <span v-if="selectedGoods.spec">{{ selectedGoods.spec.specName }}-{{
                  selectedGoods.spec.specValue
                }}</span>
                <span v-else>默认</span>
              </view>
              <view class="card-bottom">
                <u-icon name="more-dot-fill"></u-icon>
              </view>
            </view>
            <view class="card-flex" @click="shutMask(3)">
              <view class="card-title"> 送至</view>
              <view class="card-content">
                <span v-if="delivery">{{clearStrComma(delivery.consigneeAddressPath)
                }}</span>
                <span v-else>暂无地址信息</span>
              </view>
              <view class="card-bottom">
                <u-icon name="more-dot-fill"></u-icon>
              </view>
            </view>
          </view>

          <!-- 评价 -->
          <Evaluation id="main5" :goodsDetail="goodsDetail" />

          <!-- 店铺推荐 -->
          <storeLayout id="main7" :storeDetail="storeDetail" :goodsDetail="goodsDetail" :res="recommendList" />

          <!-- 宝贝详情 -->
          <GoodsIntro
            id="main9"
            :res="goodsDetail"
            :goodsParams="goodsParams"
            :goodsId="goodsDetail.goodsId"
            v-if="goodsDetail.id && (goodsDetail.mobileIntro || (goodsParams && goodsParams.length))"
          />

          <!-- 宝贝推荐 -->
          <GoodsRecommend id="main11" v-if="likeGoodsList.length" :res="likeGoodsList" />
        </view>
      </scroll-view>


      <view class="page-bottom mp-iphonex-bottom" id="pageBottom">
        <view class="icon-btn">
          <view class="icon-btn-item" @click="navigateToStore(goodsDetail.storeId)">
            <u-icon size="22" class="red" name="home-fill"></u-icon>
            <view class="red icon-btn-name">店铺</view>
          </view>
          <view class="icon-btn-item" @click="linkMsgDetail()">
            <u-icon size="22" name="kefu-ermai"></u-icon>
            <view class="icon-btn-name">客服</view>
          </view>
          <view class="icon-btn-item" @click="reluchToCart()">
            <u-icon size="22" name="shopping-cart"></u-icon>
            <view class="icon-btn-name">购物车</view>
            <view v-if="nums && nums > 0" class="num-icon">{{ nums }}</view>
          </view>
        </view>
        <!-- 下架展示 -->
        <div class="detail-btn" v-if="takeDownFromSale">
          <view class="to-store-car to-store-btn"  @click="reStartTakeDownSale">
            查看类似商品</view>
        </div>
        <!-- 正常结算页面 -->
        <view class="detail-btn" v-if="!isGroup && !takeDownFromSale">
          <view class="to-store-car to-store-btn" v-if="showAddToCart" @click="shutMask(4)">
            加入购物车</view>
          <view
            class="to-buy to-store-btn"
            :class="{ 'to-buy-theme': isAppointmentGoodsType }"
            @click="handleBuyClick"
          >
            {{ isAppointmentGoodsType ? '立即预约' : '立即购买' }}
          </view>
          <view class="to-store-car to-store-btn" v-if="startTimer">暂未开始</view>
        </view>
        <!-- 拼团结算 -->
        <view class="detail-btn" v-else-if="isGroup">
          <view class="to-store-car pt-buy to-store-btn" @click="shutMask(4, 'buy')">
            <view>￥{{unitPrice(goodsDetail.price)}}</view>
            <view>单独购买</view>
          </view>
          <view class="to-buy pt-buy to-store-btn" @click="toAssembleBuyNow">
            <view>￥{{unitPrice(goodsDetail.promotionPrice)}}</view>
            <view>拼团价格</view>
          </view>
        </view>
      </view>
    </view>
    <!-- 规格-模态层弹窗 -->
    <view class="spec">
      <!-- 促销弹窗 -->
      <u-popup v-model:show="promotionShow" :height="setup.height" :mode="setup.mode" :border-radius="setup.radius"
        @close="promotionShow = false" :mask-close-able="setup.close" closeable>
        <view class="header-title">优惠</view>
        <view class="cuxiao">
          <scroll-view class="scroll_mask" :scroll-y="true">
            <view class="con-cuxiao">
              <view class="cuxiao-title">促销活动</view>
              <PromotionDetailsLayout :res="PromotionList" />
            </view>
            <view class="con-cuxiao coupons">
              <view class="cuxiao-title">可领优惠券</view>
              <PromotionCoupon @getCoupon="getCoupon" :res="PromotionList" />
            </view>
          </scroll-view>
        </view>
      </u-popup>

      <!-- 配送地址弹窗 -->
      <popupAddress @closeAddress="closePopupAddress" @deliveryData="deliveryFun" v-if="goodsDetail.id"
        :goodsId="goodsDetail.id" :addressFlag="addressFlag" />

      <!-- 商品规格  商品详情，以及默认参与活动的id-->
      <popupGoods :addr="delivery" ref="popupGoodsRef" @changed="changedGoods" @closeBuy="closePopupBuy"
        @queryCart="cartCount()" :goodsDetail="goodsDetail" :goodsSpec="goodsSpec" :isGroup="isGroup" :id="productId"
        v-if="goodsDetail.id" :pointDetail="pointDetail" @handleClickSku="selectSku"
        :buyMask="buyMask" />

      <!-- 下架框 -->
      <takeDownFormSaleGoods ref="takeDownSaleRef" v-if="takeDownFromSale" />
    </view>
  </div>
</template>

<script setup lang="ts">
/************接口API***************/
import { ref, reactive, computed, watch, nextTick, getCurrentInstance } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getGoods, getGoodsList, getMpScene } from '@/api/goods.js'
import { recordDistributionGoodsVisit } from '@/api/distribution.js'
import { tryBindDistribution } from '@/utils/distributionBind.js'
import * as API_trade from '@/api/trade.js'
import * as API_Members from '@/api/members.js'
import * as API_store from '@/api/store.js'
import { getIMDetail } from '@/api/common'
/************请求存储***************/
import storage from '@/utils/storage.js'
/************工具函数***************/
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { unitPrice, goodsFormatPrice, isLogin, parseGoodsImageUrl, clearStrComma, talkIm } from '@/utils/filters.js'
import { isNonPhysicalGoods, isAppointmentGoods } from '@/utils/goodsType.js'

/************组件***************/
import PromotionLayout from './product/promotion/-promotion'
import PromotionDetailsLayout from './product/promotion/-promotion-details'
import PromotionAssembleLayout from './product/promotion/-promotion-assemble-promotions'
import PromotionAssembleListLayout from './product/promotion/-promotion-assemble-list'
import PromotionCoupon from './product/promotion/-promotion-coupon'
import GoodsIntro from './product/goods/-goods-intro'
import GoodsRecommend from './product/goods/-goods-recommend'
import storeLayout from './product/shop/-shop'
import Evaluation from './product/evaluation/-evaluation'
import GoodsSwiper from './product/goods/-goods-swiper'
import popupGoods from '@/components/m-buy/goods'
import popupAddress from './product/popup/address'
import shares from '@/components/m-share/index'
import takeDownFormSaleGoods from '@/components/m-take-down-sale-goods/index'
import setup from './product/popup/popup'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const instance = getCurrentInstance()
const popupGoodsRef = ref()
const takeDownSaleRef = ref()

// 响应式数据
const promotionShow = ref(false)
const enableShare = ref(false)
const selectedGoods = ref<any>("")
const isGroup = ref(false)
const isSeckill = ref(false)
const pointDetail = ref<any>("")
const assemble = ref<any>("")
const navbarOnlyBack = reactive({ background: "transparent" })
const navbar = reactive({ background: "#fff" })
const header = reactive({ top: 0, height: 50 })
const goodsParams = ref<any[]>([])
const headerFlag = ref(false)
const headerList = [
  { text: "商品", id: "1" },
  { text: "评价", id: "2" },
  { text: "详情", id: "3" },
  { text: "推荐", id: "4" },
]
const tabScrollTop = ref<any>(null)
const scrollArr = ref<number[]>([])
const scrollId = ref("1")
const scrollFlag = ref(true)
const current = ref("1")
const goodsDetail = ref<any>({})
const goodsSpec = ref<any>("")
const imgList = ref<any[]>([])
const favorite = ref(false)
const recommendList = ref<any[]>([])
const addressFlag = ref(false)
const buyMask = ref(false)
const num = ref(1)
const skuId = ref<any>("")
const storeDetail = ref<any>("")
const storeParams = reactive({
  pageNumber: 1,
  pageSize: 10,
})
const likeGoodsList = ref<any[]>([])
const PromotionList = ref<any>("")
const specList = ref<any[]>([])
const selectedSpec = ref<any[]>([])
const nums = ref(0)
const delivery = ref<any>("")
const exchange = ref<any>({})
const productId = ref(0)
const startTimer = ref(false)
const routerVal = ref<any>("")
const IMLink = ref("")
const takeDownFromSale = ref(false)

// computed
const IM = computed(() => {
  return IMLink.value + storeDetail.value.merchantEuid
})

// E_COUPON：禁加购、免地址；促销展示与 VIRTUAL 对齐（M-02）
const isNonPhysicalGoodsType = computed(() => isNonPhysicalGoods(goodsDetail.value?.goodsType))
const showAddToCart = computed(() => {
  return !isNonPhysicalGoodsType.value
})
const isAppointmentGoodsType = computed(() => isAppointmentGoods(goodsDetail.value?.goodsType))

// watch
watch(isGroup, (val) => {
  if (val) {
    let timer = setInterval(() => {
      if (popupGoodsRef.value) {
        (popupGoodsRef.value as any).buyType = "PINTUAN"
      }
      clearInterval(timer)
    }, 100)
  } else {
    if (popupGoodsRef.value) {
      (popupGoodsRef.value as any).buyType = ""
    }
  }
})

// 生命周期
onLoad((options: any) => {
  routerVal.value = options
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
  })
  // #endif
})

onShow(async () => {
  goodsDetail.value = {}
  if (routerVal.value.scene) {
    const res = await getMpScene(routerVal.value.scene)
    if (res.data.success) {
      let data = res.data.result.split(",")
      init(data[0], data[1], data[2], data[3] || '')
    }
  } else {
    init(
      routerVal.value.id,
      routerVal.value.goodsId,
      routerVal.value.distributionId,
      routerVal.value.shareId || ''
    )
  }
})

// 方法
function reStartTakeDownSale() {
  if (takeDownSaleRef.value) {
    (takeDownSaleRef.value as any).show = true
  }
}

function share() {
  return `/pages/product/goods?id=${routerVal.value.id}&goodsId=${routerVal.value.goodsId}`
}

function emptyPromotion(): boolean {
  if (PromotionList.value == "" || PromotionList.value == null || PromotionList.value == []) {
    return true
  }
  return false
}

function selectSku(idObj: any) {
  init(idObj.skuId, idObj.goodsId)
}

async function init(id: any, goodsId: any, distributionId = "", shareId = "") {
  isGroup.value = false
  productId.value = id

  let response = await getGoods(id || 'undefined', goodsId)

  if (!response?.data?.success) {
    if (response?.data?.code == 11001) {
      takeDownFromSale.value = true
    }
    uni.showToast({
      title: response?.data?.message || '商品加载失败',
      icon: 'none'
    })
    return
  }

  const distId = distributionId || store.state.distributionId
  if (distId) {
    await tryBindDistribution(distId)
  }
  if (distId && goodsId && id && storage.getAccessToken()) {
    recordDistributionGoodsVisit({
      skuId: id,
      goodsId,
      distributionId: distId,
      shareId: shareId || undefined,
    }).then((res) => {
      if (res?.data?.success) {
        store.state.distributionId = distId
      }
    }).catch(() => {})
  }

  const resultData = response.data.result?.data
  if (!resultData) {
    uni.showToast({
      title: '商品数据异常',
      icon: 'none'
    })
    return
  }

  goodsDetail.value = resultData
  if (goodsDetail.value) {
    goodsDetail.value.thumbnail = parseGoodsImageUrl(goodsDetail.value.thumbnail)
  }
  goodsSpec.value = response.data.result.specs || ""
  PromotionList.value = response.data.result.promotionMap || ""
  goodsParams.value = response.data.result.goodsParamsDTOList || []

  PromotionList.value &&
    Object.keys(PromotionList.value).forEach((item: string) => {
      if (item.indexOf("PINTUAN") == 0) {
        isGroup.value = true
      }
      if (item.indexOf("SECKILL") == 0) {
        isSeckill.value = true
      }
    })

  const gallery = (goodsDetail.value.goodsGalleryList || [])
    .map((i: any) => parseGoodsImageUrl(i, ""))
    .filter(Boolean)
  imgList.value = [...new Set(gallery)]

  getStoreBaseInfoFun(goodsDetail.value.storeId)
  cartCount()
  getStoreRecommend()
  getOtherLikeGoods()

  if (isLogin("auth")) {
    getGoodsCollectionFun(goodsDetail.value.id)
  }
}

async function getIMDetailMethods() {
  let res = await getIMDetail()
  if (res.data.success) {
    IMLink.value = res.data.result
  }
}

function linkMsgDetail() {
  talkIm(goodsDetail.value.storeId, routerVal.value.goodsId, routerVal.value.id)
}

function changedGoods(val: any) {
  selectedGoods.value = val
}

function deliveryFun(val: any) {
  delivery.value = val
}

function closePopupAddress(val: any) {
  addressFlag.value = val
}

function closePopupBuy(val: any) {
  buyMask.value = val
}

function toAssembleBuyNow(order: any) {
  shutMask(4, "PINTUAN", order)
}

function reluchToCart() {
  let obj = {
    from: "product",
    id: productId.value,
  }
  storage.setCartBackbtn(obj)
  uni.switchTab({
    url: "/pages/tabbar/cart/cartList",
  })
}

function cartCount() {
  if (storage.getHasLogin()) {
    API_trade.getCartNum().then((res: any) => {
      nums.value = res.data.result
    })
  }
}

function back() {
  uni.navigateBack({
    fail() {
      uni.switchTab({ url: '/pages/tabbar/home/index' })
    },
  })
}

function getStoreBaseInfoFun(id: any) {
  API_store.getStoreBaseInfo(id).then((res: any) => {
    if (res.data.success) {
      storeDetail.value = res.data.result
      if (storeDetail.value) {
        storeDetail.value.storeLogo = parseGoodsImageUrl(storeDetail.value.storeLogo)
      }
    }
  })
}

function deleteGoodsCollectionFun(id: any) {
  API_Members.deleteGoodsCollection(id).then((res: any) => {
    if (res.statusCode == 200) {
      uni.showToast({
        title: "商品已取消收藏!",
        icon: "none",
      })
      favorite.value = !favorite.value
    }
  })
}

function getGoodsCollectionFun(goodsId: any) {
  if (storage.getHasLogin()) {
    API_Members.getGoodsIsCollect("GOODS", goodsId).then((res: any) => {
      favorite.value = res.data.result
    })
  }
}

function getStoreRecommend() {
  getGoodsList({
    pageNumber: 1,
    pageSize: 6,
    storeId: goodsDetail.value.storeId,
    recommend: true,
  }).then((res: any) => {
    recommendList.value = (res.data.result.records || []).map((item: any) => ({
      ...item,
      thumbnail: parseGoodsImageUrl(item.thumbnail),
    }))
  })
}

function getOtherLikeGoods() {
  getGoodsList({
    pageNumber: 1,
    pageSize: 10,
    currentGoodsId: goodsDetail.value.id,
    keyword: goodsDetail.value.name
  }).then((res: any) => {
    likeGoodsList.value = (res.data.result.records || []).map((item: any) => ({
      ...item,
      thumbnail: parseGoodsImageUrl(item.thumbnail),
    }))
  })
}

function receiveCouponsFun(id: any) {
  API_Members.receiveCoupons(id).then((res: any) => {
    uni.showToast({
      title: res.data.message,
      icon: "none",
    })
  })
}

function navigateToStore(store_id: any) {
  uni.navigateTo({
    url: `/pages/product/shopPage?id=` + store_id,
  })
}

function getCoupon(item: any) {
  receiveCouponsFun(item.id)
}

function goAppointmentCheckout(num = 1) {
  const sku = goodsDetail.value?.id
  const gid = goodsDetail.value?.goodsId || routerVal.value.goodsId
  if (!sku || !gid) {
    uni.showToast({ title: '商品信息异常', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/order/appointment/appointmentCheckout?skuId=${sku}&goodsId=${gid}&num=${num}`,
  })
}

function handleBuyClick() {
  if (isAppointmentGoodsType.value) {
    goAppointmentCheckout()
    return
  }
  shutMask(4, 'buy')
}

function shutMask(flag: any, buyFlag?: any, type?: any) {
  promotionShow.value = false
  buyMask.value = false
  addressFlag.value = false
  if (flag) {
    switch (flag) {
      case 1:
        promotionShow.value = true
        break
      case 3:
        addressFlag.value = true
        break
      case 4:
        buyMask.value = true
        if (buyFlag == "PINTUAN") {
          if (type.orderSn && popupGoodsRef.value) {
            (popupGoodsRef.value as any).parentOrder = type
          }
          if (popupGoodsRef.value) {
            (popupGoodsRef.value as any).buyType = "PINTUAN"
          }
        }
        if (buyFlag == "buy") {
          if (popupGoodsRef.value) {
            (popupGoodsRef.value as any).buyType = ""
          }
        }
        break
    }
  }
}

function clickFavorite(id: any) {
  if (favorite.value) {
    deleteGoodsCollectionFun(id)
    return false
  }
  API_Members.collectionGoods("GOODS", id).then((res: any) => {
    if (res.data.success) {
      uni.showToast({
        title: "收藏成功!",
        icon: "none",
      })
    }
  })
  favorite.value = !favorite.value
}

function pageScroll(e: any) {
  if (scrollFlag.value) {
    calcSize()
  }
  if (e.detail.scrollTop > 200) {
    headerFlag.value = true
  } else {
    headerFlag.value = false
  }
  if (e.detail.scrollTop < scrollArr.value[0] - 10) {
    scrollId.value = "1"
  }
  if (e.detail.scrollTop > scrollArr.value[1] - 10) {
    scrollId.value = "2"
  }
  if (e.detail.scrollTop > scrollArr.value[2] - 10) {
    scrollId.value = "3"
  }
  if (e.detail.scrollTop > scrollArr.value[3] - 10) {
    scrollId.value = "4"
  }
}

function calcSize() {
  scrollArr.value = []
  let h = 0
  const arr = [
    "main1", "main2", "main3", "main4", "main5",
    "main6", "main7", "main8", "main9", "main10", "main11",
  ]
  arr.forEach((item: string) => {
    uni.createSelectorQuery()
      .in(instance?.proxy)
      .select("#" + item)
      .fields({ size: true }, (data: any) => {
        if (item === "main1" || item === "main5" || item === "main9" || item === "main11") {
          scrollArr.value.push(h)
        }
        if (data && data.height) {
          h += data.height
        }
      })
      .exec()
  })
  scrollFlag.value = false
}

function headerTab(id: string) {
  if (scrollFlag.value) {
    calcSize()
  }
  scrollId.value = id
  nextTick(() => {
    tabScrollTop.value = scrollArr.value[parseInt(id) - 1]
  })
}

async function shareChange() {
  enableShare.value = true
}
</script>

<style lang="scss" scoped>
// #ifdef MP-WEIXIN
@import "./product/mp-goods.scss";
// #endif

@import "./product/style.scss";
@import "./product/product.scss";
</style>
