/**
 * 一些常用的基础方法
 * whetherNavigate 登录后跳转判断
 * unixToDate    将unix时间戳转换为指定格式
 * dateToUnix    将时间转unix时间戳
 * deepClone     对一个对象进行深拷贝
 * formatPrice   货币格式化
 * secrecyMobile 手机号隐私保护
 * randomString  随机生成指定长度的字符串
 */

/**
 * 登录后跳转判断
 * 计算出当前router路径
 * 1.如果跳转的链接为登录页面或跳转的链接为空页面。则会重新跳转到首页
 * 2.都不满足返回跳转页面
 * @param type  'default' || 'wx'  //返回地址会做判断默认为default
 */

export function whetherNavigate(type = "default") {
  if (getCurrentPages().length > 1) {
    if ((getCurrentPages().length - 2).route == "pages/passport/login") {
      navigationToBack(type);
    } else {
      if (
        !(getCurrentPages().length - 2).route ||
        (getCurrentPages().length - 2).route == "undefined"
      ) {
        navigationToBack(type);
      } else {
        uni.navigateBack({
          delta: getCurrentPages().length - 2,
        });
      }
    }
  } else {
    uni.switchTab({
      url: "/pages/tabbar/home/index",
    });
  }
}

/**
 * 将unix时间戳转换为指定格式
 * @param unix   时间戳【秒】
 * @param format 转换格式
 * @returns {*|string}
 */
export function unixToDate(unix, format) {
  if (!unix) return unix;
  let _format = format || "yyyy-MM-dd hh:mm:ss";
  const d = new Date(unix);
  const o = {
    "M+": d.getMonth() + 1,
    "d+": d.getDate(),
    "h+": d.getHours(),
    "m+": d.getMinutes(),
    "s+": d.getSeconds(),
    "q+": Math.floor((d.getMonth() + 3) / 3),
    S: d.getMilliseconds(),
  };
  if (/(y+)/.test(_format))
    _format = _format.replace(
      RegExp.$1,
      (d.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (const k in o)
    if (new RegExp("(" + k + ")").test(_format))
      _format = _format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return _format;
}

/**
 * 将时间转unix时间戳
 * @param date
 * @returns {number} 【秒】
 */
export function dateToUnix(date) {
  let newStr = date.replace(/:/g, "-");
  newStr = newStr.replace(/ /g, "-");
  const arr = newStr.split("-");
  const datum = new Date(
    Date.UTC(
      arr[0],
      arr[1] - 1,
      arr[2],
      arr[3] - 8 || -8,
      arr[4] || 0,
      arr[5] || 0
    )
  );
  return parseInt(datum.getTime() / 1000);
}

/**
 * 货币格式化
 * @param price
 * @returns {string}
 */
export function formatPrice(price) {
  if (typeof price !== "number") return price;
  return String(Number(price).toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 手机号隐私保护
 * 隐藏中间四位数字
 * @param mobile
 * @returns {*}
 */
export function secrecyMobile(mobile) {
  mobile = String(mobile);
  if (!/\d{11}/.test(mobile)) {
    return mobile;
  }
  return mobile.replace(/(\d{3})(\d{4})(\d{4})/, "$1****$3");
}

/**
 * 随机生成指定长度的字符串
 * @param length
 * @returns {string}
 */
export function randomString(length = 32) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const maxPos = chars.length;
  let _string = "";
  for (let i = 0; i < length; i++) {
    _string += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return _string;
}

/**
 * 计算传秒数的倒计时【天、时、分、秒】
 * @param seconds
 * @returns {{day : *, hours : *, minutes : *, seconds : *}}
 */

export function countTimeDown(seconds) {
  const leftTime = (time) => {
    if (time < 10) time = "0" + time;
    return time + "";
  };
  return {
    day: leftTime(parseInt(seconds / 60 / 60 / 24, 10)),
    hours: leftTime(parseInt((seconds / 60 / 60) % 24, 10)),
    minutes: leftTime(parseInt((seconds / 60) % 60, 10)),
    seconds: leftTime(parseInt(seconds % 60, 10)),
  };
}


function navigationToBack(type) {
  if (type == "wx") {
    // console.log(getCurrentPages().length - 3)
    uni.navigateBack({
      delta: getCurrentPages().length ,
    });
  } else {
    uni.switchTab({
      url: "/pages/tabbar/home/index",
    });
  }
}

/**
 * 计算当前时间到第二天0点的倒计时[秒]
 * @returns {number}
 */
export function theNextDayTime() {
  const nowDate = new Date();
  const time =
    new Date(
      nowDate.getFullYear(),
      nowDate.getMonth(),
      nowDate.getDate() + 1,
      0,
      0,
      0
    ).getTime() - nowDate.getTime();
  return parseInt(time / 1000);
}
module.exports = {
  unixToDate,
  dateToUnix,
  formatPrice,
  secrecyMobile,
  randomString,
  countTimeDown,
  theNextDayTime,
  whetherNavigate,
};
