export function navigateTo({url}) {
  // #ifdef MP-WEIXIN
  //判断当前页面栈的长度
  if (getCurrentPages().length >= 8) {
    //超过八层的时候跳转销毁当前页面，十层的时候手机应该会很卡;
    uni.redirectTo({
      url: url,
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    });
  } else {
    uni.navigateTo({
      url: url,
    });
  }
  //   #endif

  //   #ifndef MP-WEIXIN
  uni.navigateTo({
    url: url,
  });
  // #endif
}
