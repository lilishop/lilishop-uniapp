/**
 * 微信小程序支付
 * 此处针对于微信小程序开发的支付插件
 * 第一次支付成功后会跳出订阅的消息 如果用户拒绝或同意都会跳转到支付成功页面
 *
 * @param {sn,price,orderPromotionType}
 */

import { getWeChatMpMessage } from "@/api/message.js";
import { initiatePay } from "@/api/trade";

const SCENE_NAME_MAP = {
  ORDER_DELIVER: ["订单发货提醒", "订单发货通知"],
  ORDER_COMPLETE: ["订单已完成提醒", "订单完成通知"],
  PINTUAN_SUCCESS: ["拼团成功通知"],
  AFTER_SALE_AUDIT: ["售后申请审核通知", "售后审核通知"],
  POINT_CHANGE: ["积分变更提醒", "积分变更通知"],
  WALLET_CHANGE: ["账户余额变动通知", "余额账户变更通知"],
  WALLET_WITHDRAWAL_AUDIT_ERROR: ["提现结果通知", "提现申请审核通知"],
};

let cachedMpMessageList = null;

export function prefetchMpMessageTemplates() {
  return getWeChatMpMessage()
    .then((res) => {
      if (res && res.data && Array.isArray(res.data.result)) {
        cachedMpMessageList = res.data.result;
      }
      return cachedMpMessageList || [];
    })
    .catch(() => cachedMpMessageList || []);
}

function extractTmplIdsByScenes(list, targetScenes) {
  const tmplIds = [];
  (targetScenes || []).forEach((scene) => {
    const aliasNames = SCENE_NAME_MAP[scene] || [];
    const matched = (list || []).find(
      (item) =>
        item &&
        item.enable !== false &&
        item.code &&
        (item.sceneCode === scene || aliasNames.includes(item.name))
    );
    if (matched && matched.code && !tmplIds.includes(matched.code)) {
      tmplIds.push(matched.code);
    }
  });
  return tmplIds.slice(0, 3);
}

export function subscribeMpMessageByScenes(sceneCodes, onComplete) {
  const done = typeof onComplete === "function" ? onComplete : () => {};
  const targetScenes = Array.isArray(sceneCodes) ? sceneCodes : [];
  if (!targetScenes.length) {
    done();
    return;
  }
  if (Array.isArray(cachedMpMessageList) && cachedMpMessageList.length) {
    const finalTmplIds = extractTmplIdsByScenes(cachedMpMessageList, targetScenes);
    if (!finalTmplIds.length) {
      done();
      return;
    }
    console.log("[微信订阅消息] 请求订阅 tmplIds:", finalTmplIds);
    uni.requestSubscribeMessage({
      tmplIds: finalTmplIds,
      complete: (res) => {
        console.log("[微信订阅消息] 授权返回结果:", res);
        done();
      },
    });
    return;
  }
  prefetchMpMessageTemplates()
    .then((list) => {
      const finalTmplIds = extractTmplIdsByScenes(list, targetScenes);
      if (!finalTmplIds.length) {
        done();
        return;
      }
      uni.requestSubscribeMessage({
        tmplIds: finalTmplIds,
        complete: () => done(),
      });
    })
    .catch(() => done());
}

export function subscribePayMessageThen(onComplete, options = {}) {
  const isPintuan =
    options &&
    String(options.orderPromotionType || "").toUpperCase() === "PINTUAN";
  const scenes = isPintuan
    ? ["ORDER_DELIVER", "ORDER_COMPLETE", "PINTUAN_SUCCESS"]
    : ["ORDER_DELIVER", "ORDER_COMPLETE"];
  subscribeMpMessageByScenes(scenes, onComplete);
}

class LiLiWXPay {
  constructor(...payList) {
    this.data = payList[0];
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
          success: () => {
            uni.showToast({
              icon: "none",
              title: "支付成功!",
            });
            subscribePayMessageThen(
              () => {
                uni.redirectTo({
                  url:
                    "/pages/cart/payment/success?paymentMethod=WECHAT" +
                    "&payPrice=" +
                    payList[0].price,
                });
              },
              { orderPromotionType: this.data.orderPromotionType }
            );
          },
          fail: (e) => {
            this.exception = e;
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
