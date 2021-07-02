<template>
  <view class="user">
    <!-- 个人信息 -->
    <view class="status_bar">
      <!-- 这里是状态栏 -->
    </view>
    <view class="header" @click="userDetail">
      <view class="head-1">
        <image :src="userInfo.face || '/static/missing-face.png'"></image>
      </view>
      <view class="head-2" v-if="userInfo.id">
        <view class="user-name">{{ userInfo.nickName }}</view>
      </view>
      <view class="head-2" v-else>
        <view class="user-name">登录/注册</view>
      </view>

      <u-icon style="display: flex;
      align-items: flex-start;" name="arrow-right"></u-icon>

    </view>
    <!-- 积分，优惠券，关注， -->
    <div class="pointBox">
      <u-row text-align="center" gutter="16" class="point">
        <u-col text-align="center" span="4" @click="navigateTo('/pages/mine/deposit/operation')">
          <view>预存款</view>
          <view class="money">{{ walletNum | unitPrice}}</view>
        </u-col>

        <u-col text-align="center" span="4" @click="navigateTo('/pages/cart/coupon/myCoupon')">
          <view>优惠券</view>
          <view>{{ couponNum || 0 }}</view>
        </u-col>

        <u-col text-align="center" span="4" @click="navigateTo('/pages/mine/myTracks')">
          <view>足迹</view>
          <view>{{ footNum || 0 }}</view>
        </u-col>
      </u-row>
    </div>
    <!-- 我的订单，代付款 -->
    <view class="order">
      <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=0')">
        <div class="bag bag1">
          <u-icon name="order" size="35" color="#fff"></u-icon>
        </div>
        <view>我的订单</view>
      </view>
      <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=1')">
        <div class="bag bag2">
          <u-icon name="bag-fill" size="35" color="#fff"></u-icon>
        </div>

        <view>待付款</view>
        <!-- <view class="corner" v-if="cornerForm.stay_pay_order > 0">{{ cornerForm.stay_pay_order}}</view> -->
      </view>
      <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=3')">
        <div class="bag bag3">
          <u-icon name="car-fill" size="35" color="#fff"></u-icon>
        </div>
        <view>待收货</view>
        <!-- <view class="corner" v-if="cornerForm.stay_receiving_order > 0">{{ cornerForm.stay_receiving_order}}</view> -->
      </view>
      <view class="order-item" @click="navigateTo('/pages/order/evaluate/myEvaluate')">
        <div class="bag bag4">
          <u-icon name="star-fill" size="35" color="#fff"></u-icon>
        </div>
        <view>待评价</view>
        <!-- <view class="corner" v-if="cornerForm.pending_comment_count > 0">{{ cornerForm.pending_comment_count}}</view> -->
      </view>
      <view class="order-item" @click="navigateTo('/pages/order/afterSales/afterSales')">
        <div class="bag bag5">
          <u-icon name="server-fill" size="35" color="#fff"></u-icon>
        </div>
        <view>售后服务</view>
        <!-- <view class="corner" v-if="cornerForm.after_order > 0">{{ cornerForm.after_order}}</view> -->
      </view>
    </view>

    <!-- 常用工具 -->

    <tool />

  </view>
</template>
<script>
import storage from "@/utils/storage.js";
import tool from "@/pages/tabbar/user/utils/tool.vue";
import { getCouponsNum, getFootprintNum } from "@/api/members.js";
import { getUserInfo, getUserWallet } from "@/api/members";
let startY = 0,
  moveY = 0,
  pageAtTop = true;
export default {
  components: {
    tool,
  },
  data() {
    return {
      coverTransform: "translateY(0px)",
      coverTransition: "0s",
      moving: false,
      userInfo: {},
      couponNum: "",
      footNum: "",
      walletNum: "",
    };
  },
  onLoad() {},
  onShow() {
    this.userInfo = this.$options.filters.isLogin();
    if (this.$options.filters.isLogin("auth")) {
      this.getUserOrderNum();
    }
  },
  onPullDownRefresh() {
    this.getUserOrderNum();
    this.userInfo = this.$options.filters.isLogin();
  },
  // #ifndef MP
  onNavigationBarButtonTap(e) {
    const index = e.index;
    if (index === 0) {
      this.navigateTo("/pages/mine/set/setUp");
    }
  },
  // #endif

  mounted() {},
  methods: {
    /**
     * 统一跳转接口,拦截未登录路由
     * navigator标签现在默认没有转场动画，所以用view
     */
    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },
    userDetail() {
      this.userInfo.id
        ? this.navigateTo("/pages/mine/set/personMsg")
        : this.navigateTo("/pages/passport/login");
    },

    /**
     *  会员卡下拉和回弹
     *  1.关闭bounce避免ios端下拉冲突
     *  2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
     *    transition设置0.1秒延迟，让css来过渡这段空窗期
     *  3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
     */
    coverTouchstart(e) {
      if (pageAtTop === false) {
        return;
      }
      this.coverTransition = "transform .1s linear";
      startY = e.touches[0].clientY;
    },
    coverTouchmove(e) {
      moveY = e.touches[0].clientY;
      let moveDistance = moveY - startY;
      if (moveDistance < 0) {
        this.moving = false;
        return;
      }
      this.moving = true;
      if (moveDistance >= 80 && moveDistance < 100) {
        moveDistance = 80;
      }

      if (moveDistance > 0 && moveDistance <= 80) {
        this.coverTransform = `translateY(${moveDistance}px)`;
      }
    },
    coverTouchend() {
      if (this.moving === false) {
        return;
      }
      this.moving = false;
      this.coverTransition = "transform 0.3s cubic-bezier(.21,1.93,.53,.64)";
      this.coverTransform = "translateY(0px)";
    },
    async getUserOrderNum() {
      uni.stopPullDownRefresh();

      Promise.all([
        getCouponsNum(), //优惠券
        getFootprintNum(), //浏览数量
        getUserWallet(), //预存款
      ]).then((res) => {
        this.couponNum = res[0].data.result;
        this.footNum = res[1].data.result;
        this.walletNum = res[2].data.result.memberWallet;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
html,
body {
  overflow: auto;
}
.money {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.uiconRed {
  position: relative;
  &::before {
    content: "";
    background: red;
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
    position: absolute;
    right: 0;
    top: 0;
  }
}
.user {
  .status_WEIXIN {
    background: $light-color;
    overflow: hidden;
    > .status_WEIXIN_R {
      float: right;
      margin-right: 20rpx;
    }
    > .status_WEIXIN_L {
      float: left;
      margin-left: 20rpx;
    }
  }
  .header {
    max-width: 100%;
    padding: calc(50rpx + var(--status-bar-height)) 30rpx 0 115rpx;
    height: calc(var(--status-bar-height) + 360rpx);
    background-size: cover;
    border-bottom-left-radius: 20rpx;
    border-bottom-right-radius: 20rpx;
    background-image: url("/static/img/main-bg.png");
    background-position: bottom;
    background-repeat: no-repeat;
    color: #ffffff;
    display: flex;
    justify-content: space-between;
    .head-1 {
      text-align: center;
      width: 152rpx;
      position: relative;
      display: flex;
      align-items: center;
      image {
        width: 152rpx;
        height: 144rpx;
        border-radius: 50%;
        margin-bottom: 30rpx;
        border: 3px solid #fff;
      }
      .edti-head {
        position: absolute;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        top: 100rpx;
        right: 0;
        image {
          width: 100%;
          height: 100%;
        }
      }

      .certificate {
        font-size: 20rpx;
        border: 1px solid #ffffff;
        border-radius: 1em;
        width: 91rpx;
        margin: 0 auto;
      }
    }
    .head-2 {
      flex: 1;
      margin-left: 30rpx;
      margin-top: 100rpx;
      line-height: 1;
    }
    /deep/ .u-icon,
    .u-icon {
      margin-top: 106rpx;
    }
  }
  .pointBox {
    transform: translateY(-30rpx);
    width: 94%;
    margin: 0 3%;
    background: #fff;
    border-radius: 0.4em;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    height: 160rpx;
  }
  .point {
    text-align: center;
    height: 160rpx;
    border-bottom: 1px solid $border-color-light;
    color: #999;
    font-size: $font-sm;
    // #ifdef MP-WEIXIN
    padding: 24rpx;
    // #endif
    .u-col {
      line-height: 1.5em view {
        color: $u-main-color;
        font-size: 28rpx;
      }
      view:last-child {
        margin-top: 8rpx;
        color: $main-color;
        font-size: $font-lg;
      }
    }
  }
  .order {
    height: 140rpx;
    text-align: center;
    font-size: $font-sm;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 3%;
    color: #999;
    .order-item {
      position: relative;
      line-height: 2em;
      width: 96rpx;
      :first-child {
        font-size: 48rpx;
        margin-bottom: 10rpx;
      }
      .corner {
        position: absolute;
        right: 14rpx;
        top: -6rpx;
        width: 30rpx;
        height: 30rpx;
        background-color: red;
        color: #fff;
        border-radius: 50%;
        line-height: 30rpx;
      }
    }
  }
}

.user-name {
  font-size: 34rpx;
}

.nickname {
  font-size: 24rpx;
}

.bag {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin: 0 auto;
}

.bag1 {
  background: #ff4a48;
}

.bag2 {
  background: #ff992f;
}

.bag3 {
  background: #009ee0;
}

.bag4 {
  background: #00d5d5;
}

.bag5 {
  background: #28ccb0;
}
</style>
