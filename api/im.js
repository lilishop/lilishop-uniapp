import { http,Method } from "@/utils/request.js";

import api from "@/config/api.js";

/**
 * 获取聊天详情接口
 * @param {*} talkId 
 * @returns 
 */
export function getTalk(talkId) {
    return http.request({
      url: `${api.im}/talk/${talkId}`,
      method: Method.GET,
    });
}

/**
 * 获取与用户的聊天详情
 * @param {*} talkId 
 * @returns 
 */
 export function getTalkByUser(userId) {
  return http.request({
    url: `${api.im}/talk/by/user/${userId}`,
    method: Method.GET,
  });
}

/**
 * 获取聊天列表
 * @param {*} talkId 
 * @returns 
 */
 export function getTalkList(params) {
    return http.request({
      url: `${api.im}/talk/list`,
      method: Method.GET,
      params
    });
}

/**
 * 获取聊天信息接口
 * @param {*} params 
 * @returns 
 */
 export function getTalkMessage(params) {
    return http.request({
      url: `${api.im}/message`,
      method: Method.GET,
      params
    });
}

/**
 * 获取聊天信息接口
 * @param {*} params 
 * @returns 
 */
 export function cleanUnreadMessage(params) {
  return http.request({
    url: `${api.im}/message/clean/unred`,
    method: Method.PUT,
    params
  });
}

