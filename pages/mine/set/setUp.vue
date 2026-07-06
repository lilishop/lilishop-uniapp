<template>
  <view class="set-up">
    <view class="person" @click="checkUserInfo()">
      <u-image
        width="140rpx"
        height="140rpx"
        shape="circle"
        :src="userInfo.face || userImage"
        mode="aspectFill"
      ></u-image>
      <view class="user-name">
        {{ userInfo.id ? userInfo.nickName || '' : '暂未登录' }}
      </view>
      <u-icon color="#ccc" name="arrow-right" size="16"></u-icon>
    </view>

    <u-cell-group class="cell-group" :border="false">
      <!-- #ifdef APP-PLUS -->
      <u-cell is-link title="清除缓存" :value="fileSizeString" @click="clearCache"></u-cell>
      <!-- #endif -->
      <!-- #ifndef MP-WEIXIN -->
      <u-cell
        is-link
        title="安全中心"
        @click="navigateTo('/pages/mine/set/securityCenter/securityCenter')"
      ></u-cell>
      <!-- #endif -->
      <u-cell is-link title="用户注销" v-if="userInfo.id" @click="logoff"></u-cell>
      <u-cell is-link title="意见反馈" @click="navigateTo('/pages/mine/set/feedBack')"></u-cell>
      <u-cell
        is-link
        :title="`关于${config.name}`"
        @click="navigateTo('/pages/mine/set/editionIntro')"
      ></u-cell>
    </u-cell-group>

    <view class="submit" v-if="userInfo.id" @click="quiteLoginOut">退出登录</view>
  </view>
</template>

<script>
import config from "@/config/config";
export default {
  data() {
    return {
      config,
      userImage: config.defaultUserPhoto,
      isCertificate: false,
      userInfo: {},
      fileSizeString: "0B",
    };
  },

  methods: {
    navigateTo(url) {
      if (url == "/pages/set/securityCenter/securityCenter") {
        url += `?mobile=${this.userInfo.mobile}`;
      }
      uni.navigateTo({
        url: url,
      });
    },

    getCacheSize() {
      let that = this;
      plus.cache.calculate(function (size) {
        let sizeCache = parseInt(size);
        if (sizeCache == 0) {
          that.fileSizeString = "0B";
        } else if (sizeCache < 1024) {
          that.fileSizeString = sizeCache + "B";
        } else if (sizeCache < 1048576) {
          that.fileSizeString = (sizeCache / 1024).toFixed(2) + "KB";
        } else if (sizeCache < 1073741824) {
          that.fileSizeString = (sizeCache / 1048576).toFixed(2) + "MB";
        } else {
          that.fileSizeString = (sizeCache / 1073741824).toFixed(2) + "GB";
        }
      });
    },

    checkUserInfo() {
      if (this.isLogin("auth")) {
        this.navigateTo("/pages/mine/set/personMsg");
      } else {
        this.tipsToLogin();
      }
    },

    clearCache() {
      let that = this;
      let os = plus.os.name;
      if (os == "Android") {
        let main = plus.android.runtimeMainActivity();
        let sdRoot = main.getCacheDir();
        let files = plus.android.invoke(sdRoot, "listFiles");
        let len = files.length;
        for (let i = 0; i < len; i++) {
          let filePath = "" + files[i];
          plus.io.resolveLocalFileSystemURL(
            filePath,
            function (entry) {
              if (entry.isDirectory) {
                entry.removeRecursively(
                  function () {
                    uni.showToast({
                      title: "缓存清理完成",
                      duration: 2000,
                      icon: "none",
                    });
                    that.getCacheSize();
                  },
                  function () {}
                );
              } else {
                entry.remove();
              }
            },
            function () {
              uni.showToast({
                title: "文件路径读取失败",
                duration: 2000,
                icon: "none",
              });
            }
          );
        }
      } else {
        plus.cache.clear(function () {
          uni.showToast({
            title: "缓存清理完成",
            duration: 2000,
            icon: "none",
          });
          that.getCacheSize();
        });
      }
    },
  },
  onShow() {
    this.userInfo = this.isLogin();
    // #ifdef APP-PLUS
    this.getCacheSize();
    // #endif
  },
};
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8 !important;
}

.set-up {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f8f8f8;
}

.person {
  display: flex;
  align-items: center;
  padding: 36rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #ededed;
}

.user-name {
  flex: 1;
  min-width: 0;
  margin-left: 30rpx;
  font-size: 34rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-group {
  width: 100%;
  margin-top: 20rpx;
  background: #fff;
}

:deep(.u-cell-group) {
  width: 100%;
}

:deep(.u-cell) {
  width: 100%;
}

:deep(.u-cell__body) {
  padding: 28rpx 30rpx;
}

:deep(.u-cell__title-text) {
  font-size: 30rpx;
  color: #333;
}

:deep(.u-cell__value) {
  color: #ccc !important;
}

:deep(.u-cell__right-icon-wrap) {
  color: #ccc !important;
}

:deep(.u-line) {
  width: 100% !important;
  margin: 0 !important;
}

.submit {
  height: 90rpx;
  line-height: 90rpx;
  margin-top: 20rpx;
  text-align: center;
  background: #fff;
  color: $main-color;
  font-size: 30rpx;
}
</style>
