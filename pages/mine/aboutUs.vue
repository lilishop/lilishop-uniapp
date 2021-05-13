<template>
  <view class="about-us">
    <view class="box flex-center">
      <image src="/static/logo.png" mode="scaleToFill"></image>
      <view>lili商城</view>
    </view>
    <u-cell-group :border="false">
      <!--  #ifdef APP-PLUS -->
      <u-cell-item title="检查更新" @click="checkUpdate"></u-cell-item>
      <!--  #endif -->
      <u-cell-item title="证照信息" @click="
          navigateTo('/pages/mine/help/tips?type=message')
        "></u-cell-item>
      <u-cell-item title="服务协议" @click="
          navigateTo('/pages/mine/help/tips?type=user')
        "></u-cell-item>
      <u-cell-item title="隐私协议" :border-bottom="false" @click="
          navigateTo('/pages/mine/help/tips?type=privacy')
        "></u-cell-item>
      <u-cell-item title="关于我们" :border-bottom="false" @click="
          navigateTo('/pages/mine/help/tips?type=about')
        "></u-cell-item>
    </u-cell-group>
    <view class="intro flex-center c-content">
      <view>客服热线：15810610731</view>
      <view>客服邮箱：lili@lili.com</view>

    </view>
    <view class="bottom flex-center">
      <view @click="navigateTo('/pages/help/tips?type=user')">《lili商城用户协议》</view>
      <view>CopyRight @ lili商城 </view>
    </view>
  </view>
</template>

<script>
// #ifdef APP-PLUS
import APPUpdate, { getCurrentNo, getServerNo } from "@/plugins/APPUpdate";
import { getAppVersionList } from "@/api/message.js";

// #endif
export default {
  data() {
    return {
      showUpdate: false,
      version: "",
      currentNo: 0,
      params: {
        pageNumber: 1,
        pageSize: 5,
      },
    };
  },
  onLoad(options) {
    // #ifdef APP-PLUS
    let _this = this;
    plus.runtime.getProperty(plus.runtime.appid, function (inf) {
      var wgtVer = inf.version;
      _this.currentVersion = wgtVer;
    });
    if (uni.getSystemInfoSync().platform === "android") {
      this.params.type = 0;
    } else {
      this.params.type = 1;
    }
    // #endif
  },
  methods: {
    async checkUpdate() {
      // #ifdef APP-PLUS
      let needUpdate = false;
      getCurrentNo((res) => {
        this.currentNo = res.versionCode;
      });
      let res = await getAppVersionList(this.params);
      res.data.data.forEach((ele) => {
        let versionDetail = ele.version.replace(/\./g, "");
        if (versionDetail.length < this.currentNo.length) {
          versionDetail = versionDetail.padEnd(this.currentNo.length, "0");
        }
        if (versionDetail > this.currentNo) {
          needUpdate = true;
        }
      });
      if (needUpdate) {
        APPUpdate(true);
      } else {
        uni.showToast({
          title: "已是最新版本！",
        });
      }
      // #endif
    },
    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 242rpx;
  image {
    transform: scale(2.5);
    width: 94rpx;
    height: 94rpx;
  }
  view {
    font-size: 30rpx;
    margin-top: 25rpx;
  }
}
.u-cell {
  padding: 35rpx 20rpx;
  height: 110rpx;
}
.intro {
  color: #999999;
  font-size: $font-sm;
  margin-top: 20rpx;
  border: none;
  padding: 45rpx 0;
  line-height: 2em;
}
.bottom {
  :nth-child(1) {
    color: $main-color;
    font-size: 22rpx;
    margin-bottom: 20rpx;
  }
  :last-child {
    font-size: 20rpx;
    color: $font-color-light;
  }
  margin-top: 110rpx;
}
</style>
