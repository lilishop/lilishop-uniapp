import api from "@/config/api.js";
import Request from "@/lib/request/index.js";
import Foundation from "@/utils/Foundation.js";
import { md5 } from "@/utils/md5.js";
import storage from "@/utils/storage.js";
import uuid from "@/utils/uuid.modified.js";

let isStoreNavigateTo = false;

function cleanStoreAuth() {
  uni.showToast({
    title: "商家登录状态已过期，请重新登录",
    icon: "none",
    duration: 1800,
  });

  storage.clearStoreAuth();

  if (!isStoreNavigateTo) {
    isStoreNavigateTo = true;
    setTimeout(() => {
      isStoreNavigateTo = false;
      uni.reLaunch({
        url: "/pages-sub/merchant/pages/login/index",
      });
    }, 1200);
  }
}

const storeHttp = new Request();

const ensureUuid = () => {
  if (!storage.getUuid()) {
    storage.setUuid(uuid.v1());
  }
};

storeHttp.setConfig((config) => {
  ensureUuid();
  config.baseURL = api.store;
  config.header = {
    ...config.header,
  };
  config.validateStatus = () => true;
  return config;
});

storeHttp.interceptors.request.use(
  (config) => {
    ensureUuid();
    const token = storage.getStoreAccessToken();
    if (token) {
      const nonce = Foundation.randomString(6);
      const timestamp = parseInt(new Date().getTime() / 1000);
      const sign = md5(nonce + timestamp + token);
      const _params = { nonce, timestamp, sign };
      config.params = { ...(config.params || {}), ..._params };
      config.header.accessToken = token;
    }
    config.header = {
      ...config.header,
      uuid: storage.getUuid(),
    };
    return config;
  },
  (config) => Promise.reject(config)
);

let isStoreRefreshing = false;
let storeRequests = [];

function refreshTokenApi(refreshToken) {
  return uni.request({
    url: `${api.store}/passport/login/refresh/${refreshToken}`,
    method: "GET",
    header: {
      uuid: storage.getUuid(),
    },
  });
}

storeHttp.interceptors.response.use(
  async (response) => {
    isStoreNavigateTo = false;
    try {
      uni.hideLoading();
    } catch (e) {}

    const token = storage.getStoreAccessToken();
    const refreshToken = storage.getStoreRefreshToken();

    // 403 / 401 并且有 refreshToken，尝试刷新
    if (
      token &&
      refreshToken &&
      (response.statusCode === 403 || response.statusCode === 401 || response.data?.code === 403)
    ) {
      if (!isStoreRefreshing) {
        isStoreRefreshing = true;
        storage.removeStoreAccessToken();
        try {
          const [err, res] = await refreshTokenApi(refreshToken);
          const data = res?.data || err?.data;
          if (data && data.success && data.result) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.result;
            storage.setStoreAccessToken(newAccessToken);
            if (newRefreshToken) {
              storage.setStoreRefreshToken(newRefreshToken);
            }
            response.header = response.header || {};
            response.header.accessToken = `${newAccessToken}`;
            storeRequests.forEach((cb) => cb(newAccessToken));
            storeRequests = [];
            return storeHttp.request(response.config);
          } else {
            cleanStoreAuth();
            return Promise.reject(data);
          }
        } catch (e) {
          cleanStoreAuth();
          return Promise.reject(e);
        } finally {
          isStoreRefreshing = false;
        }
      } else {
        return new Promise((resolve) => {
          storeRequests.push((newToken) => {
            response.header = response.header || {};
            response.header.accessToken = `${newToken}`;
            resolve(storeHttp.request(response.config));
          });
        });
      }
    } else if (
      (!token && (response.statusCode === 403 || response.statusCode === 401)) ||
      response.data?.code === 403 ||
      response.data?.code === 401
    ) {
      cleanStoreAuth();
    } else if ((response.statusCode === 200 && response.data && !response.data.success) || response.statusCode === 400) {
      if (response.data?.message) {
        uni.showToast({
          title: response.data.message,
          icon: "none",
          duration: 2000,
        });
      }
    }
    return response;
  },
  (error) => error
);

export { storeHttp };
export default storeHttp;
