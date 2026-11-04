<template>
  <view class="tpl-coupon" :class="{ styled: styled }" :style="wrapperStyle" v-if="couponList.length || !styled">
    <view class="coupon-title" v-if="title">{{ title }}</view>

    <!-- 老数据保持原样 -->
    <block v-if="!styled">
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
          <view class="coupon-threshold">{{ item.consumeThreshold > 0 ? '满' + unitPrice(item.consumeThreshold) + '元可用' : '无门槛使用' }}</view>
        </view>
        <view class="coupon-right">
          <view class="coupon-name">
            {{ item.storeName == 'platform' ? '全平台通用' : item.storeName + '店铺' }}
          </view>
          <view class="coupon-btn">立即领取</view>
        </view>
      </view>
    </block>

    <!-- 样式一：红色大卡横滑，右侧竖排领取 -->
    <scroll-view
      v-else-if="layoutStyle === '1'"
      scroll-x
      class="cp-scroll"
      :show-scrollbar="false"
    >
      <view
        class="cp1-item"
        v-for="item in couponList"
        :key="item.id"
        :style="itemGapStyle"
        @click="receive(item)"
      >
        <view class="cp1-left">
          <view class="cp1-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <text class="cp1-value">{{ item.couponDiscount }}</text>
              <text class="cp1-symbol">折</text>
            </template>
            <template v-else>
              <text class="cp1-symbol">¥</text>
              <text class="cp1-value">{{ unitPrice(item.price) }}</text>
            </template>
          </view>
          <view class="cp1-threshold">{{ thresholdText(item) }}</view>
        </view>
        <view class="cp1-right">
          <text>领</text><text>取</text>
        </view>
        <view class="cp-notch cp-notch-t"></view>
        <view class="cp-notch cp-notch-b"></view>
      </view>
    </scroll-view>

    <!-- 样式二：白底小卡，底部去领取按钮 -->
    <scroll-view
      v-else-if="layoutStyle === '2'"
      scroll-x
      class="cp-scroll"
      :show-scrollbar="false"
    >
      <view
        class="cp2-item"
        v-for="item in couponList"
        :key="item.id"
        :style="itemGapStyle"
        @click="receive(item)"
      >
        <view class="cp2-top">
          <view class="cp2-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <text class="cp2-value">{{ item.couponDiscount }}</text>
              <text class="cp2-symbol">折</text>
            </template>
            <template v-else>
              <text class="cp2-symbol">¥</text>
              <text class="cp2-value">{{ unitPrice(item.price) }}</text>
            </template>
          </view>
          <view class="cp2-threshold">{{ thresholdText(item) }}</view>
        </view>
        <view class="cp2-btn">去领取</view>
      </view>
    </scroll-view>

    <!-- 样式三：浅粉虚线卡，右侧竖排立即领取 -->
    <scroll-view
      v-else-if="layoutStyle === '3'"
      scroll-x
      class="cp-scroll"
      :show-scrollbar="false"
    >
      <view
        class="cp3-item"
        v-for="item in couponList"
        :key="item.id"
        :style="itemGapStyle"
        @click="receive(item)"
      >
        <view class="cp3-left">
          <view class="cp3-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <text class="cp3-value">{{ item.couponDiscount }}</text>
              <text class="cp3-symbol">折</text>
            </template>
            <template v-else>
              <text class="cp3-symbol">¥</text>
              <text class="cp3-value">{{ unitPrice(item.price) }}</text>
            </template>
          </view>
          <view class="cp3-threshold">{{ thresholdText(item) }}</view>
        </view>
        <view class="cp3-right">
          <text>立</text><text>即</text><text>领</text><text>取</text>
        </view>
        <view class="cp-notch cp-notch-t"></view>
        <view class="cp-notch cp-notch-b"></view>
      </view>
    </scroll-view>

    <!-- 样式四：浅粉渐变 + 右侧渐变竖条领取 -->
    <scroll-view v-else scroll-x class="cp-scroll" :show-scrollbar="false">
      <view
        class="cp4-item"
        v-for="item in couponList"
        :key="item.id"
        :style="itemGapStyle"
        @click="receive(item)"
      >
        <view class="cp4-left">
          <view class="cp4-amount">
            <template v-if="item.couponType == 'DISCOUNT'">
              <text class="cp4-value">{{ item.couponDiscount }}</text>
              <text class="cp4-symbol">折</text>
            </template>
            <template v-else>
              <text class="cp4-symbol">¥</text>
              <text class="cp4-value">{{ unitPrice(item.price) }}</text>
            </template>
          </view>
          <view class="cp4-threshold">{{ thresholdText(item) }}</view>
        </view>
        <view class="cp4-right">
          <text>领</text><text>取</text>
        </view>
        <view class="cp-notch cp-notch-t"></view>
        <view class="cp-notch cp-notch-b"></view>
      </view>
    </scroll-view>
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
const count = computed(() => props.res?.list?.[0]?.count || 5);
const layoutStyle = computed(() => (props.res && props.res.layoutStyle) || "1");

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const itemGapStyle = computed(() => {
  if (!styled.value) return {};
  const gap = props.res?.contentGap !== undefined ? Number(props.res.contentGap) || 0 : 5;
  return { marginRight: `${gap}rpx` };
});
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (styled.value) {
    const bg =
      !res.bgColor2 || res.bgColor1 === res.bgColor2
        ? res.bgColor1
        : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
    const radius = Number(res.borderRadius) || 0;
    return {
      background: bg,
      padding: `${Number(res.paddingTop) || 0}rpx ${Number(res.paddingX) || 0}rpx ${Number(res.paddingBottom) || 0}rpx`,
      marginBottom: `${Number(res.pageGap) || 0}rpx`,
      borderRadius: `${radius}rpx`,
      overflow: "hidden",
    };
  }
  return {
    background: res.bgColor || "#FFFFFF",
    padding: `20rpx ${res.paddingX ?? 0}rpx`,
    marginBottom: `${res.pageGap ?? 0}rpx`,
    borderRadius: `${res.borderRadius ?? 0}rpx`,
    overflow: "hidden",
  };
});

onMounted(() => {
  getAllCoupons({ pageNumber: 1, pageSize: count.value }).then((res) => {
    if (res.data.code == 200 && res.data.result) {
      couponList.value = (res.data.result.records || []).slice(0, count.value);
    }
  });
});

function thresholdText(item: any) {
  const t = Number(unitPrice(item.consumeThreshold));
  return t > 0 ? `满${unitPrice(item.consumeThreshold)}元可用` : "无门槛使用";
}

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
.tpl-coupon.styled .coupon-item {
  margin: 0;
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

/* 参考 CRMEB 优惠券组件 */
.tpl-coupon.styled .coupon-title {
  padding: 0 0 16rpx;
}
.cp-scroll {
  white-space: nowrap;
}
.cp1-item:last-child,
.cp2-item:last-child,
.cp3-item:last-child,
.cp4-item:last-child {
  margin-right: 0 !important;
}
.cp-notch {
  position: absolute;
  right: 60rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #fff;
}
.cp-notch-t {
  top: -8rpx;
}
.cp-notch-b {
  bottom: -8rpx;
}

/* 样式一：红色大卡 */
.cp1-item {
  position: relative;
  display: inline-flex;
  width: 264rpx;
  height: 132rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: linear-gradient(135deg, #ff5a36, #e1251b);
  color: #fff;
  vertical-align: top;
}
.cp1-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 24rpx;
}
.cp1-value {
  font-size: 40rpx;
  font-weight: 700;
}
.cp1-symbol {
  font-size: 22rpx;
}
.cp1-threshold {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4rpx;
}
.cp1-right {
  width: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  border-left: 2rpx dashed rgba(255, 255, 255, 0.6);
}
.cp1-item .cp-notch {
  right: 52rpx;
}

/* 样式二：白底小卡 */
.cp2-item {
  display: inline-flex;
  flex-direction: column;
  width: 148rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: #fff;
  border-left: 4rpx solid #f5483a;
  border-right: 4rpx solid #f5483a;
  overflow: hidden;
  vertical-align: top;
}
.cp2-top {
  padding: 16rpx 0 12rpx;
  text-align: center;
}
.cp2-value {
  font-size: 34rpx;
  font-weight: 700;
  color: #e1251b;
}
.cp2-symbol {
  font-size: 20rpx;
  color: #e1251b;
}
.cp2-threshold {
  font-size: 18rpx;
  color: #999;
  margin-top: 2rpx;
}
.cp2-btn {
  background: linear-gradient(90deg, #ff6a3d, #e1251b);
  color: #fff;
  font-size: 20rpx;
  text-align: center;
  padding: 8rpx 0;
}

/* 样式三：浅粉虚线卡 */
.cp3-item {
  position: relative;
  display: inline-flex;
  width: 276rpx;
  height: 120rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  background: #fdf1ec;
  border: 2rpx dashed #f5483a;
  vertical-align: top;
}
.cp3-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 24rpx;
}
.cp3-value {
  font-size: 38rpx;
  font-weight: 700;
  color: #e1251b;
}
.cp3-symbol {
  font-size: 20rpx;
  color: #e1251b;
}
.cp3-threshold {
  font-size: 20rpx;
  color: #e1251b;
  margin-top: 2rpx;
}
.cp3-right {
  width: 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #e1251b;
  border-left: 2rpx dashed #f5483a;
}
.cp3-item .cp-notch {
  right: 56rpx;
}

/* 样式四：浅粉渐变 + 渐变竖条 */
.cp4-item {
  position: relative;
  display: inline-flex;
  width: 232rpx;
  height: 108rpx;
  margin-right: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
  vertical-align: top;
}
.cp4-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20rpx;
  background: linear-gradient(135deg, #fff3ec, #ffe0d3);
}
.cp4-value {
  font-size: 34rpx;
  font-weight: 700;
  color: #e1251b;
}
.cp4-symbol {
  font-size: 20rpx;
  color: #e1251b;
}
.cp4-threshold {
  font-size: 18rpx;
  color: #e1251b;
  margin-top: 2rpx;
}
.cp4-right {
  width: 52rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(180deg, #ff6a3d, #e1251b);
}
.cp4-item .cp-notch {
  right: 44rpx;
  width: 12rpx;
  height: 12rpx;
}
.cp4-item .cp-notch-t {
  top: -6rpx;
}
.cp4-item .cp-notch-b {
  bottom: -6rpx;
}
</style>
