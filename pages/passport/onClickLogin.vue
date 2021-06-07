<template>
  <div class="form">
    <u-form ref="validateCodeForm">
      <div class="login-list">
        <!-- 循环出当前可使用的第三方登录模式 -->
        <div class="login-item" v-for="(item,index) in loginList" :key="index">
          <u-icon :color="item.color" size="80" :name="item.icon" @click="navigateLogin(item)"></u-icon>
          <div>{{item.title}}</div>
        </div>
      </div>
      <view class="text-tips cell" @click="clickCodeLogin">账号密码登录</view>
    </u-form>
  </div>
</template>

<script>
import { webConnect, openIdLogin } from "@/api/connect.js";
import { whetherNavigate } from "@/utils/Foundation"; //登录跳转
import { getUserInfo } from "@/api/members";
import storage from "@/utils/storage.js";
import api from "@/config/api.js";

export default {
  data() {
    return {
      loginList: [
        {
          icon: "weixin-circle-fill",
          color: "#00a327",
          title: "微信",
          code: "WECHAT",
        },
        {
          icon: "qq-circle-fill",
          color: "#38ace9",
          title: "QQ",
          code: "QQ",
        },
        {
          icon: "apple-fill",
          color: "#000000",
          title: "Apple",
          code: "APPLE",
        },
      ],
      tips: "",
    };
  },
  props: ["status"],
  mounted() {
    //#ifdef APP-PLUS
    /**如果是app 加载支持的登录方式*/
    let _this = this;
    uni.getProvider({
      service: "oauth",
      success: (result) => {
        _this.loginList = result.provider.map((value) => {
          //展示title
          let title = "";
          //系统code
          let code = "";
          //颜色
          let color = "#8b8b8b";
          //图标
          let icon = "";
          //uni 联合登录 code
          let appcode = "";
          switch (value) {
            case "weixin":
              icon = "weixin-circle-fill";
              color = "#00a327";
              title = "微信";
              code = "WECHAT";
              break;
            case "qq":
              icon = "qq-circle-fill";
              color = "#38ace9";
              title = "QQ";
              code = "QQ";
              break;
            case "apple":
              icon = "apple-fill";
              color = "#000000";
              title = "Apple";
              code = "APPLE";
              break;
          }
          return {
            title: title,
            code: code,
            color: color,
            icon: icon,
            appcode: value,
          };
        });
      },
      fail: (error) => {
        uni.showToast({
          title: "获取登录通道失败" + error,
          duration: 2000,
          icon: "none",
        });
      },
    });
    //#endif

    //特殊平台，登录方式需要过滤
    // #ifdef H5
    this.methodFilter(["QQ"]);
    // #endif

    //微信小程序，只支持微信登录
    // #ifdef MP-WEIXIN
    this.methodFilter(["WECHAT"]);
    // #endif
  },

  methods: {
    /** 根据参数显示登录模块 */
    methodFilter(code) {
      let way = [];
      this.loginList.forEach((item) => {
        if (code.length != 0) {
          code.forEach((val) => {
            if (item.code == val) {
              way.push(item);
            }
          });
        } else {
          uni.showToast({
            title: '配置有误请联系管理员',
            duration: 2000,
            icon:"none"
          });
        }
      });
      this.loginList = way;
    },
    /**跳转到登录页面 */
    navigateLogin(connectLogin) {
      if (!this.status) {
        uni.showToast({
          title: "请您阅读并同意用户协议以及隐私政策",
          duration: 2000,
          icon: "none",
        });
        return false;
      }

      // #ifdef H5
      let code = connectLogin.code;
	  let buyer = api.buyer;
      window.open(buyer+`/connect/login/web/`+code, "_self");
      // #endif
      // #ifdef APP-PLUS
      this.nonH5OpenId(connectLogin);
      // #endif
    },

    // 跳转到一键登录
    clickCodeLogin() {
      this.$emit("open", "code");
    },

    //非h5 获取openid
    async nonH5OpenId(item) {
      let _this = this;
      //获取各个openid
      await uni.login({
        provider: item.appcode,
        // #ifdef MP-ALIPAY
        scopes: "auth_user", //支付宝小程序需设置授权类型
        // #endif
        success: function (res) {
          uni.setStorageSync("type", item.code);
          //微信小程序意外的其它方式直接在storage中写入openid
          // #ifndef MP-WEIXIN
          uni.setStorageSync("openid", res.authResult.openid);
          // #endif
        },
        fail(e) {
          uni.showToast({
            title: "第三方登录暂不可用！",
            icon: "none",
            duration: 3000,
          });
        },
        complete(e) {
          //获取用户信息
          uni.getUserInfo({
            provider: item.appcode,
            success: function (infoRes) {
              //写入用户信息
              uni.setStorageSync("nickname", infoRes.userInfo.nickName);
              uni.setStorageSync("avatar", infoRes.userInfo.avatarUrl);

              // #ifdef MP-WEIXIN
              //微信小程序获取openid 需要特殊处理 如需获取openid请参考uni-id: https://uniapp.dcloud.net.cn/uniCloud/uni-id
              _this.weixinMPOpenID(res).then((res) => {
                //这里需要先行获得openid，再使用openid登录，小程序登录需要两步，所以这里特殊编译
                _this.goOpenidLogin("WECHAT_MP");
              });
              // #endif

              // #ifndef MP-WEIXIN
              _this.goOpenidLogin("APP");
              //#endif
            },
          });
        },
      });
    },
    //openid 登录
    goOpenidLogin(clientType) {
      let _this = this;
      // 获取准备好的参数，进行登录系统
      let params = {
        uuid: uni.getStorageSync("openid"), //联合登陆id
        source: uni.getStorageSync("type"), //联合登陆类型
        nickname: uni.getStorageSync("nickname"), // 昵称
        avatar: uni.getStorageSync("avatar"), // 头像
        uniAccessToken: uni.getStorageSync("uni_access_token"), //第三方token
      };
      openIdLogin(params, clientType).then((res) => {
        if (!res.data.success) {
          let errormessage = "第三方登录暂不可用";
          uni.showToast({
            // title: '未绑定第三方账号',
            title: errormessage,
            icon: "none",
            duration: 3000,
          });
          return;
        } else {
          storage.setAccessToken(res.data.result.accessToken);
          storage.setRefreshToken(res.data.result.refreshToken);
          // 登录成功
          uni.showToast({
            title: "第三方登录成功!",
            icon: "none",
          });
          // 执行登录
          getUserInfo().then((user) => {
            storage.setUserInfo(user.data.result);
            storage.setHasLogin(true);
          });
          whetherNavigate()
        }
      });
    },
    //微信小程序获取openid
    async weixinMPOpenID(res) {
      await miniProgramLogin(res.code).then((res) => {
        uni.setStorageSync("openid", res.data);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import url("./login.scss");

.submit {
  margin: 80rpx 0 40rpx 0;
}

.login-list {
  display: flex;
  padding: 40rpx 0;
  justify-content: space-between;

  .login-item {
    font-size: 24rpx;
    text-align: center;

    > * {
      margin: 4rpx 0;
    }
  }
}
</style>
