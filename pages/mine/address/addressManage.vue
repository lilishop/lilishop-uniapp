<template>
  <view class="address-page address-manage" :style="themeStyle">
    <view v-if="!loading && addressList.length === 0" class="empty-state">
      <view class="empty-icon"><u-icon name="map" size="42" color="#c4c8d1" /></view>
      <text class="empty-title">还没有收货地址</text>
      <text class="empty-description">添加常用地址，下次购物更方便</text>
    </view>
    <view v-if="addressList.length" class="list-heading">
      <text>我的收货地址</text>
      <text class="address-count">共 {{ addressList.length }} 个</text>
    </view>
    <view class="address-list">
      <view class="address-card address-item" v-for="item in addressList" :key="item.id">
        <view class="recipient-line">
          <text class="recipient-name">{{ item.name }}</text>
          <text class="recipient-mobile">{{ item.mobile }}</text>
        </view>
        <view class="address-region">{{ item.consigneeAddressPath.join(' ') }}</view>
        <text class="address-detail">{{ item.detail }}</text>
        <view class="address-tags" v-if="item.isDefault || item.alias">
          <text v-if="item.isDefault" class="address-tag default-tag">默认地址</text>
          <text v-if="item.alias" class="address-tag">{{ item.alias }}</text>
        </view>
        <view class="card-actions">
          <view class="default-action" @click="setDefault(item)">
            <view class="default-check" :class="{ 'is-checked': item.isDefault }">
              <u-icon v-if="item.isDefault" name="checkmark" size="11" color="#fff" />
            </view>
            <text>{{ item.isDefault ? '已设为默认' : '设为默认' }}</text>
          </view>
          <view class="edit-actions">
            <view class="text-action" @click="addAddress(item.id)">
              <u-icon name="edit-pen" size="16" color="#6c7280" /><text>编辑</text>
            </view>
            <view class="action-divider"></view>
            <view class="text-action" @click="removeAddress(item.id)">
              <u-icon name="trash" size="16" color="#9297a1" /><text>删除</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="address-footer">
      <button class="address-primary-button" @click="addAddress('')">
        <u-icon name="plus" color="#fff" size="17" /><text>新增收货地址</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow, onPullDownRefresh, onBackPress } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { tipsToLogin } from '@/utils/filters.js'
import * as API_Address from '@/api/address.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const loading = ref(true)

const addressList = ref<any[]>([])
const routerVal = ref<Record<string, string>>({})
const params = { pageNumber: 1, pageSize: 1000 }

onBackPress(() => {
  uni.switchTab({ url: '/pages/tabbar/user/my' })
  return true
})

onLoad((val) => {
  routerVal.value = val || {}
})

onPullDownRefresh(() => {
  getAddressList()
})

onShow(() => {
  if (tipsToLogin()) {
    getAddressList()
  }
})

async function getAddressList() {
  loading.value = true
  try {
    const res = await API_Address.getAddressList(params.pageNumber, params.pageSize)
    if (!res.data?.success || !Array.isArray(res.data.result?.records)) throw new Error('地址加载失败')
    addressList.value = res.data.result.records.map((item: any) => ({
      ...item,
      consigneeAddressPath: Array.isArray(item.consigneeAddressPath)
        ? item.consigneeAddressPath
        : String(item.consigneeAddressPath || '').split(',').filter(Boolean),
    }))
  } catch {
    uni.showToast({ title: '地址加载失败，请下拉重试', icon: 'none' })
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}

function removeAddress(id: string) {
  uni.showModal({
    title: '提示',
    content: '确定要删除该收货人信息吗？',
    success: (res) => {
      if (!res.confirm) return
      API_Address.deleteAddress(id).then((result) => {
        if (result.data?.success) {
          uni.showToast({ icon: 'none', title: '删除成功' })
          getAddressList()
        } else {
          uni.showToast({ icon: 'none', title: result.data.message, duration: 2000 })
        }
      })
    },
  })
}

function addAddress(id?: string) {
  uni.navigateTo({
    url: `/pages/mine/address/add${id ? '?id=' + id : ''}`,
  })
}

function setDefault(item: any) {
  if (item.isDefault) return
  const data = { ...item, isDefault: true, consigneeAddressPath: item.consigneeAddressPath.join(',') }
  delete data.updateBy
  delete data.updateTime
  delete data.deleteFlag
  API_Address.editAddress(data).then((res) => {
    if (res.data?.success) {
      uni.showToast({ title: '已设为默认地址', icon: 'none' })
      getAddressList()
    } else {
      uni.showToast({ title: res.data?.message || '设置失败，请重试', icon: 'none' })
    }
  }).catch(() => uni.showToast({ title: '设置失败，请重试', icon: 'none' }))
}
</script>

<style lang="scss" scoped>
@import "./address-page.scss";

.list-heading { display: flex; justify-content: space-between; padding: 8rpx 8rpx 24rpx; font-size: 26rpx; color: #6c7280; }
.address-count { color: #a0a5af; font-size: 24rpx; }
.address-item { padding: 32rpx 32rpx 0; margin-bottom: 24rpx; }
.recipient-line { display: flex; align-items: baseline; flex-wrap: wrap; gap: 20rpx; margin-bottom: 18rpx; }
.recipient-name { font-size: 34rpx; font-weight: 600; color: #222732; overflow-wrap: anywhere; }
.recipient-mobile { color: #636a77; font-size: 28rpx; }
.address-region { color: #9399a4; font-size: 25rpx; line-height: 1.7; }
.address-detail { display: block; color: #343b48; font-size: 29rpx; line-height: 1.7; overflow-wrap: anywhere; }
.address-tags { display: flex; flex-wrap: wrap; gap: 12rpx; padding-top: 20rpx; }
.address-tag { max-width: 100%; overflow-wrap: anywhere; padding: 4rpx 14rpx; background: #f3f4f6; border-radius: 8rpx; color: #7f8591; font-size: 22rpx; }
.default-tag { color: var(--theme-primary); background: var(--theme-primary-10); }
.card-actions { margin-top: 26rpx; border-top: 1rpx solid #f0f1f4; min-height: 92rpx; display: flex; justify-content: space-between; align-items: center; }
.default-action, .text-action, .edit-actions { display: flex; align-items: center; }
.default-action { gap: 12rpx; min-height: 80rpx; color: #858b96; font-size: 24rpx; }
.default-check { width: 30rpx; height: 30rpx; box-sizing: border-box; border: 2rpx solid #dce0e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.is-checked { background: var(--theme-primary); border-color: var(--theme-primary); }
.text-action { gap: 8rpx; min-height: 80rpx; color: #6c7280; font-size: 24rpx; padding: 0 8rpx; }
.action-divider { width: 1rpx; height: 22rpx; background: #e9ebef; margin: 0 16rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 160rpx 0 80rpx; }
.empty-icon { width: 148rpx; height: 148rpx; display: flex; align-items: center; justify-content: center; background: #eaecef; border-radius: 50%; margin-bottom: 36rpx; }
.empty-title { color: #454c59; font-size: 32rpx; font-weight: 500; }
.empty-description { color: #a0a5af; font-size: 26rpx; margin-top: 16rpx; }
</style>
