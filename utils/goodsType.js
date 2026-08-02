/**
 * @Author Mike
 * @Date 2026-07-31
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

/** 非实物：含 E_COUPON 与核销型 VIRTUAL_GOODS（详情页隐藏「送至」等） */
export function isNonPhysicalGoods(goodsType) {
  return isECoupon(goodsType) || isVirtualGoods(goodsType)
}

export function isNonPhysicalOrder(orderType) {
  return isECouponOrder(orderType) || isVirtualOrder(orderType)
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

/** 将 orderItems[].cardKeys 展平为列表，供卡密二级页展示 */
export function flattenOrderCardKeys(orderItems) {
  const rows = []
  ;(orderItems || []).forEach((item) => {
    ;(item.cardKeys || []).forEach((ck) => {
      rows.push({ ...ck })
    })
  })
  return rows
}

/** 是否已发卡（API-B-01：cardKeyDelivered 或 orderItems 内标记） */
export function isCardKeyDelivered(orderItems) {
  return (orderItems || []).some((item) => item.cardKeyDelivered)
}
