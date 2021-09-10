<template>
  <view>
    <!--  -->
    <view v-if="codeLogin">
      <!-- 背景 -->
      <view class="login-ball bg-linear-gradient small"></view>

      <view class="logo-cell">
        <image class="logo" :src="config.logo" mode="aspectFit"></image>
      </view>
      <view class="title">{{config.name}}</view>

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
    <view v-if="wechatLogin">
      <wechatH5Login />
    </view>
  </view>
</template>
<script>
import codeLogin from "./codeLogin";
import onClickLogin from "./onClickLogin";
import { getUserInfo } from "@/api/members";
import storage from "@/utils/storage.js";
import { loginCallback } from "@/api/connect.js";
import { webConnect } from "@/api/connect.js";
import config from "@/config/config";
import wechatH5Login from "./wechatH5Login.vue";
export default {
  onShow() {
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
      config,
      lightColor: this.$lightColor,
      wechatLogin: false, //是否加载微信公众号登录
      codeLogin: false, //是否加载正常验证码登录
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
    wechatH5Login,
  },
  mounted() {
    // #ifndef APP-PLUS
    //判断是否微信浏览器
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      this.wechatLogin = true;
      return;
  
    } else {
      this.codeLogin = true;
    }
    // #endif
    // #ifdef APP-PLUS
    this.codeLogin = true;
    // #endif
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
