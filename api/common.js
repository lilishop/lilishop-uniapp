/**
 * 公共 API（由 buyer-api 提供）
 */
import { http, Method } from "@/utils/request.js";
import api from "@/config/api.js";

/**
 * 获取地区数据
 * @param id
 */
export function getRegionsById(id = 0) {
  return http.request({
    url: `${api.buyer}/common/region/item/${id}`,
    method: Method.GET,
    message: false,
  });
}

// 获取 IM 接口前缀
export function getIMDetail() {
  return http.request({
    url: `${api.buyer}/common/IM`,
    method: Method.GET,
    message: false,
  });
}

/**
 * 文件上传地址
 * @type {string}
 */
export const upload = `${api.buyer}/common/upload/file`;

/**
 * 获取主题色配置
 */
export function getThemeSetting() {
  return http.request({
    url: `${api.buyer}/common/site/theme`,
    method: Method.GET,
    message: false,
  });
}
