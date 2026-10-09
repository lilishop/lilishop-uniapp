<template>
  <view :style="themeStyle" class="wrapper" v-if="flag">
    <div class='goods' v-if="selectedGoods">
      <image class="goods-image" :src="selectedGoods.thumbnail" alt="" />
      <p class="goodsName">{{selectedGoods.goodsName}}</p>
      <div class="goodsPrice">{{ unitPrice(selectedGoods.promotionPrice || selectedGoods.price, '￥') }}</div>
    </div>
    <div>
      <div class="tips">

        <span v-if="master.toBeGroupedNum">
          还差<span class="num">{{master.toBeGroupedNum || 0}}</span>人，赶快邀请好友拼单吧
        </span>
        <span v-if="isBuy &&!master.toBeGroupedNum >0">
          已成功拼团
        </span>
        <span v-if="!master.toBeGroupedNum >0">
          拼团已结束
        </span>
      </div>

      <div v-if="isMaster && !isOver">
        <div class="share-user" v-if="master.toBeGroupedNum" @click="share()">
          邀请好友拼团
        </div>
        <div class="home" @click="handleClickHome()">
          去首页逛逛
        </div>
      </div>
      <div v-if="!isMaster && !isOver && !isBuy && master.toBeGroupedNum">
        <div class="share-user" @click="toBuy">
          参与拼团
        </div>
      </div>
      <div v-if="!isMaster && !isOver && isBuy">
        <div class="share-user disabled">
          已购买该商品
        </div>
      </div>
      <div v-if="isOver">
        <!-- <div class="share-user disabled">
          拼团已结束
        </div> -->
        <div class="home" @click="handleClickHome()">
          去首页逛逛
        </div>
      </div>
    </div>

    <!-- 倒计时 -->
    <div class="count-down" v-if="!isOver && master.toBeGroupedNum">
      <u-count-down
        v-if="timeStamp > 0"
        bgColor="#ededed"
        :time="timeStamp * 1000"
        format="HH:mm:ss"
        @finish="onCountDownEnd"
      ></u-count-down>
    </div>

    <div class="user-list" v-if="data.pintuanMemberVOS">
      <div class="user-item" v-for="(item,index) in data.pintuanMemberVOS" :key="index">
        <span class="master" v-if="item.orderSn == ''">团长</span>
        <image class="img" :src="item.face" alt="" />
      </div>
    </div>

    <popupGoods
      :addr="addr"
      ref="popupGoodsRef"
      :buyMask="maskFlag"
      @closeBuy="closePopupBuy"
      :goodsDetail="goodsDetail"
      :goodsSpec="goodsSpec"
      v-if="goodsDetail.id"
      @handleClickSku="getGoodsDetail"
    />
    <shares
      @close="closeShare"
      :link="shareLink"
      type="pintuan"
      :thumbnail="data.promotionGoods.thumbnail"
      :goodsName="data.promotionGoods.goodsName"
      v-if="shareFlag"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getGoods } from '@/api/goods.js'
import { getPinTuanShare } from '@/api/order'
import shares from '@/components/m-share/index'
import storage from '@/utils/storage.js'
import popupGoods from '@/components/m-buy/goods'
import { unitPrice } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const popupGoodsRef = ref<any>(null)
const flag = ref(false)
const addr = ref({ id: '' })
const maskFlag = ref(false)
const timeStamp = ref(0)
const shareFlag = ref(false)
const data = ref<any>(null)
const isMaster = ref(true)
const selectedGoods = ref<any>(null)
const routers = ref<Record<string, string>>({})
const goodsDetail = ref<any>({})
const goodsSpec = ref<any>(null)
const master = ref<any>(null)
const PromotionList = ref<any>(null)
const isGroup = ref(false)
const isOver = ref(false)
const isBuy = ref(false)

const shareLink = computed(() => {
  const { sn, sku, goodsId } = routers.value
  return `/pages/cart/payment/shareOrderGoods?sn=${sn}&sku=${sku}&goodsId=${goodsId}`
})

watch(isGroup, (val) => {
  if (val) {
    const timer = setInterval(() => {
      if (popupGoodsRef.value) {
        popupGoodsRef.value.buyType = 'PINTUAN'
      }
      clearInterval(timer)
    }, 100)
  } else if (popupGoodsRef.value) {
    popupGoodsRef.value.buyType = ''
  }
})

onLoad((options) => {
  routers.value = options || {}
})

onMounted(() => {
  init(routers.value.sn, routers.value.sku)
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function closeShare() {
  shareFlag.value = false
}

function onCountDownEnd() {
  isOver.value = true
}

function toBuy() {
  maskFlag.value = true
  if (!popupGoodsRef.value) return
  popupGoodsRef.value.parentOrder = {
    ...master.value,
    orderSn: routers.value.sn,
  }
  popupGoodsRef.value.isMask = true
  popupGoodsRef.value.isClose = true
  popupGoodsRef.value.buyType = 'PINTUAN'
}

function share() {
  shareFlag.value = true
}

function closePopupBuy() {
  maskFlag.value = false
}

async function init(sn: string, sku: string) {
  const res = await getPinTuanShare(sn, sku)
  if (res.data.success && res.data.result.promotionGoods) {
    flag.value = true
    data.value = res.data.result
    selectedGoods.value = res.data.result.promotionGoods
    const endTime = Date.parse(
      res.data.result.promotionGoods.endTime.replace(/-/g, '/')
    )
    const endTimestamp = Date.parse(new Date(endTime) as any) / 1000
    const dateTime = Date.parse(new Date() as any) / 1000
    timeStamp.value = parseInt(String(endTimestamp - dateTime))
    isOver.value = timeStamp.value <= 0

    master.value =
      res.data.result.pintuanMemberVOS.length != 0 &&
      res.data.result.pintuanMemberVOS.filter((item: any) => item.orderSn == '')[0]

    if (
      storage.getUserInfo(routers.value.sku, routers.value.goodsId).id ==
      master.value.memberId
    ) {
      isMaster.value = true
    } else {
      isMaster.value = false
      getGoodsDetail({
        id: routers.value.sku,
        goodsId: routers.value.goodsId,
      })
    }

    if (storage.getUserInfo().id) {
      const bought = res.data.result.pintuanMemberVOS.filter(
        (item: any) => item.memberId == storage.getUserInfo().id
      )
      isBuy.value = bought.length != 0
    }
  } else {
    uni.showToast({
      title: '当前拼团单有误！请联系管理员重试',
      duration: 2000,
      icon: 'none',
    })
  }
}

function getGoodsDetail(val: { id: string; goodsId: string }) {
  const { id, goodsId } = val
  uni.showLoading({ title: '加载中', mask: true })
  getGoods(id, goodsId).then((response) => {
    goodsDetail.value = response.data.result.data
    selectedGoods.value = response.data.result.data
    goodsSpec.value = response.data.result.specs
    hideLoadingIfNeeded()
    PromotionList.value = response.data.result.promotionMap
    if (PromotionList.value) {
      Object.keys(PromotionList.value).forEach((item) => {
        if (item.indexOf('PINTUAN') == 0) {
          isGroup.value = true
        }
      })
    }
  })
}

function handleClickHome() {
  uni.switchTab({ url: '/pages/tabbar/home/index' })
}
</script>

<style lang="scss" scoped>
page {
  background: #fff;
}
.over {
  margin: 10% 0;
}
.goods {
  display: flex;
  align-content: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  width: 80%;
  margin: 0 auto;
}
.goods-image {
  margin: 40rpx auto;
  width: 400rpx;
  height: 400rpx;
}
.goodsName {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 30rpx;
  font-weight: bold;
}
.goodsPrice {
  margin-top: 10rpx;
  font-weight: bold;
  font-size: 40rpx;
  color: $main-color;
}
.master {
  z-index: 99;
  position: absolute;
  top: 0;
  left: 0;
  background: $light-color;
  padding: 0 8rpx;
  border-radius: 10rpx;
  color: #fff;
}
.user-item {
  position: relative;
  margin: 20rpx;
}
.count-down {
  margin: 40rpx 0;
  text-align: center;
}
.img {
  border-radius: 50%;
  border: 2rpx solid $light-color;
  width: 100rpx;
  height: 100rpx;
}
.user-list {
  width: 80%;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.tips {
  margin-top: 10%;
  text-align: center;
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 100rpx;
}
.num {
  color: $main-color;
  font-size: 60rpx;
  margin: 0 10rpx;
}

.home,
.share-user {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  width: 80%;
  margin: 30rpx auto 0 auto;
  color: #fff;
  border-radius: 0.4em;
}
.share-user {
  background: $main-color;
}
.disabled {
  background: var(--theme-primary-20, rgba(255, 60, 42, 0.2));
}
.home {
  color: $main-color;
  border: 2rpx solid $main-color;
}
</style>
