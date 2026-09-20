<template>
  <view class="page">
    <view class="section current">
      <view class="section-title">当前预约</view>
      <text class="current-text">{{ currentSlotText }}</text>
    </view>

    <view class="section">
      <view class="section-title">新预约日期</view>
      <picker mode="date" :value="slotDate" :start="minDate" :end="maxDate" @change="onDateChange">
        <view class="picker-row">
          <text>{{ slotDate || '请选择日期' }}</text>
          <u-icon name="arrow-right" color="#ccc" size="16" />
        </view>
      </picker>
    </view>

    <view class="section">
      <view class="section-title">新预约时段</view>
      <view v-if="loadingSlots" class="tip">加载时段中...</view>
      <view v-else-if="!slots.length" class="tip">该日期暂无可预约时段</view>
      <view v-else class="slot-list">
        <view
          v-for="slot in slots"
          :key="slot.id"
          class="slot-item"
          :class="{ active: selectedSlot && selectedSlot.id === slot.id }"
          @click="selectSlot(slot)"
        >
          {{ slot.slotStartTime }}-{{ slot.slotEndTime }}
          <text v-if="slot.showRemainingQty && slot.availableQty != null" class="slot-qty">
            余{{ slot.availableQty }}
          </text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">改期说明（选填）</view>
      <u-input v-model="remark" type="textarea" placeholder="如有需要请填写改期原因" border="surround" height="100" />
    </view>

    <view class="footer">
      <u-button type="primary" shape="circle" :loading="submitting" @click="submit">提交改期</u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listSlots, getAppointmentOrderDetail, requestReschedule, getGoodsExt } from '@/api/appointment.js'
import { buildBookableDates, formatDate } from '@/utils/appointmentGoods.js'

const orderSn = ref('')
const skuId = ref('')
const goodsId = ref('')
const quantity = ref(1)
const currentDetail = ref<any>({})
const goodsExt = ref<any>(null)
const slotDate = ref('')
const slots = ref<any[]>([])
const selectedSlot = ref<any>(null)
const remark = ref('')
const loadingSlots = ref(false)
const submitting = ref(false)
const bookableDates = ref<string[]>([])

const minDate = computed(() => bookableDates.value[0] || formatDate(new Date()))
const maxDate = computed(() => {
  const list = bookableDates.value
  return list.length ? list[list.length - 1] : minDate.value
})
const currentSlotText = computed(() => {
  const d = currentDetail.value
  if (!d?.slotDate) return '加载中...'
  return `${d.slotDate} ${d.slotStartTime || ''}-${d.slotEndTime || ''}`
})

onLoad((options) => {
  orderSn.value = options?.orderSn || ''
})

onMounted(async () => {
  if (!orderSn.value) return
  try {
    const res = await getAppointmentOrderDetail(orderSn.value)
    currentDetail.value = res.data?.result || {}
    skuId.value = currentDetail.value.skuId || ''
    goodsId.value = currentDetail.value.goodsId || ''
    quantity.value = currentDetail.value.quantity || 1
    if (goodsId.value) {
      const extRes = await getGoodsExt(goodsId.value)
      goodsExt.value = extRes.data?.result || null
      bookableDates.value = buildBookableDates(goodsExt.value)
    } else {
      bookableDates.value = buildBookableDates(null)
    }
    slotDate.value = bookableDates.value[0] || formatDate(new Date())
    await loadSlots()
  } catch {
    uni.showToast({ title: '加载预约信息失败', icon: 'none' })
  }
})

watch(slotDate, () => {
  selectedSlot.value = null
  loadSlots()
})

async function loadSlots() {
  if (!skuId.value || !slotDate.value) return
  loadingSlots.value = true
  try {
    const res = await listSlots(skuId.value, slotDate.value)
    slots.value = res.data?.result || []
  } catch {
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

function onDateChange(e: any) {
  slotDate.value = e.detail?.value || ''
}

function selectSlot(slot: any) {
  const need = quantity.value || 1
  if (slot?.availableQty != null && slot.availableQty < need) {
    uni.showToast({ title: '该时段可约数量不足', icon: 'none' })
    return
  }
  selectedSlot.value = slot
}

async function submit() {
  if (!selectedSlot.value) {
    uni.showToast({ title: '请选择新时段', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    const slot = selectedSlot.value
    const res = await requestReschedule(orderSn.value, {
      slotStockId: slot.id,
      slotDate: slotDate.value,
      slotStartTime: slot.slotStartTime,
      slotEndTime: slot.slotEndTime,
      remark: remark.value.trim(),
    })
    const action = res.data?.result?.action
    uni.showToast({
      title: action === 'APPLY' ? '改期申请已提交，等待审核' : '改期成功',
      icon: 'none',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1200)
  } catch (e: any) {
    uni.showToast({
      title: e?.data?.message || e?.message || '改期失败',
      icon: 'none',
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx 24rpx 160rpx;
}
.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 20rpx;
}
.current-text {
  font-size: 28rpx;
  color: #333;
}
.picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}
.tip {
  color: #999;
  font-size: 26rpx;
}
.slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.slot-item {
  padding: 16rpx 28rpx;
  background: #f2f2f2;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #333;
  border: 2rpx solid transparent;
}
.slot-item.active {
  background: #fff5f5;
  border-color: #f2270c;
  color: #f2270c;
}
.slot-qty {
  margin-left: 8rpx;
  color: #999;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}
</style>
