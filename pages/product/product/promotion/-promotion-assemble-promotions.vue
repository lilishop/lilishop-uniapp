<template>
  <view>
    <div v-for="(promotion, promotion_index) in promotionList" :key="promotion_index">
      <div
        class="showBox"
        v-if="
          promotion.__key == 'SECKILL' ||
          promotion.__key == 'GROUPBUY' ||
          promotion.__key == 'PINTUAN'
        "
      >
        <view class="group-wrapper">
          <div class="u-group-row">
            <view :span="8" class="showBox_L">
              <view class="u-group-flex">
                <!-- 限时抢购 -->
                <view class="u-group-flex-left" v-if="promotion.__key == 'SECKILL'">
                  <span
                    class="u-group-flex-left-span"
                    v-if="detail.promotionPrice != undefined"
                  >
                    ￥
                    <span class="flex-price">
                      {{ goodsFormatPrice(detail.promotionPrice)[0] }}.{{
                        goodsFormatPrice(detail.promotionPrice)[1]
                      }}</span
                    >
                  </span>
                  <view class="u-group-flex" v-if="detail.price != undefined">
                    <span class="old-price"
                      >￥{{ goodsFormatPrice(detail.price)[0] }}.{{
                        goodsFormatPrice(detail.price)[1]
                      }}</span
                    >
                    <view class="promotion">限时抢购</view>
                  </view>
                </view>

                <!-- 团购 -->
                <view class="u-group-flex-left" v-if="promotion.__key == 'GROUPBUY'">
                  <span class="u-group-flex-left-span">
                    <span
                      class="flex-price"
                      v-if="promotion.groupbuy_goods_vo.price != undefined"
                      >￥{{ goodsFormatPrice(promotion.groupbuy_goods_vo.price)[0] }}.{{
                        goodsFormatPrice(promotion.groupbuy_goods_vo.price)[1]
                      }}</span
                    >
                  </span>
                  <view class="u-group-flex">
                    <span
                      class="old-price"
                      v-if="promotion.groupbuy_goods_vo.original_price != undefined"
                      >￥{{
                        goodsFormatPrice(promotion.groupbuy_goods_vo.original_price)[0]
                      }}.{{
                        goodsFormatPrice(promotion.groupbuy_goods_vo.original_price)[1]
                      }}</span
                    >
                    <view class="promotion">团购活动</view>
                  </view>
                </view>

                <view class="u-group-flex-left" v-if="promotion.__key == 'PINTUAN'">
                  <span
                    class="u-group-flex-left-span"
                    v-if="detail.promotionPrice != undefined"
                  >
                    ￥<span class="flex-price">
                      {{ goodsFormatPrice(detail.promotionPrice)[0] }}.</span
                    >{{ goodsFormatPrice(detail.promotionPrice)[1] }}
                  </span>
                  <view class="u-group-flex" v-if="detail.price != undefined">
                    <span class="old-price"
                      >￥{{ goodsFormatPrice(detail.price)[0] }}.{{
                        goodsFormatPrice(detail.price)[1]
                      }}</span
                    >
                    <view class="promotion">拼团活动</view>
                  </view>
                </view>
                <!--  拼团右侧 -->
                <view class="u-group-flex-right" v-if="promotion.__key == 'PINTUAN'">
                  <span class="group-bag">{{ promotion.requiredNum }}人拼团 </span>
                  <span class="group-bag">限购{{ promotion.limitNum }}件</span>
                </view>
              </view>
            </view>
            <view class="showBox_R" v-if="promotion && promotion.endTime">
              <u-tag :text="getIsTimer(promotion)" size="mini" type="error" />
              <view class="promotion-countdown" v-if="countdownData[promotion_index]">
                <text v-if="countdownData[promotion_index].days > 0" class="countdown-day">
                  {{ countdownData[promotion_index].days }}天
                </text>
                <text class="countdown-num">{{ padTime(countdownDisplayHours(promotion_index)) }}</text>
                <text class="countdown-colon">:</text>
                <text class="countdown-num">{{ padTime(countdownData[promotion_index].minutes) }}</text>
                <text class="countdown-colon">:</text>
                <text class="countdown-num">{{ padTime(countdownData[promotion_index].seconds) }}</text>
              </view>
            </view>
          </div>
        </view>
      </div>
    </div>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { goodsFormatPrice } from '@/utils/filters.js'

const props = defineProps<{
  res?: any
  detail?: any
}>()

const countdownData = ref<Record<number, any>>({})
let countdownTimer: ReturnType<typeof setInterval> | null = null

const promotionList = computed(() => {
  if (!props.res || typeof props.res !== 'object') return []
  return Object.keys(props.res).map((key) => ({
    ...(props.res[key] || {}),
    __key: key.split('-')[0],
  }))
})

watch(
  promotionList,
  (list) => {
    refreshCountdown(list)
    startCountdownTimer()
  },
  { immediate: true }
)

onUnmounted(() => {
  clearCountdownTimer()
})

function clearCountdownTimer() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

function startCountdownTimer() {
  clearCountdownTimer()
  countdownTimer = setInterval(() => {
    refreshCountdown(promotionList.value)
  }, 1000)
}

function refreshCountdown(list = promotionList.value) {
  const next: Record<number, any> = {}
  list.forEach((promotion, index) => {
    next[index] = msToTimeData(getCountDownMs(promotion))
  })
  countdownData.value = next
}

function padTime(val: number | undefined) {
  return String(val ?? 0).padStart(2, '0')
}

function countdownDisplayHours(index: number) {
  const data = countdownData.value[index]
  if (!data) return 0
  return data.days * 24 + data.hours
}

function msToTimeData(ms: number) {
  const DAY = 86400000
  const HOUR = 3600000
  const MINUTE = 60000
  const SECOND = 1000
  const time = Math.max(Number(ms) || 0, 0)
  return {
    days: Math.floor(time / DAY),
    hours: Math.floor((time % DAY) / HOUR),
    minutes: Math.floor((time % HOUR) / MINUTE),
    seconds: Math.floor((time % MINUTE) / SECOND),
  }
}

function parsePromotionTime(val: any) {
  if (val == null || val === '') return 0
  if (typeof val === 'number' && !Number.isNaN(val)) {
    return val < 1e12 ? val * 1000 : val
  }
  const text = String(val).trim()
  if (/^\d+$/.test(text)) {
    const num = Number(text)
    return num < 1e12 ? num * 1000 : num
  }
  const parsed = Date.parse(text.replace(/-/g, '/'))
  return Number.isNaN(parsed) ? 0 : parsed
}

function getCountDownMs(promotion: any) {
  if (!promotion || !promotion.endTime) return 0
  const now = Date.now()
  const startMs = parsePromotionTime(promotion.startTime || promotion.start_time)
  const endMs = parsePromotionTime(promotion.endTime)
  if (!endMs) return 0
  const target = startMs && now < startMs ? startMs : endMs
  const remain = target - now
  return remain > 0 ? remain : 0
}

function getIsTimer(val: any) {
  const now = Date.now()
  const startMs = parsePromotionTime(val.startTime || val.start_time)
  if (startMs && now < startMs) {
    return '距离活动开始'
  }
  return '距离活动结束'
}
</script>

<style scoped lang="scss">
@import "./group.scss";
</style>
