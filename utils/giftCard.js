/**
 * 礼品卡（现金卡）展示与状态工具，与 PC 买家端对齐。
 */

export const GIFT_CARD_STATUS = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  PENDING_ACTIVATION: 'PENDING_ACTIVATION',
}

export const GIFT_CARD_PAY_NOTICE =
  '请在礼品卡有效期内使用；结算时勾选礼品卡即可按规则抵扣订单金额，可与优惠券等活动叠加规则以平台说明为准。放弃勾选或取消抵扣将恢复对应余额。'

export const GIFT_CARD_USE_NOTICE =
  '请在有效期内使用本礼品卡；消费时将优先使用卡内余额。具体使用范围以活动规则为准。如有疑问请联系客服。'

export function formatGiftFaceValue(val) {
  if (val == null || val === '') {
    return '—'
  }
  const n = Number(val)
  if (Number.isNaN(n)) {
    return String(val)
  }
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}

export function formatGiftExpire(row) {
  const t = row && row.expireTime
  if (!t) {
    return '长期有效'
  }
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) {
    return '长期有效'
  }
  if (d.getFullYear() >= 2099) {
    return '长期有效'
  }
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day} 到期`
}

export function resolveMemberCardId(row) {
  if (!row) {
    return ''
  }
  if (row.memberCardId != null && row.memberCardId !== '') {
    return String(row.memberCardId)
  }
  if (row.id != null && row.id !== '') {
    return String(row.id)
  }
  return ''
}

export function decorateGiftCard(item, selectedIds = []) {
  const ids = (selectedIds || []).map(String)
  return {
    ...item,
    selected: ids.indexOf(String(item && item.id)) !== -1,
    faceText: formatGiftFaceValue(item && item.faceValue),
    expireText: formatGiftExpire(item),
  }
}

export function giftCardActionLabel(status) {
  if (status === GIFT_CARD_STATUS.PENDING_ACTIVATION) {
    return '激活自用'
  }
  if (status === GIFT_CARD_STATUS.AVAILABLE) {
    return '去使用'
  }
  return '不可用'
}
