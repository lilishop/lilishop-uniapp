<template>
  <view class="container">
    <block v-for="(row, index) in messageList" :key="index">
      <view class="msgItem">
        <div class="is_read">
          <span v-if="row.is_read"></span>
          <span v-else class="red">·</span>
        </div>
        <div class="msgMsg">{{ formatSendTime(row.send_time) }}</div>
        <u-card :title="pageTitle" :title-size="35" :border="false">
          <template #body>
            <view class="u-body-item u-flex u-row-between u-p-b-0">
              <view class="u-body-item-title u-line-2">{{ row.content }}</view>
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

const pageTitle = '系统消息'
const loadStatus = ref('more')
const queryParams = ref({ pageNumber: 1, pageSize: 5 })
const messageList = ref<any[]>([])

onLoad(() => {
  fetchMessageList(true)
})

onReachBottom(() => {
  queryParams.value.pageNumber++
  fetchMessageList(false)
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

function fetchMessageList(reset: boolean) {
  if (reset) {
    queryParams.value.pageNumber = 1
    messageList.value = []
    loadStatus.value = 'more'
  }
  uni.showLoading({ title: '加载中' })
  API_Message.getMessages(queryParams.value).then((response) => {
    hideLoadingIfNeeded()
    const res = response.data
    const records = extractRecords(res)
    if (records.length) {
      messageList.value.push(...records)
      markPageMessagesAsRead()
    } else {
      loadStatus.value = 'noMore'
    }
  })
}

function markPageMessagesAsRead() {
  const ids = messageList.value.map((item) => item.id).join(',')
  if (!ids) return
  API_Message.messageMarkAsRead(ids)
}
</script>

<style scoped lang="scss">
.is_read {
  position: absolute;
  right: 25px;
  top: 80rpx;
  z-index: 999;
}
.container {
  background: #f9f9f9;
  min-height: 100vh;
}
.red {
  color: coral;
  font-size: 100rpx;
}
.msgMsg {
  text-align: center;
  color: $u-tips-color;
}
.msgItem {
  padding: 1em 0;
  position: relative;
}
</style>
