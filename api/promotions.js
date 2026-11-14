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
    params,
  });
}

/**
 * 获取直播间详情
 * @deprecated 请使用 api/live.js 中的 getLiveRoomById
 * @param {number} roomId 直播间房间号
 */
export function getLiveDetail(roomId) {
  return http.request({
    url: `broadcast/studio`,
    method: Method.GET,
    params: {
      pageNumber: 1,
      pageSize: 1,
      roomId,
    },
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
 * 获取积分商城商品详情
 * @param params
 */
export function getPointsGoodsDetail(id) {
  return http.request({
    url: "/promotion/pointsGoods/"+id,
    method: Method.GET,
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

/**
 * 分页获取砍价商品
 * @param params
 */
export function getBargainList(params) {
  return http.request({
    url: "/promotion/kanjiaGoods",
    method: Method.GET,
    params,
  });
}

/**
 * 分页获取砍价商品
 * @param params
 */
export function getBargainDetail(id) {
  return http.request({
    url: `/promotion/kanjiaGoods/${id}`,
    method: Method.GET,
  });
}

/**
 * 获取砍价活动
 * @param params
 */
export function getBargainActivity(params) {
  return http.request({
    url: `/promotion/kanjiaGoods/getKanjiaActivity`,
    method: Method.POST,
    params,
  });
}

/**
 * 发起砍价活动
 * @param params
 */
export function openBargain(params) {
  return http.request({
    url: `/promotion/kanjiaGoods`,
    method: Method.POST,
    header: { "content-type": "application/x-www-form-urlencoded" },
    data: params,
  });
}

/**
 * 分页获取砍价活动-帮砍记录
 */
export function getBargainLog(params) {
  return http.request({
    url: `/promotion/kanjiaGoods/getKanjiaActivity/logs`,
    method: Method.GET,
    data: params,
  });
}


/**
 * 分页获取砍价活动-帮砍记录
 */
 export function helpBargain(kanJiaActivityId) {
  return http.request({
    url: `promotion/kanjiaGoods/help/${kanJiaActivityId}`,
    method: Method.POST,
  });
}

/**
 * 分页获取已参与的砍价活动
 */
export function getMineBargainLog(params) {
  return http.request({
    url: `/promotion/kanjiaGoods/kanjiaActivity/mine/`,
    method: Method.GET,
    params
  });
}

/**
 * 分页查询当前客户礼品卡
 */
export function getGiftCardCashMemberCardPage(params) {
  return http.request({
    url: '/promotion/giftCardCash/memberCard',
    method: Method.GET,
    needToken: true,
    params,
  })
}

/**
 * 绑定礼品卡（卡号 + 兑换码/卡密）
 */
export function bindGiftCardCashMemberCard(data) {
  return http.request({
    url: '/promotion/giftCardCash/memberCard/bind',
    method: Method.POST,
    needToken: true,
    header: { 'content-type': 'application/json' },
    data,
  })
}

/**
 * 激活礼品卡
 */
export function activateGiftCardCashMemberCard(memberCardId) {
  return http.request({
    url: `/promotion/giftCardCash/memberCard/${memberCardId}/activate`,
    method: Method.POST,
    needToken: true,
  })
}



/**
 * 获取优惠券礼包详情
 * @param {string} id 券礼包活动ID
 * @author Bulbasaur
 * @since 2026-11-12
 */
export function getCouponPackageDetail(id) {
  return http.request({
    url: `/promotion/coupon/package/${id}`,
    method: Method.GET,
  });
}

/**
 * 买家一键领取优惠券礼包
 * @param {string} id 券礼包活动ID
 * @author Bulbasaur
 * @since 2026-11-12
 */
export function receiveCouponPackage(id) {
  return http.request({
    url: `/promotion/coupon/package/receive/${id}`,
    method: Method.POST,
  });
}
