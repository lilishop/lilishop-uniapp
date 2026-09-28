/**
 * @Author Mike
 * @Date 2026-08-03
 *
 * 卡密商品（电子卡券 E_COUPON）类型与订单工具。
 *
 * 与 VIRTUAL_GOODS / VIRTUAL 核销商品区分：E_COUPON 走 BUY_NOW/PINTUAN/POINTS/KANJIA，
 * 支付后 COMPLETED + cardKeys；禁加购、免地址；M-02 支持全量促销；不支持买家售后。
 * 需求见 lilishop/docs/requirements/card-key-goods-v4.md
 */
export const E_COUPON_GOODS_TYPE = 'E_COUPON'
export const E_COUPON_ORDER_TYPE = 'E_COUPON'
export const VIRTUAL_GOODS_TYPE = 'VIRTUAL_GOODS'
export const VIRTUAL_ORDER_TYPE = 'VIRTUAL'

import {
  APPOINTMENT_GOODS_TYPE,
  APPOINTMENT_ORDER_TYPE,
  isAppointmentGoods,
  isAppointmentOrder,
  hasAppointmentInCheckout,
  getAppointmentStock,
  getAppointmentMaxBuyNum,
} from './appointmentGoods.js'

export {
  APPOINTMENT_GOODS_TYPE,
  APPOINTMENT_ORDER_TYPE,
  isAppointmentGoods,
  isAppointmentOrder,
  hasAppointmentInCheckout,
  getAppointmentStock,
  getAppointmentMaxBuyNum,
}

/** 单次购买数量上限（O-09 默认：min(quantity, 999)） */
export const E_COUPON_MAX_BUY_NUM = 999

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE
}

export function isECouponOrder(orderType) {
  return orderType === E_COUPON_ORDER_TYPE
}

export function isVirtualGoods(goodsType) {
  return goodsType === VIRTUAL_GOODS_TYPE
}

export function isVirtualOrder(orderType) {
  return orderType === VIRTUAL_ORDER_TYPE
}

/** 非实物：含 E_COUPON、预约商品与核销型 VIRTUAL_GOODS（详情页隐藏「送至」等） */
export function isNonPhysicalGoods(goodsType) {
  return isECoupon(goodsType) || isVirtualGoods(goodsType) || isAppointmentGoods(goodsType)
}

export function isNonPhysicalOrder(orderType) {
  return isECouponOrder(orderType) || isVirtualOrder(orderType) || isAppointmentOrder(orderType)
}

/** 可售库存：E_COUPON 读 SKU quantity（由卡池 syncSkuStock 同步） */
export function getECouponStock(sku) {
  if (!sku) return 0
  return Number(sku.quantity) || 0
}

export function getECouponMaxBuyNum(sku) {
  const stock = getECouponStock(sku)
  if (stock <= 0) return 1
  return Math.min(stock, E_COUPON_MAX_BUY_NUM)
}

/**
 * 结算页识别当前交易是否含 E_COUPON SKU（用于免地址/免配送，不用于促销屏蔽）。
 * 须从 goodsSku.goodsType 判断，不能依赖 cartTypeEnum=VIRTUAL（E_COUPON 仍是 BUY_NOW）。
 */
export function hasECouponInCheckout(orderMessage) {
  if (!orderMessage) return false
  const checked = orderMessage.checkedSkuList || []
  if (checked.some((item) => isECoupon(item?.goodsSku?.goodsType))) {
    return true
  }
  const cartList = orderMessage.cartList || []
  return cartList.some((cart) =>
    (cart.checkedSkuList || []).some((item) =>
      isECoupon(item?.goodsSku?.goodsType)
    )
  )
}

/** 卡密履约状态（与后端 CardKeyFulfillStatusEnum 一致） */
export const CARD_KEY_FULFILL_STATUS = {
  PENDING: 'PENDING',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
}

export const CARD_KEY_FULFILL_STATUS_TEXT = {
  PENDING: '待发放',
  DELIVERED: '已发放',
  FAILED: '发放失败',
  NOT_APPLICABLE: '不适用',
}

export function resolveCardKeyFulfillMessage(line) {
  if (line && line.message) return line.message
  return CARD_KEY_FULFILL_STATUS_TEXT[line?.status] || line?.status || '—'
}

export function isCardKeyFulfillApplicable(item) {
  if (!item) return false
  const status = item.cardKeyFulfillStatus
  if (status) return status !== CARD_KEY_FULFILL_STATUS.NOT_APPLICABLE
  if (item.cardKeyDelivered != null || (item.cardKeys && item.cardKeys.length)) {
    return true
  }
  return item.goodsType === E_COUPON_GOODS_TYPE
}

function normalizeCardKeyFulfillLine(source) {
  const status =
    source.cardKeyFulfillStatus ||
    (source.cardKeyDelivered
      ? CARD_KEY_FULFILL_STATUS.DELIVERED
      : CARD_KEY_FULFILL_STATUS.PENDING)
  const cardKeys =
    status === CARD_KEY_FULFILL_STATUS.DELIVERED ? source.cardKeys || [] : []
  return {
    key: source.sn || source.orderSn || source.id || source.skuId,
    goodsName: source.goodsName,
    status,
    message: source.cardKeyFulfillMessage,
    cardKeys,
  }
}

/** 汇总当前订单 orderItems 的卡密履约行（仅本单；满赠赠品在赠品订单单独查看） */
export function collectCardKeyFulfillLines(orderItems = []) {
  const lines = []
  ;(orderItems || []).forEach((item) => {
    if (!isCardKeyFulfillApplicable(item)) return
    lines.push(normalizeCardKeyFulfillLine(item))
  })
  return lines
}

function flattenCardKeyFulfillLines(lines, withGoodsName = false) {
  const rows = []
  ;(lines || []).forEach((line) => {
    if (line.status !== CARD_KEY_FULFILL_STATUS.DELIVERED) return
    ;(line.cardKeys || []).forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: line.goodsName } : { ...ck })
    })
  })
  return rows
}

/** 当前订单是否含已交付卡密（仅 orderItems） */
export function orderHasCardKeyContent(orderItems) {
  const lines = collectCardKeyFulfillLines(orderItems)
  return flattenCardKeyFulfillLines(lines).length > 0
}

/** 将 orderItems[].cardKeys 展平为明文列表（DELIVERED 且含 cardSecret） */
export function flattenOrderCardKeys(orderItems, withGoodsName = false) {
  const lines = collectCardKeyFulfillLines(orderItems)
  if (lines.some((line) => line.status)) {
    return flattenCardKeyFulfillLines(lines, withGoodsName)
  }
  const rows = []
  ;(orderItems || []).forEach((item) => {
    if (!item.cardKeyDelivered || !item.cardKeys || !item.cardKeys.length) return
    item.cardKeys.forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: item.goodsName } : { ...ck })
    })
  })
  return rows
}
