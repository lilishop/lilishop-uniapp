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
  if (Array.isArray(raw) && raw.length) return raw
  if (typeof raw === 'string' && raw.trim()) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
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

export function buildBookableDates(ext, days = 30) {
  const rangeDays = Number(ext?.bookingDateRangeDays) || days
  const list = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    list.push(formatDate(d))
  }
  return list
}

export function buildCancelNotice(ext) {
  if (!ext) return '请按时到店/等候服务；具体取消规则以商家设置为准。'
  const mode = ext.cancelMode
  const hours = ext.cancelHours
  if (mode === 'NOT_ALLOWED') return '预约成功后不可取消，请谨慎下单。'
  if (mode === 'ALLOW_BEFORE_HOURS' && hours) {
    return `服务开始前 ${hours} 小时可免费取消，逾期可能无法退款。`
  }
  return '请按时到店/等候服务；具体取消规则以商家设置为准。'
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
    reschedule: paid && ['PAID', 'TAKE'].includes(order.orderStatus),
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
