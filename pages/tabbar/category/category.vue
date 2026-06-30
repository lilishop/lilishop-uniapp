<template>
  <view class="category-wrap">
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
        <view class="nav-content">
          <text class="title">商品分类</text>
          <view class="nav-search-wrap" :style="searchBarStyle">
            <!-- #ifdef H5 -->
            <u-search class="nav-search" @click="search" placeholder="搜索商品" :show-action="false"></u-search>
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <u-search class="nav-search" disabled @click="search" placeholder="搜索商品" :show-action="false"></u-search>
            <!-- #endif -->
          </view>
        </view>
      </template>
    </u-navbar>
    <view class="content">
      <scroll-view scroll-y scroll-with-animation class="left-aside">
        <view v-for="(item, index) in tabList" :key="item.id" class="f-item b-b" :class="{ active: item.id === currentId }" @click="tabtap(item, index)">
          {{ item.name }}
        </view>
      </scroll-view>
      <scroll-view scroll-with-animation scroll-y class="right-aside" :upper-threshold="-100" :lower-threshold="-100">
        <!-- 头部图片 -->
        <view class="top-img" id="main-top">
          <u-image width="500rpx" height="230rpx" @click="navigateToList(topImg.id,topImg.id)" :src="topImg.image" mode="">
          </u-image>
        </view>
        <view v-for="item in categoryList" :key="item.id" class="s-list" :id="'main-' + item.id">
          <!-- 分类标题 -->
          <text class="s-item">{{ item.name }}</text>
          <!-- 分类详情 -->
          <view class="t-list">
            <template v-for="(children, cIndex) in item.children" :key="children.id">
            <view @click="navigateToList(item.id, children.id)" v-if="children.parentId === item.id" class="t-item"
              :class="{ 'margin-right': (cIndex + 1) % 3 == 0 }">
              <u-image width="70px" height="70px" :src="children.image" :lazy-load="true">
              </u-image>
              <text>{{ children.name }}</text>
            </view>
            </template>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getCategoryList } from "@/api/goods.js";
export default {
  data() {
    return {
      currentId: 0,
      tabList: [], //左侧标题列表
      categoryList: [], //右侧分类数据列表
      topImg: "", //顶部图片
      searchBarWidth: 0, //导航栏搜索框宽度（避让微信胶囊）
    };
  },
  computed: {
    searchBarStyle() {
      if (this.searchBarWidth) {
        return { width: `${this.searchBarWidth}px` };
      }
      return { width: "460rpx" };
    },
  },
  onLoad() {
    this.loadData();
    // #ifdef MP-WEIXIN
    // 小程序默认分享
    uni.showShareMenu({ withShareTicket: true });
    // #endif
  },
  onReady() {
    this.setSearchBarWidth();
  },
  methods: {
    /**
     * 根据微信胶囊位置计算搜索框宽度，避免被胶囊遮挡
     */
    setSearchBarWidth() {
      // #ifdef MP-WEIXIN
      try {
        const menuButton = uni.getMenuButtonBoundingClientRect();
        const { windowWidth } = uni.getWindowInfo();
        const capsuleInsetRight = windowWidth - menuButton.left;
        const titleWidth = uni.upx2px(160); // “商品分类” 标题宽度
        const leftPadding = uni.upx2px(60); // 左侧内边距
        const gap = uni.upx2px(20); // 搜索框与胶囊间距
        this.searchBarWidth =
          windowWidth - capsuleInsetRight - titleWidth - leftPadding - gap;
      } catch (e) {
        this.searchBarWidth = 180;
      }
      // #endif
    },
    /**
     * 查询
     */
    search() {
      uni.navigateTo({
        url: "/pages/navigation/search/searchPage",
      });
    },

    /**
     * 加载图片
     */
    async loadData() {
      let list = await getCategoryList(0);
      this.tabList = list.data.result;
      this.currentId = list.data.result[0].id;
      this.loadListContent(0);
    },

    /**
     * 加载列表内容
     */
    loadListContent(index) {
      this.topImg = this.tabList[index];
      this.categoryList = this.tabList[index].children;
    },
    /**
     * 一级分类点击
     */
    tabtap(item, i) {
      if (item.id != this.currentId) {
        this.currentId = item.id;
        this.loadListContent(i);
      }
    },

    navigateToList(sid, tid) {
      uni.navigateTo({
        url: `/pages/navigation/search/searchPage?category=${tid}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  height: 100%;
  background-color: #fdfaff;
}
/* 解决小程序和app滚动条的问题 */
/* #ifdef MP-WEIXIN || APP-PLUS */
::-webkit-scrollbar {
  display: none;
}
/* #endif */
/* 解决H5 的问题 */
/* #ifdef H5 */
uni-scroll-view .uni-scroll-view::-webkit-scrollbar {
  /* 隐藏滚动条，但依旧具备可以滚动的功能 */
  display: none;
}
/* #endif */
.s-list {
  box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.05);
}
.nav-content {
  display: flex;
  align-items: center;
}
.nav-search-wrap {
  flex-shrink: 0;
}
.nav-search {
  width: 100%;
}
.title {
  flex-shrink: 0;
  text-align: center;
  font-size: 28rpx;
  padding-right: 16rpx;
  white-space: nowrap;
}
.category-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    flex: 1;
    min-height: 0;
    display: flex;
    color: #333;
    font-size: 28rpx;
    background: #fff;
  }
  .left-aside {
    flex-shrink: 0;
    width: 200rpx;
    height: 100%;
    background-color: #f7f7f7;
  }
  .f-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 97rpx;
    position: relative;
    &.active {
      font-weight: bold;
      color: $light-color;
      background: #fff;
    }
  }
  .right-aside {
    flex: 1;
    overflow: hidden;
    padding: 40rpx 0 0 30rpx;
  }

  .top-img {
    width: 500rpx;
    height: 230rpx;
    border-radius: 8px;
    overflow: hidden;
    image {
      width: 100%;
      height: 100%;
    }
  }
  .s-item {
    display: flex;
    align-items: center;
    height: 70rpx;
    padding-top: 16rpx;
    font-weight: 500;
  }
  .t-list {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    padding-top: 12rpx;
  }
  .margin-right {
    margin-right: 0 !important;
  }
  .t-item {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 150rpx;
    margin-right: 25rpx;
    font-size: 24rpx;
    padding-bottom: 20rpx;
    image {
      width: 140rpx;
      height: 140rpx;
      border-radius: 8px;
      margin-bottom: 20rpx;
    }
    ::v-deep .u-image {
      width: 140rpx !important;
      height: 140rpx !important;
      border-radius: 8px !important;
      margin-bottom: 20rpx !important;
    }
  }
}
</style>
