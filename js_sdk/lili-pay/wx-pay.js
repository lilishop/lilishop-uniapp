import { initiatePay } from "@/api/trade";
class LiLiWXPay {
  constructor(...payList) {
    this.data = payList[0];
    // 调用支付
    this.pay = () => {
      uni.showLoading({
        title: "加载中",
      });

      let submitData = {
        sn: this.data.sn,
        orderType: this.data.orderType || "TRADE",
        clientType: "WECHAT_MP",
      };
      const paymentMethod = "WECHAT";
      const paymentClient = "MP";
      // 调用支付
      initiatePay(paymentMethod, paymentClient, submitData).then((res) => {
        let response = res.data.result;
        uni.hideLoading();
        uni.requestPayment({
          provider: "wxpay",
          appid: response.appid,
          timeStamp: response.timeStamp,
          nonceStr: response.nonceStr,
          package: response.package,
          signType: response.signType,
          paySign: response.paySign,
          success: (e) => {
            uni.showToast({
              icon: "none",
              title: "支付成功!",
            });
            // 之后成功后跳转到支付成功页面
            uni.redirectTo({
              url:
                "/pages/cart/payment/success?paymentMethod=WECHAT" +
                "&payPrice=" +
                this.data.price,
            });
          },
          fail: (e) => {
            this.exception = e;
            // 支付异常或支付失败之后跳转到订单页面
            uni.showModal({
              content: "支付失败,如果您已支付，请勿反复支付",
              showCancel: false,
              success: () => {
                uni.redirectTo({
                  url: "/pages/order/myOrder?status=0",
                });
              },
            });
          },
        });
      });
    };
  }
}

export default LiLiWXPay;
