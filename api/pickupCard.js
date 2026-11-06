/**
 * 提货卡选品、试算及一次兑换接口。
 * @author Bulbasaur
 * @since 2026-11-05
 */
import { http, Method } from '@/utils/request.js'

/** 获取当前会员的卡规则及候选商品。 */
export const getPickupCard = id => http.request({ url: `/promotion/pickupCard/${encodeURIComponent(id)}`, method: Method.GET, needToken: true })
/** 服务端试算，校验商品与地址且不消耗权益。 */
export const previewPickupCard = data => http.request({ url: '/promotion/pickupCard/preview', method: Method.POST, needToken: true, header: { 'content-type': 'application/json' }, data })
/** 原子核销创单，网络重试返回原交易。 */
export const redeemPickupCard = data => http.request({ url: '/promotion/pickupCard/redeem', method: Method.POST, needToken: true, header: { 'content-type': 'application/json' }, data })
