/**
 * 入驻类相关api
 */

import { http, Method } from "@/utils/request.js";

// 获取当前用户的代理入驻详情
export function getCompanyDetail(params) {
  return http.request({
    url: "/store/store/apply",
    method: Method.GET,
    params,
  });
}

// 申请店铺第一步-填写企业信息
export function applyFirst(params) {
  return http.request({
    url: "/store/store/apply/first",
    method: Method.PUT,
    params,
  });
}

// 申请店铺第二步-填写银行
export function applySecond(params) {
  return http.request({
    url: "/store/store/apply/second",
    method: Method.PUT,
    params,
  });
}

// 申请店铺第三步-填写银行
export function applyThird(params) {
  return http.request({
    url: "/store/store/apply/third",
    method: Method.PUT,
    params,
  });
}
