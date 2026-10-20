<template>
  <view class="tpl-home-comb" :style="wrapperStyle">
    <!-- 高斯模糊轮播图背景 + 底部渐变遮罩 -->
    <view class="comb-bg">
      <image
        v-if="currentBannerImg"
        class="comb-bg-img"
        :src="currentBannerImg"
        mode="aspectFill"
      />
      <view class="comb-mask"></view>
    </view>

    <!-- 顶部状态栏占位（小程序/App） -->
    <view v-if="statusBarHeight" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 1. 搜索栏 -->
    <view class="comb-search-row" :style="searchRowStyle">
      <image
        v-if="res.searType === 'logo' && res.logoUrl"
        class="comb-logo"
        :src="res.logoUrl"
        mode="aspectFit"
      />
      <view class="comb-search-box" :style="searchBoxStyle" @click="onSearchTap">
        <u-icon name="search" :color="res.textColor || '#303133'" size="28rpx" />
        <text class="comb-search-text">{{ displayHotWord }}</text>
      </view>
    </view>

    <!-- 2. 分类选项卡 -->
    <view v-if="res.showTabs !== false" class="comb-tabs-wrap">
      <view class="comb-tabs">
        <scroll-view scroll-x class="comb-tabs-scroll" :show-scrollbar="false">
          <view class="comb-tabs-inner">
            <view
              v-for="(tab, idx) in displayTabs"
              :key="idx"
              class="comb-tab-item"
              :class="{ active: activeTabIndex === idx }"
              :style="{
                color:
                  activeTabIndex === idx
                    ? res.tabActiveColor || '#E93323'
                    : res.tabColor || '#FFFFFF',
              }"
              @click="onTabTap(tab, idx)"
            >
              <text>{{ tab.title || "未命名" }}</text>
              <view
                v-if="activeTabIndex === idx"
                class="comb-tab-line"
                :style="{ background: res.tabActiveColor || '#E93323' }"
              ></view>
            </view>
          </view>
        </scroll-view>
        <view class="comb-tab-toggle" @click="showMoreTabs = !showMoreTabs">
          <u-icon
            :name="showMoreTabs ? 'arrow-up' : 'arrow-down'"
            :color="res.tabColor || '#FFFFFF'"
            size="28rpx"
          />
        </view>
      </view>

      <!-- 下拉展开全部分类面板 -->
      <view v-if="showMoreTabs" class="comb-tabs-dropdown">
        <view
          v-for="(tab, idx) in displayTabs"
          :key="idx"
          class="dropdown-chip"
          :class="{ active: activeTabIndex === idx }"
          :style="
            activeTabIndex === idx
              ? {
                  color: res.tabActiveColor || '#E93323',
                  borderColor: res.tabActiveColor || '#E93323',
                }
              : {}
          "
          @click="onTabTap(tab, idx)"
        >
          {{ tab.title || "未命名" }}
        </view>
      </view>
    </view>

    <!-- 3. 轮播图区域 -->
    <view
      v-if="bannerList.length"
      class="comb-banner"
      :class="{ 'no-tabs': res.showTabs === false }"
    >
      <swiper
        class="comb-swiper"
        autoplay
        :interval="4500"
        :duration="500"
        circular
        :previous-margin="cardMode ? '48rpx' : '0rpx'"
        :next-margin="cardMode ? '48rpx' : '0rpx'"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(item, i) in bannerList" :key="i">
          <view
            class="comb-slide-item"
            :class="{ 'is-card': cardMode, active: i === currentSlide }"
            @click="onBannerTap(item)"
          >
            <image
              class="comb-slide-img"
              :style="bannerImgStyle"
              :src="item.img"
              mode="scaleToFill"
            />
          </view>
        </swiper-item>
      </swiper>

      <!-- 指示器 -->
      <view
        v-if="res.indicatorStyle !== 'none' && bannerList.length > 1"
        class="comb-indicator"
        :class="'pos-' + (res.indicatorPosition || 'center')"
      >
        <view
          v-for="(item, i) in bannerList"
          :key="i"
          class="dot"
          :class="[res.indicatorStyle || 'round', { active: i === currentSlide }]"
          :style="
            i === currentSlide
              ? { background: res.indicatorColor || '#E93323' }
              : {}
          "
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { modelNavigateTo } from "./tpl";

const props = defineProps<{ res: any }>();

const toRpx = (v: any) => `${Number(v) || 0}rpx`;

// 状态栏与胶囊避让
const statusBarHeight = ref(0);
const capsuleRightPad = ref(0);

onMounted(() => {
  try {
    const info = uni.getWindowInfo();
    // #ifdef MP-WEIXIN || APP-PLUS
    statusBarHeight.value = info.statusBarHeight || 0;
    // #endif
    // #ifdef MP-WEIXIN
    const menu = uni.getMenuButtonBoundingClientRect();
    capsuleRightPad.value = Math.max(0, info.windowWidth - menu.left + 8);
    // #endif
  } catch (e) {
    statusBarHeight.value = 0;
  }
});

// 搜索热词轮换
const hotIndex = ref(0);
let hotTimer: ReturnType<typeof setInterval> | null = null;
const validHotWords = computed(() =>
  (props.res?.hotWords || []).filter((w: string) => w && String(w).trim())
);
const displayHotWord = computed(() => {
  if (validHotWords.value.length) {
    return validHotWords.value[hotIndex.value % validHotWords.value.length];
  }
  return props.res?.placeWords || "搜索商品名称";
});

function stopHotTimer() {
  if (hotTimer) {
    clearInterval(hotTimer);
    hotTimer = null;
  }
}

watch(
  () => [validHotWords.value.length, props.res?.hotInterval],
  () => {
    stopHotTimer();
    hotIndex.value = 0;
    if (validHotWords.value.length > 1) {
      hotTimer = setInterval(() => {
        hotIndex.value = (hotIndex.value + 1) % validHotWords.value.length;
      }, (Number(props.res?.hotInterval) || 3) * 1000);
    }
  },
  { immediate: true }
);

onBeforeUnmount(stopHotTimer);

// 选项卡
const activeTabIndex = ref(0);
const showMoreTabs = ref(false);
const displayTabs = computed(() => {
  const custom = Array.isArray(props.res?.tabList) ? props.res.tabList : [];
  return [{ title: "首页", isHome: true }, ...custom];
});

function onTabTap(tab: any, idx: number) {
  activeTabIndex.value = idx;
  showMoreTabs.value = false;
  if (tab.isHome || !tab.value) return;
  if (tab.dataType === "special") {
    uni.navigateTo({
      url: `/pages/tabbar/special/special?id=${tab.value}`,
    });
  } else if (tab.dataType === "category") {
    uni.navigateTo({
      url: `/pages/navigation/search/searchPage?category=${tab.value}`,
    });
  }
}

// 轮播图
const currentSlide = ref(0);
const bannerList = computed(() =>
  Array.isArray(props.res?.list) ? props.res.list : []
);
const cardMode = computed(() => (props.res?.swiperStyle || "card") === "card");
const currentBannerImg = computed(() => {
  const list = bannerList.value;
  if (!list.length) return "";
  const item = list[currentSlide.value % list.length] || list[0];
  return item?.img || "";
});

function onSwiperChange(e: any) {
  currentSlide.value = e?.detail?.current ?? 0;
}

function onBannerTap(item: any) {
  if (item) modelNavigateTo(item);
}

function onSearchTap() {
  const keyword = validHotWords.value.length ? displayHotWord.value : "";
  const query = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
  uni.navigateTo({
    url: `/pages/navigation/search/searchPage${query}`,
  });
}

// 样式计算
const wrapperStyle = computed(() => ({
  marginBottom: toRpx(props.res?.pageGap ?? 0),
}));

const searchRowStyle = computed(() =>
  capsuleRightPad.value ? { paddingRight: `${capsuleRightPad.value}px` } : {}
);

const searchBoxStyle = computed(() => {
  const r = props.res || {};
  const align = r.textAlign || "left";
  return {
    background: r.boxColor || "#FFFFFF",
    color: r.textColor || "#303133",
    borderRadius: toRpx(r.searchRadius ?? 30),
    justifyContent:
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start",
  };
});

const bannerImgStyle = computed(() => ({
  borderRadius: toRpx(props.res?.bannerRadius ?? 14),
}));
</script>

<style lang="scss" scoped>
.tpl-home-comb {
  position: relative;
  overflow: hidden;
  padding: 16rpx 20rpx 20rpx;
  box-sizing: border-box;
}

.comb-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #e93323 0%, #f5f5f5 100%);
  .comb-bg-img {
    width: 100%;
    height: 100%;
    transform: scale(1.25);
    filter: blur(40rpx);
    display: block;
  }
  .comb-mask {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 180rpx;
    background: linear-gradient(180deg, rgba(245, 245, 245, 0) 0%, #f5f5f5 100%);
  }
}

.comb-search-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.comb-logo {
  width: 138rpx;
  height: 48rpx;
  flex-shrink: 0;
}

.comb-search-box {
  flex: 1;
  min-width: 0;
  height: 60rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.comb-search-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comb-tabs-wrap {
  position: relative;
  z-index: 3;
  margin-top: 8rpx;
}

.comb-tabs {
  display: flex;
  align-items: center;
  height: 72rpx;
}

.comb-tabs-scroll {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.comb-tabs-inner {
  display: inline-flex;
  align-items: center;
  gap: 32rpx;
}

.comb-tab-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 68rpx;
  font-size: 26rpx;
  white-space: nowrap;
  &.active {
    font-size: 28rpx;
    font-weight: 600;
  }
  .comb-tab-line {
    position: absolute;
    left: 50%;
    bottom: 4rpx;
    transform: translateX(-50%);
    width: 36rpx;
    height: 4rpx;
    border-radius: 4rpx;
  }
}

.comb-tab-toggle {
  flex-shrink: 0;
  padding-left: 16rpx;
  display: flex;
  align-items: center;
}

.comb-tabs-dropdown {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-top: 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.dropdown-chip {
  padding: 8rpx 24rpx;
  background: #f5f5f5;
  border: 2rpx solid transparent;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333333;
}

.comb-banner {
  position: relative;
  z-index: 2;
  margin-top: 12rpx;
  height: 300rpx;
  &.no-tabs {
    margin-top: 20rpx;
  }
}

.comb-swiper {
  width: 100%;
  height: 300rpx;
}

.comb-slide-item {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  &.is-card {
    padding: 0 8rpx;
    transform: scale(0.92);
    transition: transform 0.35s ease;
    &.active {
      transform: scale(1);
    }
  }
}

.comb-slide-img {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}

.comb-indicator {
  position: absolute;
  bottom: 16rpx;
  display: flex;
  align-items: center;
  z-index: 3;
  &.pos-left {
    left: 32rpx;
  }
  &.pos-center {
    left: 50%;
    transform: translateX(-50%);
  }
  &.pos-right {
    right: 32rpx;
  }
  .dot {
    background: rgba(255, 255, 255, 0.65);
    transition: all 0.25s ease;
    &.round {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      margin: 0 6rpx;
    }
    &.line {
      width: 24rpx;
      height: 6rpx;
      border-radius: 4rpx;
      margin: 0 4rpx;
    }
  }
}
</style>
