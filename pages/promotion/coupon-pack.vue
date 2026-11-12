<!--
 * 优惠券礼包（券包一键领）专属落地页
 * 支持H5及微信小程序环境访问，提供礼包明细展示、总价值汇总、一键领券及凑单导购
 *
 * @author Bulbasaur
 * @since 2026-11-12
-->
<template>
  <view class="coupon-pack-page">
    <!-- 顶部氛围 Banner -->
    <view class="banner-box">
      <view class="banner-decor decor-1"></view>
      <view class="banner-decor decor-2"></view>
      <view class="banner-content">
        <text class="pack-badge">限时专享福利</text>
        <text class="pack-title">{{ detail.activityName || '专属超值优惠券礼包' }}</text>
        <view class="total-amount-box">
          <text class="currency">¥</text>
          <text class="amount">{{ detail.totalAmount || 0 }}</text>
          <text class="amount-tip">立省总额</text>
        </view>
        <text class="time-tip" v-if="detail.endTime">
          活动有效期至：{{ formatTime(detail.endTime) }}
        </text>
      </view>
    </view>

    <!-- 券包内优惠券列表 -->
    <view class="coupon-list-container">
      <view class="section-header">
        <text class="title">礼包包含优惠券 (共{{ couponCount }}张)</text>
      </view>

      <view v-if="detail.couponItems && detail.couponItems.length > 0" class="coupon-card-list">
        <view 
          v-for="(item, index) in detail.couponItems" 
          :key="index"
          class="coupon-card"
        >
          <!-- 左侧面额 -->
          <view class="card-left">
            <template v-if="item.couponType === 'PRICE'">
              <text class="symbol">¥</text>
              <text class="price">{{ item.price || 0 }}</text>
            </template>
            <template v-else>
              <text class="price">{{ item.couponDiscount || 0 }}</text>
              <text class="symbol">折</text>
            </template>
            <text class="threshold">
              {{ item.consumeThreshold > 0 ? `满${item.consumeThreshold}元可用` : '无门槛' }}
            </text>
          </view>

          <!-- 中部信息 -->
          <view class="card-center">
            <view class="name-box">
              <text class="coupon-tag">{{ item.couponType === 'PRICE' ? '满减券' : '折扣券' }}</text>
              <text class="coupon-name">{{ item.couponName }}</text>
            </view>
            <text class="coupon-num">发放数量：{{ item.num || 1 }} 张</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-box">
        <text class="empty-text">礼包暂无可用优惠券或活动已结束</text>
      </view>
    </view>

    <!-- 活动规则说明 -->
    <view class="rules-container">
      <view class="rules-title">活动说明</view>
      <view class="rules-content">
        <text class="rule-item">1. 每位用户活动期间仅限一键领取本礼包 1 次；</text>
        <text class="rule-item">2. 领取成功后优惠券将自动发放至【我的 - 优惠券】中；</text>
        <text class="rule-item">3. 优惠券不可兑现、不找零，下单结算时满足条件自动抵扣；</text>
        <text class="rule-item">4. 礼包内优惠券使用规则及有效期以各券券面标注为准。</text>
      </view>
    </view>

    <!-- 底部悬浮操作栏 -->
    <view class="bottom-action-bar">
      <button 
        v-if="!isLogin"
        class="action-btn primary-btn"
        @click="toLogin"
      >
        登录并一键领取 (¥{{ detail.totalAmount || 0 }})
      </button>

      <button 
        v-else-if="detail.hasReceived"
        class="action-btn success-btn"
        @click="toUse"
      >
        已领取，去挑选商品凑单 >
      </button>

      <button 
        v-else
        class="action-btn primary-btn"
        :loading="loading"
        @click="handleReceive"
      >
        一键领取全部 (¥{{ detail.totalAmount || 0 }})
      </button>
    </view>
  </view>
</template>

<script>
/**
 * 优惠券礼包落地页交互逻辑
 *
 * @author Bulbasaur
 * @since 2026-11-12
 */
import { getCouponPackageDetail, receiveCouponPackage } from "@/api/promotions.js";
import storage from "@/utils/storage.js";

export default {
  data() {
    return {
      packId: "",
      detail: {
        id: "",
        activityName: "",
        totalAmount: 0,
        endTime: "",
        hasReceived: false,
        couponItems: []
      },
      loading: false,
      isLogin: false
    };
  },
  computed: {
    couponCount() {
      if (!this.detail.couponItems) return 0;
      return this.detail.couponItems.reduce((acc, cur) => acc + (cur.num || 1), 0);
    }
  },
  onLoad(options) {
    if (options && options.id) {
      this.packId = options.id;
    } else if (options && options.scene) {
      // 兼容微信小程序太阳码 scene 参数 (如 scene=pack_123)
      const sceneStr = decodeURIComponent(options.scene);
      if (sceneStr.startsWith("pack_")) {
        this.packId = sceneStr.replace("pack_", "");
      } else {
        this.packId = sceneStr;
      }
    }

    this.checkLoginStatus();
    this.fetchDetail();
  },
  onShow() {
    this.checkLoginStatus();
    if (this.packId) {
      this.fetchDetail();
    }
  },
  methods: {
    checkLoginStatus() {
      const accessToken = storage.getAccessToken();
      this.isLogin = !!accessToken;
    },
    async fetchDetail() {
      if (!this.packId) {
        uni.showToast({ title: "活动参数缺失", icon: "none" });
        return;
      }
      try {
        const res = await getCouponPackageDetail(this.packId);
        if (res.data.success && res.data.result) {
          this.detail = res.data.result;
        } else {
          uni.showToast({
            title: res.data.message || "获取券包失败",
            icon: "none"
          });
        }
      } catch (e) {
        console.error("加载券包详情异常", e);
      }
    },
    async handleReceive() {
      if (!this.isLogin) {
        this.toLogin();
        return;
      }
      if (this.loading) return;
      this.loading = true;
      uni.showLoading({ title: "领取中..." });
      try {
        const res = await receiveCouponPackage(this.packId);
        uni.hideLoading();
        this.loading = false;
        if (res.data.success) {
          uni.showModal({
            title: "领取成功",
            content: `恭喜！已成功领取礼包内 ${this.couponCount} 张优惠券，快去挑选商品吧！`,
            confirmText: "立即去逛",
            cancelText: "留在此页",
            success: (modalRes) => {
              this.detail.hasReceived = true;
              if (modalRes.confirm) {
                this.toUse();
              }
            }
          });
        } else {
          uni.showToast({
            title: res.data.message || "领取失败，请稍后重试",
            icon: "none"
          });
        }
      } catch (err) {
        uni.hideLoading();
        this.loading = false;
        console.error("一键领券异常", err);
      }
    },
    toLogin() {
      uni.navigateTo({
        url: "/pages/passport/login"
      });
    },
    toUse() {
      uni.switchTab({
        url: "/pages/tabbar/home/index"
      });
    },
    formatTime(timeStr) {
      if (!timeStr) return "";
      return String(timeStr).replace("T", " ").substring(0, 16);
    }
  }
};
</script>

<style lang="scss" scoped>
.coupon-pack-page {
  min-height: 100vh;
  background-color: #f6f7f9;
  padding-bottom: 140rpx;
  box-sizing: border-box;

  .banner-box {
    position: relative;
    background: linear-gradient(135deg, #ff4142 0%, #ff6b4a 100%);
    padding: 60rpx 40rpx 50rpx;
    color: #fff;
    overflow: hidden;

    .banner-decor {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);

      &.decor-1 {
        width: 300rpx;
        height: 300rpx;
        top: -100rpx;
        right: -80rpx;
      }
      &.decor-2 {
        width: 200rpx;
        height: 200rpx;
        bottom: -60rpx;
        left: -40rpx;
      }
    }

    .banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .pack-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.4);
        padding: 4rpx 20rpx;
        border-radius: 30rpx;
        font-size: 22rpx;
        margin-bottom: 16rpx;
        letter-spacing: 2rpx;
      }

      .pack-title {
        font-size: 38rpx;
        font-weight: bold;
        margin-bottom: 24rpx;
      }

      .total-amount-box {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 16rpx;

        .currency {
          font-size: 40rpx;
          font-weight: bold;
        }

        .amount {
          font-size: 88rpx;
          font-weight: 800;
          line-height: 1;
          margin: 0 8rpx;
        }

        .amount-tip {
          font-size: 24rpx;
          background: #ffe175;
          color: #b33b00;
          padding: 2rpx 12rpx;
          border-radius: 8rpx;
          font-weight: bold;
        }
      }

      .time-tip {
        font-size: 22rpx;
        opacity: 0.85;
      }
    }
  }

  .coupon-list-container {
    padding: 30rpx 24rpx 10rpx;

    .section-header {
      margin-bottom: 20rpx;
      .title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .coupon-card-list {
      .coupon-card {
        display: flex;
        align-items: center;
        background: #fff;
        border-radius: 16rpx;
        margin-bottom: 20rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
        position: relative;

        .card-left {
          width: 220rpx;
          background: linear-gradient(135deg, #fff2f0 0%, #ffe9e7 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30rpx 10rpx;
          border-right: 2rpx dashed #ffccc7;

          .symbol {
            font-size: 28rpx;
            color: #ff4142;
            font-weight: bold;
          }

          .price {
            font-size: 52rpx;
            font-weight: 800;
            color: #ff4142;
            line-height: 1;
          }

          .threshold {
            font-size: 20rpx;
            color: #888;
            margin-top: 8rpx;
          }
        }

        .card-center {
          flex: 1;
          padding: 24rpx;

          .name-box {
            display: flex;
            align-items: center;
            margin-bottom: 12rpx;

            .coupon-tag {
              background: #ff4142;
              color: #fff;
              font-size: 18rpx;
              padding: 2rpx 8rpx;
              border-radius: 6rpx;
              margin-right: 12rpx;
              flex-shrink: 0;
            }

            .coupon-name {
              font-size: 28rpx;
              font-weight: bold;
              color: #222;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .coupon-num {
            font-size: 22rpx;
            color: #ff8533;
          }
        }
      }
    }

    .empty-box {
      background: #fff;
      padding: 60rpx 20rpx;
      text-align: center;
      border-radius: 16rpx;

      .empty-text {
        font-size: 26rpx;
        color: #999;
      }
    }
  }

  .rules-container {
    margin: 20rpx 24rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;

    .rules-title {
      font-size: 26rpx;
      font-weight: bold;
      color: #555;
      margin-bottom: 14rpx;
    }

    .rules-content {
      display: flex;
      flex-direction: column;

      .rule-item {
        font-size: 22rpx;
        color: #888;
        line-height: 1.6;
        margin-bottom: 6rpx;
      }
    }
  }

  .bottom-action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
    z-index: 99;

    .action-btn {
      width: 100%;
      height: 84rpx;
      line-height: 84rpx;
      border-radius: 42rpx;
      font-size: 30rpx;
      font-weight: bold;
      border: none;

      &.primary-btn {
        background: linear-gradient(135deg, #ff4142 0%, #ff6b4a 100%);
        color: #fff;
      }

      &.success-btn {
        background: #f0f7f2;
        color: #2b8555;
        border: 1px solid #c2e5d3;
      }
    }
  }
}
</style>
