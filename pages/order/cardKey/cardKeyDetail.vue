<!--
  @Author Mike
  @Date 2026-08-03
-->
<template>
  <view :style="themeStyle" class="card-key-page">
    <view v-if="loading" class="card-key-page__loading">加载中...</view>
    <view v-else-if="errorMessage" class="card-key-page__empty">{{ errorMessage }}</view>
    <view v-else-if="!cardKeyRows.length" class="card-key-page__empty">
      {{ emptyMessage }}
    </view>
    <view v-else>
      <view
        v-for="(line, lineIndex) in cardKeyFulfillLines"
        :key="line.key || lineIndex"
        class="card-key-fulfill-block"
      >
        <view v-if="cardKeyFulfillLines.length > 1" class="card-key-fulfill-title">
          {{ line.goodsName || '电子卡券' }}
        </view>
        <view
          class="card-key-item"
          v-for="(row, index) in line.cardKeys"
          :key="`${line.key}-${row.cardNo || index}-${index}`"
        >
          <view class="card-key-item__title">卡密 {{ index + 1 }}</view>
          <view class="card-key-item__row">
            <text class="card-key-item__label">卡号：</text>
            <text class="card-key-item__value card-key-item__value--plain" selectable>{{
              row.cardNo || '-'
            }}</text>
          </view>
          <view class="card-key-item__row">
            <text class="card-key-item__label">卡密：</text>
            <text class="card-key-item__value card-key-item__value--plain" selectable>{{
              row.cardSecret || '-'
            }}</text>
          </view>
          <view class="card-key-item__actions">
            <view class="card-key-item__copy" @click="copyCardKey(row)">复制</view>
          </view>
        </view>
      </view>
      <view class="card-key-page__footer">
        <view class="card-key-page__copy-all" @click="copyAllCardKeys">复制全部</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 电子卡券卡密二级页（原型 P-09）。
 * 仅展示当前 orderSn 对应订单的 orderItems[].cardKeys；满赠赠品请进赠品订单查看。
 */
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { getOrderDetail } from '@/api/order.js'
import { setClipboard } from '@/utils/filters.js'
import {
  isECouponOrder,
  collectCardKeyFulfillLines,
  flattenOrderCardKeys,
  resolveCardKeyFulfillMessage,
  CARD_KEY_FULFILL_STATUS,
} from '@/utils/goodsType.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const orderSn = ref('')
const loading = ref(true)
const errorMessage = ref('')
const orderItems = ref<any[]>([])
const orderStatus = ref('')

const cardKeyFulfillLines = computed(() =>
  collectCardKeyFulfillLines(orderItems.value).filter(
    (line) => line.status === CARD_KEY_FULFILL_STATUS.DELIVERED && line.cardKeys.length
  )
)

const cardKeyRows = computed(() => flattenOrderCardKeys(orderItems.value))

const emptyMessage = computed(() => {
  if (orderStatus.value === 'CANCELLED') {
    return '订单已关闭，暂无卡密信息'
  }
  const pending = collectCardKeyFulfillLines(orderItems.value).find(
    (line) => line.status !== CARD_KEY_FULFILL_STATUS.DELIVERED
  )
  if (pending) {
    return resolveCardKeyFulfillMessage(pending)
  }
  if (orderStatus.value === 'COMPLETED') {
    return '卡密尚未发放，请稍后刷新'
  }
  return '暂无卡密信息'
})

onLoad((options) => {
  orderSn.value = options?.sn || ''
  loadData()
})

onPullDownRefresh(() => {
  loadData(true)
})

function loadData(fromPullDown = false) {
  if (!orderSn.value) {
    loading.value = false
    errorMessage.value = '订单编号无效'
    if (fromPullDown) uni.stopPullDownRefresh()
    return
  }
  if (!fromPullDown) {
    loading.value = true
    errorMessage.value = ''
  }
  getOrderDetail(orderSn.value)
    .then((res) => {
      if (!res.data.success) {
        errorMessage.value = res.data.message || '加载失败'
        return
      }
      const result = res.data.result
      if (!isECouponOrder(result?.order?.orderType)) {
        errorMessage.value = '该订单没有电子卡券卡密'
        return
      }
      orderItems.value = result.orderItems || []
      orderStatus.value = result.order?.orderStatus || ''
    })
    .catch(() => {
      errorMessage.value = '加载失败，请稍后重试'
    })
    .finally(() => {
      loading.value = false
      if (fromPullDown) uni.stopPullDownRefresh()
    })
}

function copyCardKey(row: any) {
  const text = `卡号：${row.cardNo || ''}\n卡密：${row.cardSecret || ''}`
  setClipboard(text)
}

function copyAllCardKeys() {
  const text = cardKeyRows.value
    .map(
      (row, index) =>
        `${index + 1}. 卡号：${row.cardNo || ''}  卡密：${row.cardSecret || ''}`
    )
    .join('\n')
  if (!text) {
    uni.showToast({ title: '暂无可复制卡密', icon: 'none' })
    return
  }
  setClipboard(text)
}
</script>

<style lang="scss" scoped>
.card-key-page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f7f7f7;
}

.card-key-page__loading,
.card-key-page__empty {
  padding: 120rpx 40rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

.card-key-fulfill-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.card-key-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.card-key-item__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.card-key-item__row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
  font-size: 26rpx;
  line-height: 1.6;
}

.card-key-item__label {
  color: #666;
  flex-shrink: 0;
}

.card-key-item__value {
  color: #333;
  word-break: break-all;
}

.card-key-item__value--plain {
  font-family: monospace;
  flex: 1;
}

.card-key-item__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8rpx;
}

.card-key-item__copy {
  color: $main-color;
  font-size: 26rpx;
}

.card-key-page__footer {
  padding: 20rpx 0 40rpx;
}

.card-key-page__copy-all {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: $main-color;
  color: #fff;
  border-radius: 44rpx;
  font-size: 28rpx;
}
</style>
