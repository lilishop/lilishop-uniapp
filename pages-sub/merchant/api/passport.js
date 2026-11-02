import { storeHttp } from "../utils/storeRequest.js";

/**
 * 账号密码登录（支持店主与店员账号）
 * @param {Object} params { username, password }
 */
export function userLogin(params) {
  return storeHttp.request({
    url: "/passport/login/userLogin",
    method: "POST",
    params,
    header: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 短信验证码登录（支持店主与店员手机号）
 * @param {Object} params { mobile, code }
 */
export function smsLogin(params) {
  return storeHttp.request({
    url: "/passport/login/smsLogin",
    method: "POST",
    params,
    header: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 发送登录短信
 * @param {String} mobile
 * @param {String} verificationEnums (LOGIN)
 */
export function sendStoreSms(mobile, verificationEnums = "LOGIN") {
  return storeHttp.request({
    url: `/common/sms/${verificationEnums}/${mobile}`,
    method: "GET",
  });
}

/**
 * 获取滑块验证码
 * @param {String} verificationEnums (LOGIN)
 */
export function getStoreSlider(verificationEnums = "LOGIN") {
  return storeHttp.request({
    url: `/common/slider/${verificationEnums}`,
    method: "GET",
  });
}

/**
 * 登出
 */
export function storeLogout() {
  return storeHttp.request({
    url: "/passport/login/logout",
    method: "POST",
  });
}

/**
 * 获取店铺基本配置与信息
 */
export function getStoreSettings() {
  return storeHttp.request({
    url: "/settings/storeSettings",
    method: "GET",
  });
}

/**
 * 获取当前登录人员（店主 / 店员）个人信息
 */
export function getStoreUserInfo() {
  return storeHttp.request({
    url: "/member/user/info",
    method: "GET",
  });
}

/**
 * 获取当前登录所属店铺详情
 */
export function getStoreDetail() {
  return storeHttp.request({
    url: "/member/user",
    method: "GET",
  });
}
