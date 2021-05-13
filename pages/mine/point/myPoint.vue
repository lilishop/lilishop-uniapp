<template>
  <view class="content">
    <view class="portrait-box">
      <image src="/static/pointTrade/point_bg_1.png" mode=""></image>
      <image class="point-img" src="/static/pointTrade/tradehall.png" />
      <view class="position-point">
        <view class="apply-point" @click="goIntro"><text>积分介绍</text></view>

      </view>
    </view>
    <u-row class="portrait-box2">
      <u-col span="6" class="portrait-box2-col" :gutter="16">
        <text>累计获得：</text>
        <text class="pcolor">{{ pointData.point || 0 }}</text>
      </u-col>
      <u-col span="6" class="portrait-box2-col">
        <text>未使用：</text>
        <text class="pcolor">{{ pointData.variablePoint || 0 }}</text>
      </u-col>
    </u-row>
    <u-row class="portrait-box3">
      <!-- #ifndef MP-WEIXIN -->
      <u-col span="8">近30天记录</u-col>
      <u-col textAlign="right" span="4" @click="goDetail" class="more">更多</u-col>
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN  -->
      <view class="mp-weixin-more">
        <view>近30天记录</view>
        <view @click="goDetail">更多</view>
      </view>
      <!-- #endif -->
    </u-row>

    <view class="dataList" v-for="(item, index) in list" :key="index">
      <view>
        <view>{{ item.content }}</view>
        <view>{{ item.createTime}}</view>
      </view>
      <view><span>{{item.pointType == "1" ? '+' : '-'}}</span>{{ item.variablePoint }}</view>
    </view>
    <uni-load-more :status="count.loadStatus"></uni-load-more>
    <u-popup v-model="show" mode="bottom" :closeable="true">
      <view class="title">申请积分</view>
      <u-form :model="form" ref="uForm">
        <u-form-item label="选择店铺" label-width="140">
          <u-input v-model="storeParams.storeName" type="select" @click="showstore" placeholder="请选择店铺" />
        </u-form-item>
        <u-form-item label="申请积分" label-width="140">
          <u-input v-model="storeParams.point" type="number" placeholder="请输入积分数量" />
        </u-form-item>
      </u-form>
      <button class="btn-mini" @click="submit" :disabled="avoidClick">提交申请</button>
    </u-popup>
  </view>
</template>

<script>
import { getPoints, getPointsData } from "@/api/members.js";
import { getMemberPointSum } from "@/api/members.js";
import { contractStep } from "@/api/safe.js";

import storage from "@/utils/storage.js";
export default {
  onShow() {
    this.userInfo = storage.getUserInfo();
  },
  data() {
    return {
      count: {
        loadStatus: "more",
      },
      list: [],
      userInfo: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        start_time: 0,
        end_time: 0,
      },
      pointData: {},
      show: false,
      form: {},
      showAction: false,
      actionList: [],
      storeParams: {
        point: 0,
        storeId: 0,
        storeName: "请选择店铺",
      },
      avoidClick: false,
      isCertificate: true,
    };
  },
  onLoad() {
    contractStep().then((res) => {
      //是否实名认证
      console.log(res);
      this.isCertificate = res.data == 1 ? true : false;
    });
    getPoints().then((res) => {
      this.count = res.data;
    });
    this.initpointDataData();
    this.getList();
  },
  onReachBottom() {
    this.params.pageNumber++;
    this.getList();
  },
  methods: {
    getList() {
      let date = Date.parse(new Date()) / 1000;
      let params = this.params;
      params.start_time = date - 60 * 60 * 24 * 30; //30天前时间
      params.end_time = date;
      // console.log(params)
      // return;
      uni.showLoading({
        title: "加载中",
      });
      getPointsData(params).then((res) => {
        uni.hideLoading();
        if (res.data.success) {
          let data = res.data.result.records;
          if (data.length < 10) {
            this.$set(this.count, "loadStatus", "noMore");
            this.list.push(...data);
          } else {
            this.list.push(...data);
            if (data.length < 10) this.$set(this.count, "loadStatus", "noMore");
          }
        }
      });
    },
    initpointDataData() {
      //累计获得累计使用
      getMemberPointSum().then((res) => {
        this.pointData = res.data.result;
      });
    },
    goDetail() {
      //积分明细
      uni.navigateTo({
        url: "/pages/point/pointDetail",
      });
    },
    goIntro() {
      //跳转详情
      uni.navigateTo({
        url: "/pages/pointTrade/pointIntro",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.mp-weixin-more {
  width: 96vw;
  padding: 0 2vw;
  display: flex;
  align-items: center;
  height: 100%;

  justify-content: space-between;
}

.u-close--top-right {
  top: 22rpx;
}

.i_time {
  color: $u-tips-color;
}

.title {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.btn-mini {
  margin: 20rpx auto;
  font-size: 24rpx;
  border-radius: 6rpx;
}

.u-form-item {
  padding: 10rpx 30rpx 10rpx 20rpx;
}

.dataList {
  width: 100%;
  height: 130rpx;
  padding: 0 20rpx;
  background: #ffffff;
  font-size: $font-sm;
  // line-height: 2em;
  border-bottom: 1px solid $border-color-light;
  display: flex;
  justify-content: end;
  align-items: center;

  .colorRed {
    color: #f04844;
  }

  > view:nth-child(1) {
    flex: 1;
    line-height: 40rpx;

    view {
      color: #666666;
    }

    :last-child {
      color: #999;
    }
  }

  > view:nth-child(2) {
    width: 100rpx;
    text-align: center;
  }
}

.portrait-box2 {
  height: 100rpx;
  background: #ffffff;
  border-radius: 0 0 20rpx 20rpx;
  margin: 0 20rpx;
  font-size: 26rpx;

  /deep/ .u-col {
    text-align: center !important;
  }

  /deep/ .u-col:first-child {
    border-right: 1px solid $border-color-light;
  }

  .pcolor {
    color: #4ebb9d;
  }
}

.portrait-box3 {
  // #ifdef MP-WEIXIN
  display: flex;
  // #endif

  height: 110rpx;
  background-color: #f1f1f1;
  margin-top: 20rpx;
  font-size: 28rpx;

  .u-col {
    padding: 0 20rpx;
  }
}

.content {
  background: #f9f9f9;
}

.more {
  text-align: right;
  color: $u-tips-color;
  font-size: 24rpx;
  padding-right: 40rpx !important;
}

.portrait-box {
  background-color: $main-color;
  height: 250rpx;
  background: linear-gradient(134deg, #28d094 2%, #1abc9c 98%);
  border-radius: 20rpx 20rpx 0 0;
  margin: 20rpx 20rpx 0;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;

  > image:first-child {
    width: 263rpx;
    height: 250rpx;
    position: absolute;
    left: 0;
    bottom: 0;
    transform: rotateY(180deg);
  }

  .position-point {
    position: absolute;
    right: -2rpx;
    top: 0;

    .apply-point {
      margin-top: 30rpx;
      text-align: center;
      line-height: 40rpx;
      font-size: $font-sm;
      color: #ffffff;
      width: 142rpx;
      height: 40rpx;
      background: rgba(#ffffff, 0.2);
      border-radius: 20rpx 0px 0px 20rpx;
    }
  }

  .point-img {
    height: 108rpx;
    width: 108rpx;
    margin-bottom: 30rpx;
  }

  .current {
    font-size: 26rpx;

    text {
      vertical-align: middle;
    }

    > text:nth-child(2) {
      color: #ffee80;
      font-size: 40rpx;
      margin-left: 20rpx;
    }
  }

  .point {
    font-size: 56rpx;
  }
}
</style>
