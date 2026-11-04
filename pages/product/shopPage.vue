<template>
  <view :style="themeStyle">
    <!-- 楼层装修店铺信息 -->
    <div>
      <!-- 基础店铺：返回 + 搜索；楼层装修无顶部搜索时：仅返回 -->
      <u-navbar
        v-if="!enablePageData || !floorHasTopSearch"
        class="shop-navbar"
        :border="false"
        :fixed="true"
        :placeholder="true"
        left-icon=""
        :auto-back="false"
      >
        <template #left>
          <view class="shop-navbar-inner">
            <view class="nav-back" @click.stop="back">
              <u-icon name="arrow-left" size="20"></u-icon>
            </view>
            <view v-if="!enablePageData" class="search-wrap" @click.stop>
              <u-search
                v-model="keyword"
                @search="goToSearch"
                @click="goToSearch"
                placeholder="请输入搜索"
                :show-action="false"
              ></u-search>
            </view>
          </view>
        </template>
      </u-navbar>
      <div class="wrapper">
        <!-- 店铺信息模块 -->
        <div class="store">
          <view class="store-logo">
            <u-image
              border-radius="10"
              width="100"
              height="100"
              :src="storeInfo.storeLogo || config.logo"
              mode="aspectFit"
            >
            </u-image>
          </view>
          <view class="store-main">
            <view class="store-top">
              <view class="store-name" @click="getStoreLicencePhoto">
                <text class="store-name-text">{{ storeInfo.storeName || "" }}</text>
              </view>
              <view class="collection">
                <view class="collection-btn" @click.stop="whetherCollection">
                  {{ isCollection ? "已关注" : "+ 关注" }}
                </view>
              </view>
            </view>
            <view class="store-message">
              <view class="store-stat">
                <text class="stat-num">{{ storeInfo.collectionNum || 0 }}</text>
                <text class="stat-label">关注</text>
              </view>
              <view class="store-stat">
                <text class="stat-num">{{ storeInfo.goodsNum || 0 }}</text>
                <text class="stat-label">件商品</text>
              </view>
            </view>
          </view>
        </div>
        <!-- 店铺简介 -->
        <div class="store-desc wes-2">
          {{ storeInfo.storeDesc || '' }}
        </div>

        <!-- 联系客服 -->
        <div class="kefu" @click="talk">
          <u-icon name="kefu-ermai"></u-icon>
          联系客服
        </div>
      </div>
      <!-- 优惠券 -->
      <scroll-view
        scroll-x="true"
        show-scrollbar="false"
        class="discount"
        v-if="couponList.length > 0"
      >
        <view class="card-box" v-for="(item, index) in couponList" :key="index">
          <view class="card" @click="getCoupon(item)">
            <view class="money">
              <view>
                <span v-if="item.couponType == 'DISCOUNT'"
                  >{{ item.couponDiscount }}折</span
                >
                <span v-else>{{ item.price }}元</span>
              </view>
            </view>
            <view class="xian"></view>
            <view class="text">
              <text>{{ "领取优惠券" }}</text>
              <text>{{ item.consumeThreshold > 0 ? '满' + unitPrice(item.consumeThreshold) + '元可用' : '无门槛使用' }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 基础店铺模式 -->
      <div v-if="basePageData">
        <u-tabs
          :list="tabs"
          :lineColor="mainColor"
          :activeStyle="{ color: mainColor }"
          :scrollable="false"
          v-model:current="current"
        ></u-tabs>
        <div class="content" v-if="current == 0">
          <u-empty style='margin-top:100rpx' v-if="goodsList.length == 0" class="empty" text='暂无商品信息'></u-empty>
          <goodsTemplate style="width:100%;" v-else :res="goodsList" :storeName="false" />
        </div>
        <!-- 全部分类 -->
        <div class="category" v-if="current == 1">
          <div class="category-item" v-for="(item,index) in categoryList" :key="index">
            <div class="flex" @click="getCategoryGoodsList(item)">
              <div>{{item.labelName}}</div>
              <div>
                <u-icon color="#999" name="arrow-right"></u-icon>
              </div>
            </div>
            <!-- 分类子级 -->
            <div class="child-list" v-if="item.children && item.children.length!=0">
              <div class="child" @click="getCategoryGoodsList(child)" :key='i' v-for="(child,i) in item.children">{{child.labelName}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 楼层装修模式 -->
      <view v-if="enablePageData" class="floor-page">
        <!-- uni 中不能使用 vue component 所以用if判断每个组件 -->
        <view
          v-for="(item, index) in pageData.list || []"
          :key="`${item.type}-${index}`"
          class="floor-block"
        >
          <!-- 搜索栏，如果在楼层装修顶部则会自动浮动，否则不浮动 -->
          <u-navbar
            class="navbar shop-navbar"
            v-if="item.type == 'search'"
            :fixed="index === 1 ? false : true"
            :placeholder="index === 1 ? false : true"
            left-icon=""
            :auto-back="false"
          >
            <template #left>
              <view class="shop-navbar-inner">
                <view class="nav-back" @click.stop="back">
                  <u-icon name="arrow-left" size="20"></u-icon>
                </view>
                <view class="floor-search-wrap" @click.stop>
                  <search style="width: 100%" :res="item.options" :storeId="storeId" />
                </view>
              </view>
            </template>
          </u-navbar>
          <carousel v-if="item.type == 'carousel'" :res="item.options" />
          <titleLayout v-if="item.type == 'title'" :res="item.options" />
          <leftOneRightTwo
            v-if="item.type == 'leftOneRightTwo'"
            :res="item.options"
          />
          <leftTwoRightOne
            v-if="item.type == 'leftTwoRightOne'"
            :res="item.options"
          />
          <topOneBottomTwo
            v-if="item.type == 'topOneBottomTwo'"
            :res="item.options"
          />
          <topTwoBottomOne
            v-if="item.type == 'topTwoBottomOne'"
            :res="item.options"
          />
          <flexThree v-if="item.type == 'flexThree'" :res="item.options" />
          <flexFive v-if="item.type == 'flexFive'" :res="item.options" />
          <flexFour v-if="item.type == 'flexFour'" :res="item.options" />
          <flexTwo v-if="item.type == 'flexTwo'" :res="item.options" />
          <textPicture v-if="item.type == 'textPicture'" :res="item.options" />
          <menuLayout v-if="item.type == 'menu'" :res="item.options" />
          <flexOne v-if="item.type == 'flexOne'" :res="item.options" />

          <GoodsFloor v-if="item.type == 'goods'" :res="item.options" />

          <group v-if="item.type == 'group'" :res="item.options" />
          <!-- <joinGroup v-if="item.type == 'joinGroup'" :res="item.options" /> -->
          <integral v-if="item.type == 'integral'" :res="item.options" />
          <coupon v-if="item.type == 'coupon'" :res="item.options" />
          <articleList v-if="item.type == 'article'" :res="item.options" />
          <shopList v-if="item.type == 'shop'" :res="item.options" />
          <!-- <spike v-if="item.type == 'spike'" :res="item.options" /> -->
          <blank v-if="item.type == 'blank'" :res="item.options" />
          <lineLayout v-if="item.type == 'line'" :res="item.options" />
          <richText v-if="item.type == 'richText'" :res="item.options" />
        </view>
      </view>
      <u-no-network></u-no-network>
    </div>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  onLoad,
  onPageScroll,
  onPullDownRefresh,
  onReachBottom,
} from '@dcloudio/uni-app'
import { useStore } from '@/store'
import carousel from '@/pages/tabbar/home/template/tpl_banner.vue'
import titleLayout from '@/pages/tabbar/home/template/tpl_title.vue'
import leftOneRightTwo from '@/pages/tabbar/home/template/tpl_left_one_right_two.vue'
import leftTwoRightOne from '@/pages/tabbar/home/template/tpl_left_two_right_one.vue'
import topOneBottomTwo from '@/pages/tabbar/home/template/tpl_top_one_bottom_two.vue'
import topTwoBottomOne from '@/pages/tabbar/home/template/tpl_top_two_bottom_one.vue'
import flexOne from '@/pages/tabbar/home/template/tpl_flex_one.vue'
import flexTwo from '@/pages/tabbar/home/template/tpl_flex_two.vue'
import flexThree from '@/pages/tabbar/home/template/tpl_flex_three.vue'
import flexFive from '@/pages/tabbar/home/template/tpl_flex_five.vue'
import flexFour from '@/pages/tabbar/home/template/tpl_flex_four.vue'
import textPicture from '@/pages/tabbar/home/template/tpl_text_picture.vue'
import menuLayout from '@/pages/tabbar/home/template/tpl_menu.vue'
import search from '@/pages/tabbar/home/template/tpl_search.vue'
import group from '@/pages/tabbar/home/template/tpl_group.vue'
import GoodsFloor from '@/pages/tabbar/home/template/tpl_goods.vue'
import blank from '@/pages/tabbar/home/template/tpl_blank.vue'
import lineLayout from '@/pages/tabbar/home/template/tpl_line.vue'
import richText from '@/pages/tabbar/home/template/tpl_rich_text.vue'
import integral from '@/pages/tabbar/home/template/tpl_integral.vue'
import coupon from '@/pages/tabbar/home/template/tpl_coupon.vue'
import articleList from '@/pages/tabbar/home/template/tpl_article.vue'
import shopList from '@/pages/tabbar/home/template/tpl_shop.vue'
import goodsTemplate from '@/components/m-goods-list/list.vue'
import { getStoreBaseInfo, getStoreCategory } from '@/api/store.js'
import {
  receiveCoupons,
  deleteStoreCollection,
  collectionStore,
  getStoreIsCollect,
} from '@/api/members.js'
import config from '@/config/config'
import { getGoodsList, getMpScene } from '@/api/goods.js'
import { getAllCoupons } from '@/api/promotions.js'
import { getFloorStoreData } from '@/api/home'
import {
  isLogin,
  navigateToLogin,
  talkIm,
  unitPrice,
} from '@/utils/filters.js'
import storage from '@/utils/storage.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const mainColor = computed(() => store.getters.mainColor)

const pageData = ref<{ list: any[] }>({ list: [] })
const enablePageData = ref(false)
const basePageData = ref(false)
const scrollTop = ref(0)
const current = ref(0)
const tabs = [
  { name: '全部商品' },
  { name: '分类查看' },
]
const storeId = ref('')
const keyword = ref('')
const storeInfo = ref<any>({})
const isCollection = ref(false)
const goodsList = ref<any[]>([])
const couponList = ref<any[]>([])
const categoryList = ref<any[]>([])
const couponParams = reactive({
  pageNumber: 1,
  pageSize: 50,
  storeId: '',
})
const goodsParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  storeId: '',
})

const floorHasTopSearch = computed(() => {
  const list = pageData.value && pageData.value.list
  if (!list || !list.length) return false
  return list.some((item, index) => item.type === 'search' && index !== 1)
})

watch(current, (val) => {
  if (val == 0) {
    goodsList.value = []
    getGoodsData()
  } else {
    getCategoryData()
  }
})

function talk() {
  talkIm(storeInfo.value.storeId)
}

function back() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.switchTab({ url: '/pages/tabbar/home/index' })
  }
}

function isPageDataSuccess(payload: any) {
  return payload?.success === true || payload?.code === 200
}

function shouldUseFloorPage(pageShow: unknown) {
  return pageShow === '1' || pageShow === 1 || pageShow === true
}

function initPageData() {
  getFloorStoreData({
    pageType: 'STORE',
    num: storeId.value,
  })
    .then((res) => {
      const payload = res?.data != null ? res.data : res
      const result = payload?.result
      const pageDataStr = result?.pageData
      if (!isPageDataSuccess(payload) || !pageDataStr) {
        fallbackToBasePage()
        return
      }
      try {
        const parsed = JSON.parse(pageDataStr)
        if (parsed && Array.isArray(parsed.list)) {
          parsed.list = parsed.list.filter((i: any) => !i?.hidden)
        }
        pageData.value =
          parsed && Array.isArray(parsed.list) ? parsed : { list: [] }
        enablePageData.value = pageData.value.list.length > 0
        if (!enablePageData.value) {
          fallbackToBasePage()
        }
      } catch (e) {
        fallbackToBasePage()
      }
    })
    .catch(() => {
      fallbackToBasePage()
    })
}

function fallbackToBasePage() {
  enablePageData.value = false
  basePageData.value = true
  pageData.value = { list: [] }
  getGoodsData()
  getCategoryData()
}

function applyStoreId(id) {
  storeId.value = id || ''
  goodsParams.storeId = storeId.value
  couponParams.storeId = storeId.value
}

function parseStoreIdFromParams(params) {
  const text = String(params || '').trim()
  if (!text) return ''
  if (text.indexOf('id=') === 0) return text.slice(3)
  const match = /(?:^|&)id=([^&]+)/.exec(text)
  return match ? decodeURIComponent(match[1]) : ''
}

async function resolveStoreIdFromScene(scene) {
  const raw = decodeURIComponent(String(scene || '')).trim()
  if (!raw) return ''
  const direct = parseStoreIdFromParams(raw)
  if (direct) return direct
  try {
    const res = await getMpScene(raw)
    return parseStoreIdFromParams(res?.data?.result)
  } catch {
    return ''
  }
}

function getStoreLicencePhoto() {
  uni.navigateTo({
    url: `/pages/product/licencePhoto?id=${storeId.value}`,
  })
}

function init() {
  goodsList.value = []
  categoryList.value = []
  couponList.value = []
  goodsParams.pageNumber = 1
  if (isLogin('auth')) {
    enableGoodsIsCollect()
  }
  getStoreData()
}

function linkKefuDetail() {
  // 客服
  // #ifdef MP-WEIXIN

  const params = {
    // originalPrice: goodsDetail.original || goodsDetail.price,
    uuid: storage.getUuid(),
    token: storage.getAccessToken(),
    sign: storeInfo.value.yzfSign,
    mpSign: storeInfo.value.yzfMpSign,
  }
  uni.navigateTo({
    url: '/pages/mine/im/index',
  })
  // uni.navigateTo({
  //   url:
  //     "/pages/product/customerservice/index?params=" +
  //     encodeURIComponent(JSON.stringify(params)),
  // });
  // // #endif
  // // #ifndef MP-WEIXIN
  // const sign = storeInfo.yzfSign;
  // uni.navigateTo({
  //   url:
  //     "/pages/tabbar/home/web-view?src=https://yzf.qq.com/xv/web/static/chat/index.html?sign=" +
  //     sign,
  // });
  // #endif
}

async function getCategoryData() {
  const res = await getStoreCategory(storeId.value)
  if (res.data.success) {
    categoryList.value = res.data.result
  }
}

async function enableGoodsIsCollect() {
  const res = await getStoreIsCollect('STORE', storeId.value)
  if (res.data.success) {
    isCollection.value = res.data.result
  }
}

function getCategoryGoodsList(val: any) {
  uni.navigateTo({
    url: `/pages/product/shopPageGoods?title=${val.labelName}&id=${val.id}&storeId=${storeId.value}`,
  })
}

function goToSearch() {
  uni.navigateTo({
    url: `/pages/navigation/search/searchPage?storeId=${storeId.value}&keyword=${keyword.value}`,
  })
}

async function getStoreData() {
  const res = await getStoreBaseInfo(storeId.value)
  if (res.data.success) {
    storeInfo.value = res.data.result
    getCouponsData()
    if (shouldUseFloorPage(res.data.result.pageShow)) {
      initPageData()
    } else {
      getGoodsData()
      getCategoryData()
      basePageData.value = true
    }
  } else {
    uni.reLaunch({
      url: '/',
    })
  }
}

async function getGoodsData() {
  const res = await getGoodsList(goodsParams)
  if (res.data.success) {
    goodsList.value.push(...res.data.result.records)
  }
}

async function getCouponsData() {
  couponParams.storeId = storeId.value
  const res = await getAllCoupons(couponParams)
  if (res.data.success) {
    couponList.value.push(...res.data.result.records)
  }
}

function whetherCollection() {
  if (isCollection.value) {
    deleteStoreCollection(storeId.value).then((res) => {
      if (res.data.success) {
        isCollection.value = false
        uni.showToast({
          icon: 'none',
          duration: 3000,
          title: '取消关注成功！',
        })
      }
    })
  } else {
    collectionStore(storeId.value).then((res) => {
      if (res.data.success) {
        isCollection.value = true
        uni.showToast({
          icon: 'none',
          duration: 3000,
          title: '关注成功！',
        })
      }
    })
  }
}

function getCoupon(item: any) {
  if (!isLogin('auth')) {
    uni.showToast({
      icon: 'none',
      duration: 3000,
      title: '请先登录！',
    })

    navigateToLogin('redirectTo')
    return false
  }
  receiveCoupons(item.id).then((res) => {
    if (res.data.success) {
      uni.showToast({
        icon: 'none',
        duration: 3000,
        title: '领取成功！',
      })
    }
  })
}

onLoad((options: any) => {
  applyStoreId(options?.id)
  if (!storeId.value && options?.scene) {
    resolveStoreIdFromScene(options.scene).then((id) => {
      if (!storeId.value && id) {
        applyStoreId(id)
        init()
      }
    })
  }
})

onPageScroll((e) => {
  scrollTop.value = e.scrollTop
})

onPullDownRefresh(() => {
  init()
})

onReachBottom(() => {
  goodsParams.pageNumber++
  getGoodsData()
})

onMounted(() => {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
  })
  // #endif
  if (storeId.value) init()
})
</script>

<style lang="scss" scoped>
.wrapper {
  background: #fff;
  padding: 32rpx;
}

.store {
  display: flex;
  align-items: center;

  .store-logo {
    flex-shrink: 0;
    width: 100rpx;
    height: 100rpx;
    overflow: hidden;

    :deep(.u-image),
    :deep(.u-image__image) {
      width: 100rpx !important;
      height: 100rpx !important;
    }
  }

  .store-main {
    flex: 1;
    min-width: 0;
    margin-left: 20rpx;
  }

  .store-top {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 56rpx;
  }

  .store-name {
    width: 100%;
    font-size: 34rpx;
    color: #333;
    letter-spacing: 1rpx;
    font-weight: bold;
    text-align: left;
  }

  .store-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    padding: 0 150rpx 0 0;
    box-sizing: border-box;
  }

  .store-message {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }

  .store-stat {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    margin-right: 24rpx;
    font-size: 26rpx;
    color: #999;
  }

  .stat-num {
    font-size: 26rpx;
    font-weight: bold;
    color: #333;
    margin-right: 4rpx;
  }

  .stat-label {
    font-size: 26rpx;
    color: #999;
  }
}

.collection {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
}

.collection-btn {
  background: $main-color;
  padding: 8rpx 0;
  width: 140rpx;
  font-size: 24rpx;
  color: #fff;
  border-radius: 100px;
  text-align: center;
  line-height: 1.2;
}

.store-desc {
  margin: 40rpx 0 0 0;
  color: #999;
}

.content {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  > .empty {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
  }

  .item {
    overflow: hidden;

    background: #fff;
    width: 49%;
    height: 484rpx;
    font-size: 26rpx;
    display: flex;
    flex-direction: column;
    border: 1px solid #f8f8f8;
    margin-bottom: 20rpx;

    .name {
      text-align: left !important;
      color: #333;
      padding: 0 20rpx;
      margin-top: 20rpx;
      height: 80rpx;
      overflow: hidden;
    }

    .price {
      font-weight: 500;
      color: $main-color;
      font-size: 30rpx;
      padding: 0 20rpx;
      margin-top: 20rpx;
      white-space: nowrap;
    }

    .buyCount {
      display: flex;
      padding: 0 20rpx;
      font-size: 24upx;
      justify-content: space-between;
      color: #999;
    }
  }
}

.discount {
  height: 154rpx;
  border-top: 1px solid #f6f6f6;
  border-bottom: 18rpx solid #f6f6f6;
  background: #f6f6f6;
  overflow: hidden;
  white-space: nowrap;

  .card-box {
    display: inline-block;
    padding-top: 25rpx;
  }

  .card {
    width: 324rpx;
    height: 116rpx;
    background: #fff;
    margin-left: 20rpx;
    border-radius: 5px;
    display: flex;
    align-items: center;

    .money {
      width: 45%;
      color: $price-color;
      font-weight: 500;
      text-align: center;

      text {
        font-size: 50rpx;
      }
    }

    .xian {
      height: 66rpx;
      border: 1px dashed #f6f6f6;
      position: relative;

      &:before,
      &:after {
        content: "";
        width: 22rpx;
        height: 12rpx;
        position: absolute;
        background: #f6f6f6;
      }

      &:before {
        border-radius: 0 0 22rpx 22rpx;
        top: -30rpx;
        left: -10rpx;
      }

      &:after {
        border-radius: 22rpx 22rpx 0 0;
        bottom: -30rpx;
        left: -10rpx;
      }
    }

    .text {
      flex: 1;
      color: $aider-light-color;
      font-size: 24rpx;
      display: flex;
      flex-direction: column;
      margin-left: 14rpx;

      text:nth-of-type(2) {
        color: #ccc;
      }

      .cur:nth-of-type(1) {
        color: #ccc;
      }
    }
  }
}

.category {
  padding: 0 20rpx;
}

.category-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin: 20rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);

  > .flex {
    color: #333;
    font-size: 28rpx;
    font-weight: 500;
    height: 88rpx;
    align-items: center;
    justify-content: space-between;
  }

  > .child-list {
    display: flex;
    flex-wrap: wrap;
    padding-bottom: 8rpx;

    > .child {
      width: 32%;
      margin-right: 2%;
      margin-bottom: 16rpx;
      height: 64rpx;
      line-height: 64rpx;
      padding: 0 12rpx;
      font-size: 24rpx;
      color: #666;
      background: #f7f8fa;
      border: none;
      border-radius: 8rpx;
      box-sizing: border-box;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:nth-child(3n) {
        margin-right: 0;
      }
    }
  }
}

.kefu {
  background: #f7f7f7;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.shop-navbar {
  :deep(.u-navbar__content__left) {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
    width: auto !important;
    padding: 0 24rpx 0 8rpx !important;
    box-sizing: border-box;
  }
}

.shop-navbar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.search-wrap {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.floor-search-wrap {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 100%;
  flex-shrink: 0;
}

.floor-page {
  width: 100%;
  background: #f9f9f9;
}

.floor-block {
  width: 100%;
  display: block;
}
</style>
