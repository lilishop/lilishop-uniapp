<template>
  <view class="address">

    <u-empty class="empty" v-if="storeAddressList.length == 0" text="暂无自提地址" mode="address"></u-empty>
    <view class="list" v-else>
      <view class="item c-content" v-for="(item, index) in storeAddressList" :key="index">
        <view class="basic" @click="selectAddressData(item)">
          <text>{{ item.addressName }}</text>
          <text>{{ item.mobile }}</text>
          <view>
            <div class="region">
              <span>{{ item.address }}</span>
            </div>
          </view>
        </view>
      </view>
      <view style="height: 100px"></view>
    </view>
    <u-action-sheet
      :actions="removeList"
      :description="tips.text"
      cancel-text="取消"
      v-model:show="showAction"
      @select="deleteAddressMessage"
    ></u-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import * as API_Trade from '@/api/trade'
import * as API_Store from '@/api/store.js'

const store = useStore()

const storeAddressList = ref<any[]>([])
const showAction = ref(false)
const removeList = [{ name: '确定' }]
const tips = { text: '确定要删除该收货人信息吗？' }
const removeId = ref('')
const routerVal = ref<Record<string, string>>({})
const params = { pageNumber: 1, pageSize: 1000 }

onPullDownRefresh(() => {
  storeAddressList.value = []
  getAddressList()
})

onLoad((val) => {
  routerVal.value = val || {}
})

onShow(() => {
  storeAddressList.value = []
  getAddressList()
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

async function selectAddressData(val: any) {
  await API_Trade.setStoreAddressId(val.id, routerVal.value.way)
  uni.navigateBack({ delta: 1 })
}

function getAddressList() {
  uni.showLoading()
  API_Store.getStoreAddress(routerVal.value.storeId, params).then((res) => {
    storeAddressList.value = res.data.result.records
    hideLoadingIfNeeded()
  })
}

function deleteAddressMessage() {
  // 保留 action-sheet 回调占位，当前页面无删除入口
}
</script>

<style lang="scss" scoped>
@import "./address.scss";
</style>
