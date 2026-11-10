<template>
  <view class="address">

    <u-empty class="empty" v-if="addressList.length == 0" text="暂无收货地址" mode="address"></u-empty>
    <view class="list" v-else>
      <view class="item c-content" v-for="(item, index) in addressList" :key="index">
        <view class="basic" @click="selectAddressData(item)">
          <text>{{ item.name }}</text>
          <text>{{ item.mobile }}</text>
          <text class="default" v-show="item.isDefault">默认</text>
          <view>
            <div class="region">
              <span v-if="item.consigneeAddressPath[0]">{{item.consigneeAddressPath[0]}}</span>
              <span v-if="item.consigneeAddressPath[1]">{{item.consigneeAddressPath[1]}}</span>
              <span v-if="item.consigneeAddressPath[2]">{{item.consigneeAddressPath[2]}}</span>
              <span v-if="item.consigneeAddressPath[3]">{{item.consigneeAddressPath[3]}}</span>
              <span>{{ item.detail }}</span>
            </div>
          </view>
        </view>
        <view class="edit">
          <view class="relative" @click="setDefault(item)">
            <view v-if="item.isDefault" class="alifont icon-xuanzhong"></view>
            <text v-else class="unchecked"></text>
            <text>{{ item.isDefault ? "默认地址" : "设为默认" }}</text>
          </view>
          <view class="relative">
            <view class="alifont icon-bianji-copy"></view>
            <text class="mr-40" @click="addAddress(item.id)">编辑</text>
            <view class="alifont icon-lajitong" @click.stop="removeAddress(item.id)"></view>
            <text @click.stop="removeAddress(item.id)">删除</text>
          </view>
        </view>
      </view>
    </view>
    <view class="btn-bar">
      <view class="btn" @click="addAddress('')">
        <u-icon name="plus-circle" color="#ffffff" size="18"></u-icon>
        <text class="btn-text">添加新收货人</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import * as API_Trade from '@/api/trade'
import * as API_Address from '@/api/address.js'

const store = useStore()

const addressList = ref<any[]>([])
const routerVal = ref<Record<string, string>>({})
const params = { pageNumber: 1, pageSize: 1000 }

onPullDownRefresh(() => {
  addressList.value = []
  getAddressList()
})

onLoad((val) => {
  routerVal.value = val || {}
})

onShow(() => {
  addressList.value = []
  getAddressList()
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

async function selectAddressData(val: any) {
  await API_Trade.setAddressId(val.id, routerVal.value.way)
  uni.navigateBack({ delta: 1 })
}

function getAddressList() {
  uni.showLoading()
  API_Address.getAddressList(params.pageNumber, params.pageSize).then((res) => {
    res.data.result.records.forEach((item: any) => {
      item.consigneeAddressPath = item.consigneeAddressPath.split(',')
    })
    addressList.value = res.data.result.records
    hideLoadingIfNeeded()
  })
}

function removeAddress(id: string) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该收货人信息吗？',
    success: (res) => {
      if (!res.confirm) return
      API_Address.deleteAddress(id).then((result) => {
        if (result.statusCode == 200) {
          uni.showToast({ icon: 'none', title: '删除成功' })
          getAddressList()
        } else {
          uni.showToast({ icon: 'none', title: result.data.message, duration: 2000 })
        }
      })
    },
  })
}

function addAddress(id: string) {
  if (id) {
    uni.navigateTo({
      url: `/pages/mine/address/add?id=${id}&way=${routerVal.value.way}&type=order`,
    })
  } else {
    uni.navigateTo({
      url: `/pages/mine/address/add?way=${routerVal.value.way}&type=order`,
    })
  }
}

function setDefault(item: any) {
  delete item.updateBy
  delete item.updateTime
  delete item.deleteFlag
  if (!item.isDefault) item.isDefault = true
  API_Address.editAddress(item).then(() => {
    uni.showToast({ title: '设置默认地址成功', icon: 'none' })
    getAddressList()
  })
}
</script>

<style lang="scss" scoped>
@import "./address.scss";
</style>
