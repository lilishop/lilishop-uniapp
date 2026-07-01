
<template>
  <view class="edition-intro">
    <view class="header-block">
      <image :src="config.logo" class="logo" mode="aspectFit" />
      <text class="app-name">{{ config.name }}</text>
      <view class="version">
        <!-- #ifdef APP-PLUS -->
        Version {{ localVersion.version }}
        <!-- #endif -->
        <!-- #ifdef MP-WEIXIN -->
        小程序版本: {{ localVersion.version }} {{ localVersion.envVersion }}
        <!-- #endif -->
      </view>
    </view>

    <u-cell-group class="cell-group">
      <!-- #ifdef APP-PLUS -->
      <u-cell v-if="IosWhether" isLink title="去评分" @click="checkStar"></u-cell>
      <u-cell isLink title="功能介绍" @click="navigateTo('/pages/mine/set/versionFunctionList')"></u-cell>
      <u-cell isLink title="检查更新" @click="checkUpdate"></u-cell>
      <!-- #endif -->

      <u-cell isLink title="证照信息" @click="navigateTo('/pages/mine/help/tips?type=LICENSE_INFORMATION')"></u-cell>
      <u-cell isLink title="服务协议" @click="navigateTo('/pages/mine/help/tips?type=USER_AGREEMENT')"></u-cell>
      <u-cell isLink title="隐私协议" @click="navigateTo('/pages/mine/help/tips?type=PRIVACY_POLICY')"></u-cell>
      <u-cell isLink title="关于我们" @click="navigateTo('/pages/mine/help/tips?type=ABOUT')"></u-cell>
    </u-cell-group>

    <view class="intro">
      <view v-if="config.customerServiceMobile">客服热线：{{ config.customerServiceMobile }}</view>
      <view v-if="config.customerServiceEmail" class="intro-line">客服邮箱：{{ config.customerServiceEmail }}</view>
      <view class="intro-line">
        <text class="intro-link" @click="navigateTo('/pages/mine/help/tips?type=USER_AGREEMENT')">
          《{{ config.name }}用户协议》
        </text>
      </view>
      <view class="intro-line">CopyRight ©{{ config.name }}</view>
    </view>
  </view>
</template>

<script>
import APPUpdate from "@/plugins/APPUpdate";
import config from "@/config/config";
import { getAppVersion } from "@/api/message.js";
export default {
  data() {
    return {
      config,
      IosWhether: false,
      editionHistory: [],
      versionData: {},
      localVersion: "",
      params: {
        pageNumber: 1,
        pageSize: 5,
      },
    };
  },
  onLoad() {
    // #ifdef APP-PLUS
    const platform = uni.getSystemInfoSync().platform;
    if (platform === "android") {
      this.params.type = 0;
    } else {
      this.IosWhether = true;
      this.params.type = 1;
    }
    this.getVersion(platform);

    plus.runtime.getProperty(plus.runtime.appid, (inf) => {
      this.localVersion = {
        versionCode: inf.version.replace(/\./g, ""),
        version: inf.version,
      };
    });
    // #endif

    // #ifdef MP-WEIXIN
    const accountInfo = wx.getAccountInfoSync();
    this.version_number = accountInfo.miniProgram.version;
    this.localVersion = {
      versionCode: accountInfo.miniProgram.version.replace(/\./g, ""),
      version: accountInfo.miniProgram.version,
      envVersion: accountInfo.miniProgram.envVersion,
    };
    // #endif
  },

  methods: {
    async getVersion(platform) {
      let type;
      platform == "android" ? (type = "ANDROID") : (type = "IOS");

      let res = await getAppVersion(type);
      if (res.data.success) {
        this.versionData = res.data.result;
      }
    },

    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },

    checkStar() {
      plus.runtime.launchApplication({
        action: `itms-apps://itunes.apple.com/app/${config.iosAppId}?action=write-review`,
      });
    },

    checkUpdate() {
      if (
        this.versionData.version.replace(/\./g, "") <
        this.localVersion.versionCode
      ) {
        APPUpdate();
      } else {
        uni.showToast({
          title: "当前版本已是最新版",
          duration: 2000,
          icon: "none",
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #fff !important;
}

.edition-intro {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}

.header-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 48rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
}

.app-name {
  margin-top: 20rpx;
  font-size: 36rpx;
  font-weight: 500;
  letter-spacing: 2rpx;
  color: #333;
}

.version {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.cell-group {
  width: 100%;
}

:deep(.u-cell) {
  padding: 0 30rpx;
}

:deep(.u-cell__title-text) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-cell__right-icon-wrap) {
  color: #ccc !important;
}

.intro {
  margin-top: auto;
  width: 100%;
  padding: 48rpx 40rpx 60rpx;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.6;
  color: #666;
  letter-spacing: 1rpx;
  box-sizing: border-box;
}

.intro-line {
  margin-top: 16rpx;
}

.intro-link {
  color: #003a8c;
}
</style>
