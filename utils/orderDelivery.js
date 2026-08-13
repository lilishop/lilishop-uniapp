/**
 * 订单配送展示工具（整单 / 拆单 / 无需配送）
 */

export function shouldLoadDelivery(order) {
  return (
    order?.deliveryMethod === 'LOGISTICS' &&
    order?.allowOperationVO?.showLogistics === true
  )
}

export function isNoDelivery(packageItem) {
  return (
    packageItem?.fulfillmentMode === 'NO_DELIVERY' ||
    packageItem?.logisticsRequired === false
  )
}

export function getPackageTitle(packageItem, index) {
  if (isNoDelivery(packageItem)) return '无需配送'
  if (packageItem?.fulfillmentMode === 'WHOLE') return '整单发货'
  if (packageItem?.fulfillmentMode === 'SPLIT') return `包裹 ${index + 1}`
  return `包裹 ${index + 1}`
}

export function getDeliveryEntryText(packages, orderStatus, legacyTraces) {
  if (packages?.length) {
    const allNoDelivery = packages.every(isNoDelivery)
    if (allNoDelivery) return '查看配送说明'
    if (orderStatus === 'PARTS_DELIVERED') {
      return `已发出 ${packages.length} 个包裹，剩余商品待发货`
    }
    return `共 ${packages.length} 个配送包裹`
  }

  const traces = legacyTraces?.traces
  if (Array.isArray(traces) && traces.length) {
    const latest = traces[0]
    return latest?.AcceptStation || '商家已发货，物流信息同步中'
  }

  return '商家已发货，物流信息同步中'
}

export function getOrderAllowOperation(order, orderDetail) {
  return order?.allowOperationVO || orderDetail?.allowOperationVO || {}
}
