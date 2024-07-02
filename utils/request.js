import {
	refreshTokenFn
} from "@/api/login.js";
import api from "@/config/api.js";
import Request from "@/lib/request/index.js";
import Foundation from "@/utils/Foundation.js";
import {
	md5
} from "@/utils/md5.js";
import storage from "@/utils/storage.js";

import jwt from '@/js_sdk/t-jwt/jwt.js';
import uuid from "@/utils/uuid.modified.js";
import store from "../store";


let isNavigateTo = false

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
	console.log("清空token");
	storage.setUuid("");
	storage.setUserInfo({});


	if (!isNavigateTo) {
		isNavigateTo = true
		// 防抖处理跳转
		// #ifdef MP-WEIXIN
		uni.navigateTo({
			url: "/pages/passport/wechatMPLogin",
		});
		// #endif
		// #ifndef MP-WEIXIN
		uni.navigateTo({
			url: "/pages/passport/login",
		});
		//  #endif
	}
}

let http = new Request();


/**
 * 创建uuid方法
 */
const createUuid = () => {
	if (!storage.getUuid()) {
		storage.setUuid(uuid.v1());
		console.log("uuid", storage.getUuid());
	}
}


http.setConfig((config) => {
	createUuid();
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
			/**
			 * 使用JWT解析
			 * 小于当前时间将当前token清除
			 */
			const decodeJwt = jwt(accessToken);
			const timing = new Date().getTime() / 1000
			if (decodeJwt.exp <= timing) {
				accessToken = ""
				storage.setAccessToken('')
			}
			const nonce = Foundation.randomString(6);
			const timestamp = parseInt(new Date().getTime() / 1000);
			const sign = md5(nonce + timestamp + accessToken);
			const _params = {
				nonce,
				timestamp,
				sign,
			};
			let params = config.params || {};
			params = {
				...params,
				..._params
			};

			config.params = params;
			config.header.accessToken = accessToken;


		}
		createUuid();
		config.header = {
			...config.header,
			uuid: storage.getUuid()
		};
		return config;
	},
	(config) => {
		return Promise.reject(config);
	}
);


// 是否正在刷新的标记
let isRefreshing = false;
//重试队列
let requests = [];
// 必须使用异步函数，注意
http.interceptors.response.use(
	async (response) => {
		isNavigateTo = false
		/* 请求之后拦截器。可以使用async await 做异步操作  */
		// token存在并且token过期
		// if (isRefreshing && response.statusCode === 403) {
		//   cleanStorage();
		//   isRefreshing = false;
		// }
		uni.showLoading() ? uni.hideLoading() : ''
		let token = storage.getAccessToken();
		if (
			(token && response.statusCode === 403) ||
			response.data.status === 403
		) {
			if (!isRefreshing) {
				console.log('旧token', token)
				isRefreshing = true;
				storage.setAccessToken('')
				let oldRefreshToken = storage.getRefreshToken();
				//调用刷新token的接口
				return refreshTokenFn(oldRefreshToken)
					.then((res) => {
						let {
							accessToken,
							refreshToken
						} = res.data.result;
						storage.setAccessToken(accessToken);
						storage.setRefreshToken(refreshToken);

						response.header.accessToken = `${accessToken}`;
						// token 刷新后将数组的方法重新执行
						console.log('接口队列', requests, '新token', accessToken)
						requests.forEach((cb) => cb(accessToken));
						requests = []; // 重新请求完清空
						return http.request(response.config);
					})
					.catch((err) => {
						console.log('刷新token报错' + oldRefreshToken, err)
						cleanStorage();
						return Promise.reject(err);
					})
					.finally(() => {
						isRefreshing = false;
					});
			} else {
				// 返回未执行 resolve 的 Promise
				return new Promise((resolve) => {
					// 用函数形式将 resolve 存入，等待刷新后再执行
					requests.push((token) => {
						response.header.accessToken = `${token}`;
						resolve(http.request(response.config));
					});
				});
			}

			// 如果当前返回没登录
		} else if (
			(!token && !storage.getRefreshToken() && response.statusCode === 403) ||
			response.data.code === 403
		) {
			console.log('没有token 以及刷新token 内容', token, storage.getRefreshToken())
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
					success: function () {
						store.state.isShowToast = true;
					},
					fail: function () {
						store.state.isShowToast = false;
					},
					complete: function () {
						store.state.isShowToast = false;
					}
				});
			}
		}
		return response;
	},
	(error) => {
		return error;
	}
);

export {
	http
};

export const Method = {
	GET: "GET",
	POST: "POST",
	PUT: "PUT",
	DELETE: "DELETE",
};
