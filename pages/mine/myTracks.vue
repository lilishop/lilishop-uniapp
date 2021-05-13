<template>
  <view class="myTracks" v-if="refresh">
    <empty v-if="nomsg"></empty>
    <view v-else v-for="(item, index) in list" :key="index">
      <view class="myTracks-title" @click="gostore(item)">{{item.storeName}}</view>
      <view class="myTracks-items">
        <view class="myTracks-item">
          <u-checkbox-group>
            <u-checkbox v-model="item.___isDel" v-if="editFlag" active-color="#ff6b35" style="margin-right: 10rpx" @change="changeChecked(item)"></u-checkbox>
          </u-checkbox-group>
          <view class="myTracks-item-img" @click.stop="goDetail(item)">
            <image :src="item.thumbnail"></image>
          </view>
          <view class="myTracks-item-content" @click.stop="goDetail(item)">
            <view class="myTracks-item-title">
              {{ item.goodsName }}
              <view class="myTracks-item-title-desc"> </view>
            </view>
            <view class="myTracks-item-price">
              ￥{{ item.price | unitPrice }}
            </view>
            <!-- <view class="myTracks-item-btn" @click.stop="goSimilar(item)">
              找相似
            </view> -->
          </view>
        </view>
      </view>
      <view class="myTracks-divider"></view>
    </view>
    <uni-load-more :status="loadStatus"></uni-load-more>
    <view v-if="editFlag">
      <view class="myTracks-action-placeholder"></view>
      <view class="myTracks-action">
        <view class="myTracks-action-check">
          <u-checkbox-group>
            <u-checkbox v-model="allChecked" v-if="editFlag" active-color="#ff6b35" style="margin-right: 10rpx" @change="checkedAllitem"></u-checkbox>
            全选
          </u-checkbox-group>
        </view>

        <view>
          <u-button type="warning" plain="true" @click="delAllTracks" class="myTracks-action-btn">
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
      editFlag: false,
      allChecked: false,
      loadStatus: "more",
      nomsg: false,
      params: {
        pageNumber: 1,
        pageSize: 10,
      },
      refresh: true,
      list: [],
    };
  },
  onPullDownRefresh() {
    this.params.pageNumber = 1;
    this.list = [];
    this.getList();
  },
  onReachBottom() {
    if (this.loadStatus != "noMore") {
      this.params.pageNumber++;
      this.getList();
    }
  },
  onLoad() {
    this.getList();
  },
  methods: {
    gostore(val) {
      uni.navigateTo({
        url: "/pages/product/shopPage?id=" + val.storeId,
      });
    },
    setStyle(text) {
      //导航按钮文本设置
      let pages = getCurrentPages();
      let page = pages[pages.length - 1];
      // #ifdef APP-PLUS
      let currentWebview = page.$getAppWebview();
      let titleNView = currentWebview.getStyle().titleNView;
      titleNView.buttons[0].text = text;
      if (text == "完成") {
        this.list.forEach((key) => {
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
    goDetail(item) {
      //跳转详情
      uni.navigateTo({
        url: "/pages/product/goods?id=" + item.id + "&goodsId=" + item.goodsId,
      });
    },
    goSimilar(item) {
      //找相似
      uni.navigateTo({
        url:
          "/pages/user/similaritem?item=" +
          encodeURIComponent(JSON.stringify(item)),
      });
    },
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
            this.nomsg = true;
          } else if (data.total < 10) {
            this.loadStatus = "noMore";
            this.list.push(...data);
          } else {
            this.list.push(...data);
            if (data.length < 10) this.loadStatus = "noMore";
          }
        }
      });
    },
    changeChecked(val) {
      //点击后判断是不是全选
      console.log(val);
      const isCheckedAll = this.list.every((key) => {
        console.log(key);
        return key.___isDel == val.___isDel;
      });
      this.allChecked = isCheckedAll;
    },
    checkedAllitem() {
      //全选按钮
      this.list.forEach((key) => {
        this.$set(key, "___isDel", this.allChecked);
      });
    },
    delAllTracks() {
      let way = [];
      this.list.forEach((key) => {
        if (key.___isDel) {
          way.push(key.goodsId);
        }
      });
      if (way.length == 0) return false;
      deleteHistoryListId(way).then((res) => {
        if (res.data.code == 200) {
          this.list = [];
 
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
  onNavigationBarButtonTap(e) {
    if (!this.editFlag) {
      this.setStyle("完成");
    } else {
      this.setStyle("编辑");
    }
    this.editFlag = !this.editFlag;
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

.myTracks-item-content {
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

.myTracks-item-price-now {
  font-size: 28rpx;
  color: $light-color;
  margin: 0 10rpx;
}

.myTracks-item-price-origin {
  font-size: 28rpx;
  color: #999;
  -webkit-text-decoration-line: line-through;
  text-decoration-line: line-through;
  text-decoration: line-through;
}

.myTracks-item-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  width: 120rpx;
  height: 42rpx;
  background-color: #fff;
  border: 1px solid $aider-light-color;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: $aider-light-color;
  display: flex;
  justify-content: center;
  align-items: center;
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

.myTracks-action-placeholder {
  height: 110rpx;
}

.myTracks-action {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  background-color: #fff;
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  justify-content: space-between;
}

.myTracks-action-check {
  align-items: center;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
}
</style>
