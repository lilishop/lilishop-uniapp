<template>
  <view class="container">
    <u-navbar title="扫码登录授权"></u-navbar>
    <view class="wx-auth-container">
      <div class="box">
        <!-- <div v-if="!errorMsg"> -->
        <div>
          <view class="small-tips flex flex-center">
            <u-image
              width="400rpx"
              height="300rpx"
              src="https://lili-system.oss-cn-beijing.aliyuncs.com/confirm.png"
            ></u-image>
            <div>电脑端登录确认</div>
            <div>为确保帐号安全，请确认是您本人操作</div>
          </view>

          <view class="btns">
            <button @click="confirmLogin()" class="btn-auth">确认登录</button>
            <div @click="cancelLogin()" class="btn-callback">取消登录</div>
          </view>
        </div>
      </div>
    </view>
  </view>
</template>

<script>
import { scannerCodeLogin, scannerCodeLoginConfirm } from "@/api/login";
export default {
  data() {
    return {
      errorMsg: "",
      token: "",
    };
  },
  watch: {
    errorMsg(val) {
      if (val) {
        uni.showToast({
          title: val,
          icon: "none",
        });
        // uni.navigateBack()
      }
    },
  },
  onShow() {
    this.$options.filters.forceLogin();
    scannerCodeLogin({ token: this.token }).then((res) => {
      if (res.data.code == 200) {
        let code = res.data.result;
        switch (code) {
          case 0:
          case 1:
            this.errorMsg = "";
            break;
          case 2:
          case 3:
            this.errorMsg = "请勿重复扫码";
            break;
          case 4:
            this.errorMsg = "二维码已过期，重新扫码";
            break;
          default:
            this.errorMsg = "状态异常";
        }
      } else {
        this.errorMsg = res.data.message;
      }
    });
  },
  onLoad(params) {
    this.token = params.token;
    if (this.token == undefined || this.token == "") {
      this.errorMsg = "信息异常";
    }
  },
  methods: {
    confirmLogin() {
      this.config(1);
    },
    cancelLogin() {
      this.config(0);
    },
    config(code) {
      scannerCodeLoginConfirm({ token: this.token, code: code }).then((res) => {
        let title = res.data.success ? "操作成功" : "操作失败";
        uni.showToast({
          title: title,
          duration: 1500,
          icon: "none",
        });
        setTimeout(function () {
          uni.navigateBack();
        }, 1000);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
page {
  background: #fff;
}
</style>
<style lang="scss" scoped>
.container {
  background-color: #fff;
  width: 100vw;
  height: 100vh;
}
.wx-auth-container {
  width: 100%;
  background: #fff;
  margin-top: 20%;
}
text.title,
text.shop {
  display: inline-block;
  font-size: 60rpx;
  color: #333;
}

.box {
  margin: 0 32rpx;
}

/* 文字提示*/
.small-tips {
  width: 100%;

  padding: 20rpx;
  font-size: 29rpx;
  margin: 0 0 20rpx;
  color: #999;
}

.btn-auth {
  width: 92%;
  background: $main-color;
  color: #fff;
  margin: 0 auto 40rpx;
  border-radius: 100px;
}
.btn-callback {
  text-align: center;
  font-size: 30rpx;
  background: #ededed;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 100px;
  width: 92%;
  margin: 0 auto;
}

.btns {
  margin-top: 100rpx;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
}
</style>
