<template>
  <view class="myTracks">
    <u-navbar title="我的足迹">
      <div @click="changeRightBtn" slot="right" style="margin-right:32rpx">
        {{edit}}
      </div>
    </u-navbar>
    <u-empty text="暂无历史记录" style="margin-top:200rpx;" mode="history" v-if="whetherEmpty"></u-empty>
    <div v-else>
      <view v-for="(item, index) in trackList" :key="index">
        <view class="myTracks-title" @click="navgaiteToStore(item)">{{item.storeName}}</view>
        <view class="myTracks-items">
          <view class="myTracks-item">
            <u-checkbox-group>
              <u-checkbox v-model="item.___isDel" v-if="editFlag" active-color="#ff6b35" style="margin-right: 10rpx"
                @change="changeChecked(item)"></u-checkbox>
            </u-checkbox-group>
            <view class="myTracks-item-img" @click.stop="navgaiteToDetail(item)">
              <image :src="item.thumbnail"></image>
            </view>
            <view class="myTracks-item-content" @click.stop="navgaiteToDetail(item)">
              <view class="myTracks-item-title">
                {{ item.goodsName }}
                <view class="myTracks-item-title-desc"> </view>
              </view>
              <view class="myTracks-item-price">
                ￥{{ item.price | unitPrice }}
              </view>
            </view>
          </view>
        </view>
        <view class="myTracks-divider"></view>

      </view>
      <uni-load-more :status="loadStatus"></uni-load-more>
    </div>
    <view v-if="editFlag">
      <view class="myTracks-action">
        <view class="myTracks-action-check">
          <u-checkbox-group>
            <u-checkbox v-model="allChecked" v-if="editFlag" active-color="#ff6b35" style="margin-right: 10rpx"
              @change="checkedAllitem"></u-checkbox>
            全选
          </u-checkbox-group>
        </view>

        <view>
          <u-button type="warning"  @click="delAllTracks" class="myTracks-action-btn">
            删除
          </u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { myTrackList, deleteHistoryListId } from "@/api/members.js";

export default {
  data() {
    return {
      edit: "编辑",
      editFlag: false, //是否编辑
      allChecked: false, //是否全选
      loadStatus: "more", //底部下拉加载状态
      whetherEmpty: false, //是否数据为空
      params: {
        pageNumber: 1,
        pageSize: 10,
      },

      trackList: [], //足迹列表
    };
  },

  /**
   * 滑到底部加载下一页数据
   */
  onReachBottom() {
    if (this.loadStatus != "noMore") {
      this.params.pageNumber++;
      this.getList();
    }
  },
  onLoad() {
    this.getList();
  },
  onPullDownRefresh() {
    this.trackList = [];
    this.getList();
  },
  methods: {
    /**
     * 导航到店铺
     */
    navgaiteToStore(val) {
      uni.navigateTo({
        url: "/pages/product/shopPage?id=" + val.storeId,
      });
    },

    /**
     * 设置右侧导航栏文本
     */
    setStyle(text) {
      //导航按钮文本设置
      let pages = getCurrentPages();
      let page = pages[pages.length - 1];
      // #ifdef APP-PLUS
      let currentWebview = page.$getAppWebview();
      let titleNView = currentWebview.getStyle().titleNView;
      titleNView.buttons[0].text = text;
      if (text == "完成") {
        this.trackList.forEach((key) => {
          key.history.forEach((item) => {
            this.$set(item, "___isDel", false);
          });
        });
      }
      currentWebview.setStyle({
        titleNView: titleNView,
      });
      // #endif
      // #ifdef H5
      // h5 临时方案
      document.getElementsByClassName("uni-btn-icon")[1].innerText = text;
      // #endif
    },

    /**
     * 跳转详情
     */
    navgaiteToDetail(item) {
      uni.navigateTo({
        url: "/pages/product/goods?id=" + item.id + "&goodsId=" + item.goodsId,
      });
    },

    /**
     * 获取我的足迹列表
     */
    getList() {
      uni.showLoading({
        title: "加载中",
      });
      myTrackList(this.params).then((res) => {
        uni.stopPullDownRefresh();
        uni.hideLoading();
        if (res.statusCode == 200) {
          res.data.result &&
            res.data.result.forEach((item) => {
              item.___isDel = false;
            });

          let data = res.data.result;
          if (data.total == 0) {
            this.whetherEmpty = true;
          } else if (data.total < 10) {
            this.loadStatus = "noMore";
            this.trackList.push(...data);
          } else {
            this.trackList.push(...data);
            if (data.length < 10) this.loadStatus = "noMore";
          }
        }
      });
    },

    /**
     * 点击后判断是不是全选
     */
    
    changeChecked(val) {
      var opt = null;
      const isCheckedAll = this.trackList.every((key) => {
        key.___isDel == val.___isDel;  
        opt = key.___isDel;
        return opt;
      });
      if(opt){
        this.allChecked = isCheckedAll;
      }else{
        this.allChecked = false;
      }     
    },

    /**
     * 右侧标签栏切换
     */
    changeRightBtn(e) {
      if (!this.editFlag) {
        this.edit = "完成";
      } else {
        this.edit = "编辑";
      }
      this.editFlag = !this.editFlag;
    },

    /**
     * 点击全选按钮
     */
    checkedAllitem() {
      //全选按钮
      this.trackList.forEach((key) => {
        this.$set(key, "___isDel", this.allChecked);
      });
    },

    /**
     * 删除足迹
     */
    delAllTracks() {
      let way = [];
      this.trackList.forEach((key) => {
        if (key.___isDel) {
          way.push(key.goodsId);
        }
      });
      if (way.length == 0) return false;
      deleteHistoryListId(way).then((res) => {
        if (res.data.code == 200) {
          this.trackList = [];
          this.allChecked = false;
          this.getList();
        } else {
          uni.showToast({
            title: res.data.message,
            duration: 2000,
            icon: "none",
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.myTracks {
  width: 100%;
  padding-top: 2rpx;
}

.myTracks-title {
  width: 100%;
  height: 110rpx;
  padding-left: 20rpx;
  font-size: 28rpx;
  color: #666;
  font-weight: bold;
  background-color: #fff;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}

.myTracks-items {
  padding-top: 2rpx;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
}

.myTracks-item {
  width: 100%;
  height: 226rpx;
  padding-left: 20rpx;
  padding-right: 20rpx;
  margin-bottom: 2rpx;
  // border-radius: 6/@px;
  background-color: #fff;
  position: relative;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}

.myTracks-item-img {
  margin-right: 20rpx;
  border-radius: 8rpx;
  image {
    width: 130rpx;
    height: 130rpx;
    border-radius: 8rpx;
  }
}

.myTracks-item-title {
  font-size: 28rpx;
  color: #333;
}

.myTracks-item-title-desc {
  font-size: 28rpx;
  color: #999;
}

.myTracks-item-price {
  font-size: 28rpx;
  color: $light-color;
  padding: 10rpx 0 0 0;
}
.myTracks-action{
  display: flex;
  justify-content: space-between;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  height: 75rpx;
  align-items: center;
  padding: 0 32rpx;
}

.myTracks-action-btn {
  width: 130rpx;
  height: 60rpx;
  line-height: 60rpx;
}

.myTracks-divider {
  width: 100%;
  height: 20rpx;
}



.myTracks-action-check {
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}
</style>
