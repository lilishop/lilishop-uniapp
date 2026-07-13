<template>
  <div class="page" :style="themeStyle">
    <u-navbar
      :auto-back="false"
      @leftClick="back"
      left-icon-color="#fff"
      :bg-color="background.backgroundColor"
      :border="false"
    >
    </u-navbar>

    <div class="wrapper-box">
      <!-- 砍价列表 -->
      <div class="box box1">
        <div class="bargain">
          <div class="flex bargain-item">
            <div class="goods-img">
              <u-image width="200rpx" height="200rpx" :src="bargainDetail.thumbnail"></u-image>
            </div>
            <div class="goods-config">
              <div class="goods-title wes-2">
                {{ bargainDetail.goodsName }}
              </div>
              <div class="flex price-box">
                <div class="purchase-price">
                  当前:<text>￥{{ activityData.surplusPrice == 0 ? bargains.purchasePrice : unitPrice(activityData.surplusPrice) }}</text>
                </div>
                <div class="max-price">原价:<text>￥{{ unitPrice(bargainDetail.price) }}</text></div>
              </div>
              <div class="tips">{{ bargainDetail.sellingPoint }}</div>
            </div>
          </div>
          <!-- 砍价进度 -->
          <div class="bargain-progress">
            <u-line-progress
              class="line"
              :active-color="lightColor"
              :percentage="totalPercent"
              :show-text="false"
              height="12"
            >
            </u-line-progress>
            <div class="flex tips">
              <div>已砍{{ cutPrice }}元</div>
              <div>还剩{{ activityData.surplusPrice }}元</div>
            </div>
          </div>
          <!-- 参与砍价 -->
          <div class="bargaining" v-if="!activityData.pass && activityData.status != 'END'" @click="shareBargain">
            邀请砍价
          </div>
          <!-- 立即购买 -->
          <div v-else>
            <div v-if="activityData.status != 'END'" class="buy" @click="getGoodsDetail">
              立即购买
            </div>
          </div>
          <!-- 我要开团 -->
          <div class="start" v-if="activityData.memberId != loginUser.id" @click="startOpenGroup">我要开团</div>
        </div>
      </div>
      <!-- 帮砍列表 -->
      <div class="box box2">
        <div class="bargain">
          <div class="bargain-title">帮忙砍</div>
          <div class="user-item flex" v-if="logData.length != 0" v-for="(item, index) in logData" :key="index">
            <div>
              <u-image width="75rpx" shape="circle" height="75rpx" :src="item.kanjiaMemberFace"></u-image>
            </div>
            <div class="user-config flex">
              <div class="user-name">
                <div>{{ noPassByName(item.kanjiaMemberName) }}</div>
                <div>使出吃的奶劲儿</div>
              </div>
              <div class="save">砍掉：<text>￥{{ unitPrice(item.kanjiaPrice) }}</text></div>
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
      <u-modal
        title="恭喜您砍掉了"
        v-model:show="Bargaining"
        :close-on-click-overlay="true"
        :show-confirm-button="false"
      >
        <view class="slot-content">
          <u-count-to
            :start-val="0"
            ref="uCountToRef"
            font-size="100"
            :color="lightColor"
            :end-val="kanjiaPrice"
            :decimals="2"
            :autoplay="autoplay"
          ></u-count-to>
          <text class="price">元</text>
        </view>
      </u-modal>
      <!-- 帮砍 -->
      <u-modal title=" " v-model:show="helpBargainFlage" :show-confirm-button="false">
        <view class="help-bargain" @click="handleClickHelpBargain">
          <u-image
            width="100%"
            height="600rpx"
            src="https://lilishop-oss.oss-cn-beijing.aliyuncs.com/91631d5a66c7426bbe3f7d644ee41946.jpeg"
          ></u-image>
          <u-image class="help" width="300rpx" height="80rpx" src="/pages/promotion/static/help-bargain.png"></u-image>
        </view>
      </u-modal>

      <!-- 分享 -->
      <shares
        @close="closeShare"
        :link="share()"
        type="kanjia"
        :thumbnail="bargainDetail.thumbnail"
        :goodsName="bargainDetail.goodsName"
        v-if="shareFlage"
      />

      <!-- 购买 -->
      <popupGoods
        ref="popupGoodsRef"
        :buyMask="maskFlag"
        @closeBuy="closePopupBuy"
        :goodsDetail="bargainDetail"
        :goodsSpec="goodsSpec"
        v-if="bargainDetail.id"
        @handleClickSku="getGoodsDetail"
      />
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
import { getThemeStyle } from '@/utils/theme'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const themeStyle = computed(() => getThemeStyle(store.state.theme))

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
        100 - Math.floor((val.surplusPrice / bargainDetail.value.price) * 100)
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
  background-color: var(--theme-light, #ff6b35) !important;
}
</style>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding-bottom: 40rpx;
}

.slot-content {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 20rpx 0 80rpx 0;
}

.price {
  margin-left: 10rpx;
  color: var(--theme-light, #ff6b35);
}

.price-box {
  align-items: center;
  padding: 10rpx 0;
}

.wrapper-box {
  background: url('https://lili-system.oss-cn-beijing.aliyuncs.com/kanjia.png') no-repeat top center;
  background-size: 100% 506rpx;
  width: 100%;
  box-sizing: border-box;
  padding-top: 420rpx;
  padding-bottom: 40rpx;
}

.box {
  background: #fff;
  border-radius: 20rpx;
  position: relative;
  width: 94%;
  margin: 0 auto 20rpx;
  overflow: hidden;

  > .bargain {
    padding: 32rpx;
  }
}

.bargain-item {
  align-items: center;
}

.goods-img {
  flex-shrink: 0;
}

.goods-config {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;

  > .goods-title {
    font-weight: bold;
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
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
  color: var(--theme-primary, #ff3c2a);

  > text {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.bargaining,
.buy,
.start {
  width: 80%;
  margin: 50rpx auto 0;
  text-align: center;
  font-size: 30rpx;
  padding: 18rpx;
  border-radius: 100px;
  box-sizing: border-box;
}

.start {
  border: 1rpx solid var(--theme-primary, #ff3c2a);
  color: var(--theme-primary, #ff3c2a);
}

.bargaining,
.buy {
  color: #fff;
  background-image: linear-gradient(
    25deg,
    var(--theme-primary, #ff3c2a),
    var(--theme-light, #ff6b35),
    var(--theme-aider, #ff9f28)
  );
  animation: mymove 5s infinite;
  animation-direction: alternate;
  animation-timing-function: ease-in-out;
}

@keyframes mymove {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
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
  color: var(--theme-light, #ff6b35);
  text-align: center;
  margin-bottom: 40rpx;
}

.user-item {
  margin: 40rpx 0;
  align-items: center;
}

.user-config {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: space-between;

  > .user-name {
    flex: 1;
    min-width: 0;

    > div:nth-of-type(1) {
      font-size: 28rpx;
      max-width: 300rpx;
      overflow: hidden;
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
  flex-shrink: 0;
  color: var(--theme-light, #ff6b35);

  > text {
    font-weight: bold;
  }
}

.u-content {
  overflow: hidden;
  max-width: 100%;
}

@keyframes fontMove {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.1);
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
    margin: 40rpx 0;
    border-radius: 20rpx;
    animation: fontMove 5s infinite;
    animation-direction: alternate;
    animation-timing-function: ease-in-out;
  }
}
</style>
