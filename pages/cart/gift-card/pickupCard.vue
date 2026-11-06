<!--
  提货卡选品及确认兑换，兼容 H5、App 和微信小程序。
  @author Bulbasaur
  @since 2026-11-05
-->
<template>
  <view class="pickup-page">
    <view class="notice">每张卡一次兑完，每种一件，免邮。兑换成功后取消不退权益，不支持退款或退货。</view>
    <view v-if="loading" class="state">加载中...</view>
    <view v-else-if="error" class="state" @click="load">{{ error }}，点击重试</view>
    <template v-else-if="detail.credentialId">
      <view class="title">{{ detail.giftCardName }}</view>
      <view v-if="completed || detail.tradeSn" class="state">该提货卡已兑换<button @click="viewOrders">查看订单</button></view>
      <template v-else>
        <view class="rule">{{ detail.pickupMode === 'ALL' ? '兑换以下全部商品' : '任选 ' + detail.pickupCount + ' 种商品' }} · 已选 {{ selected.length }} 种</view>
        <view v-for="goods in detail.goods" :key="goods.id" class="goods" :class="{ selected: selected.includes(goods.id), disabled: !goods.available }" @click="toggle(goods)">
          <image :src="goods.thumbnail" mode="aspectFill" />
          <view class="goods-info"><view>{{ goods.goodsName }}</view><view class="muted">{{ specsText(goods.specs) }}</view><view class="muted">{{ goods.storeName }} · 1 件</view><text v-if="!goods.available">暂不可兑换</text></view>
          <text>{{ selected.includes(goods.id) ? '●' : '○' }}</text>
        </view>
        <view class="address">
          <view class="title">收货地址</view>
          <picker :range="addresses" :range-key="'label'" :value="addressIndex" :disabled="busy" @change="chooseAddress"><view>{{ addresses[addressIndex]?.label || '请选择收货地址' }}　›</view></picker>
          <view class="links"><text @click="manageAddress">管理收货地址</text><text @click="loadAddresses">刷新地址</text></view>
        </view>
        <button class="submit" :loading="busy" :disabled="!canSubmit || busy" @click="submit">确认兑换 · 实付 ￥0</button>
      </template>
    </template>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { getAddressList } from '@/api/address.js'
import { getPickupCard, previewPickupCard, redeemPickupCard } from '@/api/pickupCard.js'
import storage from '@/utils/storage.js'

const detail = ref({}), selected = ref([]), addresses = ref([]), addressIndex = ref(0)
const loading = ref(false), busy = ref(false), error = ref(''), completed = ref(false)
let cardId = '', active = true, version = 0, owner = ''
const canSubmit = computed(() => selected.value.length === detail.value.pickupCount && !!addresses.value[addressIndex.value] && !detail.value.goods?.some(g => selected.value.includes(g.id) && !g.available))
/** 隔离账号切换和离页后的异步响应。 */
function sameOwner() { return active && owner === String(storage.getUserInfo()?.id || '') }
/** 将既有 SKU 规格转成可读文字。 */
function specsText(value) { try { const specs = JSON.parse(value || '[]'); return Array.isArray(specs) ? specs.filter(s => s.specName !== 'images').map(s => s.specValue).join(' / ') : '' } catch { return value || '' } }
/** 非全选模式可增减选项，数量仍由后端再次校验。 */
function toggle(goods) {
  if (busy.value || !goods.available || detail.value.pickupMode === 'ALL') return
  if (selected.value.includes(goods.id)) selected.value = selected.value.filter(id => id !== goods.id)
  else if (detail.value.pickupCount === 1) selected.value = [goods.id]
  else if (selected.value.length < detail.value.pickupCount) selected.value = [...selected.value, goods.id]
  else uni.showToast({ title: '已达到可兑换种数', icon: 'none' })
}
/** 读取当前会员地址并保留有效选项。 */
async function loadAddresses() {
  const previous = addresses.value[addressIndex.value]?.id
  const response = await getAddressList(1, 100)
  if (!sameOwner()) return
  if (!response.data.success) throw new Error(response.data.message || '地址加载失败')
  addresses.value = (response.data.result?.records || []).map(a => ({ ...a, label: `${a.name} ${a.mobile} ${a.consigneeAddressPath || ''} ${a.detail || ''}` }))
  const index = addresses.value.findIndex(a => a.id === previous)
  addressIndex.value = index >= 0 ? index : Math.max(0, addresses.value.findIndex(a => a.isDefault))
}
/** 刷新卡可用性；返回页面重新校验已选商品。 */
async function load() {
  const request = ++version
  loading.value = true; error.value = ''
  try {
    const response = await getPickupCard(cardId)
    if (!sameOwner() || request !== version) return
    if (!response.data.success) throw new Error(response.data.message || '卡片加载失败')
    detail.value = response.data.result
    selected.value = detail.value.pickupMode === 'ALL' ? detail.value.goods.map(g => g.id) : selected.value.filter(id => detail.value.goods.some(g => g.id === id && g.available))
    await loadAddresses()
  } catch (e) { if (sameOwner() && request === version) error.value = e.message || '加载失败' }
  finally { if (sameOwner() && request === version) loading.value = false }
}
/** 提交前服务端试算；确认后核销，网络错误允许幂等重试。 */
async function submit() {
  if (busy.value || !canSubmit.value || !sameOwner()) return
  busy.value = true
  const payload = { credentialId: cardId, skuIds: [...selected.value], addressId: addresses.value[addressIndex.value].id }
  try {
    const preview = await previewPickupCard(payload)
    if (!sameOwner()) return
    if (!preview.data.success) throw new Error(preview.data.message || '兑换校验失败')
    const confirmed = await new Promise(resolve => uni.showModal({ title: '确认兑换', content: '每种一件，免邮且实付为零。兑换后取消不退权益，不支持退款或退货。', confirmText: '确认兑换', success: result => resolve(result.confirm), fail: () => resolve(false) }))
    if (!confirmed || !sameOwner()) return
    const response = await redeemPickupCard(payload)
    if (!sameOwner()) return
    if (!response.data.success) throw new Error(response.data.message || '兑换失败')
    completed.value = true
  } catch (e) {
    if (sameOwner()) {
      try { const status = await getPickupCard(cardId); if (sameOwner() && status.data.success && status.data.result?.tradeSn) { detail.value = status.data.result; completed.value = true; return } } catch { /* 保留选项以便重试 */ }
      uni.showToast({ title: e.message || '结果待确认，请重试或查看订单', icon: 'none' })
    }
  }
  finally { if (sameOwner()) busy.value = false }
}
/** 地址选择仅改变本页状态，不修改地址本身。 */
function chooseAddress(event) { addressIndex.value = Number(event.detail.value) }
/** 复用现有地址管理，返回时刷新。 */
function manageAddress() { if (!busy.value) uni.navigateTo({ url: '/pages/mine/address/addressManage' }) }
/** 兑换订单沿用普通订单列表与物流详情。 */
function viewOrders() { uni.navigateTo({ url: '/pages/order/myOrder?status=0' }) }
onLoad(options => { cardId = options.id || ''; owner = String(storage.getUserInfo()?.id || '') })
onShow(() => {
  if (owner !== String(storage.getUserInfo()?.id || '')) { detail.value = {}; selected.value = []; addresses.value = []; error.value = '账号已变更，请返回我的礼品卡'; return }
  load()
})
onUnload(() => { active = false; version++ })
</script>

<style scoped>
.pickup-page{min-height:100vh;background:#f6f7f9;padding:24rpx;box-sizing:border-box;padding-bottom:calc(40rpx + env(safe-area-inset-bottom))}.notice{background:#fff5e8;color:#965b24;padding:24rpx;border-radius:16rpx;font-size:26rpx;line-height:1.7}.title{font-weight:600;font-size:32rpx;margin:28rpx 0 20rpx}.rule,.muted{color:#777;font-size:24rpx;margin:12rpx 0}.goods{display:flex;align-items:center;gap:20rpx;background:#fff;border:2rpx solid transparent;border-radius:16rpx;padding:24rpx;margin:16rpx 0}.goods.selected{border-color:#f56c36}.goods.disabled{opacity:.5}.goods image{width:130rpx;height:130rpx;border-radius:12rpx;flex-shrink:0}.goods-info{flex:1;font-size:28rpx}.address{background:#fff;padding:4rpx 24rpx 24rpx;border-radius:16rpx;font-size:26rpx}.links{display:flex;justify-content:space-between;color:#e75d31;margin-top:24rpx}.submit{background:#e75d31;color:#fff;margin-top:32rpx;border-radius:48rpx;font-size:30rpx}.state{text-align:center;padding:60rpx 20rpx}
</style>
