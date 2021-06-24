import Request from "@/lib/request/index.js";
import { refreshTokenFn } from "@/api/login.js";
import storage from "@/utils/storage.js";
import { md5 } from "@/utils/md5.js";
import Foundation from "@/utils/Foundation.js";
import api from "@/config/api.js";

import uuid from "@/utils/uuid.modified.js";

/**
 *  无痛刷新token思路（如果不使用无痛刷新token,忽略此处注释）
 * 看了很多，有个问题一直得不到解决----‘多个接口请求，token失效，如何让获取token只获取一遍’、
 * 于是想到了闭包防抖......
 * 本方案并不是最佳方案，只是给你们提供一种思路。如果你有完美解决方案，可以分享一下
 */
const expireToken = []; // 储存过期的token

// 防抖闭包来一波
function getTokenDebounce() {
  let lock = false;
  let success = false;
  return async function () {
    if (!lock) {
      lock = true;
      await refreshTokenFn(storage.getRefreshToken())
        .then((res) => {
          if (res.data.success) {
            let { accessToken, refreshToken } = res.data.result;
            storage.setAccessToken(accessToken);
            storage.setRefreshToken(refreshToken);
            success = true;
            lock = false;
          } else {
            cleanStorage();
            success = false;
            lock = false;
          }
        })
        .catch((error) => {
          cleanStorage();
          success = false;
          lock = false;
        });
    }
    return new Promise((resolve) => {
      // XXX 我只能想到通过轮询来看获取新的token是否结束，有好的方案可以说。一直看lock,直到请求失败或者成功
      const timer = setInterval(() => {
        if (!lock) {
          clearInterval(timer);

          if (success) {
            resolve("success");
          } else {
            cleanStorage();
            resolve("fail");
          }
        }
      }, 100); // 轮询时间可以自己看改成多少合适
    });
  };
}

function cleanStorage() {
  uni.showToast({
    title: "你的登录状态已过期，请重新登录",
    icon: "none",
    duration: 1500,
  });
  if (uni.showLoading()) {
    uni.hideLoading();
  }

  storage.setHasLogin(false);
  storage.setAccessToken("");
  storage.setRefreshToken("");
  console.log("清空token")
  storage.setUuid("");
  storage.setUserInfo({});

  uni.navigateTo({
    url: "/pages/passport/login",
  });
}

let http = new Request();
const refreshToken = getTokenDebounce();

http.setConfig((config) => {
  // 没有uuid创建
  if (!storage.getUuid()) {
    storage.setUuid(uuid.v1());
  }

  /* 设置全局配置 */
  config.baseURL = api.buyer;
  config.header = {
    ...config.header,
  };
  config.validateStatus = (statusCode) => {
    // 不论什么状态,统一在正确中处理
    return true;
  };
  return config;
});

http.interceptors.request.use(
  (config) => {
    /* 请求之前拦截器。可以使用async await 做异步操作 */
    let accessToken = storage.getAccessToken();
    if (accessToken) {
      const nonce = Foundation.randomString(6);
      const timestamp = parseInt(new Date().getTime() / 1000);
      const sign = md5(nonce + timestamp + accessToken);
      const _params = {
        nonce,
        timestamp,
        sign,
      };
      let params = config.params || {};
      params = { ...params, ..._params };

      config.params = params;
      config.header.accessToken = accessToken;
     
      /**
       * jwt 因为安卓以及ios没有window的属性
       * window.atob（）这个函数 base64编码的使用方法就是btoa（），而用于解码的使用方法是atob（），
       * 所以使用手写 base-64 编码的字符串数据。
       */
      const atob = (str) => Buffer.from(str, "base64").toString("binary");
      // 判断如果过期时间小于我的当前时间，在请求上重新刷新token
      if (accessToken.split(".").length <= 1) {
        refresh();
      } else {
        if (
          JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, '+').replace(/_/g, '/'))).exp <
          Math.round(new Date() / 1000)
        ) {
          refresh();
        }
      }
    }
    config.header = {
      ...config.header,
      uuid: storage.getUuid() || uuid.v1(),
    };
    return config;
  },
  (config) => {
    return Promise.reject(config);
  }
);


async function refresh() {
  // 本地储存的是过期token了，重新获取
  const getTokenResult = await refreshToken();
  if (getTokenResult === "success") {
    // 获取新的token成功 刷新当前页面

    let routes = getCurrentPages(); // 获取当前打开过的页面路由数组
    let curRoute = routes[routes.length - 1].route; //获取当前页面路由
    let curParam = routes[routes.length - 1].options; //获取路由参数
    // 拼接参数
    let param = "";
    for (let key in curParam) {
      param += "&" + key + "=" + curParam[key];
    }
    // 判断当前路径
    if (curRoute.indexOf("pages/tabbar") == 1) {
      uni.switchTab({
        url: "/" + curRoute + param.replace("&", "?"),
      });
    }

    uni.redirectTo({
      url: "/" + curRoute + param.replace("&", "?"),
    });
  }
}

// 必须使用异步函数，注意
http.interceptors.response.use(
  async (response) => {
    /* 请求之后拦截器。可以使用async await 做异步操作  */
    // token存在并且token过期
    let token = storage.getAccessToken();
    if (
      (token && response.statusCode === 403) ||
      response.data.status === 403
    ) {
      // jwt token 过期了
      expireToken.push(token); // 把过期token 储存
      const currentToken = storage.getAccessToken();
      if (expireToken.includes(currentToken)) {
        refresh();
      }
      // 如果当前返回没登录
    } else if (
      (!token && response.statusCode === 403) ||
      response.data.code === 403
    ) {
      cleanStorage();
      // 如果当前状态码为正常但是success为不正常时
    } else if (
      (response.statusCode == 200 && !response.data.success) ||
      response.statusCode == 400
    ) {
      if (response.data.message) {
        uni.showToast({
          title: response.data.message,
          icon: "none",
          duration: 1500,
        });
      }
    }
    return response;
  },
  (error) => {
    return error;
  }
);

export { http };

export const Method = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};
