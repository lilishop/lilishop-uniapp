<template>
  <view :style="themeStyle">
    <view class="after-sales-goods-detail-view">
      <view class="header">
        <view>
          本次售后服务将由
          <text class="seller-name">{{ sku.storeName }}</text>
          为您提供
        </view>
      </view>
      <view>
        <template v-for="(item,index) in sku.orderItems" :key="index">
        <view class="goods-item-view" v-if="item && item.sn == sn" @click="navigateToGoodsDetail(sku.skuId)">
          <view class="goods-img">
            <u-image
              border-radius="6"
              width="131rpx"
              height="131rpx"
              mode="aspectFill"
              :src="getGoodsImage(item)"
            ></u-image>
          </view>
          <view class="goods-info">
            <view class="goods-title">{{ getGoodsName(item) }}</view>
            <view class="goods-price">
              <text v-if="!sku.orderItems || sku.orderItems.length <= 1">￥{{ unitPrice(sku.flowPrice) }}</text>
              <text class="num">购买数量: {{ item.num || 0 }}</text>
            </view>
          </view>
        </view>
        </template>
      </view>
    </view>

    <view class="select-view">
      <view class="select-cell" v-if="applyInfo.returnGoods" @click="onSelect(1)">
        <view class="select-image">
          <image class="select-icon" src="/pages/order/static/t1.png"></image>
        </view>
        <view class="cell-body">
          <view class="select-title">退货</view>
          <view class="select-sub-title">退回收到的商品</view>
        </view>
        <u-icon name="arrow-right" color="#bababa" size="28rpx"></u-icon>
      </view>
      <view class="select-cell" v-if="applyInfo.returnMoney" @click="onSelect(3)">
        <view class="select-image">
          <image class="select-icon" src="/pages/order/static/t3.png"></image>
        </view>
        <view class="cell-body">
          <view class="select-title">退款</view>
          <view class="select-sub-title">退款商品返还金额</view>
        </view>
        <u-icon name="arrow-right" color="#bababa" size="28rpx"></u-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { unitPrice, parseGoodsImageUrl } from '@/utils/filters.js'
import { getAfterSaleInfo } from '@/api/after-sale'
import storage from '@/utils/storage'
// 深链进入时拦截 E_COUPON，后端 apply/save 亦会拒绝
import { isECouponOrder } from '@/utils/goodsType.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const sn = ref('')
const sku = ref<any>({})
const applyInfo = ref<any>({})

onLoad((options) => {
  sn.value = options?.sn || ''
  const cached = storage.getAfterSaleData()
  sku.value = cached && typeof cached === 'object' ? cached : { orderItems: [] }
  if (!Array.isArray(sku.value.orderItems)) sku.value.orderItems = []
  if (isECouponOrder(sku.value?.orderType)) {
    uni.showToast({
      title: '电子卡券订单不支持售后',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    return
  }
  init()
})

function getGoodsName(item: any) {
  return item.goodsName || item.name || ''
}

function getGoodsImage(item: any) {
  const image = item.image || item.goodsImage || item.thumbnail
  return parseGoodsImageUrl(image)
}

function init() {
  getAfterSaleInfo(sn.value).then((response) => {
    if (response.data.success) {
      applyInfo.value = response.data.result
    }
  })
}

function onSelect(value: number) {
  uni.redirectTo({
    url: `./afterSalesDetail?sn=${sn.value}&value=${value}`,
  })
}

function navigateToGoodsDetail(skuId: string) {
  uni.navigateTo({
    url: `/pages/product/goods?id=${skuId}&goodsId=${sku.value.goodsId}`,
  })
}
</script>

<style lang="scss">
page,
.content {
  background: $page-color-base;
  height: 100%;
}
.after-sales-goods-detail-view {
  background-color: #fff;
  .header {
    background-color: #f7f7f7;
    color: #999999;
    font-size: 22rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    line-height: 70rpx;
    .header-text {
      background-color: #999999;
      padding: 10rpx 30rpx;
      border-radius: 50rpx;
    }
    .seller-name {
      color: $main-color;
    }
  }

  .goods-item-view {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 24rpx 30rpx;
    background-color: #eef1f2;

    .goods-img {
      flex-shrink: 0;
      width: 131rpx;
      height: 131rpx;
      border-radius: 6rpx;
      overflow: hidden;
    }

    .goods-info {
      flex: 1;
      min-width: 0;
      padding-left: 24rpx;

      .goods-title {
        margin-bottom: 12rpx;
        color: $font-color-dark;
        font-size: 26rpx;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
      }

      .goods-price {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 28rpx;
        color: $light-color;

        .num {
          flex-shrink: 0;
          margin-left: 16rpx;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
}
.select-view {
  background-color: #fff;
  margin-top: 20rpx;

  .select-cell {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 32rpx 30rpx;
    border-bottom: 1px solid $page-color-base;

    &:last-child {
      border-bottom: none;
    }

    .select-image {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      .select-icon {
        width: 51rpx;
        height: 51rpx;
      }
    }

    .cell-body {
      flex: 1;
      min-width: 0;
      margin-left: 24rpx;
      margin-right: 16rpx;

      .select-title {
        font-size: 30rpx;
        color: #666666;
        line-height: 1.4;
      }

      .select-sub-title {
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #cccccc;
        line-height: 1.4;
      }
    }
  }
}
</style>
