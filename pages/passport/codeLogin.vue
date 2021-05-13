<template>
  <div class="form">
    <u-form :model="codeForm" ref="validateCodeForm">
      <u-form-item class="cell" label-width="120" label="手机号" prop="mobile">
        <u-input maxlength="11" v-model="codeForm.mobile" placeholder="请输入您的手机号" />
      </u-form-item>

      <u-form-item class="cell code" label-width="120" prop="code" label="验证码">
        <div style="display:flex; with:100%;">
          <u-input v-model="codeForm.code" placeholder="请输入验证码" />
          <u-verification-code keep-running unique-key="page-login" :seconds="seconds" @end="end" @start="start" ref="uCode" @change="codeChange"></u-verification-code>
          <view @tap="getCode" class="text-tips">{{ tips }}</view>
        </div>
      </u-form-item>

      <view class="submit" @click="submit">登录</view>
      <view class="text-tips cell" @click="clickLogin">一键登录</view>
      <myVerification v-if="codeFlag" @send="verification" class="verification" ref="verification" business="LOGIN" />
    </u-form>
  </div>
</template>

<script>
import { sendMobile, smsLogin } from "@/api/login";
import { getUserInfo } from "@/api/members";
import storage from "@/utils/storage.js";

import myVerification from "@/components/verification/verification.vue";
import uuid from "@/utils/uuid.modified.js";
export default {
  components: {
    myVerification,
  },
  props: ["status"],
  data() {
    return {
      uuid,
      flage: false, //是否验证码验证
      codeFlag: true,

      // 验证码登录form
      codeForm: {
        mobile: "",
        code: "",
      },
      tips: "",
      clientType: "",
      seconds: 60,
      //   验证码登录校验
      codeRules: {
        mobile: [
          {
            validator: (rule, value, callback) => {
              return this.$u.test.mobile(value);
            },
            message: "手机号码不正确",
            trigger: ["blur"],
          },
        ],
        code: [
          {
            min: 4,
            max: 6,
            required: true,
            message: "请输入验证码",
            trigger: ["blur"],
          },
        ],
      },
    };
  },
  // 必须要在onReady生命周期，因为onLoad生命周期组件可能尚未创建完毕
  mounted() {
    this.$refs.validateCodeForm.setRules(this.codeRules);
    //#ifdef H5
    this.clientType = "H5";
    //#endif
    //#ifdef APP-PLUS
    this.clientType = "APP";
    //#endif
  },
  watch: {
    flage(val) {
      if (val) {
        if (this.$refs.uCode.canGetCode) {
          // 模拟向后端请求验证码
          uni.showLoading({
            title: "正在获取验证码",
          });
          sendMobile(this.codeForm.mobile).then((res) => {
            uni.hideLoading();
            // 这里此提示会被this.start()方法中的提示覆盖
            if (res.data.success) {
              this.$refs.uCode.start();
            } else {
              uni.showToast({
                title: res.data.message,
                duration: 2000,
                icon: "none",
              });
            }
          });
        } else {
          this.$u.toast("请倒计时结束后再发送");
        }
      }
    },
  },

  methods: {
    // 验证码验证
    verification(val) {
      this.flage = val == this.$store.state.verificationKey ? true : false;
    },
    //   登录
    submit() {
      if (!this.status) {
        uni.showToast({
          title: "请您阅读并同意用户协议以及隐私政策",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      let _this = this;
      this.$refs.validateCodeForm.validate((valid) => {
        if (valid) {
          storage.setHasLogin(false);
          storage.setAccessToken("");
          storage.setRefreshToken("");
          storage.setUuid(this.uuid.v1());
          storage.setUserInfo({});
          smsLogin(this.codeForm, _this.clientType).then((res) => {
            if (res.data.success) {
              storage.setAccessToken(res.data.result.accessToken);
              storage.setRefreshToken(res.data.result.refreshToken);

              getUserInfo().then((user) => {
                if (user.data.success) {
                  storage.setUserInfo(user.data.result);
                  storage.setHasLogin(true);
                  // 登录成功
                  uni.showToast({
                    title: "登录成功!",
                    icon: "none",
                  });

                  if (getCurrentPages().length > 1) {
                    if (
                      (getCurrentPages().length - 2).route ==
                      "pages/passport/login"
                    ) {
                      uni.switchTab({
                        url: "/pages/tabbar/home/index",
                      });
                    } else {
                    
                      if (
                        !(getCurrentPages().length - 2).route ||
                        (getCurrentPages().length - 2).route == "undefined"
                      ) {
                        uni.switchTab({
                          url: "/pages/tabbar/home/index",
                        });
                      } else {
                        uni.navigateBack({
                          delta: getCurrentPages().length - 2,
                        });
                      }
                    }
                  } else {
                    uni.switchTab({
                      url: "/pages/tabbar/home/index",
                    });
                  }
                } else {
                  uni.switchTab({
                    url: "/pages/tabbar/home/index",
                  });
                }
              });
            }
          });
        }
      });
    },

    clickLogin() {
      this.$emit("open", "click");
    },

    codeChange(text) {
      console.log(text);
      this.tips = text;
    },
    end() {},
    /**获取验证码 */
    getCode() {
      if (this.tips == "重新获取") {
        this.codeFlag = true;

        uni.showLoading({
          title: "加载中",
        });
        setTimeout(() => {
          this.$refs.verification.hide();
          uni.hideLoading();
        }, 2000);
      }
      if (!this.$u.test.mobile(this.codeForm.mobile)) {
        uni.showToast({
          title: "请输入正确手机号",
          icon: "none",
        });
        return false;
      }
      if (!this.flage) {
        this.$refs.verification.hide();
        return false;
      }
    },
    start() {
      this.$u.toast("验证码已发送");
      this.flage = false;

      this.codeFlag = false;
      this.$refs.verification.hide();
    },
  },
};
</script>
<style lang="scss" scoped>
@import url("./login.scss");

// #ifdef MP-WEIXIN
@import url("./mp-codeLogin.scss");

// #endif
</style>