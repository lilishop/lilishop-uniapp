/**
 * 商品相关API
 */

import { http, Method } from "@/utils/request.js";

/**
 * 从ES中获取相关商品品牌名称，分类名称及属性
 */
 export function getGoodsMessage(goodsId) {
  return http.request({
    url: `/goods/goods/get/${goodsId}`,
    method: Method.GET,
  });
}

/**
 * 获取商品搜索筛选条件
 */
export function getGoodsRelated(params) {
  return http.request({
    url: `/goods/goods/search/related`,
    method: Method.GET,
    params,
  });
}

/**
 * 获取商品详情
 * @param skuId 商品ID
 * @returns {AxiosPromise}
 */
 export function getGoods(skuId, goodsId) {
  return http.request({
    url: `/goods/goods/sku/${goodsId}/${skuId}`,
    method: Method.GET,
  });
}

/**
 * 获取商品列表
 * @param params
 * @returns {AxiosPromise}
 */
export function getGoodsList(params) {
  return http.request({
    url: "/goods/goods/search",
    method: Method.GET,
    params,
  });
}

/**
 * 获取上新商品列表
 * @param params
 * @returns {AxiosPromise}
 */
export function getGoodsListUplog(params) {
  return http.request({
    url: "goods/search/uplog",
    method: Method.GET,
    params,
  });
}



/**
 * 获取标签商品
 * @param storeId 卖家id
 * @param mark      标签 hot：热卖 new：新品 recommend：推荐
 * @param num       获取个数
 */
export function getTagGoods(storeId, mark = "hot", num = 5) {
  return http.request({
    url: `goods/tags/${mark}/goods`,
    method: Method.GET,
    loading: false,
    params: {
      storeId,
      mark,
      num,
    },
  });
}
/**
 * 获取标签商品
 */
export function getPlateformTagGoods(tag_id) {
  return http.request({
    url: `goods/tags/byid/${tag_id}`,
    method: Method.GET,
    loading: false,
  });
}

/**
 * 获取首页商品分类 左侧列表
 * @param parent_id
 */
export function getCategoryList(id) {
  return http.request({
    url: `/goods/category/get/${id}`,
    method: Method.GET,
    loading: false,
  });
}

/**
 * 获取 小程序码
 */
 export function getMpCode(params){
  return http.request({
    url:`/passport/connect/miniProgram/mp/unlimited`,
    method:Method.GET,
    params
  })
}

/**
 * 根据shortlink 获取页面参数
 */
 export function getMpScene(id){
  return http.request({
    url:`/passport/connect/miniProgram/mp/unlimited/scene?id=${id}`,
    method:Method.GET,

  })
}
