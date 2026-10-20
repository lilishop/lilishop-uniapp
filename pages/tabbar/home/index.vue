<template>
  <view class="home-page" :style="[themeStyle, pageBgStyle]">
    <view
      v-for="(item, index) in pageData.list"
      :key="`${item.type}-${index}`"
      class="floor-block"
    >
      <u-navbar
        class="navbar"
        v-if="item.type == 'search'"
        :auto-back="false"
        :fixed="index === 1 ? false : true"
        :placeholder="index === 1 ? false : true"
        left-icon=""
        title=""
        :bg-color="topColor"
      >
        <template #left>
          <view class="navbar-search-wrap" :style="searchBarStyle" @click.stop>
            <search :res="item.options" />
          </view>
        </template>
      </u-navbar>
      <homeComb v-if="item.type == 'homeComb'" :res="item.options" />
      <carousel v-if="item.type == 'carousel'" :res="item.options" />
      <titleLayout v-if="item.type == 'title'" :res="item.options" />
      <leftOneRightTwo v-if="item.type == 'leftOneRightTwo'" :res="item.options" />
      <leftTwoRightOne v-if="item.type == 'leftTwoRightOne'" :res="item.options" />
      <topOneBottomTwo v-if="item.type == 'topOneBottomTwo'" :res="item.options" />
      <topTwoBottomOne v-if="item.type == 'topTwoBottomOne'" :res="item.options" />
      <flexThree v-if="item.type == 'flexThree'" :res="item.options" />
      <flexFive v-if="item.type == 'flexFive'" :res="item.options" />
      <flexFour v-if="item.type == 'flexFour'" :res="item.options" />
      <flexTwo v-if="item.type == 'flexTwo'" :res="item.options" />
      <textPicture v-if="item.type == 'textPicture'" :res="item.options" />
      <menuLayout v-if="item.type == 'menu'" :res="item.options" />
      <flexOne v-if="item.type == 'flexOne'" :res="item.options" />
      <goods
        v-if="item.type == 'goods'"
        :enableBottomLoad="enableLoad"
        :res="item.options"
      />
      <group v-if="item.type == 'group'" :res="item.options" />
      <notice v-if="item.type == 'notice'" :res="item.options" />
      <promotions v-if="item.type == 'promotionDetail'" :res="item.options" />
      <videoLayout v-if="item.type == 'video'" :res="item.options" />
      <blank v-if="item.type == 'blank'" :res="item.options" />
      <lineLayout v-if="item.type == 'line'" :res="item.options" />
      <richText v-if="item.type == 'richText'" :res="item.options" />
      <integral v-if="item.type == 'integral'" :res="item.options" />
      <coupon v-if="item.type == 'coupon'" :res="item.options" />
      <articleList v-if="item.type == 'article'" :res="item.options" />
      <shopList v-if="item.type == 'shop'" :res="item.options" />
    </view>
    <fetchCoupon ref="couponRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  onShow,
  onReady,
  onReachBottom,
  onPullDownRefresh,
} from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import carousel from '@/pages/tabbar/home/template/tpl_banner.vue'
import titleLayout from '@/pages/tabbar/home/template/tpl_title.vue'
import leftOneRightTwo from '@/pages/tabbar/home/template/tpl_left_one_right_two.vue'
import leftTwoRightOne from '@/pages/tabbar/home/template/tpl_left_two_right_one.vue'
import topOneBottomTwo from '@/pages/tabbar/home/template/tpl_top_one_bottom_two.vue'
import topTwoBottomOne from '@/pages/tabbar/home/template/tpl_top_two_bottom_one.vue'
import flexOne from '@/pages/tabbar/home/template/tpl_flex_one.vue'
import flexTwo from '@/pages/tabbar/home/template/tpl_flex_two.vue'
import flexThree from '@/pages/tabbar/home/template/tpl_flex_three.vue'
import flexFive from '@/pages/tabbar/home/template/tpl_flex_five.vue'
import flexFour from '@/pages/tabbar/home/template/tpl_flex_four.vue'
import textPicture from '@/pages/tabbar/home/template/tpl_text_picture.vue'
import menuLayout from '@/pages/tabbar/home/template/tpl_menu.vue'
import search from '@/pages/tabbar/home/template/tpl_search.vue'
import group from '@/pages/tabbar/home/template/tpl_group.vue'
import videoLayout from '@/pages/tabbar/home/template/tpl_video.vue'
import goods from '@/pages/tabbar/home/template/tpl_goods.vue'
import notice from '@/pages/tabbar/home/template/tpl_notice.vue'
import promotions from '@/pages/tabbar/home/template/tpl_promotions_detail.vue'
import fetchCoupon from '@/pages/tabbar/home/template/fetch_coupon.vue'
import blank from '@/pages/tabbar/home/template/tpl_blank.vue'
import lineLayout from '@/pages/tabbar/home/template/tpl_line.vue'
import richText from '@/pages/tabbar/home/template/tpl_rich_text.vue'
import integral from '@/pages/tabbar/home/template/tpl_integral.vue'
import coupon from '@/pages/tabbar/home/template/tpl_coupon.vue'
import articleList from '@/pages/tabbar/home/template/tpl_article.vue'
import shopList from '@/pages/tabbar/home/template/tpl_shop.vue'
import homeComb from '@/pages/tabbar/home/template/tpl_home_comb.vue'
import { getFloorData } from '@/api/home'

const HOME_LAYOUT_PADDING_RPX = 16

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const couponRef = ref<InstanceType<typeof fetchCoupon>>()
const pageData = ref<Record<string, any>>({ list: [] })
const enableLoad = ref(false)
const loading = ref(false)
const searchBarWidth = ref(0)

const topColor = computed(() => pageData.value?.topColor || '#ffffff')

// 页面设置-样式：画布背景（背景色 / 背景图 + 填充方式）
const pageBgStyle = computed(() => {
  const data: any = pageData.value
  if (data?.bgType === 'image' && data?.bgImage) {
    const size =
      data.bgFill === 'contain'
        ? 'contain'
        : data.bgFill === 'cover'
          ? 'cover'
          : '100% 100%'
    return {
      backgroundImage: `url(${data.bgImage})`,
      backgroundSize: size,
      backgroundRepeat: 'no-repeat',
      backgroundColor: data.bgColor || '#f9f9f9',
    }
  }
  if (data?.bgColor) {
    return { backgroundColor: data.bgColor }
  }
  return {}
})

const searchBarStyle = computed(() => {
  if (searchBarWidth.value) {
    return { width: `${searchBarWidth.value}px` }
  }
  return { width: '100%' }
})

function setCapsuleInset() {
  try {
    const { windowWidth } = uni.getWindowInfo()
    const leftPadding = uni.upx2px(HOME_LAYOUT_PADDING_RPX)
    const rightPadding = uni.upx2px(HOME_LAYOUT_PADDING_RPX)
    // #ifdef MP-WEIXIN
    const menuButton = uni.getMenuButtonBoundingClientRect()
    searchBarWidth.value = windowWidth - (windowWidth - menuButton.left) - leftPadding
    // #endif
    // #ifndef MP-WEIXIN
    searchBarWidth.value = windowWidth - leftPadding - rightPadding
    // #endif
  } catch (e) {
    searchBarWidth.value = 0
  }
}

function fetchCouponFn() {
  couponRef.value?.firstGetAuto()
}

function init() {
  if (loading.value) return
  loading.value = true
  getFloorData()
    .then((res) => {
      const payload = res?.data != null ? res.data : res
      const pageDataStr = payload?.result?.pageData
      const isSuccess = payload?.success === true || payload?.code === 200
      if (!isSuccess || !pageDataStr) return

      try {
        const result = JSON.parse(pageDataStr)
        pageData.value = Array.isArray(result?.list)
          ? { ...result, list: result.list.filter((i: any) => !i?.hidden) }
          : { list: [] }
        // 页面设置-内容：页面标题同步到导航栏
        if (result?.title) {
          uni.setNavigationBarTitle({ title: result.title })
        }
        // 页面设置-样式：顶部颜色与标题颜色同步到导航栏
        if (result?.topColor || result?.titleColor) {
          uni.setNavigationBarColor({
            frontColor: result?.titleColor === 'white' ? '#ffffff' : '#000000',
            backgroundColor: result?.topColor || '#ffffff',
          })
        }
        const lastItem = pageData.value.list[pageData.value.list.length - 1]
        enableLoad.value =
          lastItem?.type === 'goods' || lastItem?.model === 'goods'
      } catch (parseError) {
        console.error('parse pageData failed', parseError)
      }
    })
    .catch((err) => {
      console.error('getFloorData failed', err)
    })
    .finally(() => {
      loading.value = false
    })
}

onReady(() => {
  setCapsuleInset()
  init()
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  // #endif
})

onShow(() => {
  setTimeout(() => {
    fetchCouponFn()
  }, 1000)
})

onReachBottom(() => {
  uni.$emit('onReachBottom', true)
})

onPullDownRefresh(() => {
  init()
  uni.stopPullDownRefresh()
})
</script>

<style scoped lang="scss">
@import '@/pages/tabbar/home/template/tpl.scss';

.home-page {
  width: 100%;
  min-height: 100%;
  background: #f9f9f9;
}

.floor-block {
  width: 100%;
  display: block;
}

.navbar {
  width: 100%;

  :deep(.u-navbar__content) {
    width: 100%;
  }

  :deep(.u-navbar__content__left) {
    flex: 1;
    width: auto !important;
    max-width: 100%;
    padding: 0 0 0 $home-layout-padding !important;
  }
}

.navbar-search-wrap {
  box-sizing: border-box;
  flex: 1;
  min-width: 0;
}
</style>
