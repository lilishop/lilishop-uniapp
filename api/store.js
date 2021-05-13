/**
 * 店铺相关API
 */

import {http, Method} from '@/utils/request.js';

/**
 * 获取店铺列表
 * @param params
 */
export function getstoreList(params) {
  return http.request({
    url: '/store',
    method: Method.GET,
    params,
  });
}

/**
 * 获取店铺基本信息
 * @param storeId
 */
export function getstoreBaseInfo(storeId) {
  return http.request({
    url: `/store/get/detail/${storeId}`,
    method: Method.GET,
    loading: false,
  });
}