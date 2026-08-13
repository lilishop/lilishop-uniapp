<template>
  <view class="container" style="font-size: 13px">
    <block v-for="(row, index) in messageList" :key="index">
      <view class="msgItem">
        <div class="msgMsg">
          <div class="bagbar">{{ formatSendTime(row.send_time) }}</div>
        </div>
        <u-card
          @click="navigateToLogisticsDetail(row.sn)"
          :title="pageTitle"
          title-color="#666666"
          title-size="24"
          sub-title-color="#666666"
          sub-title-size="24"
          :border="false"
          :sub-title="row.status"
        >
          <template #body>
            <view class="msg-body">
              <image class="msgImg" :src="row.goods_img" mode=""></image>
              <view class="msgView">
                <view>{{ row.goodsName }}</view>
                <view class="msgNum">订单号:{{ row.sn }}</view>
              </view>
            </view>
          </template>
        </u-card>
      </view>
    </block>
    <uni-load-more :status="loadStatus"></uni-load-more>
  </view>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import * as API_Message from '@/api/message.js'

const store = useStore()
const { proxy } = getCurrentInstance()!

const messageList = ref<any[]>([])
const pageTitle = '物流更新通知'
const loadStatus = ref('more')
const queryParams = ref({ pageNumber: 1, pageSize: 10 })

onLoad(() => {
  fetchLogisticsList(true)
})

onReachBottom(() => {
  queryParams.value.pageNumber++
  fetchLogisticsList(false)
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function formatSendTime(time: number) {
  return proxy.$u.timeFormat(time, 'yyyy-mm-dd')
}

function extractRecords(res: any) {
  if (Array.isArray(res?.result?.records)) return res.result.records
  if (Array.isArray(res?.result)) return res.result
  if (Array.isArray(res?.data)) return res.data
  return []
}

function navigateToLogisticsDetail(sn: string) {
  uni.navigateTo({
    url: `/pages/order/deliverDetail?order_sn=${sn}`,
  })
}

function fetchLogisticsList(reset: boolean) {
  if (reset) {
    queryParams.value.pageNumber = 1
    messageList.value = []
    loadStatus.value = 'more'
  }
  uni.showLoading({ title: '加载中' })
  API_Message.getLogisticsMessages(queryParams.value).then((response) => {
    hideLoadingIfNeeded()
    const records = extractRecords(response.data)
    if (records.length) {
      messageList.value.push(...records)
    } else {
      loadStatus.value = 'noMore'
    }
  })
}
</script>

<style scoped lang="scss">
.msg-body {
  display: flex;
  background-color: rgba(102, 110, 232, 0.0470588235294118);
  .msgImg {
    width: 160rpx;
    height: 160rpx;
  }
  .msgView {
    margin-left: 20rpx;
    .msgNum:last-child {
      margin-top: 60rpx;
    }
  }
}
.bagbar {
  display: inline;
  border-radius: 500px;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 20rpx;
  background: $u-info-disabled;
}
.container {
  background: #f9f9f9;
  min-height: 100vh;
}
.msgMsg {
  text-align: center;
  color: $u-tips-color;
}
.msgItem {
  padding: 1em 0;
}
view {
  font-size: 13px;
  color: #666666;
}
</style>
