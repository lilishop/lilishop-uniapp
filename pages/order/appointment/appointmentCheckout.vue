<template>
  <view class="page">
    <view class="section">
      <view class="section-title">预约日期</view>
      <picker mode="date" :value="slotDate" :start="minDate" :end="maxDate" @change="onDateChange">
        <view class="picker-row">
          <text>{{ slotDate || '请选择日期' }}</text>
          <u-icon name="arrow-right" color="#ccc" size="16" />
        </view>
      </picker>
    </view>

    <view class="section">
      <view class="section-title">预约时段</view>
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

    <view class="section" v-if="serviceModes.length > 1">
      <view class="section-title">服务方式</view>
      <view class="mode-list">
        <view
          v-for="mode in serviceModes"
          :key="mode"
          class="mode-item"
          :class="{ active: serviceMode === mode }"
          @click="serviceMode = mode"
        >
          {{ SERVICE_MODE_LABEL[mode] || mode }}
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">联系人</view>
      <u-input v-model="contactName" placeholder="请输入联系人姓名" border="surround" />
      <view class="input-gap" />
      <u-input v-model="contactPhone" placeholder="请输入联系电话" type="number" border="surround" />
    </view>

    <view class="section" v-if="serviceMode === SERVICE_MODE.ON_SITE">
      <view class="section-title">服务地址</view>
      <u-input
        v-model="serviceAddress"
        type="textarea"
        placeholder="请输入上门服务地址"
        border="surround"
        height="100"
      />
    </view>

    <view class="section" v-for="(group, gi) in formAnswers" :key="gi" v-show="formFields.length">
      <view class="section-title">
        {{ formAnswers.length > 1 ? `补充信息（${gi + 1}/${formAnswers.length}）` : '补充信息' }}
      </view>
      <view v-for="field in formFields" :key="field.fieldKey" class="form-field">
        <view v-if="field.richText" class="rich-text" v-html="field.richTextContent" />
        <template v-else>
          <view class="field-label">
            {{ field.fieldLabel }}
            <text v-if="field.required" class="required">*</text>
          </view>
          <view v-if="field.fieldType === 'CHECKBOX'" class="opt-list">
            <view
              v-for="opt in field.options"
              :key="opt.value"
              class="opt-item"
              @click="toggleCheckbox(gi, field, opt.value)"
            >
              <text class="opt-mark">{{ isChecked(group[field.fieldKey], opt.value) ? '☑' : '☐' }}</text>
              {{ opt.label }}
            </view>
          </view>
          <view v-else-if="field.fieldType === 'RADIO'" class="opt-list">
            <view
              v-for="opt in field.options"
              :key="opt.value"
              class="opt-item"
              @click="setFormAnswer(gi, field.fieldKey, opt.value)"
            >
              <text class="opt-mark">{{ group[field.fieldKey] === opt.value ? '●' : '○' }}</text>
              {{ opt.label }}
            </view>
          </view>
          <picker
            v-else-if="field.fieldType === 'SELECT'"
            :range="field.optionLabels"
            @change="(e) => onSelectChange(gi, field, e)"
          >
            <view class="picker-row">
              <text>{{ optionLabel(field, group[field.fieldKey]) || field.hint }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          <picker
            v-else-if="field.fieldType === 'DATE'"
            mode="date"
            :value="group[field.fieldKey]"
            @change="(e) => setFormAnswer(gi, field.fieldKey, e.detail.value)"
          >
            <view class="picker-row">
              <text>{{ group[field.fieldKey] || field.hint }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          <view v-else-if="field.fieldType === 'DATE_RANGE'" class="range-row">
            <picker mode="date" :value="rangePart(group[field.fieldKey], 0)" @change="(e) => setRangePart(gi, field.fieldKey, 0, e.detail.value)">
              <view class="picker-row"><text>{{ rangePart(group[field.fieldKey], 0) || '开始日期' }}</text></view>
            </picker>
            <text class="range-sep">至</text>
            <picker mode="date" :value="rangePart(group[field.fieldKey], 1)" @change="(e) => setRangePart(gi, field.fieldKey, 1, e.detail.value)">
              <view class="picker-row"><text>{{ rangePart(group[field.fieldKey], 1) || '结束日期' }}</text></view>
            </picker>
          </view>
          <picker
            v-else-if="field.fieldType === 'TIME'"
            mode="time"
            :value="group[field.fieldKey]"
            @change="(e) => setFormAnswer(gi, field.fieldKey, e.detail.value)"
          >
            <view class="picker-row">
              <text>{{ group[field.fieldKey] || field.hint }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          <view v-else-if="field.fieldType === 'TIME_RANGE'" class="range-row">
            <picker mode="time" :value="rangePart(group[field.fieldKey], 0)" @change="(e) => setRangePart(gi, field.fieldKey, 0, e.detail.value)">
              <view class="picker-row"><text>{{ rangePart(group[field.fieldKey], 0) || '开始时间' }}</text></view>
            </picker>
            <text class="range-sep">至</text>
            <picker mode="time" :value="rangePart(group[field.fieldKey], 1)" @change="(e) => setRangePart(gi, field.fieldKey, 1, e.detail.value)">
              <view class="picker-row"><text>{{ rangePart(group[field.fieldKey], 1) || '结束时间' }}</text></view>
            </picker>
          </view>
          <picker
            v-else-if="field.fieldType === 'CITY'"
            mode="region"
            @change="(e) => onCityChange(gi, field, e)"
          >
            <view class="picker-row">
              <text>{{ group[field.fieldKey] || field.hint }}</text>
              <text class="arrow">›</text>
            </view>
          </picker>
          <view v-else-if="field.fieldType === 'IMAGE'" class="image-row">
            <view
              v-for="(url, ui) in group[field.fieldKey] || []"
              :key="ui"
              class="image-thumb"
              @click="previewImage(group[field.fieldKey], ui)"
            >
              <image :src="url" mode="aspectFill" />
            </view>
            <view
              v-if="(group[field.fieldKey] || []).length < field.maxUploadCount"
              class="image-add"
              @click="chooseImages(gi, field)"
            >+</view>
          </view>
          <u-input
            v-else
            :model-value="group[field.fieldKey]"
            :placeholder="field.hint"
            border="surround"
            :type="field.contentType === 'NUMBER' ? 'number' : 'text'"
            @update:model-value="(val) => setFormAnswer(gi, field.fieldKey, val)"
          />
        </template>
      </view>
    </view>

    <view class="section notice">
      <view class="section-title">预约须知</view>
      <text class="notice-text">{{ cancelNotice }}</text>
    </view>

    <view class="footer">
      <u-button type="primary" shape="circle" :loading="submitting" @click="submit">
        确认并去支付
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listSlots, bindCheckout, getGoodsExt } from '@/api/appointment.js'
import {
  SERVICE_MODE,
  SERVICE_MODE_LABEL,
  parseServiceModes,
  buildBookableDates,
  buildCancelNotice,
  formatDate,
  parseFormFields,
  buildFormGroups,
  isBlankFormValue,
  validateTextContent,
} from '@/utils/appointmentGoods.js'

const skuId = ref('')
const goodsId = ref('')
const num = ref(1)
const goodsExt = ref<any>(null)
const slotDate = ref('')
const slots = ref<any[]>([])
const selectedSlot = ref<any>(null)
const serviceModes = ref<string[]>([SERVICE_MODE.IN_STORE])
const serviceMode = ref(SERVICE_MODE.IN_STORE)
const contactName = ref('')
const contactPhone = ref('')
const serviceAddress = ref('')
const loadingSlots = ref(false)
const submitting = ref(false)
const bookableDates = ref<string[]>([])
const formFields = ref<any[]>([])
const formAnswers = ref<Record<string, any>[]>([])

const cancelNotice = computed(() => buildCancelNotice(goodsExt.value))
const minDate = computed(() => bookableDates.value[0] || formatDate(new Date()))
const maxDate = computed(() => {
  const list = bookableDates.value
  return list.length ? list[list.length - 1] : minDate.value
})

onLoad((options) => {
  skuId.value = options?.skuId || ''
  goodsId.value = options?.goodsId || ''
  num.value = Number(options?.num) || 1
})

onMounted(async () => {
  if (!goodsId.value) return
  try {
    const res = await getGoodsExt(goodsId.value)
    goodsExt.value = res.data?.result || null
    serviceModes.value = parseServiceModes(goodsExt.value)
    serviceMode.value = serviceModes.value[0] || SERVICE_MODE.IN_STORE
    bookableDates.value = buildBookableDates(goodsExt.value)
    slotDate.value = bookableDates.value[0] || formatDate(new Date())
    formFields.value = parseFormFields(goodsExt.value?.systemFormSnapshot)
    formAnswers.value = buildFormGroups(goodsExt.value, num.value)
    await loadSlots()
  } catch {
    bookableDates.value = buildBookableDates(null)
    slotDate.value = bookableDates.value[0] || formatDate(new Date())
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
  if (!slot?.availableQty || slot.availableQty <= 0) {
    uni.showToast({ title: '该时段已满', icon: 'none' })
    return
  }
  selectedSlot.value = slot
}

function setFormAnswer(groupIndex: number, fieldKey: string, value: any) {
  const next = [...formAnswers.value]
  next[groupIndex] = { ...next[groupIndex], [fieldKey]: value }
  formAnswers.value = next
}

function isChecked(value: any, opt: string) {
  return Array.isArray(value) && value.includes(opt)
}

function toggleCheckbox(groupIndex: number, field: any, opt: string) {
  const current = formAnswers.value[groupIndex]?.[field.fieldKey]
  const list = Array.isArray(current) ? [...current] : []
  const idx = list.indexOf(opt)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(opt)
  setFormAnswer(groupIndex, field.fieldKey, list)
}

function optionLabel(field: any, value: string) {
  return field.options?.find((item: any) => item.value === value)?.label || value
}

function onSelectChange(groupIndex: number, field: any, e: any) {
  const idx = Number(e.detail?.value)
  const opt = field.options?.[idx]
  setFormAnswer(groupIndex, field.fieldKey, opt?.value || '')
}

function rangePart(value: string, index: number) {
  return String(value || '').split('~')[index] || ''
}

function setRangePart(groupIndex: number, fieldKey: string, index: number, part: string) {
  const current = String(formAnswers.value[groupIndex]?.[fieldKey] || '').split('~')
  current[index] = part
  if (!current[0]) current[0] = ''
  if (!current[1]) current[1] = ''
  setFormAnswer(groupIndex, fieldKey, `${current[0]}~${current[1]}`)
}

function onCityChange(groupIndex: number, field: any, e: any) {
  const parts = e.detail?.value || []
  let depth = 3
  if (field.cityLevel === 'PROVINCE_CITY') depth = 2
  setFormAnswer(groupIndex, field.fieldKey, parts.slice(0, depth).join(' '))
}

function previewImage(list: string[], index: number) {
  uni.previewImage({ urls: list, current: list[index] })
}

function chooseImages(groupIndex: number, field: any) {
  const current = Array.isArray(formAnswers.value[groupIndex]?.[field.fieldKey])
    ? [...formAnswers.value[groupIndex][field.fieldKey]]
    : []
  const remain = Math.max((field.maxUploadCount || 1) - current.length, 0)
  if (!remain) return
  uni.chooseImage({
    count: remain,
    success: (res) => {
      setFormAnswer(groupIndex, field.fieldKey, current.concat(res.tempFilePaths || []))
    },
  })
}

function validate() {
  if (!selectedSlot.value) {
    uni.showToast({ title: '请选择预约时段', icon: 'none' })
    return false
  }
  if (!contactName.value.trim()) {
    uni.showToast({ title: '请填写联系人', icon: 'none' })
    return false
  }
  if (!contactPhone.value.trim()) {
    uni.showToast({ title: '请填写联系电话', icon: 'none' })
    return false
  }
  if (serviceMode.value === SERVICE_MODE.ON_SITE && !serviceAddress.value.trim()) {
    uni.showToast({ title: '请填写服务地址', icon: 'none' })
    return false
  }
  for (const field of formFields.value) {
    if (field.richText) continue
    for (const group of formAnswers.value) {
      const val = group?.[field.fieldKey]
      if (field.required && isBlankFormValue(val)) {
        uni.showToast({ title: `请填写${field.fieldLabel}`, icon: 'none' })
        return false
      }
      if (field.fieldType === 'TEXT' && !validateTextContent(field, val)) {
        uni.showToast({ title: `请填写正确的${field.fieldLabel}`, icon: 'none' })
        return false
      }
    }
  }
  return true
}

async function submit() {
  if (!validate()) return
  submitting.value = true
  try {
    const slot = selectedSlot.value
    const checkoutPayload = {
      skuId: skuId.value,
      slotStockId: slot.id,
      serviceMode: serviceMode.value,
      slotDate: slotDate.value,
      slotStartTime: slot.slotStartTime,
      slotEndTime: slot.slotEndTime,
      contactName: contactName.value.trim(),
      contactPhone: contactPhone.value.trim(),
      serviceAddressSnapshot:
        serviceMode.value === SERVICE_MODE.ON_SITE ? serviceAddress.value.trim() : '',
      formAnswerJson: formAnswers.value.length
        ? JSON.stringify({ answers: formAnswers.value })
        : '',
    }
    await bindCheckout(checkoutPayload)
    uni.setStorageSync('appointment_checkout_context', checkoutPayload)
    uni.navigateTo({ url: '/pages/order/fillorder?way=BUY_NOW' })
  } catch (e: any) {
    uni.showToast({
      title: e?.data?.message || e?.message || '预约信息提交失败',
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
.slot-list,
.mode-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.slot-item,
.mode-item {
  padding: 16rpx 28rpx;
  background: #f2f2f2;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #333;
  border: 2rpx solid transparent;
}
.slot-item.active,
.mode-item.active {
  background: #fff5f5;
  border-color: #f2270c;
  color: #f2270c;
}
.slot-qty {
  margin-left: 8rpx;
  color: #999;
}
.input-gap {
  height: 16rpx;
}
.arrow {
  color: #ccc;
  font-size: 32rpx;
}
.opt-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.opt-item {
  font-size: 26rpx;
  color: #333;
}
.opt-mark {
  margin-right: 8rpx;
}
.range-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.range-sep {
  color: #999;
  font-size: 24rpx;
}
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.image-thumb,
.image-add {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.image-thumb image {
  width: 100%;
  height: 100%;
}
.image-add {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 48rpx;
  border: 1rpx dashed #ddd;
}
.field-label {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
}
.required {
  color: #f2270c;
  margin-left: 4rpx;
}
.rich-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
.notice-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
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
