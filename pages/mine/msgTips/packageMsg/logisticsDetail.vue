<template>
  <view class="logistics-detail">
    <view class="card">
      <view class="card-title">
        <span>{{ logisticsInfo.shipper }}</span>快递 <span>{{ logisticsInfo.logisticCode }}</span>
      </view>
      <view class="time-line">
        <u-time-line v-if="logisticsInfo.traces && logisticsInfo.traces.length != 0">
          <u-time-line-item nodeTop="2" v-for="(item, index) in logisticsInfo.traces" :key="index">
            <template #node>
              <view
                v-if="index == logisticsInfo.traces.length - 1"
                class="u-node"
                :style="{ background: lightColor }"
                style="padding: 0 4px"
              >
                <u-icon name="pushpin-fill" color="#fff" :size="24"></u-icon>
              </view>
            </template>
            <template #content>
              <view>
                <view class="u-order-desc">{{ item.AcceptStation }}</view>
                <view class="u-order-time">{{ item.AcceptTime }}</view>
              </view>
            </template>
          </u-time-line-item>
        </u-time-line>
        <u-empty class="empty" v-else text="目前没有物流订单" mode="list"></u-empty>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getExpress } from '@/api/trade.js'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const logisticsInfo = ref<Record<string, any>>({})

onLoad((option) => {
  fetchLogistics(option.order_sn)
})

function fetchLogistics(orderSn: string) {
  getExpress(orderSn).then((res) => {
    logisticsInfo.value = res.data.result || {}
  })
}
</script>

<style lang="scss">
.card-title {
  background: #f2f2f2;
}
.logistics-detail {
  margin-top: 20rpx;
  padding: 0 16rpx;
}
.card {
  background: #fff;
  border-radius: 20rpx;
  width: 100%;
  > .card-title {
    font-size: 24rpx;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    padding: 16rpx;
  }
  > .time-line {
    padding: 16rpx 32rpx;
  }
}
.u-order-desc {
  font-size: 26rpx;
  color: #666;
  margin: 10rpx 0;
}
.u-order-time {
  font-size: 24rpx;
  color: #999;
}
.empty {
  padding: 40rpx 0;
}
</style>
