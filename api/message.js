/**
 * 站内消息相关API
 */

import {http,Method} from '@/utils/request.js';
const request = http.request


/**
 * 获取微信消息订阅
 * @param params
 * @returns {AxiosPromise}
 */
export function getWeChatMpMessage() { 
  return http.request({
    url: 'mini-program/subscribeMessage',
    method: Method.GET
  });
}

/**
 * 获取消息列表
 * @param params
 * @returns {AxiosPromise}
 */
export function getMessages(params) {
  params = params || {};
  params.pageSize = params.pageSize || 5;
  return http.request({
    url: 'members/member-nocice-logs',
    method: Method.GET,
    needToken: true,
    params,
  });
}


/**
 * 标记消息为已读
 * @param ids
 */
export function messageMarkAsRead(ids) {
  return http.request({
    url: `members/member-nocice-logs/${ids}/read`,
    method: Method.PUT,
    needToken: true,
  });
}


/**
 * 获取物流消息列表
 * @param params
 * @returns {AxiosPromise}
 */
export function getLogisticsMessages(params) {
  params = params || {};
  params.pageSize = params.pageSize || 5;
  return http.request({
    url: 'trade/logistics/message',
    method: Method.GET,
    needToken: true,
    params,
  });
}


/**
 * 获取版本更新信息
 * @param params
 * @returns {AxiosPromise}
 */
export function getAppVersionList(params) {
  params = params || {};
  params.pageSize = params.pageSize || 5;
  return http.request({
    url: 'members/app/version',
    method: Method.GET,
    params,
  });
}
