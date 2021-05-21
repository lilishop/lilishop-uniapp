/**
 * 公共API
 */
import storage from "@/utils/storage.js"
import {http, Method} from '@/utils/request.js';
import api from '@/config/api.js';

/**
 * 获取图片验证码URL
 * @param type
 * @param uuid
 * @returns {string}
 */
export function getValidateCodeUrl(type, uuid) {
  if (!type) {
    return '';
  }
  if (!uuid) {
    uuid = storage.getUuid()
  }
  return `${api.base}/captchas/${uuid}/${type}?r=${new Date().getTime()}`;
}


/**
 * 获取地区数据
 * @param id
 */
export function getRegionsById(id = 0) {
  return http.request({
    url: `${api.common}/region/item/${id}`,
    method: Method.GET,
    message: false,
  });
}

/**
 * 文件上传地址
 * @type {string}
 */
export const upload =api.common+'/upload/file';

