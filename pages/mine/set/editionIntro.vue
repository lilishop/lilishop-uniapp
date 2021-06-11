// TODO 第一版本暂无此功能 后续优化以及更新
<template>
  <view class="edition-intro">
    <h1> {{config.name}}</h1>

    <view class='vesion'>
      Version
    </view>

    <u-cell-group class="cell">
      <!--  #ifdef APP-PLUS -->
      <u-cell-item v-if="IosWhetherStar" @click="()=>{window.location.href = `itms-apps://itunes.apple.com/app/${config.iosAppId}?action=write-review`}" title="去评分"></u-cell-item>
      <!--  #endif -->
      <u-cell-item title="功能介绍"></u-cell-item>
      <!--  #ifdef APP-PLUS -->
      <u-cell-item title="检查更新" @click="checkUpdate"></u-cell-item>
      <!--  #endif -->
      <u-cell-item title="证照信息" @click="navigateTo('/pages/mine/help/tips?type=message')"></u-cell-item>
      <u-cell-item title="服务协议" @click="navigateTo('/pages/mine/help/tips?type=user')"></u-cell-item>
      <u-cell-item title="隐私协议" @click="navigateTo('/pages/mine/help/tips?type=privacy')"></u-cell-item>
      <u-cell-item title="关于我们" :border-bottom="false" @click="navigateTo('/pages/mine/help/tips?type=about')"></u-cell-item>

    </u-cell-group>

    <view class="intro">
      <view>客服热线：13161366885</view>
      <view style="margin:20rpx 0 0 0;">客服邮箱：lili@lili.com</view>

      <view>
        <view style="margin:20rpx 0; color:#003a8c;" @click="navigateTo('/pages/mine/help/tips?type=user')">《lili商城用户协议》</view>
        <view>CopyRight @ {{config.name}} </view>
      </view>
    </view>
  </view>
</template>

<script>
import config from "@/config/config";
import * as API_Message from "@/api/message.js";
export default {
  data() {
    return {
      config,
      IosWhetherStar: false,
      editionHistory: [], //版本历史
      params: {
        pageNumber: 1,
        pageSize: 5,
      },
      loadStatus: "more",
    };
  },
  onLoad() {
    if (uni.getSystemInfoSync().platform === "android") {
      this.params.type = 0;
    } else {
      this.IosWhetherStar = true;
      this.params.type = 1;
    }
    this.GET_AppVersionList(true);
  },
  onReachBottom() {
    if (this.loadStatus != "noMore") {
      this.params.pageNumber++;
      this.GET_AppVersionList(false);
    }
  },
  methods: {
    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },
    GET_AppVersionList(reset) {
      if (reset) {
        this.params.pageNumber = 1;
      }
      uni.showLoading({
        title: "加载中",
      });
      API_Message.getAppVersionList(this.params).then((response) => {
        uni.hideLoading();
        if (response.statusCode == 200) {
          const { data } = response;
          if (data.data.length < 10) {
            this.loadStatus = "noMore";
          }
          this.editionHistory.push(...data.data);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #fff;
}
.cell {
  width: 90%;
  margin: 0 auto;
}
.edition-intro {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h1 {
    margin: 150rpx 0 20rpx 0;
    letter-spacing: 2rpx;
  }
  > .vesion {
    font-size: 30rpx;
    margin-bottom: 150rpx;
  }
}
.intro {
  margin-top: 150rpx;
  font-size: 24rpx;
  letter-spacing: 2rpx;
}
</style>
