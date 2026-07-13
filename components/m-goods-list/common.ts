import { useStore } from '@/store'

/**
 * 商品列表公共逻辑（原 common.vue mixin）
 * 提供高亮搜索、unicode 转换、促销标签、导航跳转等通用方法
 */
export function useGoodsListCommon() {
  const store = useStore()

  const lightColor = store.getters.lightColor

  /**
   * 高亮显示搜索内容
   */
  const lightSearchStr = (keyword: string, str: string) => {
    if (!keyword) {
      return str
    } else {
      let unicodes = ''
      for (let i of Array.from(keyword)) {
        unicodes += unicode(i) + "|"
      }
      const rule = '(' + unicodes + ')'
      const reg = new RegExp(rule, 'gi')
      return str ? str.replace(reg, (matchValue) =>
        `<span style="color:${lightColor}">${matchValue}</span>`
      ) : ''
    }
  }

  /**
   * 转换为 unicode
   */
  const unicode = (str: string) => {
    var value = ''
    for (var i = 0; i < str.length; i++) {
      value += '\\u' + leftZero4(parseInt(str.charCodeAt(i).toString(16)))
    }
    return value
  }

  const leftZero4 = (str: string) => {
    if (str != null && str != '' && str != 'undefined') {
      if (str.length == 2) {
        return '00' + str
      }
    }
    return str
  }

  /**
   * 数据去重 只显示一次 减免 劵等
   */
  const getPromotion = (item: any) => {
    if (item.promotionMap) {
      let array: string[] = []
      Object.keys(item.promotionMap).forEach((child) => {
        if (!array.includes(child.split("-")[0])) {
          array.push(child.split("-")[0])
        }
      })
      return array
    }
  }

  /**
   * 跳转到商品详情
   */
  const navigateToDetailPage = (item: any) => {
    uni.navigateTo({
      url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
    })
  }

  /**
   * 跳转到店铺详情
   */
  const navigateToStoreDetailPage = (item: any) => {
    uni.navigateTo({
      url: `/pages/product/shopPage?id=${item.storeId}`,
    })
  }

  return {
    lightSearchStr,
    getPromotion,
    navigateToDetailPage,
    navigateToStoreDetailPage,
  }
}
