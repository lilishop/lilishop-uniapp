/**
 * buyer : 买家 API（baseURL 为 buyer + /buyer）
 */
// 开发环境
const dev = {
  buyer: "https://buyer-api.pickmall.cn",
  im: "https://im-api.pickmall.cn",
  mqtt: "wss://lilishop-mqtt-pull.dllll.xyz/mqtt",
};
// 生产环境
const prod = {
  buyer: "http://127.0.0.1:8888",
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
api.buyer = buyerHost + "/buyer";
api.im = api.im + "/im";

export default {
  ...api,
  buyerHost,
};
