<!--
  移动端商品详情页-促销信息摘要栏（支持满减、满折、满赠及三级阶梯文案）
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
	<view>
		<view v-for="(promotionItem, promotionIndex) in promotion" :key="promotionIndex" class="promotion_row" @click="shutMask(1)">
			<view v-if="res != null" v-for="(item, index) in Object.keys(res)" :key="index">
				<div class="promotion_col" v-if="item.split('-')[0] == promotionItem.value && item.split('-')[0] == 'FULL_DISCOUNT'">
					<!-- 满减 / 满折 / 满赠 -->
					<div class="flex">
						<view class="deg_tag">{{ resolveFullDiscountTag(res[item]) }}</view>
						<div class="text proText">{{ formatFullDiscountSummary(res[item]) }}</div>
					</div>
				</div>
				<div class="promotion_col" v-if="item.split('-')[0] == promotionItem.value && item.split('-')[0] == 'PINTUAN'">
					<!-- 拼团 -->
					<div class="flex">
						<view class="deg_tag">{{ promotionItem.title }}</view>
						<div class="text proText">{{ res[item].promotionName }}</div>
					</div>
				</div>
				<div class="promotion_col" v-if="item.split('-')[0] == promotionItem.value && item.split('-')[0] == 'POINTS_GOODS'">
					<!-- 积分活动 -->
					<div class="flex">
						<view class="deg_tag">{{ promotionItem.title }}</view>
						<div class="text proText">{{ res[item].promotionName }}</div>
					</div>
				</div>
				<div class="promotion_col" v-if="item.split('-')[0] == promotionItem.value && item.split('-')[0] == 'KANJIA'">
					<!-- 砍价活动 -->
					<div class="flex">
						<view class="deg_tag">{{ promotionItem.title }}</view>
						<div class="text proText"></div>
					</div>
				</div>
				<div class="promotion_col" v-if="item.split('-')[0] == promotionItem.value && item.split('-')[0] == 'SECKILL'">
					<!-- 限时抢购 -->
					<div class="flex">
						<view class="deg_tag">{{ promotionItem.title }}</view>
						<div class="text proText">{{ res[item].promotionName }}</div>
					</div>
				</div>
			</view>

			<view class="promotion_row">
				<view>
					<div class="promotion_col coupon" v-if="couponList && promotionIndex == 1">
						<!-- 优惠券 -->
						<div><view class="deg_tag">优惠券</view></div>
					</div>
				</view>
			</view>
		</view>

		<view v-if="res != null && Object.keys(res).length == 0">暂无促销信息</view>
	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import promotion from './promotion_type'

const props = defineProps<{
  res?: any
}>()

const emit = defineEmits<{
  shutMasks: [val: number]
}>()

const couponList = ref('')

watch(
  () => props.res,
  (res) => {
    couponList.value = ''
    if (res && res.length != 0 && res != null) {
      Object.keys(res).forEach((item) => {
        const key = item.split('-')[0]
        res[item].__key = key

        if (item.split('-')[0] == 'COUPON') {
          couponList.value = 'COUPON'
        }
      })
    }
  },
  { immediate: true }
)

function resolveFullDiscountTag(act: any): string {
  if (!act) return '满减'
  if (act.activityType === 'FULL_RATE' || act.fullRateFlag) return '满折'
  if (act.activityType === 'FULL_GIFT' || (!act.fullMinusFlag && act.giftFlag)) return '满赠'
  return '满减'
}

function formatFullDiscountSummary(act: any): string {
  if (!act) return ''
  if (act.title) return act.title
  if (act.rulesJson) {
    try {
      const rules = JSON.parse(act.rulesJson)
      if (Array.isArray(rules) && rules.length) {
        return rules
          .map((r: any) => {
            if (act.activityType === 'FULL_RATE' || act.fullRateFlag) {
              return `满${r.fullMoney}元打${r.fullRate}折`
            }
            if (act.activityType === 'FULL_GIFT' || act.giftFlag) {
              return `满${r.fullMoney}元享好礼`
            }
            return `满${r.fullMoney}元减${r.fullMinus}元`
          })
          .join('；')
      }
    } catch (e) {
      // ignore
    }
  }
  return `满${act.fullMoney}元，立享优惠`
}

function shutMask(val: number) {
  emit('shutMasks', val)
}
</script>

<style lang="scss" scoped>
.deg_tag {
	color: $price-color;
	padding: 0 4rpx;
	border: 2rpx solid $price-color;
	font-size: 22rpx;
}

.promotion_col {
	padding: 0 !important;
	margin: 10rpx 0;
}
.promotion_row {
}
.flex {
	display: flex;
}
.proText {
	font-size: 26rpx;
	font-family: PingFang SC, PingFang SC-Regular;
	font-weight: 400;
	text-align: left;
	color: #333333;
	margin-left: 20rpx;
}
::v-deep .u-mode-light-error {
	border: none;
}
.coupon{
	display: flex;
}
</style>
