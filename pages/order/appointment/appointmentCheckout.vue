<template>
  <view class="page" :style="themeStyle">
    <view class="section product-section" v-if="goodsDetail.id">
      <view class="section-title">商品信息</view>
      <view class="product-row">
        <image class="product-thumb" :src="goodsDetail.thumbnail" mode="aspectFill" />
        <view class="product-info">
          <view class="product-name">{{ goodsDetail.goodsName }}</view>
          <view class="product-price">
            <text class="price-symbol">¥</text>
            <text class="price-int">{{ goodsFormatPrice(goodsDetail.price)[0] }}</text>
            <text class="price-dec">.{{ goodsFormatPrice(goodsDetail.price)[1] }}</text>
          </view>
        </view>
      </view>

      <view
        v-for="(spec, specIndex) in formatList"
        :key="spec.name"
        class="spec-block"
      >
        <view class="spec-block-title">{{ spec.name }}</view>
        <view class="spec-list">
          <view
            v-for="(specVal, specValIndex) in spec.values"
            :key="`${specVal.value}-${specValIndex}`"
            class="spec-item"
            :class="{ active: specVal.value === currentSelected[specIndex] }"
            @click="handleClickSpec(specIndex, specVal)"
          >
            {{ specVal.value }}
          </view>
        </view>
      </view>

      <view class="quantity-row">
        <text class="quantity-label">购买数量</text>
        <uni-number-box v-model="num" :min="1" :max="maxBuyNum" />
      </view>
    </view>

    <view class="section" v-if="serviceModes.length">
      <view class="section-title">服务方式</view>
      <view class="mode-list" :class="{ 'mode-list-split': serviceModes.length > 1 }">
        <view
          v-for="mode in serviceModes"
          :key="mode"
          class="mode-item"
          :class="{ active: serviceMode === mode, disabled: serviceModes.length === 1 }"
          @click="selectServiceMode(mode)"
        >
          {{ SERVICE_MODE_LABEL[mode] || mode }}
        </view>
      </view>
      <text v-if="serviceModes.length > 1" class="mode-hint">
        商品同时支持两种模式时须先选服务方式
      </text>
    </view>

    <view class="section booking-time-section">
      <view class="section-title">预约时间</view>

      <view class="booking-time-body">
        <view class="calendar-header">
          <view class="month-nav" @click="shiftMonth(-1)">
            <u-icon name="arrow-left" size="16" color="#666" />
          </view>
          <text class="month-title">{{ monthTitle }}</text>
          <view class="month-nav" @click="shiftMonth(1)">
            <u-icon name="arrow-right" size="16" color="#666" />
          </view>
        </view>

        <view class="calendar-grid">
          <view class="weekday-row">
            <text v-for="label in WEEKDAY_LABELS" :key="label" class="weekday-cell">{{ label }}</text>
          </view>

          <view v-for="(week, weekIndex) in monthWeeks" :key="weekIndex" class="date-row">
            <view
              v-for="day in week"
              :key="day.value"
              class="date-cell"
              :class="{
                active: slotDate === day.value,
                disabled: !day.bookable,
                'out-month': !day.inMonth,
                today: day.isToday,
              }"
              @click="selectCalendarDate(day)"
            >
              <view class="today-tag">{{ day.isToday ? '今' : '' }}</view>
              <view class="date-num" :class="{ 'date-num-active': slotDate === day.value }">
                {{ day.day }}
              </view>
            </view>
          </view>
        </view>

        <view v-if="loadingSlots" class="tip slot-tip">加载时段中...</view>
        <view v-else-if="!visibleSlots.length" class="tip slot-tip">该日期暂无可预约时段</view>
        <view v-else class="slot-panel-list">
          <view
            v-for="slot in visibleSlots"
            :key="slot.id"
            class="slot-panel-item"
            :class="{
              active: selectedSlot && selectedSlot.id === slot.id,
              full: isSlotFull(slot),
            }"
            @click="selectSlot(slot)"
          >
            <text class="slot-time">{{ slot.slotStartTime }} - {{ slot.slotEndTime }}</text>
            <text class="slot-status">{{ slotStatusText(slot) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="section" v-for="(group, gi) in formAnswers" :key="gi" v-show="formFields.length">
      <view class="section-title">
        {{ formAnswers.length > 1 ? `联系人（${gi + 1}/${formAnswers.length}）` : '联系人' }}
      </view>
      <view
        v-for="field in formFields"
        :key="field.fieldKey"
        class="form-field"
        :class="{ 'form-field-block': isBlockFormField(field) }"
      >
        <view v-if="field.richText" class="rich-text" v-html="field.richTextContent" />
        <template v-else>
          <view class="field-label">
            <text v-if="field.required" class="required">*</text>
            <text>{{ field.fieldLabel }}</text>
          </view>
          <view class="field-body">
            <view v-if="field.fieldType === 'CHECKBOX'" class="opt-list">
              <view
                v-for="opt in field.options"
                :key="opt.value"
                class="opt-item"
                :class="{ active: isChecked(group[field.fieldKey], opt.value) }"
                @click="toggleCheckbox(gi, field, opt.value)"
              >
                {{ opt.label }}
              </view>
            </view>
            <view v-else-if="field.fieldType === 'RADIO'" class="opt-list">
              <view
                v-for="opt in field.options"
                :key="opt.value"
                class="opt-item"
                :class="{ active: group[field.fieldKey] === opt.value }"
                @click="setFormAnswer(gi, field.fieldKey, opt.value)"
              >
                {{ opt.label }}
              </view>
            </view>
            <picker
              v-else-if="field.fieldType === 'SELECT'"
              :range="field.optionLabels"
              @change="(e) => onSelectChange(gi, field, e)"
            >
              <view class="picker-row">
                <text :class="{ 'field-placeholder': !group[field.fieldKey] }">{{ optionLabel(field, group[field.fieldKey]) || field.hint }}</text>
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
                <text :class="{ 'field-placeholder': !group[field.fieldKey] }">{{ group[field.fieldKey] || field.hint }}</text>
                <text class="arrow">›</text>
              </view>
            </picker>
            <view v-else-if="field.fieldType === 'DATE_RANGE'" class="range-row">
              <picker mode="date" :value="rangePart(group[field.fieldKey], 0)" @change="(e) => setRangePart(gi, field.fieldKey, 0, e.detail.value)">
                <view class="picker-row"><text :class="{ 'field-placeholder': !rangePart(group[field.fieldKey], 0) }">{{ rangePart(group[field.fieldKey], 0) || '开始日期' }}</text></view>
              </picker>
              <text class="range-sep">至</text>
              <picker mode="date" :value="rangePart(group[field.fieldKey], 1)" @change="(e) => setRangePart(gi, field.fieldKey, 1, e.detail.value)">
                <view class="picker-row"><text :class="{ 'field-placeholder': !rangePart(group[field.fieldKey], 1) }">{{ rangePart(group[field.fieldKey], 1) || '结束日期' }}</text></view>
              </picker>
            </view>
            <picker
              v-else-if="field.fieldType === 'TIME'"
              mode="time"
              :value="group[field.fieldKey]"
              @change="(e) => setFormAnswer(gi, field.fieldKey, e.detail.value)"
            >
              <view class="picker-row">
                <text :class="{ 'field-placeholder': !group[field.fieldKey] }">{{ group[field.fieldKey] || field.hint }}</text>
                <text class="arrow">›</text>
              </view>
            </picker>
            <view v-else-if="field.fieldType === 'TIME_RANGE'" class="range-row">
              <picker mode="time" :value="rangePart(group[field.fieldKey], 0)" @change="(e) => setRangePart(gi, field.fieldKey, 0, e.detail.value)">
                <view class="picker-row"><text :class="{ 'field-placeholder': !rangePart(group[field.fieldKey], 0) }">{{ rangePart(group[field.fieldKey], 0) || '开始时间' }}</text></view>
              </picker>
              <text class="range-sep">至</text>
              <picker mode="time" :value="rangePart(group[field.fieldKey], 1)" @change="(e) => setRangePart(gi, field.fieldKey, 1, e.detail.value)">
                <view class="picker-row"><text :class="{ 'field-placeholder': !rangePart(group[field.fieldKey], 1) }">{{ rangePart(group[field.fieldKey], 1) || '结束时间' }}</text></view>
              </picker>
            </view>
            <picker
              v-else-if="field.fieldType === 'CITY'"
              mode="region"
              @change="(e) => onCityChange(gi, field, e)"
            >
              <view class="picker-row">
                <text :class="{ 'field-placeholder': !group[field.fieldKey] }">{{ group[field.fieldKey] || field.hint }}</text>
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
              border="none"
              placeholder-style="color:#c0c4cc;font-size:28rpx"
              :custom-style="{ padding: '0', background: 'transparent' }"
              :type="field.contentType === 'NUMBER' || field.contentType === 'MOBILE' ? 'number' : 'text'"
              @update:model-value="(val) => setFormAnswer(gi, field.fieldKey, val)"
            />
          </view>
        </template>
      </view>
    </view>

    <view class="section" v-if="serviceMode === SERVICE_MODE.ON_SITE">
      <view class="section-title">服务地址</view>
      <view v-if="serviceAreaRequired" class="loc-btn" @click="chooseServiceLocation">地图选点</view>
      <u-input
        v-model="serviceAddress"
        type="textarea"
        :disabled="serviceAreaRequired"
        :placeholder="serviceAreaRequired ? '请在地图上选择上门地址' : '请输入上门服务地址'"
        border="surround"
        height="100"
      />
      <text v-if="serviceAreaRequired" class="loc-hint">商家已设置上门范围，请在地图上选择服务地址</text>
    </view>

    <view class="section notice">
      <view class="section-title">预约须知</view>
      <view v-if="bookableDateNotice" class="notice-text">{{ bookableDateNotice }}</view>
      <view v-if="bookingRangeNotice" class="notice-text">{{ bookingRangeNotice }}</view>
      <view v-if="advanceNotice" class="notice-text">{{ advanceNotice }}</view>
      <view class="notice-text">{{ cancelNotice }}</view>
    </view>

    <view class="footer">
      <u-button type="primary" shape="circle" :loading="submitting" @click="submit">
        下一步
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getGoods } from '@/api/goods.js'
import * as API_trade from '@/api/trade.js'
import { listSlots, bindCheckout, getGoodsExt } from '@/api/appointment.js'
import uniNumberBox from '@/components/uni-number-box.vue'
import { goodsFormatPrice, parseGoodsImageUrl } from '@/utils/filters.js'
import { getAppointmentMaxBuyNum } from '@/utils/goodsType.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import {
  SERVICE_MODE,
  SERVICE_MODE_LABEL,
  parseServiceModes,
  buildBookableDates,
  buildBookableDateNotice,
  buildBookingRangeNotice,
  buildAdvanceNotice,
  buildCancelNotice,
  formatDate,
  parseFormFields,
  buildFormGroups,
  isBlankFormValue,
  validateTextContent,
  pickContactFromForm,
  buildFormDisplayRows,
  buildSpecFormatList,
  findSkuIdBySpecSelection,
  getSpecSelectionForSku,
  WEEKDAY_LABELS,
  buildMonthCalendar,
  formatMonthTitle,
  monthStartDate,
  shiftMonthDate,
  isSlotFull,
  isSlotStartAfterNow,
  getSlotAvailableQty,
  slotStatusText,
} from '@/utils/appointmentGoods.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const skuId = ref('')
const goodsId = ref('')
const num = ref(1)
const goodsDetail = ref<any>({})
const goodsSpec = ref<any[]>([])
const formatList = ref<any[]>([])
const currentSelected = ref<string[]>([])
const goodsExt = ref<any>(null)
const slotDate = ref('')
const slots = ref<any[]>([])
const selectedSlot = ref<any>(null)
const serviceModes = ref<string[]>([SERVICE_MODE.IN_STORE])
const serviceMode = ref(SERVICE_MODE.IN_STORE)
const serviceAddress = ref('')
const serviceLongitude = ref<number | null>(null)
const serviceLatitude = ref<number | null>(null)
const loadingSlots = ref(false)
const submitting = ref(false)
const bookableDates = ref<string[]>([])
const formFields = ref<any[]>([])
const formAnswers = ref<Record<string, any>[]>([])
const calendarMonth = ref('')

const bookableDateNotice = computed(() => buildBookableDateNotice(goodsExt.value))
const bookingRangeNotice = computed(() => buildBookingRangeNotice(goodsExt.value))
const advanceNotice = computed(() => buildAdvanceNotice(goodsExt.value))
const cancelNotice = computed(() => buildCancelNotice(goodsExt.value))
const serviceAreaRequired = computed(() => !!goodsExt.value?.serviceAreaRequired)
const bookableDateSet = computed(() => new Set(bookableDates.value))
const monthWeeks = computed(() =>
  buildMonthCalendar(
    calendarMonth.value || slotDate.value || formatDate(new Date()),
    bookableDateSet.value
  )
)
const monthTitle = computed(() =>
  formatMonthTitle(calendarMonth.value || slotDate.value || formatDate(new Date()))
)
const maxBuyNum = computed(() => {
  const goodsMax = getAppointmentMaxBuyNum(goodsDetail.value)
  const slotLimit = getSlotAvailableQty(selectedSlot.value)
  if (slotLimit == null) return goodsMax
  return Math.min(goodsMax, slotLimit)
})
const visibleSlots = computed(() =>
  (slots.value || []).filter((slot) => isSlotStartAfterNow(slot, slotDate.value))
)

onLoad((options) => {
  skuId.value = options?.skuId || ''
  goodsId.value = options?.goodsId || ''
  num.value = Number(options?.num) || 1
})

onMounted(async () => {
  if (!goodsId.value) return
  await loadGoodsDetail()
  initSpecSelection()
  try {
    const res = await getGoodsExt(goodsId.value)
    goodsExt.value = res.data?.result || null
    serviceModes.value = parseServiceModes(goodsExt.value)
    serviceMode.value = serviceModes.value[0] || SERVICE_MODE.IN_STORE
    bookableDates.value = buildBookableDates(goodsExt.value)
    slotDate.value = bookableDates.value[0] || ''
    calendarMonth.value = monthStartDate(slotDate.value || formatDate(new Date()))
    formFields.value = parseFormFields(goodsExt.value?.systemFormSnapshot)
    formAnswers.value = buildFormGroups(goodsExt.value, num.value)
  } catch {
    bookableDates.value = buildBookableDates(null)
    slotDate.value = bookableDates.value[0] || ''
    calendarMonth.value = monthStartDate(slotDate.value || formatDate(new Date()))
  }
})

watch(slotDate, () => {
  selectedSlot.value = null
  loadSlots()
})

watch(num, (val) => {
  const limit = maxBuyNum.value
  if (limit > 0 && val > limit) {
    num.value = limit
    return
  }
  formAnswers.value = buildFormGroups(goodsExt.value, val)
})

watch(selectedSlot, (slot) => {
  const limit = getSlotAvailableQty(slot)
  if (limit == null || num.value <= limit) return
  num.value = Math.max(limit, 1)
  if (limit > 0) {
    uni.showToast({ title: `该时段最多可预约${limit}个`, icon: 'none' })
  }
})

async function loadGoodsDetail() {
  if (!goodsId.value) return
  const res = await getGoods(skuId.value || 'undefined', goodsId.value)
  if (!res?.data?.success) {
    uni.showToast({ title: res?.data?.message || '商品加载失败', icon: 'none' })
    return
  }
  goodsDetail.value = res.data.result?.data || {}
  goodsDetail.value.thumbnail = parseGoodsImageUrl(goodsDetail.value.thumbnail)
  goodsSpec.value = res.data.result?.specs || []
  if (!skuId.value && goodsSpec.value.length) {
    skuId.value = goodsSpec.value[0].skuId
  }
}

function initSpecSelection() {
  formatList.value = buildSpecFormatList(goodsSpec.value)
  if (skuId.value) {
    currentSelected.value = getSpecSelectionForSku(goodsSpec.value, skuId.value)
    return
  }
  if (goodsSpec.value.length) {
    skuId.value = goodsSpec.value[0].skuId
    currentSelected.value = getSpecSelectionForSku(goodsSpec.value, skuId.value)
  }
}

async function handleClickSpec(specIndex: number, specVal: any) {
  currentSelected.value[specIndex] = specVal.value
  const nextSkuId = findSkuIdBySpecSelection(goodsSpec.value, currentSelected.value)
  if (!nextSkuId) {
    uni.showToast({ title: '暂无该规格', icon: 'none' })
    return
  }
  if (nextSkuId === skuId.value) return
  skuId.value = nextSkuId
  selectedSlot.value = null
  await loadGoodsDetail()
  initSpecSelection()
  await loadSlots()
}

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

function shiftMonth(delta: number) {
  const anchor = calendarMonth.value || slotDate.value || formatDate(new Date())
  calendarMonth.value = shiftMonthDate(anchor, delta)
}

function selectCalendarDate(day: { value: string; bookable: boolean; inMonth?: boolean }) {
  if (!day?.bookable) return
  slotDate.value = day.value
  if (day.inMonth === false) {
    calendarMonth.value = monthStartDate(day.value)
  }
}

function isBlockFormField(field: any) {
  const type = field?.fieldType
  return type === 'CHECKBOX' || type === 'RADIO' || type === 'IMAGE' || type === 'DATE_RANGE' || type === 'TIME_RANGE' || field?.richText
}

function selectServiceMode(mode: string) {
  if (!serviceModes.value.includes(mode)) return
  serviceMode.value = mode
}

function selectSlot(slot: any) {
  if (!isSlotStartAfterNow(slot, slotDate.value)) {
    uni.showToast({ title: '请选择当前时间之后的时段', icon: 'none' })
    return
  }
  if (isSlotFull(slot)) {
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

function chooseServiceLocation() {
  const open = () => {
    uni.chooseLocation({
      success(res) {
        const address = [res.address, res.name].filter(Boolean).join(' ')
        serviceAddress.value = address
        serviceLongitude.value = res.longitude
        serviceLatitude.value = res.latitude
      },
    })
  }
  // #ifdef MP-WEIXIN
  uni.authorize({
    scope: 'scope.userLocation',
    success: open,
    fail() {
      uni.showModal({
        content: '需要定位权限才能选择上门地址',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting({ success: open })
          }
        },
      })
    },
  })
  // #endif
  // #ifndef MP-WEIXIN
  open()
  // #endif
}

function validate() {
  if (!selectedSlot.value) {
    uni.showToast({ title: '请选择预约时段', icon: 'none' })
    return false
  }
  if (!isSlotStartAfterNow(selectedSlot.value, slotDate.value)) {
    uni.showToast({ title: '请选择当前时间之后的时段', icon: 'none' })
    return false
  }
  const slotLimit = getSlotAvailableQty(selectedSlot.value)
  if (slotLimit != null && num.value > slotLimit) {
    uni.showToast({ title: `该时段最多可预约${slotLimit}个`, icon: 'none' })
    return false
  }
  if (serviceMode.value === SERVICE_MODE.ON_SITE && !serviceAddress.value.trim()) {
    uni.showToast({ title: serviceAreaRequired.value ? '请在地图上选择服务地址' : '请填写服务地址', icon: 'none' })
    return false
  }
  if (
    serviceMode.value === SERVICE_MODE.ON_SITE
    && serviceAreaRequired.value
    && (serviceLongitude.value == null || serviceLatitude.value == null)
  ) {
    uni.showToast({ title: '请在地图上选择服务地址', icon: 'none' })
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
    const cartRes = await API_trade.addToCart({
      skuId: skuId.value,
      num: num.value,
      cartType: 'BUY_NOW',
    })
    if (!cartRes.data?.success) {
      uni.showToast({ title: cartRes.data?.message || '下单失败', icon: 'none' })
      return
    }
    const slot = selectedSlot.value
    const contact = pickContactFromForm(formFields.value, formAnswers.value)
    const checkoutPayload = {
      skuId: skuId.value,
      slotStockId: slot.id,
      serviceMode: serviceMode.value,
      slotDate: slotDate.value,
      slotStartTime: slot.slotStartTime,
      slotEndTime: slot.slotEndTime,
      contactName: contact.contactName,
      contactPhone: contact.contactPhone,
      serviceAddressSnapshot:
        serviceMode.value === SERVICE_MODE.ON_SITE ? serviceAddress.value.trim() : '',
      serviceLongitude:
        serviceMode.value === SERVICE_MODE.ON_SITE ? serviceLongitude.value : null,
      serviceLatitude:
        serviceMode.value === SERVICE_MODE.ON_SITE ? serviceLatitude.value : null,
      formAnswerJson: formAnswers.value.length
        ? JSON.stringify({ answers: formAnswers.value })
        : '',
      formRows: buildFormDisplayRows(formFields.value, formAnswers.value),
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
.loc-btn {
  display: inline-block;
  margin-bottom: 16rpx;
  padding: 8rpx 24rpx;
  border: 1rpx solid var(--theme-primary, #ff3c2a);
  border-radius: 8rpx;
  color: var(--theme-primary, #ff3c2a);
  font-size: 26rpx;
}
.loc-hint {
  display: block;
  margin-top: 12rpx;
  color: #999;
  font-size: 24rpx;
}
.product-row {
  display: flex;
  gap: 20rpx;
}
.product-thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
  background: #f5f5f5;
}
.product-info {
  flex: 1;
  min-width: 0;
}
.product-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}
.product-price {
  margin-top: 12rpx;
  color: #f2270c;
  font-weight: 600;
}
.price-symbol,
.price-dec {
  font-size: 24rpx;
}
.price-int {
  font-size: 36rpx;
}
.spec-block {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}
.spec-block-title {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 16rpx;
}
.quantity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}
.quantity-label {
  font-size: 28rpx;
  color: #333;
}
.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.spec-item {
  padding: 16rpx 28rpx;
  background: #f2f2f2;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #333;
  border: 2rpx solid transparent;
}
.spec-item.active {
  background: #fff5f5;
  border-color: #f2270c;
  color: #f2270c;
}
.form-field {
  display: flex;
  align-items: center;
  gap: 24rpx;
  min-height: 96rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}
.form-field:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.form-field-block {
  flex-direction: column;
  align-items: stretch;
  gap: 16rpx;
  padding: 20rpx 0;
}
.field-body {
  flex: 1;
  min-width: 0;
}
.field-body picker {
  display: block;
  width: 100%;
}
.field-body :deep(.u-input) {
  padding: 0 !important;
  background: transparent !important;
}
.field-placeholder {
  color: #c0c4cc;
}
.picker-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 44rpx;
  font-size: 28rpx;
  color: #333;
}
.tip {
  color: #999;
  font-size: 26rpx;
}
.mode-list {
  display: flex;
  gap: 16rpx;
}
.mode-list-split .mode-item {
  flex: 1;
  width: 0;
}
.booking-time-body {
  margin-top: 0;
}
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  margin-bottom: 20rpx;
}
.month-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  min-width: 180rpx;
  text-align: center;
}
.month-nav {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calendar-grid {
  margin-top: 4rpx;
}
.weekday-row,
.date-row {
  display: flex;
  align-items: flex-start;
}
.date-row + .date-row {
  margin-top: 8rpx;
}
.weekday-cell,
.date-cell {
  flex: 1;
  text-align: center;
}
.weekday-cell {
  font-size: 22rpx;
  color: #999;
  padding-bottom: 12rpx;
}
.date-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 84rpx;
  padding: 0;
  box-sizing: border-box;
}
.date-cell.disabled {
  opacity: 0.45;
}
.date-cell.disabled .date-num,
.date-cell.disabled .today-tag {
  color: #ccc;
}
.date-cell.out-month .date-num {
  color: #ccc;
}
.date-cell.out-month:not(.disabled) .date-num {
  color: #999;
}
.today-tag {
  height: 22rpx;
  line-height: 22rpx;
  font-size: 18rpx;
  color: var(--theme-primary, #ff3c2a);
}
.date-num {
  width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  margin-top: 2rpx;
  border-radius: 50%;
  font-size: 28rpx;
  color: #333;
}
.date-num-active,
.date-cell.active .date-num {
  background: var(--theme-primary, #ff3c2a);
  color: #fff;
  font-weight: 600;
}
.slot-tip {
  margin-top: 24rpx;
}
.slot-panel-list {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.slot-panel-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: #fff;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  box-sizing: border-box;
}
.slot-panel-item.active {
  background: var(--theme-primary-10, rgba(255, 60, 42, 0.1));
  border-color: var(--theme-primary, #ff3c2a);
}
.slot-panel-item.full {
  background: #fafafa;
  border-color: #eee;
}
.slot-panel-item.full .slot-time,
.slot-panel-item.full .slot-status {
  color: #bbb;
}
.slot-time {
  font-size: 28rpx;
  color: #333;
}
.slot-panel-item.active .slot-time {
  color: var(--theme-primary, #ff3c2a);
  font-weight: 600;
}
.slot-status {
  font-size: 24rpx;
  color: #666;
  flex-shrink: 0;
  margin-left: 16rpx;
}
.mode-item {
  padding: 20rpx 16rpx;
  background: #fff;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
  border: 2rpx solid #e5e5e5;
  box-sizing: border-box;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mode-item.active {
  background: var(--theme-primary-10, rgba(255, 60, 42, 0.1));
  border-color: var(--theme-primary, #ff3c2a);
  color: var(--theme-primary, #ff3c2a);
  font-weight: 600;
}
.mode-hint {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}
.opt-item {
  padding: 12rpx 28rpx;
  background: #f6f7f9;
  border-radius: 999rpx;
  border: 2rpx solid transparent;
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}
.opt-item.active {
  background: var(--theme-primary-10, rgba(255, 60, 42, 0.1));
  border-color: var(--theme-primary, #ff3c2a);
  color: var(--theme-primary, #ff3c2a);
}
.range-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.range-row picker {
  flex: 1;
  min-width: 0;
}
.range-row .picker-row {
  background: #f6f7f9;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
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
  flex: 0 0 168rpx;
  width: 168rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}
.form-field-block .field-label {
  flex: none;
  width: auto;
}
.required {
  color: #f2270c;
  margin-right: 4rpx;
}
.rich-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
.notice-text {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}
.notice-text + .notice-text {
  margin-top: 8rpx;
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
