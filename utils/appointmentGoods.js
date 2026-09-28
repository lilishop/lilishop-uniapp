/**
 * 预约商品（APPOINTMENT_GOODS）买家端工具
 * 规则：禁加购、仅 BUY_NOW、免物流地址、支持买家售后（含部分数量退款）
 */
export const APPOINTMENT_GOODS_TYPE = 'APPOINTMENT_GOODS'
export const APPOINTMENT_ORDER_TYPE = 'APPOINTMENT'

export const SERVICE_MODE = {
  IN_STORE: 'IN_STORE',
  ON_SITE: 'ON_SITE',
}

export const SERVICE_MODE_LABEL = {
  IN_STORE: '到店服务',
  ON_SITE: '上门服务',
}

export const VERIFICATION_CODE_STATUS = {
  UNUSED: 'UNUSED',
  USED: 'USED',
  INVALID: 'INVALID',
}

export const VERIFICATION_CODE_STATUS_TEXT = {
  UNUSED: '待核销',
  USED: '已核销',
  INVALID: '已失效',
}

export function isAppointmentGoods(goodsType) {
  return goodsType === APPOINTMENT_GOODS_TYPE
}

/** 预约商品 SKU quantity 固定为 0，可售性在结算页按时段校验 */
export const APPOINTMENT_BUY_MAX_NUM = 999

export function getAppointmentStock(_sku) {
  return APPOINTMENT_BUY_MAX_NUM
}

export function getAppointmentMaxBuyNum(_sku) {
  return APPOINTMENT_BUY_MAX_NUM
}

/** 将买家端 specs 转为规格维度列表（与 m-buy 一致） */
export function buildSpecFormatList(specs) {
  if (!Array.isArray(specs) || !specs.length) return []
  const arr = []
  specs.forEach((item) => {
    ;(item.specValues || []).forEach((spec) => {
      if (spec.specName === 'images') return
      const values = {
        value: spec.specValue,
        skuId: item.skuId,
      }
      let found = arr.find((row) => row.name === spec.specName)
      if (!found) {
        found = { name: spec.specName, values: [] }
        arr.push(found)
      }
      if (!found.values.find((v) => v.value === values.value)) {
        found.values.push(values)
      }
    })
  })
  return arr
}

/** 按当前选中规格值匹配 skuId */
export function findSkuIdBySpecSelection(specs, selectedValues) {
  if (!Array.isArray(specs) || !specs.length) return ''
  const matched = specs.find((item) => {
    const specValues = (item.specValues || []).filter((j) => j.specName !== 'images')
    if (specValues.length !== selectedValues.length) return false
    return specValues.every((sv, idx) => sv.specValue === selectedValues[idx])
  })
  return matched?.skuId || ''
}

/** 从 specs 解析某 sku 的规格选中值 */
export function getSpecSelectionForSku(specs, skuId) {
  const selected = []
  if (!Array.isArray(specs) || !skuId) return selected
  const item = specs.find((row) => row.skuId === skuId)
  if (!item) return selected
  ;(item.specValues || [])
    .filter((v) => v.specName !== 'images')
    .forEach((v, idx) => {
      selected[idx] = v.specValue
    })
  return selected
}

export function isAppointmentOrder(orderType) {
  return orderType === APPOINTMENT_ORDER_TYPE
}

/**
 * 结算页识别当前交易是否含预约 SKU（免地址/免配送）
 */
export function hasAppointmentInCheckout(orderMessage) {
  if (!orderMessage) return false
  const checked = orderMessage.checkedSkuList || []
  if (checked.some((item) => isAppointmentGoods(item?.goodsSku?.goodsType))) {
    return true
  }
  const cartList = orderMessage.cartList || []
  return cartList.some((cart) =>
    (cart.checkedSkuList || []).some((item) =>
      isAppointmentGoods(item?.goodsSku?.goodsType)
    )
  )
}

export function parseServiceModes(ext) {
  if (!ext) return [SERVICE_MODE.IN_STORE]
  const raw = ext.serviceModes
  if (Array.isArray(raw) && raw.length) {
    return raw.map(String).filter(Boolean)
  }
  if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed) && parsed.length) {
          return parsed.map(String).filter(Boolean)
        }
      } catch {
        /* fall through */
      }
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean)
  }
  return [SERVICE_MODE.IN_STORE]
}

export function formatSlotLabel(slot) {
  if (!slot) return ''
  const date = formatDate(slot.slotDate)
  const start = slot.slotStartTime || ''
  const end = slot.slotEndTime || ''
  const qty =
    slot.showRemainingQty && slot.availableQty != null
      ? `（余${slot.availableQty}）`
      : ''
  return `${date} ${start}-${end}${qty}`
}

export function formatDate(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.slice(0, 10)
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseWeekdays(raw) {
  if (raw == null || raw === '') return null
  const list = Array.isArray(raw) ? raw : String(raw).split(',')
  const set = new Set(
    list
      .map((item) => Number(String(item).trim()))
      .filter((num) => num >= 1 && num <= 7)
  )
  return set.size ? set : null
}

function parseDay(value) {
  if (value == null || value === '') return null
  if (typeof value === 'number') {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    date.setHours(0, 0, 0, 0)
    return date
  }
  const text = String(value).trim()
  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[ T]\d{2}:\d{2})/)
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(text)
  if (dateOnly && !hasZone) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  }
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) return null
  date.setHours(0, 0, 0, 0)
  return date
}

/** 商家星期：周一=1 … 周日=7 */
function sellerWeekday(date) {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export function buildBookableDates(ext, days = 30) {
  const rangeDays = Math.max(Number(ext?.bookingDateRangeDays) || days, 1)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const mode = String(ext?.bookableDateMode || '').toUpperCase()
  const custom = mode === 'CUSTOM'
  const weekdays = custom ? parseWeekdays(ext?.customWeekdays) : null
  const startLimit = custom ? parseDay(ext?.customDateStart) : null
  const endLimit = custom ? parseDay(ext?.customDateEnd) : null
  const list = []
  for (let i = 0; i < rangeDays; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    if (startLimit && date < startLimit) continue
    if (endLimit && date > endLimit) continue
    if (weekdays && !weekdays.has(sellerWeekday(date))) continue
    list.push(formatDate(date))
  }
  return list
}

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

export function parseDateParts(dateStr) {
  if (!dateStr) return null
  const parts = String(dateStr).slice(0, 10).split('-').map(Number)
  if (parts.length < 3) return null
  const [y, m, d] = parts
  return { y, m, d, date: new Date(y, m - 1, d) }
}

export function formatMonthTitle(dateStr) {
  const parts = parseDateParts(dateStr)
  if (!parts) return ''
  return `${parts.y}年${String(parts.m).padStart(2, '0')}月`
}

function buildCalendarDayCell(date, todayStr, bookableSet, inMonth) {
  const value = formatDate(date)
  const bookable = bookableSet instanceof Set ? bookableSet.has(value) : true
  return {
    value,
    day: date.getDate(),
    isToday: value === todayStr,
    inMonth,
    bookable,
  }
}

/** 以 anchor 所在自然周（周日始）生成 7 天条 */
export function buildWeekStrip(anchorDateStr, bookableSet) {
  const parts = parseDateParts(anchorDateStr)
  if (!parts) return []
  const anchor = parts.date
  anchor.setHours(0, 0, 0, 0)
  const todayStr = formatDate(new Date())
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - anchor.getDay())
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(buildCalendarDayCell(d, todayStr, bookableSet, true))
  }
  return days
}

/** 月初 YYYY-MM-01 */
export function monthStartDate(dateStr) {
  const parts = parseDateParts(dateStr)
  if (!parts) return formatDate(new Date())
  return `${parts.y}-${String(parts.m).padStart(2, '0')}-01`
}

/** 整月日历（周日始，含前后月补位日期） */
export function buildMonthCalendar(anchorDateStr, bookableSet) {
  const parts = parseDateParts(monthStartDate(anchorDateStr))
  if (!parts) return []
  const year = parts.y
  const month = parts.m - 1
  const todayStr = formatDate(new Date())
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const weeks = []
  let currentWeek = []

  const prevMonthLast = new Date(year, month, 0).getDate()
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLast - i)
    currentWeek.push(buildCalendarDayCell(d, todayStr, bookableSet, false))
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, month, day)
    currentWeek.push(buildCalendarDayCell(d, todayStr, bookableSet, true))
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length) {
    let nextDay = 1
    while (currentWeek.length < 7) {
      const d = new Date(year, month + 1, nextDay++)
      currentWeek.push(buildCalendarDayCell(d, todayStr, bookableSet, false))
    }
    weeks.push(currentWeek)
  }

  return weeks
}

export function shiftWeekDate(dateStr, deltaWeeks) {
  const parts = parseDateParts(dateStr)
  if (!parts) return formatDate(new Date())
  const d = parts.date
  d.setDate(d.getDate() + deltaWeeks * 7)
  return formatDate(d)
}

export function shiftMonthDate(dateStr, deltaMonths) {
  const parts = parseDateParts(monthStartDate(dateStr))
  if (!parts) return monthStartDate(formatDate(new Date()))
  const d = new Date(parts.y, parts.m - 1 + deltaMonths, 1)
  return formatDate(d)
}

export function clampBookableDate(dateStr, bookableList) {
  if (!dateStr) return dateStr
  if (!Array.isArray(bookableList) || !bookableList.length) return dateStr
  if (bookableList.includes(dateStr)) return dateStr
  const target = new Date(dateStr).getTime()
  let nearest = bookableList[0]
  let minDiff = Math.abs(new Date(nearest).getTime() - target)
  bookableList.forEach((item) => {
    const diff = Math.abs(new Date(item).getTime() - target)
    if (diff < minDiff) {
      minDiff = diff
      nearest = item
    }
  })
  return nearest
}

export function isSlotFull(slot) {
  if (!slot) return true
  return slot.availableQty != null && slot.availableQty <= 0
}

/** 时段剩余可约数量。capacity 为 0 表示不限，返回 null */
export function getSlotAvailableQty(slot) {
  if (!slot) return null
  const capacity = Number(slot.capacity)
  if (!capacity) return null
  const qty = Number(slot.availableQty)
  if (!Number.isFinite(qty) || qty >= 1000000) return null
  return Math.max(Math.floor(qty), 0)
}

/** 时段开始时间晚于当前时间才可预约；未来日期全部可约 */
export function isSlotStartAfterNow(slot, dateStr) {
  if (!slot?.slotStartTime) return false
  const date = formatDate(dateStr || slot.slotDate)
  if (!date) return false
  const today = formatDate(new Date())
  if (date > today) return true
  if (date < today) return false
  const parts = String(slot.slotStartTime).split(':').map(Number)
  const start = new Date()
  start.setHours(parts[0] || 0, parts[1] || 0, 0, 0)
  return start.getTime() > Date.now()
}

export function slotStatusText(slot) {
  if (isSlotFull(slot)) return '约满'
  if (slot?.showRemainingQty && slot?.availableQty != null) {
    return `剩余 ${slot.availableQty}`
  }
  return ''
}

const SELLER_WEEKDAY_LABELS = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

function formatWeekdayRule(raw) {
  const set = parseWeekdays(raw)
  if (!set) return ''
  const days = [...set].sort((a, b) => a - b)
  if (days.length >= 7) return '每天'
  const consecutive = days.every((day, index) => index === 0 || day === days[index - 1] + 1)
  if (consecutive && days.length > 1) {
    return `${SELLER_WEEKDAY_LABELS[days[0]]}至${SELLER_WEEKDAY_LABELS[days[days.length - 1]]}`
  }
  return days.map((day) => SELLER_WEEKDAY_LABELS[day]).join('、')
}

/** 预约须知中的可预约日期说明 */
export function buildBookableDateNotice(ext) {
  if (!ext) return ''
  const mode = String(ext.bookableDateMode || '').toUpperCase()
  if (mode !== 'CUSTOM') return '可预约日期：每天。'
  const start = formatDate(parseDay(ext.customDateStart))
  const end = formatDate(parseDay(ext.customDateEnd))
  const weekdays = formatWeekdayRule(ext.customWeekdays)
  let rangeText = ''
  if (start && end) rangeText = `${start} 至 ${end}`
  else if (start) rangeText = `${start} 起`
  else if (end) rangeText = `至 ${end}`
  let rule = rangeText
  if (weekdays && weekdays !== '每天') {
    rule = rangeText ? `${rangeText} 的${weekdays}` : weekdays
  }
  if (!rule) return '可预约日期：每天。'
  return `可预约日期：${rule}。`
}

/** 预约须知中的预约日期范围（今天起连续 N 天，含今天） */
export function buildBookingRangeNotice(ext) {
  if (!ext) return ''
  const rangeDays = Math.max(Number(ext.bookingDateRangeDays) || 30, 1)
  if (rangeDays === 1) return '预约日期范围：只能预约今天。'
  if (rangeDays === 2) return '预约日期范围：可以预约今天和明天。'
  return `预约日期范围：从今天起，连续 ${rangeDays} 天都可以预约。`
}

function formatLeadTime(hours) {
  const n = Math.max(Number(hours) || 1, 1)
  if (n % 24 === 0) return `${n / 24} 天`
  return `${n} 小时`
}

/** 预约须知中的提前预约说明 */
export function buildAdvanceNotice(ext) {
  if (!ext) return ''
  const mode = String(ext.advanceBookingMode || '').toUpperCase()
  const hours = Number(ext.advanceBookingHours)
  if (mode === 'REQUIRE_HOURS' && hours > 0) {
    return `提前预约：请提前 ${formatLeadTime(hours)}预约。`
  }
  return '提前预约：随时可以约，选现在之后的时段就行。'
}

export function buildCancelNotice(ext) {
  if (!ext) return '请按时到店或等候服务，取消规则以商家设置为准。'
  const mode = String(ext.cancelMode || '').toUpperCase()
  const hours = Number(ext.cancelHours)
  if (mode === 'NOT_ALLOWED') return '取消订单：约好后就不能取消了，请确认时间再下单。'
  if (mode === 'ALLOW_BEFORE_HOURS' && hours > 0) {
    return `取消订单：服务开始前 ${formatLeadTime(hours)}可以取消。`
  }
  return '取消订单：请按时到店或等候服务，取消规则以商家设置为准。'
}

export function parseFormFields(schemaJson) {
  if (!schemaJson) return []
  let data = schemaJson
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return []
    }
  }
  const list = Array.isArray(data) ? data : data?.fields || []
  return list.map((field, index) => {
    const fieldType = String(field.field_type || field.fieldType || field.type || 'TEXT')
      .toUpperCase()
      .replace(/-/g, '_')
    const options = Array.isArray(field.options)
      ? field.options.map((item, oi) =>
          typeof item === 'string'
            ? { label: item, value: item }
            : {
                label: item?.label || item?.name || `选项${oi + 1}`,
                value: item?.value || item?.label || `opt_${oi}`,
              }
        )
      : []
    return {
      fieldKey: field.field_key || field.fieldKey || field.id || field.key || `field_${index}`,
      fieldLabel: field.field_label || field.fieldLabel || field.label || field.title || `字段${index + 1}`,
      fieldType,
      required: !!field.required,
      hint: field.hint_text || field.hintText || field.hint || field.placeholder || '请输入',
      richText: fieldType === 'RICH_TEXT',
      richTextContent: field.rich_text_content || field.richTextContent || field.content || '',
      options,
      optionLabels: options.map((item) => item.label),
      contentType: field.content_type || field.contentType || 'TEXT',
      defaultValue: field.default_value || field.defaultValue || '',
      cityLevel: field.city_level || field.cityLevel || '',
      defaultVisibility: field.default_visibility || field.defaultVisibility || '',
      defaultDateMode: field.default_date_mode || field.defaultDateMode || '',
      defaultDate: field.default_date || field.defaultDate || '',
      defaultDateStart: field.default_date_start || field.defaultDateStart || '',
      defaultDateEnd: field.default_date_end || field.defaultDateEnd || '',
      defaultTimeMode: field.default_time_mode || field.defaultTimeMode || '',
      defaultTime: field.default_time || field.defaultTime || '',
      defaultTimeStart: field.default_time_start || field.defaultTimeStart || '',
      defaultTimeEnd: field.default_time_end || field.defaultTimeEnd || '',
      maxUploadCount: Number(field.max_upload_count || field.maxUploadCount) || 1,
    }
  })
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function currentTime() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function defaultFormValue(field) {
  const type = field?.fieldType
  const opts = field?.options || []
  if (type === 'RADIO' || type === 'SELECT') {
    return opts[0]?.value || ''
  }
  if (type === 'CHECKBOX' || type === 'IMAGE') return []
  if (type === 'TEXT') return field.defaultValue || ''
  if (type === 'DATE' && field.defaultVisibility === 'SHOW') {
    return field.defaultDateMode === 'SPECIFIED_DATE' ? field.defaultDate || '' : formatDate(new Date())
  }
  if (type === 'DATE_RANGE' && field.defaultVisibility === 'SHOW') {
    if (field.defaultDateMode === 'SPECIFIED_DATE') {
      return [field.defaultDateStart, field.defaultDateEnd].filter(Boolean).join('~')
    }
    const today = formatDate(new Date())
    return `${today}~${today}`
  }
  if (type === 'TIME' && field.defaultVisibility === 'SHOW') {
    return field.defaultTimeMode === 'SPECIFIED_TIME' ? field.defaultTime || '' : currentTime()
  }
  if (type === 'TIME_RANGE' && field.defaultVisibility === 'SHOW') {
    if (field.defaultTimeMode === 'SPECIFIED_TIME') {
      return [field.defaultTimeStart, field.defaultTimeEnd].filter(Boolean).join('~')
    }
    const now = currentTime()
    return `${now}~${now}`
  }
  return ''
}

export function isBlankFormValue(value) {
  if (value == null) return true
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || text === '~') return true
    if (text.startsWith('~') || text.endsWith('~')) return true
    return false
  }
  if (Array.isArray(value)) return !value.length
  return false
}

export function validateTextContent(field, value) {
  if (isBlankFormValue(value)) return true
  const type = field?.contentType || 'TEXT'
  const text = String(value).trim()
  if (type === 'MOBILE') return /^1\d{10}$/.test(text)
  if (type === 'ID_CARD') return /(^\d{15}$)|(^\d{17}[\dXx]$)/.test(text)
  if (type === 'EMAIL') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)
  if (type === 'NUMBER') return /^-?\d+(\.\d+)?$/.test(text)
  return true
}

export function formatFormAnswerValue(value) {
  if (value == null || value === '') return ''
  if (Array.isArray(value)) {
    const list = value.map((item) => (item == null ? '' : String(item).trim())).filter(Boolean)
    if (!list.length) return ''
    const looksLikeFile = list.every((item) => /^(https?:|wxfile:|data:|blob:|\/)/.test(item))
    return looksLikeFile ? `${list.length}张图片` : list.join('、')
  }
  const text = String(value).trim()
  return text === '~' ? '' : text
}

/** 结算页展示用：字段名 + 填写内容。多份时用分组标题，不把序号拼进字段名 */
export function buildFormDisplayRows(fields, groups) {
  const rows = []
  const list = groups || []
  list.forEach((group, index) => {
    const fieldRows = []
    ;(fields || []).forEach((field) => {
      if (!field || field.richText) return
      const text = formatFormAnswerValue(group?.[field.fieldKey])
      if (!text) return
      fieldRows.push({
        label: field.fieldLabel || '补充信息',
        value: text,
      })
    })
    if (!fieldRows.length) return
    if (list.length > 1) {
      rows.push({ type: 'group', label: `第${index + 1}位` })
    }
    rows.push(...fieldRows)
  })
  return rows
}

/** 从表单答案提取联系人快照：姓名、手机号字段 */
export function pickContactFromForm(fields, groups) {
  const group = (groups && groups[0]) || {}
  let contactName = ''
  let contactPhone = ''
  ;(fields || []).forEach((field) => {
    if (!field || field.richText || field.fieldType !== 'TEXT') return
    const text = String(group[field.fieldKey] ?? '').trim()
    if (!text) return
    const label = field.fieldLabel || ''
    const contentType = field.contentType || ''
    if (!contactPhone && (contentType === 'MOBILE' || /电话|手机/.test(label))) {
      contactPhone = text
      return
    }
    if (!contactName && /姓名|联系人|名字/.test(label)) {
      contactName = text
    }
  })
  return { contactName, contactPhone }
}

export function buildFormGroups(ext, quantity) {
  const fields = parseFormFields(ext?.systemFormSnapshot)
  const fillable = fields.filter((item) => !item.richText)
  if (!ext?.systemFormId && !fillable.length) return []
  const mode = ext?.formSubmitMode || 'PER_APPOINTMENT'
  const count = mode === 'PER_ORDER' ? 1 : Math.max(Number(quantity) || 1, 1)
  return Array.from({ length: count }, () => {
    const group = {}
    fillable.forEach((field) => {
      group[field.fieldKey] = defaultFormValue(field)
    })
    return group
  })
}

export function parseFormAnswerGroups(formAnswerJson) {
  if (!formAnswerJson) return []
  let data = formAnswerJson
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return []
    }
  }
  const fields = Array.isArray(data?.fields) ? data.fields : []
  const answers = Array.isArray(data?.answers) ? data.answers : []
  return answers
    .map((group) => {
      const map = group && typeof group === 'object' && !Array.isArray(group) ? group : {}
      const source = fields.length
        ? fields
        : Object.keys(map).map((key) => ({ fieldKey: key, fieldLabel: key }))
      return source
        .map((field) => ({
          fieldKey: field.fieldKey,
          fieldLabel: field.fieldLabel || field.fieldKey,
          value: map[field.fieldKey] ?? '',
        }))
        .filter((row) => row.value !== '' && row.value != null)
    })
    .filter((rows) => rows.length)
}

/** 预约订单列表、详情共用的状态标题 */
export function appointmentOrderStatusText(orderStatus) {
  if (orderStatus === 'UNPAID') return '待支付'
  if (orderStatus === 'CANCELLED') return '已取消'
  if (orderStatus === 'COMPLETED' || orderStatus === 'COMPLETE') return '已完成'
  return '待使用'
}

/** 预约单：未付款仅可取消；已付款仅可售后 */
export function getAppointmentAllowOperation(order) {
  if (!order || !isAppointmentOrder(order.orderType)) {
    return null
  }
  const unpaid =
    order.orderStatus === 'UNPAID' && order.payStatus === 'UNPAID'
  const paid = order.payStatus === 'PAID'
  return {
    cancel: unpaid,
    pay: unpaid,
    rog: false,
    showLogistics: false,
    afterSale: paid && order.orderStatus !== 'CANCELLED',
  }
}

export function computePartialRefundPrice(applyInfo, num) {
  const totalNum = Number(applyInfo?.totalNum || applyInfo?.orderItemNum) || 0
  const totalPrice = Number(applyInfo?.applyRefundPrice) || 0
  const qty = Number(num) || 1
  if (!totalNum || totalNum <= 0) return totalPrice
  if (qty >= totalNum) return totalPrice
  const unit = totalPrice / totalNum
  return Math.round(unit * qty * 100) / 100
}
