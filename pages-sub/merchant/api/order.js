import { storeHttp } from "../utils/storeRequest.js";

/**
 * 商家订单列表
 * @param {Object} params { orderStatus, orderType, keywords, pageNumber, pageSize }
 */
export function getStoreOrderList(params) {
  return storeHttp.request({
    url: "/order/order",
    method: "GET",
    params,
  });
}

/**
 * 商家订单详情
 * @param {String} sn
 */
export function getStoreOrderDetail(sn) {
  return storeHttp.request({
    url: `/order/order/${sn}`,
    method: "GET",
  });
}

/**
 * 自提 / 虚拟商品单码核销
 * @param {String} sn
 * @param {String} verificationCode
 */
export function storeOrderTake(sn, verificationCode) {
  return storeHttp.request({
    url: `/order/order/take/${sn}/${verificationCode}`,
    method: "PUT",
  });
}

/**
 * 通用核销预检（按核销码查询）
 * @param {String} code
 */
export function previewStoreVerification(code) {
  return storeHttp.request({
    url: "/order/order/verification/preview",
    method: "GET",
    params: { code },
  });
}

/**
 * 通用确认核销
 * @param {String} code
 */
export function confirmStoreVerification(code) {
  return storeHttp.request({
    url: "/order/order/verification/confirm",
    method: "POST",
    data: { code },
  });
}

/**
 * 预约服务 — 根据核销码查询预约订单详情
 * @param {String} code
 */
export function getAppointmentOrderByCode(code) {
  return storeHttp.request({
    url: `/appointment/verification/order/${code}`,
    method: "GET",
  });
}

/**
 * 预约服务 — 执行核销
 * @param {Object} params { orderSn, code, serviceStaffId }
 */
export function verifyAppointmentCode(params) {
  return storeHttp.request({
    url: "/appointment/verification/verify",
    method: "POST",
    data: params,
  });
}

/**
 * 预约服务 — 获取已启用的服务人员列表（供核销时指派/确认）
 */
export function getEnabledServiceStaff() {
  return storeHttp.request({
    url: "/appointment/service-staff/enabled",
    method: "GET",
  });
}

/**
 * 预约服务 — 根据订单号获取预约单核销状态
 * @param {String} orderSn
 */
export function getAppointmentVerificationByOrderSn(orderSn) {
  return storeHttp.request({
    url: `/appointment/verification/order-by-sn/${orderSn}`,
    method: "GET",
  });
}
