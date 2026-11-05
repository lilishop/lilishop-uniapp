<template>
  <view class="wrapper" v-if="res">
    <view v-for="prom in promotionKeys" :key="prom">
      <view v-if="getPromType(prom) == 'FULL_DISCOUNT'">
        <view class="res_prom_item" v-if="res[prom].fullMinus">
          <view class="deg_tag">满减</view>
          <text class="pro-text">
            满{{ res[prom].fullMoney }}元 立减现金
            <text class="price">{{ res[prom].fullMinus }}元</text>
            <text v-if="res[prom].couponFlag"> 赠送优惠券</text>
            <text v-if="res[prom].pointFlag"> 赠送{{ res[prom].point }}积分</text>
            <text v-if="res[prom].giftFlag"> 赠送商品</text>
            <text v-if="res[prom].freeFreightFlag"> 赠送包邮服务</text>
          </text>
        </view>
        <view class="res_prom_item" v-if="res[prom].fullRate && res[prom].fullRateFlag">
          <view class="deg_tag">打折</view>
          <text class="pro-text">
            满{{ res[prom].fullMoney }}元，立享
            <text class="price">{{ res[prom].fullRate }}折</text>
            优惠
          </text>
        </view>
      </view>

      <view v-if="getPromType(prom) == 'PINTUAN'">
        <view class="res_prom_item" v-if="res[prom].requiredNum">
          <view class="deg_tag">拼团</view>
          <text class="pro-text">
            {{ res[prom].requiredNum }}人拼团 限购
            <text class="price">{{ res[prom].limitNum }}件</text>
          </text>
        </view>
      </view>

      <view v-if="getPromType(prom) == 'SECKILL'">
        <view class="res_prom_item">
          <view class="deg_tag">限时抢购</view>
          <text class="pro-text">限时抢购</text>
        </view>
      </view>

      <view v-if="getPromType(prom) == 'POINTS_GOODS'">
        <view class="res_prom_item">
          <view class="deg_tag">积分活动</view>
          <text class="pro-text">
            当前商品参与积分活动。
            <text @tap="handClickToJoinPromotion(prom)" class="href">点击此处参与活动</text>
          </text>
        </view>
      </view>

      <view v-if="getPromType(prom) == 'KANJIA'">
        <view class="res_prom_item">
          <view class="deg_tag">砍价活动</view>
          <text class="pro-text">
            当前商品参与砍价活动。
            <text @tap="handClickToJoinPromotion(prom)" class="href">点击此处参与活动</text>
          </text>
        </view>
      </view>
    </view>
    <view v-if="!promotionKeys.length">暂无促销活动</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  res?: any
}>()

const promotionKeys = computed(() => {
  if (!props.res || typeof props.res !== 'object') return []
  return Object.keys(props.res).filter((key) =>
    ['FULL_DISCOUNT', 'PINTUAN', 'SECKILL', 'POINTS_GOODS', 'KANJIA'].includes(getPromType(key))
  )
})

function getPromType(key: string) {
  return key.split('-')[0]
}

function handClickToJoinPromotion(val: string) {
  const type = getPromType(val)
  const promotionMap: Record<string, string> = {
    POINTS_GOODS: `/pages/promotion/point/detail?id=${props.res[val].id}`,
    KANJIA: `/pages/promotion/bargain/detail?id=${props.res[val].id}`,
  }
  const url = promotionMap[type]
  if (url) {
    uni.navigateTo({ url })
  }
}
</script>

<style lang="scss" scoped>
.deg_tag {
  flex-shrink: 0;
  color: $price-color;
  padding: 4rpx 12rpx;
  border: 2rpx solid $price-color;
  border-radius: 6rpx;
  font-size: 22rpx;
  line-height: 1.4;
  white-space: nowrap;
}

.pro-text {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  line-height: 1.6;
  color: #333333;
}

.wrapper {
  display: block;
}

.res_prom_item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  margin: 20rpx 0;
}

.price {
  color: $price-color;
}

.href {
  color: $main-color;
}
</style>
