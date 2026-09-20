/**
 * 预约服务买家端 API
 */
import { http, Method } from '@/utils/request.js'

/** 查询可预约时段 */
export function listSlots(skuId, slotDate) {
  return http.request({
    url: '/buyer/appointment/slots',
    method: Method.GET,
    needToken: true,
    params: { skuId, slotDate },
  })
}

/** 绑定预约结算上下文（addToCart 后、createTrade 前） */
export function bindCheckout(data) {
  return http.request({
    url: '/buyer/appointment/checkout/bind',
    method: Method.POST,
    needToken: true,
    data,
  })
}

/** 预约商品扩展配置 */
export function getGoodsExt(goodsId) {
  return http.request({
    url: `/buyer/appointment/goods/${goodsId}/ext`,
    method: Method.GET,
    needToken: false,
  })
}

/** 买家预约订单详情（时段、核销码） */
export function getAppointmentOrderDetail(orderSn) {
  return http.request({
    url: `/buyer/appointment/order/${orderSn}`,
    method: Method.GET,
    needToken: true,
  })
}

/** 改期申请 */
export function requestReschedule(orderSn, payload) {
  return http.request({
    url: `/buyer/appointment/orders/${orderSn}/reschedule`,
    method: Method.POST,
    needToken: true,
    data: payload || {},
  })
}
