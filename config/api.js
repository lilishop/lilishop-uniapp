/**
 * buyer : 买家 API（baseURL 为 buyer + /buyer）
 * store : 商家 API（baseURL 为 store + /store）
 */
// 开发环境
const dev = {
  buyer: "https://byer-api.pickmall.cn",
  store: "https://admin-api.pickmall.cn",
  im: "https://im-api.pickmall.cn",
  mqtt: "wss://lilishop-mqtt-pull.dllll.xyz/mqtt",
};
// 生产环境
const prod = {
  buyer: "https://buyer-api.pickmall.cn",
  store: "https://admin-api.pickmall.cn",
  im: "https://im-api.pickmall.cn",
  mqtt: "wss://lilishop-mqtt-pull.dllll.xyz/mqtt",
};

let api = dev;
if (process.env.NODE_ENV == "development") {
  api = dev;
} else {
  api = prod;
}
// 微信小程序、App 打包使用生产环境配置
// #ifdef MP-WEIXIN || APP-PLUS
api = prod;
// #endif

const buyerHost = api.buyer;
const storeHost = api.store;
api.buyer = buyerHost + "/buyer";
api.store = storeHost + "/store";
api.im = api.im + "/im";

export default {
  ...api,
  buyerHost,
  storeHost,
};
