
<script>
/**
 * vuex管理登录状态，具体可以参考官方登录模板示例
 */
import { mapMutations } from "vuex";
import APPUpdate from "@/plugins/APPUpdate";
// 悬浮球

export default {
  methods: {
    ...mapMutations(["login"]),
  },
  onLaunch: function () {
    // #ifdef APP-PLUS
    this.checkArguments(); // 检测启动参数
    // 重点是以下： 一定要监听后台恢复 ！一定要
    plus.globalEvent.addEventListener("newintent", (e) => {
      this.checkArguments(); // 检测启动参数
    });
    // #endif
  },

  methods: {
    // 开屏广告
    launch() {
      try {
        // 获取本地存储中launchFlag标识 开屏广告
        const value = uni.getStorageSync("launchFlag");
        if (!value) {
          this.$u.route("/pages/index/agreement");
        } else {
          //app启动时打开启动广告页
          var w = plus.webview.open(
            "/hybrid/html/advertise/advertise.html",
            "本地地址",
            {
              top: 0,
              bottom: 0,
              zindex: 999,
            },
            "fade-in",
            500
          );
          //设置定时器，4s后关闭启动广告页
          setTimeout(function () {
            plus.webview.close(w);
            APPUpdate();
          }, 3000);
        }
      } catch (e) {
        // error
        uni.setStorage({
          key: "launchFlag",
          data: true,
          success: function () {
            console.log("error时存储launchFlag");
          },
        });
      }
    },
    // 获取h5跳转app的链接并跳转
    checkArguments() {
      // #ifdef APP-PLUS
      setTimeout(() => {
        const args = plus.runtime.arguments;
        if (args) {
          const argsStr = decodeURIComponent(args);
          console.log(argsStr);
          const path = argsStr.split("//")[1];
          if (path.indexOf("tabbar")) {
            uni.switchTab({
              url: `/${path}`,
            });
          } else {
            uni.navigateTo({
              url: `/${path}`,
            });
          }
        }
      });
      // #endif
    },
  },
};
</script>

<style lang="scss">
@import "uview-ui/index.scss";
@import "./static/font/iconfont/iconfont.css";
// -------适配底部安全区  苹果x系列刘海屏

// #ifdef MP-WEIXIN
.mp-iphonex-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
  height: auto !important;
  padding-top: 10rpx;
}
// #endif

body {
  background-color: $bg-color;
}
/************************ */
.w200 {
  width: 200rpx !important;
}
.flex1 {
  flex: 1; //必须父级设置flex
}
</style>
