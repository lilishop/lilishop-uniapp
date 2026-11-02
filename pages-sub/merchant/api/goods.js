import { storeHttp } from "../utils/storeRequest.js";

/**
 * 获取商家商品列表
 * @param {Object} params { goodsName, marketEnable, authFlag, pageNumber, pageSize }
 */
export function getStoreGoodsList(params) {
  return storeHttp.request({
    url: "/goods/goods/list",
    method: "GET",
    params,
  });
}

/**
 * 获取商家商品详情
 * @param {String} id 商品ID
 */
export function getStoreGoodsDetail(id) {
  return storeHttp.request({
    url: `/goods/goods/get/${id}`,
    method: "GET",
  });
}

/**
 * 获取商品关联的 SKU 列表
 * @param {String} goodsId 商品ID
 */
export function getStoreGoodsSkuList(goodsId) {
  return storeHttp.request({
    url: `/goods/goods/sku/${goodsId}/list`,
    method: "GET",
  });
}

/**
 * 上架商品
 * @param {String|Array} goodsId
 */
export function upGoods(goodsId) {
  const ids = Array.isArray(goodsId) ? goodsId.join(",") : goodsId;
  return storeHttp.request({
    url: `/goods/goods/up?goodsId=${ids}`,
    method: "PUT",
  });
}

/**
 * 下架商品
 * @param {String|Array} goodsId
 */
export function downGoods(goodsId) {
  const ids = Array.isArray(goodsId) ? goodsId.join(",") : goodsId;
  return storeHttp.request({
    url: `/goods/goods/under?goodsId=${ids}`,
    method: "PUT",
  });
}

/**
 * 获取商品统计数量（出售中、已下架等）
 */
export function getStoreGoodsNumber(params) {
  return storeHttp.request({
    url: "/goods/goods/goodsNumber",
    method: "GET",
    params,
  });
}
