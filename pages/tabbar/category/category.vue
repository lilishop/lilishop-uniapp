<template>
  <view class="category-wrap" :style="themeStyle">
    <u-navbar
      class="navbar"
      :auto-back="false"
      :fixed="true"
      :placeholder="true"
      :border="false"
      left-icon=""
      title=""
      bg-color="#ffffff"
    >
      <template #left>
        <view class="nav-search-box" :style="searchBarStyle" @click="search">
          <u-icon name="search" size="16" color="#999999"></u-icon>
          <text class="search-placeholder">搜索商品</text>
        </view>
      </template>
    </u-navbar>
    <view class="content" v-if="pageTemplate === 1">
      <scroll-view scroll-y scroll-with-animation class="left-aside">
        <view
          v-for="(item, index) in tabList"
          :key="item.id"
          class="f-item"
          :class="{ active: item.id === currentId }"
          @click="tabtap(item, index)"
        >
          <text class="f-text">{{ item.name }}</text>
        </view>
      </scroll-view>
      <scroll-view scroll-with-animation scroll-y class="right-aside" :upper-threshold="-100" :lower-threshold="-100">
        <!-- 头部图片 -->
        <view class="top-img" id="main-top" v-if="topImg && topImg.image">
          <u-image width="100%" height="200rpx" border-radius="12rpx" @click="navigateToList(topImg.id, topImg.id)" :src="topImg.image" mode="aspectFill">
          </u-image>
        </view>
        <view v-for="item in categoryList" :key="item.id" class="s-list" :id="'main-' + item.id">
          <!-- 分类标题 -->
          <view class="s-header" @click="navigateToList(item.id, item.id)">
            <text class="s-item">{{ item.name }}</text>
            <u-icon name="arrow-right" size="12" color="#bbbbbb"></u-icon>
          </view>
          <!-- 分类详情 -->
          <view class="t-list">
            <template v-for="(children, cIndex) in item.children" :key="children.id">
              <view
                @click="navigateToList(item.id, children.id)"
                v-if="children.parentId === item.id"
                class="t-item"
              >
                <view class="t-img-box">
                  <u-image width="128rpx" height="128rpx" border-radius="12rpx" :src="children.image" :lazy-load="true" mode="aspectFit">
                    <template #loading><u-loading-icon></u-loading-icon></template>
                  </u-image>
                </view>
                <text class="t-name">{{ children.name }}</text>
              </view>
            </template>
          </view>
        </view>
      </scroll-view>
    </view>
    <tpl-category-goods
      v-else
      class="tpl-goods-wrapper"
      :category-list="tabList"
      :setting="categoryPageSetting"
      :template="pageTemplate"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { getCategoryList } from '@/api/goods.js'
import { getThemeStyle } from '@/utils/theme'
import { DEFAULT_CATEGORY_PAGE_SETTING } from '@/utils/categoryPageSetting'
import { useStore } from '@/store'
import TplCategoryGoods from '@/components/category/tpl-category-goods.vue'

const store = useStore()

const categoryPageSetting = computed(
  () => store.state.categoryPageSetting || DEFAULT_CATEGORY_PAGE_SETTING
)
const pageTemplate = computed(() => categoryPageSetting.value.template || 1)

const currentId = ref(0)
const tabList = ref<any[]>([]) // 左侧标题列表
const categoryList = ref<any[]>([]) // 右侧分类数据列表
const topImg = ref<any>("") // 顶部图片
const searchBarWidth = ref(0) // 导航栏搜索框宽度（避让微信胶囊）

const themeStyle = computed(() => getThemeStyle(store.state.theme))

const searchBarStyle = computed(() => {
  if (searchBarWidth.value) {
    return { width: searchBarWidth.value + 'px' }
  }
  return { width: "680rpx" }
})

onLoad(() => {
  loadData()
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  // #endif
})

onReady(() => {
  setSearchBarWidth()
})

/**
 * 根据微信胶囊位置计算搜索框宽度，避免被胶囊遮挡
 */
function setSearchBarWidth() {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const leftMargin = uni.upx2px(24) // 搜索框左边距
    const gap = uni.upx2px(20) // 搜索框与胶囊间距
    // 搜索框延伸至胶囊左边沿
    const calcWidth = menuButton.left - leftMargin - gap
    searchBarWidth.value = Math.max(calcWidth, 200)
  } catch (e) {
    searchBarWidth.value = 240
  }
  // #endif
  // #ifndef MP-WEIXIN
  try {
    const info = (uni.getWindowInfo ? uni.getWindowInfo() : (uni.getSystemInfoSync ? uni.getSystemInfoSync() : {})); const windowWidth = info.windowWidth || 375;
    searchBarWidth.value = windowWidth - uni.upx2px(48)
  } catch (e) {
    searchBarWidth.value = 340
  }
  // #endif
}

/**
 * 查询
 */
function search() {
  uni.navigateTo({
    url: "/pages/navigation/search/searchPage",
  })
}

/**
 * 加载图片
 */
async function loadData() {
  let list = await getCategoryList(0)
  tabList.value = list.data.result
  if (tabList.value && tabList.value.length) {
    currentId.value = tabList.value[0].id
    loadListContent(0)
  }
}

/**
 * 加载列表内容
 */
function loadListContent(index: number) {
  topImg.value = tabList.value[index]
  categoryList.value = tabList.value[index].children
}

/**
 * 一级分类点击
 */
function tabtap(item: any, i: number) {
  if (item.id != currentId.value) {
    currentId.value = item.id
    loadListContent(i)
  }
}

function navigateToList(sid: any, tid: any) {
  uni.navigateTo({
    url: '/pages/navigation/search/searchPage?category=' + tid,
  })
}
</script>

<style lang="scss">
page {
  height: 100%;
  background-color: #ffffff;
}
</style>

<style lang="scss" scoped>
/* 解决小程序和app滚动条的问题 */
/* #ifdef MP-WEIXIN || APP-PLUS */
::-webkit-scrollbar {
  display: none;
}
/* #endif */
/* 解决H5 的问题 */
/* #ifdef H5 */
uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
  display: none;
}
/* #endif */

.category-wrap {
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  background-color: #ffffff;

  .navbar {
    border-bottom: 1rpx solid #f2f3f5;
  }

  .nav-search-box {
    height: 64rpx;
    background: #f4f5f7;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    margin-left: 24rpx;
    box-sizing: border-box;
    cursor: pointer;
  }

  .search-placeholder {
    font-size: 26rpx;
    color: #999999;
    margin-left: 12rpx;
    line-height: 1;
  }

  .content {
    flex: 1;
    min-height: 0;
    height: 0;
    display: flex;
    color: #333;
    font-size: 28rpx;
    background: #ffffff;
    overflow: hidden;
  }

  .left-aside {
    flex-shrink: 0;
    width: 176rpx;
    height: 100%;
    background-color: #f6f7f9;
    border-right: 1rpx solid #ebebeb;
    box-sizing: border-box;
  }

  .f-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 96rpx;
    padding: 16rpx 14rpx;
    box-sizing: border-box;
    font-size: 26rpx;
    color: #666;
    text-align: center;
    line-height: 1.35;
    position: relative;
    transition: all 0.2s ease;

    &.active {
      font-weight: 600;
      color: $light-color;
      background: #ffffff;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 6rpx;
        height: 36rpx;
        border-radius: 0 4rpx 4rpx 0;
        background: $light-color;
      }
    }
  }

  .f-text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .right-aside {
    flex: 1;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    padding: 20rpx 20rpx 40rpx;
    box-sizing: border-box;
    background: #f8f9fa;
  }

  .top-img {
    width: 100%;
    height: 200rpx;
    border-radius: 14rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  }

  .s-list {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx 20rpx 12rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
  }

  .s-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16rpx;
    cursor: pointer;
  }

  .s-item {
    font-size: 26rpx;
    font-weight: 600;
    color: #222;
  }

  .t-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .t-item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 33.333%;
    padding: 10rpx 0 20rpx;
    box-sizing: border-box;
  }

  .t-img-box {
    width: 128rpx;
    height: 128rpx;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f9f9f9;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .t-name {
    font-size: 24rpx;
    color: #333;
    max-width: 140rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    line-height: 1.2;
  }
}

.tpl-goods-wrapper {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ */
tpl-category-goods {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* #endif */
</style>
