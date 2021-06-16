/**
 * 促销相关API
 */
import { http, Method } from "@/utils/request.js";

/**
 * 获取当前直播列表
 *
 * @param {*}
 * @returns
 */
export function getLiveList(params) {
  return http.request({
    url: `broadcast/studio`,
    method: Method.GET,
    params
  });
}

/**
 * 获取当前拼团活动的未成团的会员
 */
export function getPromotionGroupMember(pintuanId) {
  return http.request({
    url: `promotion/pintuan/${pintuanId}/members`,
    method: Method.GET,
  });
}

/** 获取拼团列表 */
export function getAssembleList(params) {
  return http.request({
    url: "promotion/pintuan",
    method: Method.GET,
    loading: false,
    params,
  });
}

/**
 * 获取积分商城分类
 */
export function getPointsCategory() {
  return http.request({
    url: "/promotion/pointsGoods/category",
    method: Method.GET,
  });
}

/**
 * 获取积分商城商品
 * @param params
 */
export function getPointsGoods(params) {
  return http.request({
    url: "/promotion/pointsGoods",
    method: Method.GET,
    params,
  });
}

/**
 * 获取限时抢购时间线 当天限时抢购信息
 */
export function getSeckillTimeLine() {
  return http.request({
    url: "promotion/seckill",
    method: Method.GET,
  });
}

/**
 * 获取限时抢购商品 获取某个时刻的限时抢购商品信息
 * @param params
 */
export function getSeckillTimeGoods(timeline) {
  return http.request({
    url: `promotion/seckill/${timeline}`,
    method: Method.GET,
  });
}

/**
 * 获取全部优惠券
 * @param params
 */
export function getAllCoupons(params) {
  return http.request({
    url: "/promotion/coupon",
    method: Method.GET,
    params,
  });
}
