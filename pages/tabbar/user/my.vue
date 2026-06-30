<template>
  <view class="user">
    <!-- 个人信息 -->
    <view class="status_bar">
      <!-- 这里是状态栏 -->
    </view>
    <view class="header" @click="userDetail">
      <view class="head-1">
        <image class="head-avatar" :src="userInfo.face || userImage"></image>
      </view>
      <view class="head-2" v-if="userInfo.id">
        <view class="user-name">{{ userInfo.nickName }}</view>
      </view>
      <view class="head-2" v-else>
        <view class="user-name">登录/注册</view>
      </view>
      <u-icon class="header-arrow" name="arrow-right"></u-icon>
    </view>
    <!-- 积分，优惠券，关注， -->
    <div class="pointBox box">
      <view class="point">
        <view class="point-item" @click="navigateTo('/pages/mine/deposit/operation')">
          <view class="point-label">预存款</view>
          <view class="point-value money">{{ unitPrice(walletNum) }}</view>
        </view>
        <view class="point-item" @click="navigateTo('/pages/cart/coupon/myCoupon')">
          <view class="point-label">优惠券</view>
          <view class="point-value">{{ couponNum || 0 }}</view>
        </view>
        <view class="point-item" @click="navigateTo('/pages/mine/myTracks')">
          <view class="point-label">足迹</view>
          <view class="point-value">{{ footNum || 0 }}</view>
        </view>
      </view>
      <!-- 我的订单，代付款 -->
      <view class="order">
        <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=1')">
          <view class="bag bag2">
            <u-icon name="bag-fill" size="22" color="#fff"></u-icon>
          </view>
          <view class="order-item-label">待付款</view>
        </view>
        <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=3')">
          <view class="bag bag3">
            <u-icon name="car-fill" size="22" color="#fff"></u-icon>
          </view>
          <view class="order-item-label">待收货</view>
        </view>
        <view class="order-item" @click="navigateTo('/pages/order/evaluate/myEvaluate')">
          <view class="bag bag4">
            <u-icon name="star-fill" size="22" color="#fff"></u-icon>
          </view>
          <view class="order-item-label">待评价</view>
        </view>
        <view class="order-item" @click="navigateTo('/pages/order/afterSales/afterSales')">
          <view class="bag bag5">
            <u-icon name="server-fill" size="22" color="#fff"></u-icon>
          </view>
          <view class="order-item-label">售后</view>
        </view>
        <view class="order-item" @click="navigateTo('/pages/order/myOrder?status=0')">
          <view class="bag bag1">
            <u-icon name="order" size="22" color="#fff"></u-icon>
          </view>
          <view class="order-item-label">我的订单</view>
        </view>
      </view>
    </div>
    <!-- 常用工具 -->

    <tool />

  </view>
</template>
<script>
import tool from "@/pages/tabbar/user/utils/tool.vue";
import { getCouponsNum, getFootprintNum } from "@/api/members.js";
import { getUserWallet } from "@/api/members";
import configs from '@/config/config'
export default {
  components: {
    tool,
  },
  data() {
    return {
      configs,
      userImage:configs.defaultUserPhoto,
      coverTransform: "translateY(0px)",
      coverTransition: "0s",
      moving: false,
      userInfo: {},
      couponNum: "",
      footNum: "",
      walletNum: "",
    };
  },
  onLoad() { },
  onShow() {
    this.userInfo = this.isLogin() || {};
    if (this.isLogin("auth")) {
      this.getUserOrderNum();
    } else {
      this.walletNum = 0;
      this.couponNum = 0;
      this.footNum = 0;
    }
  },
  onPullDownRefresh() {
    this.getUserOrderNum();
    this.userInfo = this.isLogin();
  },
  // #ifndef MP
  onNavigationBarButtonTap(e) {
    const index = e.index;
    if (index === 0) {
      this.navigateTo("/pages/mine/set/setUp");
    }
  },
  // #endif

  mounted() { },
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
        : this.navigateToLogin();;
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

.user {
  .header {
    max-width: 100%;
    padding: calc(50rpx + var(--status-bar-height)) 30rpx 0 6%;
    height: calc(var(--status-bar-height) + 360rpx);
    background-size: cover;
    border-bottom-left-radius: 30rpx;
    border-bottom-right-radius: 30rpx;
    background-image: url("/static/img/main-bg.png");
    background-position: bottom;
    background-repeat: no-repeat;
    color: #ffffff;
    display: flex;
    align-items: center;

    .head-1 {
      flex-shrink: 0;
      width: 152rpx;

      .head-avatar {
        width: 152rpx;
        height: 144rpx;
        border-radius: 50%;
        border: 3px solid #fff;
        display: block;
      }

      .edti-head {
        position: absolute;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        top: 100rpx;
        right: 0;

        .head-avatar {
          width: 100%;
          height: 100%;
        }
      }
    }

    .head-2 {
      flex: 1;
      margin-left: 30rpx;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .header-arrow {
      flex-shrink: 0;
      margin-left: 20rpx;
    }
  }

  .pointBox {
    width: 94%;
    margin: 0 3%;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 24rpx 0 rgba($color: #f6f6f6, $alpha: 1);
  }

  .point {
    display: flex;
    align-items: center;
    text-align: center;
    height: 160rpx;
    font-size: $font-sm;
    // #ifdef MP-WEIXIN
    padding: 24rpx;
    // #endif

    .point-item {
      flex: 1;
      text-align: center;
    }

    .point-label {
      color: $u-main-color;
      font-size: 28rpx;
    }

    .point-value {
      margin-top: 8rpx;
      color: $main-color;
      font-size: $font-lg;
    }
  }

  .order {
    height: 140rpx;
    font-size: $font-sm;
    display: flex;
    align-items: center;
    padding: 0 3%;
    color: #999;

    .order-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .order-item-label {
      margin-top: 10rpx;
      line-height: 1.4;
      font-size: $font-sm;
    }
  }
}

.box {
  transform: translateY(-30rpx);
}

.user-name {
  font-size: 34rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bag {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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
