/**
 * 直播流相关 API
 */
import { http, Method } from "@/utils/request.js";

/**
 * 通过 id 获取直播间详情
 * @param {string} id 直播流 ID
 */
export function getLiveRoomById(id) {
  return http.request({
    url: `live/room/${id}`,
    method: Method.GET,
  });
}

/**
 * 观看的同时注册直播用户
 * @param {string} liveRoomId 直播流 ID
 */
export function registerLiveViewUser(liveRoomId) {
  return http.request({
    url: `live/user/view`,
    method: Method.POST,
    params: { liveRoomId },
  });
}

/**
 * 发送直播消息
 * @param {object} data LiveMessage
 */
export function sendLiveMessage(data) {
  return http.request({
    url: `live/message`,
    method: Method.POST,
    data,
  });
}

/**
 * 获取直播轮询聚合数据
 * @param {string} id 直播流 ID
 */
export function getLivePollingData(id) {
  return http.request({
    url: `live/room/polling/${id}`,
    method: Method.GET,
    loading: false,
  });
}

/**
 * 领取直播间优惠券
 * @param {string} liveRoomId 直播流 ID
 * @param {string} couponId 优惠券 ID
 */
export function receiveLiveCoupon(liveRoomId, couponId) {
  return http.request({
    url: `promotion/coupon/receive/live/${liveRoomId}/${couponId}`,
    method: Method.GET,
    needToken: true,
  });
}

