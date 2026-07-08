<template>
  <div class="page">
    <u-navbar :auto-back="false" @leftClick="back" left-icon-color="#fff" :bg-color="background.backgroundColor" :border="false">
    </u-navbar>

    <div class="wrapper-box">
      <!-- 砍价列表 -->
      <div class="box box1">
        <div class="bargain">
          <div class="flex bargain-item">
            <div class="goods-img">
              <u-image width="200" height="200" :src="bargainDetail.thumbnail"></u-image>
            </div>
            <div class="goods-config">
              <div class="goods-title wes-2">
                {{bargainDetail.goodsName}}
              </div>
              <div class="flex price-box">
                <div class="purchase-price">
                  当前:<span>￥{{ activityData.surplusPrice == 0 ? bargains.purchasePrice : unitPrice(activityData.surplusPrice)}}</span>
                </div>
                <div class="max-price">原价:<span>￥{{unitPrice(bargainDetail.price)}}</span>

                </div>
              </div>
              <div class="tips">{{bargainDetail.sellingPoint}}</div>
            </div>
          </div>
          <!-- 砍价进度 -->
          <div class="bargain-progress">
            <u-line-progress class="line" :active-color="lightColor" striped striped-active :percent="totalPercent">
            </u-line-progress>
            <div class="flex tips">
              <div>已砍{{cutPrice}}元</div>
              <div>还剩{{activityData.surplusPrice}}元</div>
            </div>
          </div>
          <!-- 参与砍价 -->
          <div class="bargaining" v-if="!activityData.pass && activityData.status!='END'" @click="shareBargain">
            邀请砍价
          </div>
          <!-- 立即购买 -->
          <div v-else>

            <div v-if="activityData.status!='END'" class="buy" @click="getGoodsDetail">
              立即购买
            </div>
          </div>
          <!-- 我要开团 -->
          <div class="start" v-if="activityData.memberId != loginUser.id" @click="startOpenGroup">我要开团
          </div>
        </div>
      </div>
      <!-- 帮砍列表 -->
      <div class="box box2">
        <div class="bargain">
          <div class="bargain-title">帮忙砍</div>
          <div class="user-item flex" v-if="logData.length !=0 " v-for="(item,index) in logData" :key="index">
            <div>
              <u-image width="75" shape="circle" height="75" :src="item.kanjiaMemberFace"></u-image>
            </div>
            <div class="user-config flex">
              <div class="user-name">
                <div>{{noPassByName(item.kanjiaMemberName)}}</div>
                <div>使出吃的奶劲儿</div>
              </div>
              <div class="save">砍掉：<span>￥{{unitPrice(item.kanjiaPrice)}}</span></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 产品详情 -->
      <div class="box box3">
        <div class="bargain">
          <div class="bargain-title">商品详情</div>
          <view class="u-content">
            <u-parse :content="bargainDetail.mobileIntro" :tag-style="style"></u-parse>
          </view>

        </div>
      </div>

      <!-- 砍价 -->
      <u-modal title="恭喜您砍掉了" v-model:show="Bargaining" mask-close-able :show-confirm-button="false"
        :title-style="{color: lightColor}">
        <view class="slot-content">
          <u-count-to :start-val="0" ref="uCountToRef" font-size="100" :color="lightColor" :end-val="kanjiaPrice"
            :decimals="2" :autoplay="autoplay"></u-count-to><span class="price">元</span>
        </view>
      </u-modal>
      <!-- 帮砍 -->

      <u-modal :show-title="false" v-model:show="helpBargainFlage" :show-confirm-button="false">
        <view class="help-bargain" @click="handleClickHelpBargain">
          <u-image width="100%" height="600rpx"
            src="https://lilishop-oss.oss-cn-beijing.aliyuncs.com/91631d5a66c7426bbe3f7d644ee41946.jpeg"></u-image>
          <u-image class="help" width="300rpx" height="80rpx" src="/pages/promotion/static/help-bargain.png"></u-image>
        </view>
      </u-modal>

      <!-- 分享 -->
      <shares @close="closeShare" :link="share()" type="kanjia" :thumbnail="bargainDetail.thumbnail"
        :goodsName="bargainDetail.goodsName" v-if="shareFlage " />

      <!-- 购买 -->
      <popupGoods ref="popupGoodsRef" :buyMask="maskFlag" @closeBuy="closePopupBuy" :goodsDetail="bargainDetail"
        :goodsSpec="goodsSpec" v-if="bargainDetail.id " @handleClickSku="getGoodsDetail" />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
// #ifdef MP-WEIXIN
import { onShareAppMessage } from '@dcloudio/uni-app'
// #endif
import { useStore } from '@/store'
import popupGoods from '@/components/m-buy/goods'
import {
  getBargainDetail,
  getBargainActivity,
  openBargain,
  getBargainLog,
  helpBargain,
} from '@/api/promotions'
import shares from '@/components/m-share/index'
import config from '@/config/config'
import { unitPrice, noPassByName, isLogin } from '@/utils/filters.js'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)

const style = ref({
  img: 'display:block',
})

const background = ref({
  backgroundColor: 'transparent',
})

const maskFlag = ref(false)
const shareFlage = ref(false)
const bargains = ref<any>({})
const bargainDetail = ref<any>({})
const Bargaining = ref(false)
const helpBargainFlage = ref(false)
const autoplay = ref(false)
const kanjiaPrice = ref(0)
const totalPercent = ref(0)
const activityData = ref<any>({})
const cutPrice = ref<number | string>(0)

const params = ref<Record<string, any>>({})

const logData = ref<any[]>([])

const logParams = ref({
  pageNumber: 1,
  pageSize: 20,
  kanJiaActivityId: '',
})

const goodsSpec = ref<any>({})
const routerVal = ref<Record<string, string>>({})

const loginUser = computed(() => isLogin() || {})

const popupGoodsRef = ref<any>(null)
const uCountToRef = ref<any>(null)

onLoad((options) => {
  routerVal.value = options || {}
  if (options?.activityId) {
    params.value.kanjiaActivityId = options.activityId
  }
})

// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  return {
    path: share(),
    title: `请快来帮我砍一刀${bargainDetail.value.goodsName}`,
    imageUrl: bargainDetail.value.thumbnail || config.logo,
  }
})
// #endif

onShow(() => {
  init()
})

watch(Bargaining, (val) => {
  if (val) {
    nextTick(() => {
      uCountToRef.value?.start?.()
    })
  }
})

watch(
  activityData,
  (val) => {
    if (val) {
      totalPercent.value =
        100 -
        Math.floor((val.surplusPrice / bargainDetail.value.price) * 100)
      cutPrice.value = (
        bargainDetail.value.price - activityData.value.surplusPrice
      ).toFixed(2)

      logParams.value.kanJiaActivityId = val.id

      if (params.value.kanjiaActivityId && val.help) {
        helpBargainFlage.value = true
      }

      getBargainLogList()
    }
  },
  { immediate: true }
)

function share() {
  return (
    '/pages/promotion/bargain/detail?id=' +
    routerVal.value.id +
    '&activityId=' +
    activityData.value.id
  )
}

function back() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
  } else {
    uni.redirectTo({
      url: `/pages/promotion/bargain/list`,
    })
  }
}

function startOpenGroup() {
  uni.redirectTo({
    url: `/pages/promotion/bargain/list`,
  })
}

function closePopupBuy() {
  maskFlag.value = false
}

function closeShare() {
  shareFlage.value = false
}

function shareBargain() {
  shareFlage.value = true
}

function getGoodsDetail() {
  uni.showLoading({
    title: '加载中',
    mask: true,
  })
  popupGoodsRef.value?.buy({
    skuId: bargainDetail.value.id,
    id: routerVal.value.id,
    num: 1,
    cartType: 'KANJIA',
  })
}

async function init() {
  const res = await getBargainDetail(routerVal.value.id)
  if (res.data.success) {
    bargainDetail.value = res.data.result.goodsSku
    bargains.value = res.data.result
    if (!params.value.kanjiaActivityId) {
      params.value.kanjiaActivityGoodsId = routerVal.value.id
    }
    activity()
  }
}

async function activity() {
  const res = await getBargainActivity(params.value)
  if (res.data.success) {
    if (res.data.result.launch) {
      activityData.value = res.data.result
    } else {
      openActivity()
    }
  }
}

async function getBargainLogList() {
  const res = await getBargainLog(logParams.value)
  if (res.data.success) {
    logData.value = res.data.result.records
  }
}

async function handleClickHelpBargain() {
  const res = await helpBargain(params.value.kanjiaActivityId)
  if (res.data.success) {
    helpBargainFlage.value = false
    kanjiaPrice.value = res.data.result.kanjiaPrice
    Bargaining.value = true
    init()
  } else {
    helpBargainFlage.value = false
  }
}

async function openActivity() {
  const res = await openBargain({ id: routerVal.value.id })
  if (res.data.success) {
    kanjiaPrice.value = res.data.result.kanjiaPrice
    Bargaining.value = true
    init()
  }
}
</script>
<style lang="scss">
page {
  background-color: $light-color !important;
}
</style>
<style lang="scss" scoped>
.slot-content {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 20rpx 0 80rpx 0;
}
.price {
  margin-left: 10rpx;
  color: $light-color;
}
.price-box {
  align-items: center;
  padding: 10rpx 0;
}
.wrapper-box {
  background: url("https://lili-system.oss-cn-beijing.aliyuncs.com/kanjia.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 506rpx;
  width: 100%;
}

.box {
  background: #fff;
  border-radius: 20rpx;
  position: relative;
  width: 94%;
  margin: 0 auto;
  > .bargain {
    padding: 32rpx;
  }
}
.box1 {
  top: 560rpx;
}
.box2 {
  top: 580rpx;
}
.box3 {
  top: 600rpx;
}
.box4 {
  top: 620  rpx;
  height: 200rpx;
}
.bargain-item {
  align-items: center;
}
.goods-config {
  margin-left: 20rpx;
  > .goods-title {
    font-weight: bold;
  }
}
.max-price,
.purchase-price {
  font-size: 24rpx;
  color: #999;
}
.max-price {
  margin-left: 10rpx;
  text-decoration: line-through;
}
.purchase-price {
  color: $main-color;
  > span {
    font-size: 32rpx;
    font-weight: bold;
  }
}
.bargaining,
.buy,
.start {
  font-size: 24rpx;

  width: 80%;
  margin: 50rpx auto 0 auto;
  text-align: center;

  font-size: 30rpx;
  padding: 18rpx;
  border-radius: 100px;
}
.start {
  border: 1rpx solid $main-color;
  color: $main-color;
}
.bargaining,
.buy {
  font-size: 24rpx;
  color: #fff;
  width: 80%;
  margin: 50rpx auto 0 auto;
  text-align: center;
  font-size: 30rpx;
  background-image: linear-gradient(
    25deg,
    $main-color,
    $light-color,
    $aider-light-color
  );

  padding: 18rpx;
  border-radius: 100px;
  animation: mymove 5s infinite;
  -webkit-animation: mymove 5s infinite; /*Safari and Chrome*/
  animation-direction: alternate; /*轮流反向播放动画。*/
  animation-timing-function: ease-in-out; /*动画的速度曲线*/
  /* Safari 和 Chrome */
  -webkit-animation: mymove 5s infinite;
  -webkit-animation-direction: alternate; /*轮流反向播放动画。*/
  -webkit-animation-timing-function: ease-in-out; /*动画的速度曲线*/
}

@keyframes mymove {
  0% {
    transform: scale(1); /*开始为原始大小*/
  }
  25% {
    transform: scale(1.1); /*放大1.1倍*/
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}
.line {
  margin: 20rpx 0;
}
.tips {
  font-size: 24rpx;
  color: #999;
  justify-content: space-between;
}
.bargain-progress {
  margin: 20rpx 0;
}
.bargain-title {
  font-size: 32rpx;
  font-weight: bold;
  color: $light-color;
  text-align: center;
  margin-bottom: 40rpx;
}
.user-item {
  margin: 40rpx 0;
  align-items: center;
}
.user-config {
  margin-left: 20rpx;
  flex: 8;
  align-items: center;
  justify-content: space-between;
  > .user-name {
    > div:nth-of-type(1) {
      font-size: 28rpx;
      max-width: 300rpx;
      overflow: hidden;
      word-wrap: normal;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    > div:nth-last-of-type(1) {
      font-size: 24rpx;
      color: #999;
    }
  }
}
.save {
  color: $light-color;
  > span {
    font-weight: bold;
  }
}
.mobile-intro {
  overflow: hidden;
  max-width: 100%;
}

@keyframes fontMove {
  0% {
    transform: scale(1); /*开始为原始大小*/
  }
  25% {
    transform: scale(1.1); /*放大1.1倍*/
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
}

.help-bargain {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  > .help {
    margin-bottom: 40rpx;
    border-radius: 20rpx;

    margin-top: 40rpx;
    animation: fontMove 5s infinite;
    -webkit-animation: fontMove 5s infinite; /*Safari and Chrome*/
    animation-direction: alternate; /*轮流反向播放动画。*/
    animation-timing-function: ease-in-out; /*动画的速度曲线*/
    /* Safari 和 Chrome */
    -webkit-animation: fontMove 5s infinite;
    -webkit-animation-direction: alternate; /*轮流反向播放动画。*/
    -webkit-animation-timing-function: ease-in-out; /*动画的速度曲线*/
  }
}
</style>
