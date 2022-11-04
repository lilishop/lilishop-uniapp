import { http, Method } from "@/utils/request.js";

 export function toSpecial(data) {
  return http.request({
    url: `/other/pageData/getSpecial`,
    method: Method.GET,
    data
  });
}
/**
 * 专题内容
 */
 export function getSpecial(id) {
  return http.request({
    url: `/other/pageData/get/${id}`,
    method: Method.GET,
  });
}

/**
 * 获取广告图
 */
export function getAdvertisement() {
  return http.request({
    url: "/advertisement",
    method: Method.GET,
  });
}



/**
 * 获取首页商品分类
 * @param parent_id
 */
export function getCategory(parent_id = 0) {
  return http.request({
    url: `goods/categories/${parent_id}/children`,
    method: Method.GET,
    loading: false,
  });
}

/**
 * 获取热门关键词
 * @param num
 */
export function getHotKeywords(count) {
  return http.request({
    url: "/goods/goods/hot-words",
    method: Method.GET,
    loading: false,
    params: { count },
  });
}

/**
 * 获取楼层数据
 * @param client_type
 * @param page_type
 */
export function getFloorData(params) {
  return http.request({
    url: `/other/pageData/getIndex?clientType=H5`,
    method: "get",
    params
  });
}

/**
 * 获取店铺楼层数据
 */
export function getFloorStoreData(params) {
  return http.request({
    url: `/other/pageData?pageClientType=H5`,
    method: "get",
    params
  });
}

/**
 * 获取获取首页分类数据
 */
export function getCategoryIndexData(parentId = 0) {
  return http.request({
    url: `/goods/category/get/${parentId}`,
    method: "get",
  });
}
