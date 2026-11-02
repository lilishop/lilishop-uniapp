import { storeHttp } from "../utils/storeRequest.js";

/**
 * 分页获取客户评价列表
 * @param {Object} params { grade, goodsName, replyStatus, pageNumber, pageSize }
 */
export function getStoreEvaluationList(params) {
  return storeHttp.request({
    url: "/member/evaluation",
    method: "GET",
    params,
  });
}

/**
 * 回复客户评价
 * @param {String} id 评价ID
 * @param {String} reply 回复文字
 * @param {String} replyImage 可选回复图片
 */
export function replyStoreEvaluation(id, reply, replyImage = "") {
  return storeHttp.request({
    url: `/member/evaluation/reply/${id}?reply=${encodeURIComponent(reply)}&replyImage=${encodeURIComponent(replyImage)}`,
    method: "PUT",
  });
}
