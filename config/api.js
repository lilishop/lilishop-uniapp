/**
 * base    : 基础业务API
 * buyer   : 买家API
 */
// 开发环境
const dev = {
  im: "https://im-api.pickmall.cn",
  common: "https://common-api.pickmall.cn",
  buyer: "https://buyer-api.pickmall.cn",
  // common: "http://192.168.0.113:8890",
  // buyer: "http://192.168.0.113:8888",
  // im: "http://192.168.0.113:8885",
};
// 生产环境
const prod = {
  im: "https://im-api.pickmall.cn",
  common: "https://common-api.pickmall.cn",
  buyer: "https://buyer-api.pickmall.cn",
};

//默认生产环境
let api = dev;
//如果是开发环境
if (process.env.NODE_ENV == "development") {
  api = dev;
} else {
  api = prod;
}
//微信小程序，app的打包方式建议为生产环境，所以这块直接条件编译赋值
// #ifdef MP-WEIXIN || APP-PLUS
api = prod;
// #endif

api.buyer += "/buyer";
api.common += "/common";
api.im += "/im";
export default {
  ...api,
};
