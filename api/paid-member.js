import { http, Method } from '@/utils/request.js'
export const getPaidMember = () => http.request({ url: '/member/paid/current', method: Method.GET, needToken: true })
export const createPaidMemberOrder = data => http.request({ url: '/member/paid/orders', method: Method.POST, data, needToken: true, header: { 'Content-Type': 'application/json' } })
export const getPaidMemberOrders = params => http.request({ url: '/member/paid/orders', method: Method.GET, params, needToken: true })
export const getPaidMemberOrder = sn => http.request({ url: `/member/paid/orders/${encodeURIComponent(sn)}`, method: Method.GET, needToken: true })
export const cancelPaidMemberOrder = sn => http.request({ url: `/member/paid/orders/${encodeURIComponent(sn)}/cancel`, method: Method.POST, needToken: true })
export const getPaidMemberQuotes = skuIds => http.request({ url: '/member/paid/quotes', method: Method.GET, params: { skuIds: skuIds.join(',') }, needToken: true })
