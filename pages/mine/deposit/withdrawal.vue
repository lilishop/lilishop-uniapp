<template>
  <view class="page">
    <view class="form-card">
      <view class="field-label">提现类型</view>
      <view class="readonly-value">{{ typeLabel }}</view>
    </view>

    <view class="form-card">
      <view class="field-label">提现金额</view>
      <view class="amount-main">
        <view class="amount-left">
          <text class="currency">￥</text>
          <u-input
            v-model="price"
            type="digit"
            border="none"
            placeholder="请输入提现金额"
            input-align="left"
            class="amount-input"
          />
        </view>
        <view class="amount-extra">
          <text class="all-btn" @click="handleAll">全部</text>
          <text class="balance-tip">可提现金额 {{ unitPrice(walletNum) }} 元</text>
        </view>
      </view>
      <view class="tips">最低提现金额为 {{ minPrice }} 元</view>
    </view>

    <template v-if="type === 'ALI'">
      <view class="form-card">
        <view class="field-row">
          <text class="field-label">真实姓名</text>
          <u-input
            v-model="realName"
            border="none"
            input-align="right"
            placeholder="请输入真实姓名"
            class="field-input"
          />
        </view>
      </view>
      <view class="form-card">
        <view class="field-row">
          <text class="field-label">第三方登录账号</text>
          <u-input
            v-model="connectNumber"
            border="none"
            input-align="right"
            placeholder="请输入支付宝账号"
            class="field-input"
          />
        </view>
      </view>
    </template>

    <view class="submit" @click="cashd">提现</view>
  </view>
</template>

<script>
import { getUserWallet, withdrawalApply, withdrawalSettingVO } from "@/api/members";
export default {
  data() {
    return {
      price: "",
      walletNum: 0,
      minPrice: 0,
      type: "",
      connectNumber: "",
      realName: "",
    };
  },
  computed: {
    typeLabel() {
      if (this.type === "ALI") return "支付宝";
      if (this.type) return "微信";
      return "--";
    },
  },
  async mounted() {
    const result = await getUserWallet();
    const res = await withdrawalSettingVO();
    this.walletNum = result.data.result.memberWallet;
    this.minPrice = res.data.result.minPrice;
    this.type = res.data.result.type;
  },
  methods: {
    cashd() {
      const amount = Number(this.price);
      if (!this.$u.test.amount(parseInt(amount))) {
        uni.showToast({
          title: "请输入正确金额",
          duration: 2000,
          icon: "none",
        });
        return;
      }

      const params = { price: amount };
      if (this.type === "ALI") {
        if (!this.connectNumber || !this.realName) {
          uni.showToast({
            title: "请输入真实姓名和第三方登录账号",
            duration: 2000,
            icon: "none",
          });
          return;
        }
        params.connectNumber = this.connectNumber;
        params.realName = this.realName;
      }

      withdrawalApply(params).then((res) => {
        if (res.data.success) {
          uni.showToast({
            title: "提现成功!",
            duration: 2000,
            icon: "none",
          });
          setTimeout(() => {
            uni.navigateBack({ delta: 1 });
          }, 1000);
        }
      });
    },
    handleAll() {
      this.price = String(this.walletNum || "");
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.field-label {
  font-size: 30rpx;
  color: #333;
}

.readonly-value {
  margin-top: 20rpx;
  font-size: 32rpx;
  color: #666;
}

.amount-main {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #f0f0f0;
}

.amount-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.currency {
  flex-shrink: 0;
  margin-right: 12rpx;
  font-size: 56rpx;
  font-weight: 600;
  line-height: 1;
  color: #333;
}

.amount-input {
  flex: 1;
  min-width: 0;
}

.amount-extra {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 24rpx;
  padding-top: 8rpx;
}

.all-btn {
  font-size: 28rpx;
  color: $main-color;
  line-height: 1.4;
}

.balance-tip {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
  white-space: nowrap;
}

.tips {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.field-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.field-input {
  flex: 1;
  min-width: 0;
  margin-left: 24rpx;
}

:deep(.amount-input .u-input),
:deep(.field-input .u-input) {
  padding: 0 !important;
}

:deep(.amount-input .u-input__content),
:deep(.field-input .u-input__content) {
  background: transparent !important;
}

:deep(.amount-input .u-input__content__field-wrapper__field) {
  height: 72rpx !important;
  min-height: 72rpx !important;
  font-size: 56rpx !important;
  font-weight: 600 !important;
  color: #333 !important;
}

:deep(.amount-input .u-input__content__field-wrapper__field--placeholder) {
  font-size: 32rpx !important;
  font-weight: 400 !important;
  color: #c0c4cc !important;
}

:deep(.field-input .u-input__content__field-wrapper__field) {
  font-size: 28rpx !important;
  color: #666 !important;
}

.submit {
  margin-top: 56rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: $light-color;
  color: #fff;
  border-radius: 44rpx;
  text-align: center;
  font-size: 32rpx;
}
</style>
