<template>
  <view class="category-wrap">
    <u-navbar class="navbar" :is-back="false">
      <div class="title"> 商品分类</div>
      <u-search class="nav-search" disabled @click.native="search" placeholder="搜索商品" :show-action="false"></u-search>
    </u-navbar>

    <view class="content">
      <scroll-view scroll-y :scroll-top="num" scroll-with-animation class="left-aside">
        <view v-for="(item, index) in flist" :key="item.id" class="f-item b-b" :class="{ active: item.id === currentId }" @click="tabtap(item, index)">
          {{ item.name }}
        </view>
      </scroll-view>
      <scroll-view scroll-with-animation :scroll-top="rightNum" scroll-y class="right-aside" @scroll="asideScroll" @scrolltolower="nextList('bottom')" :upper-threshold="-100" :lower-threshold="-100"
        @scrolltoupper="nextList('top')">
        <!-- 右边显示区域顶部热门精选的图片 -->
        <!-- <view v-show="showTopTip" class="bottomTip">下拉浏览上一页</view> -->
        <view class="top-img" id="main-top">
          <u-image width="500rpx" height="230rpx" @click="navigateToList(topImg.id,topImg.id)" :src="topImg.image" mode="">
          </u-image>
        </view>
        <view v-for="item in tlist" :key="item.id" class="s-list" :id="'main-' + item.id">
          <text class="s-item">{{ item.name }}</text>
          <view class="t-list">
            <view @click="navigateToList(item.id, titem.id)" v-if="titem.parentId === item.id" class="t-item" v-for="(titem, cIndex) in item.children" :key="titem.id"
              :class="{ 'margin-right': (cIndex + 1) % 3 == 0 }">
              <u-image width="70px" height="70px" :src="titem.image" :lazy-load="true">

              </u-image>
              <text>{{ titem.name }}</text>
            </view>
          </view>
        </view>
        <!-- #todo 暂未实现此功能 -->
        <!-- <view v-show="showBottomTip" class="bottomTip">上拉继续浏览</view> -->
      </scroll-view>
    </view>
  </view>
</template>

<script>
import { getCategory, getCategoryList } from "@/api/goods.js";
export default {
  data() {
    return {
      sizeCalcState: false,
      tabScrollTop: 0,
      currentId: 0,
      flist: [],
      slist: [],
      tlist: [],
      topImg: "",
      showBottomTip: false,
      showTopTip: false,
      num: 0,
      rightNum: 0,
    };
  },
  onLoad() {
    this.loadData();
  },

  watch: {
    currentId(val) {
      this.flist.forEach((item, index) => {
        if (item.id == val) {
          // console.log(index)
          this.showBottomTip = false;
          this.showTopTip = false;
          this.num = index * 30;
          if (index < 7) {
            this.num = 0;
          }
        }
      });
    },
  },
  methods: {
    search() {
      uni.navigateTo({
        url: "/pages/navigation/search/searchPage",
      });
    },
    async loadData() {
      let list = await getCategoryList(0);

      this.flist = list.data.result;

      this.currentId = list.data.result[0].id;
      this.loadListContent(0);
      // 获取右边显示区域顶部热门精选的图片
    },
    loadListContent(index) {
      console.log(this.flist[index]);
      this.topImg = this.flist[index];
      this.tlist = this.flist[index].children;
    },
    nextList(type) {
      //通过type 判断是上拉还是下拉，top为加载上一页，bottom为下一页
      let list = JSON.parse(JSON.stringify(this.flist));
      if (type == "top") {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id == this.currentId && i != 0) {
            this.currentId = list[i - 1].id;
            this.loadListContent();
            break;
          }
        }
      } else {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id == this.currentId && i != list.length - 1) {
            this.currentId = list[i + 1].id;
            this.loadListContent();
            // this.rightNum = 250;
            break;
          }
        }
      }
    },
    //一级分类点击
    tabtap(item, i) {
      if (item.id != this.currentId) {
        this.currentId = item.id;
        this.loadListContent(i);
      }
    },
    //右侧栏滚动
    asideScroll(e) {
      let top = e.detail.scrollTop;
      if (top < 0 && this.currentId != this.flist[0].id) {
        this.showTopTip = true;
      }
      if (
        top > e.detail.scrollHeight - 500 &&
        this.currentId != this.flist[this.flist.length - 1].id
      ) {
        this.showBottomTip = true;
      }
    },
    //计算右侧栏每个tab的高度等信息
    calcSize() {
      let h = 0;
      uni
        .createSelectorQuery()
        .select("#main-top")
        .fields(
          {
            size: true,
          },
          (data) => {
            h = data.height;
          }
        )
        .exec();
      this.slist.forEach((item) => {
        let view = uni.createSelectorQuery().select("#main-" + item.id);
        view
          .fields(
            {
              size: true,
            },
            (data) => {
              item.top = h;
              h += data.height;
              item.bottom = h;
            }
          )
          .exec();
      });
      this.sizeCalcState = true;
    },
    navigateToList(sid, tid) {
      uni.navigateTo({
        url: `/pages/navigation/search/searchPage?category=${tid}`,
      });
    },
  },
};
</script>
<style>
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
</style>
<style lang="scss" scoped>
.status_bar {
  height: var(--status-bar-height);
  background-color: #f1f1f1;
  width: 100%;
}
.nav-search {
  padding-left: 30rpx !important;
  padding-right: 20rpx !important;
}
.title {
  display: block;
  width: 200rpx;
  text-align: center;
  font-size: 34rpx;
  letter-spacing: 2rpx;
  // #ifdef MP-WEIXIN
  margin-left: 26rpx;
  // #endif
}
.category-wrap {
  height: 100%;
  .content {
    height: calc(100vh - 94px);
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
  .bottomTip {
    color: #999999;
    text-align: center;
    margin: 10rpx;
    font-size: $font-sm;
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
    /* width: 33%; */
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
    /deep/ .u-image {
      width: 140rpx !important;
      height: 140rpx !important;
      border-radius: 8px !important;
      margin-bottom: 20rpx !important;
    }
  }
}
</style>
