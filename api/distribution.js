/**
 * 分销员相关 API
 */

import { http, Method } from '@/utils/request.js'

/**
 * 绑定分销员
 * @param distributionId 分销员ID
 */
export function getGoodsDistribution(distributionId) {
  return http.request({
    url: `/distribution/distribution/bindingDistribution/${distributionId}`,
    method: Method.GET,
  })
}

/**
 * 获取当前会员的分销员信息（含待提现、冻结金额等）
 */
export function distribution() {
  return http.request({
    url: `/distribution/distribution`,
    method: Method.GET,
  })
}

/** 推广海报上下文（邀请好友锁客） */
export function getPromotionPoster() {
  return http.request({
    url: `/distribution/distribution/promotion-poster`,
    method: Method.GET,
  })
}

/** 邀请卡上下文（招募下级分销员） */
export function getInviteCard() {
  return http.request({
    url: `/distribution/distribution/invite-card`,
    method: Method.GET,
  })
}

/** 我邀请的下级分销员列表 */
export function getDistributionInvitees(params) {
  return http.request({
    url: `/distribution/distribution/invite/invitees`,
    method: Method.GET,
    params,
  })
}

/** 分销员业绩统计 */
export function getDistributionPerformance(params) {
  return http.request({
    url: `/distribution/distribution/performance`,
    method: Method.GET,
    params,
  })
}

/** 我的客户列表 */
export function getDistributionCustomers(params) {
  return http.request({
    url: `/distribution/distribution/customers`,
    method: Method.GET,
    params,
  })
}

/** 客户详情 */
export function getDistributionCustomerDetail(id) {
  return http.request({
    url: `/distribution/distribution/customers/${id}`,
    method: Method.GET,
  })
}

/** 设置/取消客户星标 */
export function updateDistributionCustomerStarred(id, starred) {
  return http.request({
    url: `/distribution/distribution/customers/${id}/starred`,
    method: Method.PUT,
    params: { starred },
  })
}

/** 分销等级列表（包装 VO：upgradeConditionVisible + grades） */
export function getDistributionGrades() {
  return http.request({
    url: `/distribution/distribution/grades`,
    method: Method.GET,
  })
}

/** 分销员提现 */
export function cash(params) {
  return http.request({
    url: `/distribution/cash`,
    method: Method.POST,
    params,
  })
}

/** 分销员提现历史 */
export function cashLog(params) {
  return http.request({
    url: `/distribution/cash`,
    method: Method.GET,
    params,
  })
}

/** 推广/邀请订单分页列表 */
export function getDistributionOrders(params) {
  return http.request({
    url: `/distribution/order/orders`,
    method: Method.GET,
    params,
  })
}

/** 推广/邀请订单详情 */
export function getDistributionOrderDetail(params) {
  return http.request({
    url: `/distribution/order/orders/detail`,
    method: Method.GET,
    params,
  })
}

/** 获取分销商品设置 */
export function getDistributionGoodsSetting() {
  return http.request({
    url: `/distribution/goods/setting`,
    method: Method.GET,
  })
}

/** 获取分销员商品列表 */
export function distributionGoods(params) {
  return http.request({
    url: `/distribution/goods`,
    method: Method.GET,
    params,
  })
}

/** 获取分销员中心推荐商品 */
export function getDistributionFeaturedGoods() {
  return http.request({
    url: `/distribution/goods/featured`,
    method: Method.GET,
  })
}

/** 获取分销商品分享上下文（推广图文） */
export function getDistributionGoodsShareContext(params) {
  return http.request({
    url: `/distribution/goods/share-context`,
    method: Method.GET,
    params,
  })
}

/** 获取分销商品海报上下文（生成葵花码，服务端记录分享） */
export function getDistributionGoodsPosterContext(params) {
  return http.request({
    url: `/distribution/goods/poster-context`,
    method: Method.GET,
    params,
  })
}

/** 分享商品访问（记录访问并绑定客户关系） */
export function recordDistributionGoodsVisit(params) {
  return http.request({
    url: `/distribution/distribution/share-visit`,
    method: Method.GET,
    params,
  })
}

/** 招募页信息 */
export function getRecruitPage() {
  return http.request({
    url: `/distribution/distribution/recruit/page`,
    method: Method.GET,
  })
}

/** 招募页邀请人信息（无需登录） */
export function getRecruitInviter(distributionId) {
  return http.request({
    url: `/distribution/distribution/recruit/inviter`,
    method: Method.GET,
    params: { distributionId },
  })
}

/** 提交招募申请 */
export function submitRecruitApplication(data) {
  return http.request({
    url: `/distribution/distribution/recruit/apply`,
    method: Method.POST,
    data,
  })
}

/** 招募条件进度 */
export function getRecruitProgress() {
  return http.request({
    url: `/distribution/distribution/recruit/progress`,
    method: Method.GET,
  })
}

/** 上报招募邀请 token（登录后供自动申请使用） */
export function savePendingRecruitToken(recruitToken) {
  return http.request({
    url: `/distribution/distribution/recruit/pending-token`,
    method: Method.PUT,
    params: { recruitToken },
  })
}

/** 上级分销员信息 */
export function getDistributionParent() {
  return http.request({
    url: `/distribution/distribution/parent`,
    method: Method.GET,
  })
}
