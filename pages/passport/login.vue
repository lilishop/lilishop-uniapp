<template>
  <view v-if="mpWechatLogin">
    <!-- 背景 -->
    <view class="login-ball bg-linear-gradient small"></view>

    <view class="logo-cell">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
    </view>
    <view class="title">LiLi商城</view>

    <!-- 验证码登录 -->
    <codeLogin @open="open" :status="value" v-if="login && loginData.code" />
    <!-- 账号密码登录 -->
    <onClickLogin @open="open" :status="value" v-if="login && loginData.click" />
    <view class="form"> </view>

    <!-- 隐私政策 -->
    <div class="privacy">
      <u-checkbox-group :icon-size="24" width="45rpx">
        <u-checkbox v-model="value" :active-color="lightColor"></u-checkbox>

      </u-checkbox-group>
      同意<span @click="handleClick('user')">《用户协议》</span>和<span @click="handleClick('privacy')">《隐私政策》</span>
    </div>
  </view>
</template>
<script>
import codeLogin from "./codeLogin";
import onClickLogin from "./onClickLogin";
import { getUserInfo } from "@/api/members";
import storage from "@/utils/storage.js";
import { loginCallback } from "@/api/connect.js";
import { webConnect } from "@/api/connect.js";
export default {

  onShow() {
    // #ifdef MP-WEIXIN
    this.mpWechatLogin = false;
    if (this.$options.filters.isLogin("auth")) {
      getCurrentPages().length > 1
        ? uni.navigateBack({
            delta: getCurrentPages().length - 2,
          })
        : uni.switchTab({
            url: "/pages/tabbar/home/index",
          });
    } else {
      uni.navigateTo({
        url: "/pages/passport/wechatMPLogin",
      });
    }
    // #endif

    //#ifdef H5
    let isWXBrowser = /micromessenger/i.test(navigator.userAgent);
    if (isWXBrowser) {
      webConnect("WECHAT").then((res) => {
        let data = res.data;
        if (data.success) {
          window.location = data.result;
        }
      });
    }
    //#endif
  },
  data() {
    return {
      lightColor:this.$lightColor,
      mpWechatLogin: true, //是否加载微信登录
      value: true, //隐私政策
      loginData: {
        code: true, //验证码登录
        click: false,
      },
      login: true, //登录
    };
  },
  watch: {},
  components: {
    codeLogin,
    onClickLogin,
  },

  onLoad(options) {
    if (options && options.state) {
      this.stateLogin(options.state);
    }
  },
  methods: {
    handleClick(val) {
      uni.navigateTo({
        url: "/pages/mine/help/tips?type=" + val,
      });
    },
    // open 开启另一个模板
    open(val) {
      Object.keys(this.loginData).forEach((item) => {
        this.$set(this.loginData, item, false);
      });
      this.$set(this.loginData, val, true);
    },
    //联合信息返回登录
    stateLogin(state) {
      loginCallback(state).then((res) => {
      
        let data = res.data;
        if (data.success) {
          storage.setAccessToken(data.result.accessToken);
          storage.setRefreshToken(data.result.refreshToken);
          // 登录成功
          uni.showToast({
            title: "登录成功!",
            icon: "none",
          });
          getUserInfo().then((user) => {
            storage.setUserInfo(user.data.result);
            storage.setHasLogin(true);
          });
          getCurrentPages().length > 1
            ? uni.navigateBack({
                delta: getCurrentPages().length - 2,
              })
            : uni.switchTab({
                url: "/pages/tabbar/home/index",
              });
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
@import url("./login.scss");
</style>
