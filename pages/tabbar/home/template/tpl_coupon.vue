<template>
  <view class="tpl-coupon" :style="wrapperStyle" v-if="couponList.length">
    <view class="coupon-title" v-if="title">{{ title }}</view>
    <view
      class="coupon-item"
      v-for="item in couponList"
      :key="item.id"
      @click="receive(item)"
    >
      <view class="coupon-left">
        <view class="coupon-amount">
          <template v-if="item.couponType == 'DISCOUNT'">
            <text class="coupon-value">{{ item.couponDiscount }}</text>
            <text class="coupon-symbol">折</text>
          </template>
          <template v-else>
            <text class="coupon-symbol">¥</text>
            <text class="coupon-value">{{ unitPrice(item.price) }}</text>
          </template>
        </view>
        <view class="coupon-threshold">满{{ unitPrice(item.consumeThreshold) }}元可用</view>
      </view>
      <view class="coupon-right">
        <view class="coupon-name">
          {{ item.storeName == 'platform' ? '全平台通用' : item.storeName + '店铺' }}
        </view>
        <view class="coupon-btn">立即领取</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getAllCoupons } from "@/api/promotions.js";
import { receiveCoupons } from "@/api/members.js";
import { isLogin, navigateToLogin, unitPrice } from "@/utils/filters.js";

const props = defineProps<{ res: any }>();

const couponList = ref<any[]>([]);

const title = computed(() => props.res?.list?.[0]?.title || "");
const count = computed(() => props.res?.list?.[0]?.count || 3);

const wrapperStyle = computed(() => ({
  background: props.res?.bgColor || "#FFFFFF",
  padding: `20rpx ${props.res?.paddingX ?? 0}rpx`,
  marginBottom: `${props.res?.pageGap ?? 10}rpx`,
  borderRadius: `${props.res?.borderRadius ?? 0}rpx`,
  overflow: "hidden",
}));

onMounted(() => {
  getAllCoupons({ pageNumber: 1, pageSize: count.value }).then((res) => {
    if (res.data.code == 200 && res.data.result) {
      couponList.value = (res.data.result.records || []).slice(0, count.value);
    }
  });
});

function receive(item: any) {
  if (!isLogin("auth")) {
    navigateToLogin("redirectTo");
    return;
  }
  receiveCoupons(item.id).then((res) => {
    if (res.data.code == 200) {
      uni.showToast({ title: "领取成功", icon: "none" });
    } else {
      uni.showToast({ title: res.data.message, icon: "none" });
    }
  });
}
</script>

<style lang="scss" scoped>
.tpl-coupon {
  font-size: 26rpx;
}
.coupon-title {
  font-size: 30rpx;
  font-weight: 600;
  padding: 8rpx 24rpx 20rpx;
}
.coupon-item {
  display: flex;
  margin: 0 20rpx 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: linear-gradient(90deg, #ffece8, #fff5f4);
}
.coupon-left {
  width: 180rpx;
  padding: 24rpx 0;
  text-align: center;
  color: var(--theme-primary, #e1251b);
  border-right: 2rpx dashed #f0c0bb;
}
.coupon-value {
  font-size: 40rpx;
  font-weight: 700;
}
.coupon-symbol {
  font-size: 24rpx;
}
.coupon-threshold {
  font-size: 22rpx;
}
.coupon-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}
.coupon-name {
  color: #333;
}
.coupon-btn {
  background: var(--theme-primary, #e1251b);
  color: #fff;
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
}
</style>
