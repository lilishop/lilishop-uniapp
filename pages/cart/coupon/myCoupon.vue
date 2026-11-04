<template>
  <view class="b-content">
    <view class="coupon-tabs">
      <u-tabs
        :list="navList"
        keyName="text"
        :scrollable="false"
        :inactiveStyle="{ color: '#333' }"
        v-model:current="tabCurrentIndex"
        :lineColor="lightColor"
        :activeStyle="{ color: lightColor }"
      ></u-tabs>
    </view>
    <swiper
      :current="tabCurrentIndex"
      class="swiper-box"
      duration="300"
      @change="changeTab"
    >
      <swiper-item
        class="tab-content"
        v-for="(navItem, navIndex) in navList"
        :key="navIndex"
      >
        <scroll-view
          class="list-scroll-content"
          scroll-y
          @scrolltolower="loadData"
        >
          <u-empty
            mode="coupon"
            text="暂无优惠券了"
            v-if="navItem.whetherEmpty"
          ></u-empty>

          <view
            class="coupon-card"
            :class="{ 'coupon-used': navIndex != 0, 'coupon-expired': navIndex == 2 }"
            v-for="(coupon, index) in navItem.dataList"
            :key="index"
          >
            <view class="coupon-card-left">
              <text class="coupon-price-symbol" v-if="coupon.couponType != 'DISCOUNT'">¥</text>
              <text class="coupon-price-value">{{ coupon.couponType == 'DISCOUNT' ? coupon.discount + '折' : unitPrice(coupon.price) }}</text>
            </view>
            <view class="coupon-divider"></view>
            <view class="coupon-card-right">
              <view class="coupon-info">
                <text class="coupon-card-name">{{ coupon.title }}</text>
                <text class="coupon-card-desc">{{ coupon.consumeThreshold > 0 ? '满' + unitPrice(coupon.consumeThreshold) + '元可用' : '无门槛使用' }}</text>
                <text class="coupon-card-desc">使用范围：{{
                  coupon.scopeType == "ALL" && coupon.storeId == "0"
                    ? "全平台"
                    : coupon.scopeType == "PORTION_GOODS"
                    ? "部分商品"
                    : coupon.scopeType == "PORTION_GOODS_CATEGORY"
                    ? "部分分类商品"
                    : coupon.storeName == "platform"
                    ? "全平台"
                    : coupon.storeName + ""
                }}使用</text>
                <text class="coupon-card-time" v-if="coupon.endTime">{{ coupon.endTime }}</text>
              </view>
              <view class="coupon-status-btn" v-if="navIndex == 0" @click="useItNow(coupon)">
                立即使用
              </view>
              <view class="coupon-status-btn disabled" v-else-if="navIndex == 1">
                已使用
              </view>
              <view class="coupon-status-btn disabled" v-else>
                已过期
              </view>
            </view>
          </view>
          <uni-load-more :status="navItem.loadStatus"></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { getMemberCoupons } from '@/api/members.js'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const tabCurrentIndex = ref(0)
const navList = ref([
  {
    text: '未使用',
    loadStatus: 'more',
    dataList: [] as any[],
    params: {
      memberCouponStatus: 'NEW',
      pageNumber: 1,
      pageSize: 10,
      status: 1,
    },
    whetherEmpty: false,
  },
  {
    text: '已使用',
    loadStatus: 'more',
    dataList: [] as any[],
    params: {
      memberCouponStatus: 'USED',
      pageNumber: 1,
      pageSize: 10,
      status: 2,
    },
    whetherEmpty: false,
  },
  {
    text: '已过期',
    loadStatus: 'more',
    dataList: [] as any[],
    params: {
      memberCouponStatus: 'EXPIRE',
      pageNumber: 1,
      pageSize: 10,
      status: 3,
    },
    whetherEmpty: false,
  },
])

onShow(() => {
  navList.value[tabCurrentIndex.value].params.pageNumber = 1
  navList.value[tabCurrentIndex.value].dataList = []
  getData()
})

watch(tabCurrentIndex, (val) => {
  if (navList.value[val].dataList.length == 0) getData()
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function handleTabClick(index: number) {
  tabCurrentIndex.value = index
}

function getData() {
  uni.showLoading({ title: '加载中' })
  const index = tabCurrentIndex.value
  getMemberCoupons(navList.value[index].params).then((res) => {
    uni.stopPullDownRefresh()
    if (res.data.success) {
      const data = res.data.result.records
      if (data.length == 0) {
        if (res.data.pageNumber == 1) {
          navList.value[index].whetherEmpty = true
        } else {
          navList.value[index].loadStatus = 'noMore'
        }
      } else if (data.length < 10) {
        navList.value[index].loadStatus = 'noMore'
        navList.value[index].dataList.push(...data)
      } else {
        navList.value[index].dataList.push(...data)
      }
    }
    hideLoadingIfNeeded()
  })
}

function changeTab(e: any) {
  tabCurrentIndex.value = e.detail.current
}

function loadData() {
  const index = tabCurrentIndex.value
  if (navList.value[index].loadStatus != 'noMore') {
    navList.value[index].params.pageNumber++
    getData()
  }
}

function useItNow(item: any) {
  uni.navigateTo({
    url: `/pages/navigation/search/searchPage?promotionsId=${item.couponId}&promotionType=COUPON`,
  })
}

function couponDetail(item: any) {
  uni.navigateTo({
    url: '/pages/cart/coupon/couponDetail?item=' + encodeURIComponent(JSON.stringify(item)),
  })
}
</script>

<style lang="scss" scoped>
.b-content {
  background: #f7f8fa;
  min-height: 100vh;
}

.coupon-tabs {
  background: #fff;
  height: 88rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 2;
}

:deep(.u-tabs),
:deep(.u-tabs__wrapper),
:deep(.u-tabs__wrapper__scroll-view-wrapper),
:deep(.u-tabs__wrapper__scroll-view),
:deep(.u-tabs__wrapper__nav) {
  background: #fff;
  height: 88rpx;
}

:deep(.u-tabs__wrapper__nav__item) {
  min-height: 88rpx;
}

:deep(.u-tabs__wrapper__nav__item__text) {
  color: #333;
  font-size: 28rpx;
}

.swiper-box {
  height: calc(100vh - 88rpx - var(--status-bar-height));
}

.list-scroll-content {
  height: 100%;
  width: 100%;
  padding: 24rpx;
  box-sizing: border-box;
}

.coupon-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  position: relative;
  box-shadow: none;
  border: 1rpx solid #f0f1f5;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 32rpx;
    height: 32rpx;
    background: #f7f8fa;
    border-radius: 50%;
    left: 204rpx;
    z-index: 2;
    box-shadow: inset 0 0 0 1rpx #eceef2;
  }

  &::before {
    top: -16rpx;
  }

  &::after {
    bottom: -16rpx;
  }

  &.coupon-used {
    .coupon-card-left {
      background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
      color: #999;
    }
    .coupon-status-btn {
      background: #ccc;
      box-shadow: none;
    }
  }

  &.coupon-expired {
    .coupon-card-left {
      background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
      color: #999;
    }
    .coupon-status-btn {
      background: #ccc;
      box-shadow: none;
    }
  }
}

.coupon-card-left {
  width: 220rpx;
  min-height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ff3b30;
  position: relative;
  background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
}

.coupon-price-symbol {
  font-size: 32rpx;
  font-weight: 700;
  margin-right: 4rpx;
}

.coupon-price-value {
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1rpx;
}

.coupon-divider {
  position: absolute;
  left: 220rpx;
  top: 24rpx;
  bottom: 24rpx;
  width: 0;
  border-left: 2rpx dashed #eceef2;
}

.coupon-card-right {
  flex: 1;
  padding: 32rpx 32rpx 32rpx 40rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  background: #fff;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex: 1;
  min-width: 0;
}

.coupon-card-name {
  font-size: 30rpx;
  color: #111;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.coupon-card-desc {
  font-size: 24rpx;
  color: #8a8f99;
  font-weight: 500;
}

.coupon-card-time {
  font-size: 22rpx;
  color: #b0b3bf;
}

.coupon-status-btn {
  flex-shrink: 0;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b35, #ff4b2b);

  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background: #ccc;
    box-shadow: none;
  }
}
</style>
