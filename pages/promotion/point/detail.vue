<template>
  <div class="page">
    <u-navbar
      :border="false"
      title="积分商品"
      :fixed="true"
      :placeholder="true"
      :auto-back="true"
    ></u-navbar>

    <div class="wrapper">
      <!-- 积分商品列表 -->
      <div class="box box1">
        <div class="bargain">
          <div class="row-title">商品信息</div>
          <div class="flex row-item">
            <div class="goods-img">
              <u-image width="200" height="200" :src="goodsData.thumbnail"></u-image>
            </div>
            <div class="goods-config">
              <div class="goods-title wes-2">
                {{goodsData.goodsName}}
              </div>
              <div class="flex price-box">
                <div class="purchase-price">积分:<span>{{unitPrice(pointDetail.points) }}</span>
                </div>
                <div class="max-price">原价:<span>￥{{unitPrice(goodsData.price)}}</span>

                </div>
              </div>
              <div class="tips">{{goodsData.sellingPoint}}</div>
            </div>
          </div>

          <div class="buy" @click="getGoodsDetail">
            立即购买
          </div>
        </div>
      </div>

      <!-- 产品详情 -->
      <div class="box box3">
        <div class="bargain">
          <div class="row-title">商品详情</div>
          <view class="u-content">
            <u-parse :content="goodsData.mobileIntro" :tag-style="style"></u-parse>
          </view>
        </div>
      </div>

      <!-- 购买 -->
      <popupGoods ref="popupGoodsRef" :goodsSpec="goodsSpec" :buyMask="maskFlag" @closeBuy="closePopupBuy" :goodsDetail="goodsData" v-if="goodsData.id " @handleClickSku="getGoodsDetail" />

      <div class="box4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import popupGoods from '@/components/m-buy/goods'
import { getPointsGoodsDetail } from '@/api/promotions'
import { unitPrice } from '@/utils/filters.js'

const style = ref({
  img: 'display:block',
})

const maskFlag = ref(false)
const goodsData = ref<any>({})
const pointDetail = ref<any>({})
const goodsSpec = ref<any>({})
const routerVal = ref<Record<string, string>>({})

const popupGoodsRef = ref<any>(null)

onLoad((options) => {
  routerVal.value = options || {}
})

onShow(() => {
  init()
})

function getGoodsDetail() {
  uni.showLoading({
    title: '加载中',
    mask: true,
  })
  popupGoodsRef.value?.buy({
    skuId: goodsData.value.id,
    num: 1,
    cartType: 'POINTS',
  })
}

async function init() {
  const res = await getPointsGoodsDetail(routerVal.value.id)
  if (res.data.success) {
    goodsData.value = res.data.result.goodsSku
    pointDetail.value = res.data.result
  }
}

function closePopupBuy(val: boolean) {
  maskFlag.value = val
}
</script>
<style lang="scss">
</style>
<style lang="scss" scoped>
.page {
  min-height: 100vh;
}
.slot-content {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin: 20rpx 0 80rpx 0;
}
.price {
  margin-left: 10rpx;
  color: #44a88d;
}
.price-box {
  align-items: center;
  padding: 10rpx 0;
}

.box {
  background: #fff;
  border-radius: 20rpx;
  position: relative;

  margin: 40rpx auto;
  > .bargain {
    padding: 32rpx;
  }
}

.row-item {
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
  color: #44a88d;
  > span {
    font-size: 32rpx;
    font-weight: bold;
  }
}

.buy {
  font-size: 24rpx;
  color: #fff;
  width: 80%;
  margin: 50rpx auto 0 auto;
  text-align: center;
  font-size: 30rpx;
  background-image: linear-gradient(25deg, #00627d, #2d8485, #44a88d, #57ce93);

  padding: 18rpx;
  border-radius: 100px;
}

.line {
  margin: 20rpx 0;
}
.tips {
  font-size: 24rpx;
  color: #999;
  justify-content: space-between;
}
.row-progress {
  margin: 20rpx 0;
}
.row-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #44a88d;
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
    }
    > div:nth-last-of-type(1) {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.mobile-intro {
  overflow: hidden;
  max-width: 100%;
}
</style>
