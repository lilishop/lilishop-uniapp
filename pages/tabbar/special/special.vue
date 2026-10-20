<template>
  <div class="wrapper" :style="pageBgStyle">
    <!-- uni 中不能使用 vue component 所以用if判断每个组件 -->
    <div v-for="(item, index) in pageData.list" :key="index">
      <!-- 搜索栏，如果在楼层装修顶部则会自动浮动，否则不浮动 -->
      <div class="navbar" v-if="item.type == 'search'" :style="{ background: topColor }">
        <search style="width: 100%" :res="item.options" />
        <!-- #ifndef H5 -->
        <!-- 扫码功能 不兼容h5 详情文档: https://uniapp.dcloud.io/api/system/barcode?id=scancode -->
        <div class="navbar-right">
          <u-icon name="scan" @click="scan()" color="#666" size="50"></u-icon>
        </div>
        <!-- #endif -->
      </div>
      <homeComb v-if="item.type == 'homeComb'" :res="item.options" />
      <carousel v-if="item.type == 'carousel'" :res="item.options" />
      <titleLayout v-if="item.type == 'title'" :res="item.options" />
      <leftOneRightTwo
        v-if="item.type == 'leftOneRightTwo'"
        :res="item.options"
      />
      <leftTwoRightOne
        v-if="item.type == 'leftTwoRightOne'"
        :res="item.options"
      />
      <topOneBottomTwo
        v-if="item.type == 'topOneBottomTwo'"
        :res="item.options"
      />
      <topTwoBottomOne
        v-if="item.type == 'topTwoBottomOne'"
        :res="item.options"
      />
      <flexThree v-if="item.type == 'flexThree'" :res="item.options" />
      <flexFive v-if="item.type == 'flexFive'" :res="item.options" />
      <flexFour v-if="item.type == 'flexFour'" :res="item.options" />
      <flexTwo v-if="item.type == 'flexTwo'" :res="item.options" />
      <textPicture v-if="item.type == 'textPicture'" :res="item.options" />
      <menuLayout v-if="item.type == 'menu'" :res="item.options" />
      <flexOne v-if="item.type == 'flexOne'" :res="item.options" />
      <goods v-if="item.type == 'goods'" :res="item.options" />
      <group v-if="item.type == 'group'" :res="item.options" />
      <notice v-if="item.type == 'notice'" :res="item.options" />
      <promotions v-if="item.type == 'promotionDetail'" :res="item.options" />
      <integral v-if="item.type == 'integral'" :res="item.options" />
      <!-- <spike v-if="item.type == 'spike'" :res="item.options" /> -->
      <videoLayout v-if="item.type == 'video'" :res="item.options" />
      <blank v-if="item.type == 'blank'" :res="item.options" />
      <lineLayout v-if="item.type == 'line'" :res="item.options" />
      <richText v-if="item.type == 'richText'" :res="item.options" />
      <coupon v-if="item.type == 'coupon'" :res="item.options" />
      <articleList v-if="item.type == 'article'" :res="item.options" />
      <shopList v-if="item.type == 'shop'" :res="item.options" />
    </div>
    <u-no-network></u-no-network>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import carousel from '@/pages/tabbar/home/template/tpl_banner'
import titleLayout from '@/pages/tabbar/home/template/tpl_title'
import leftOneRightTwo from '@/pages/tabbar/home/template/tpl_left_one_right_two'
import leftTwoRightOne from '@/pages/tabbar/home/template/tpl_left_two_right_one'
import topOneBottomTwo from '@/pages/tabbar/home/template/tpl_top_one_bottom_two'
import topTwoBottomOne from '@/pages/tabbar/home/template/tpl_top_two_bottom_one'
import flexOne from '@/pages/tabbar/home/template/tpl_flex_one'
import flexTwo from '@/pages/tabbar/home/template/tpl_flex_two'
import flexThree from '@/pages/tabbar/home/template/tpl_flex_three'
import flexFive from '@/pages/tabbar/home/template/tpl_flex_five'
import flexFour from '@/pages/tabbar/home/template/tpl_flex_four'
import textPicture from '@/pages/tabbar/home/template/tpl_text_picture'
import menuLayout from '@/pages/tabbar/home/template/tpl_menu'
import search from '@/pages/tabbar/home/template/tpl_search'
import group from '@/pages/tabbar/home/template/tpl_group'
import videoLayout from '@/pages/tabbar/home/template/tpl_video'
import goods from '@/pages/tabbar/home/template/tpl_goods'
import notice from '@/pages/tabbar/home/template/tpl_notice'
import promotions from '@/pages/tabbar/home/template/tpl_promotions_detail'
import blank from '@/pages/tabbar/home/template/tpl_blank'
import lineLayout from '@/pages/tabbar/home/template/tpl_line'
import richText from '@/pages/tabbar/home/template/tpl_rich_text'
import integral from '@/pages/tabbar/home/template/tpl_integral'
import coupon from '@/pages/tabbar/home/template/tpl_coupon'
import articleList from '@/pages/tabbar/home/template/tpl_article'
import shopList from '@/pages/tabbar/home/template/tpl_shop'
import homeComb from '@/pages/tabbar/home/template/tpl_home_comb.vue'
import { toSpecial, getSpecial } from '@/api/home'
import permision from '@/js_sdk/wa-permission/permission.js'
import config from '@/config/config'

const id = ref('')
const pageData = ref<any>('')
const bodyParam = ref('')
const isIos = ref('')

const topColor = computed(() => pageData.value?.topColor || '#ffffff')
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

function applyPageSettings(parsed: any) {
  if (!parsed) return
  if (parsed.title) {
    uni.setNavigationBarTitle({ title: parsed.title })
  }
  if (parsed.topColor || parsed.titleColor) {
    uni.setNavigationBarColor({
      frontColor: parsed.titleColor === 'white' ? '#ffffff' : '#000000',
      backgroundColor: parsed.topColor || '#ffffff',
    })
  }
}

onMounted(() => {
  init()
  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  // #endif
})

onLoad((val) => {
  id.value = val.id
  bodyParam.value = val.body
})

function init() {
  pageData.value = ''
  console.log(bodyParam.value)
  if (bodyParam.value) {
    toSpecial({ body: bodyParam.value }).then((res) => {
      if (res.data.success) {
        const parsed = JSON.parse(res.data.result.pageData)
        if (parsed && Array.isArray(parsed.list)) {
          parsed.list = parsed.list.filter((i: any) => !i?.hidden)
        }
        pageData.value = parsed
        applyPageSettings(parsed)
      }
    })
  } else {
    getSpecial(id.value).then((res) => {
      if (res.data.success) {
        const parsed = JSON.parse(res.data.result.pageData)
        if (parsed && Array.isArray(parsed.list)) {
          parsed.list = parsed.list.filter((i: any) => !i?.hidden)
        }
        pageData.value = parsed
        applyPageSettings(parsed)
      }
    })
  }
}

function seacnCode() {
  uni.scanCode({
    success: function (res) {
      const path = encodeURIComponent(res.result)

      if (res.scanType == 'WX_CODE') {
        console.log(res)
        uni.navigateTo({
          url: `/${res.path}`,
        })
      } else {
        config.scanAuthNavigation.forEach((src) => {
          if (res.result.indexOf(src) != -1) {
            uni.navigateTo({
              url: `/${res.result.substring(src.length)}`,
            })
          } else {
            setTimeout(() => {
              uni.navigateTo({
                url: '/pages/tabbar/home/web-view?src=' + path,
              })
            }, 100)
          }
        })
      }
    },
  })
}

function tipsGetSettings() {
  uni.showModal({
    title: '提示',
    content: '您已经关闭相机权限,去设置',
    success: function (res) {
      if (res.confirm) {
        if (isIos.value) {
          plus.runtime.openURL('app-settings:')
        } else {
          permision.gotoAppPermissionSetting()
        }
      }
    },
  })
}

async function scan() {
  // #ifdef APP-PLUS
  isIos.value = plus.os.name == 'iOS'
  if (isIos.value) {
    const iosFirstCamera = uni.getStorageSync('iosFirstCamera')
    if (iosFirstCamera !== 'false') {
      uni.setStorageSync('iosFirstCamera', 'false')
      seacnCode()
    } else {
      if (permision.judgeIosPermission('camera')) {
        seacnCode()
      } else {
        tipsGetSettings()
      }
    }
  } else {
    seacnCode()
  }
  // #endif

  // #ifdef MP-WEIXIN
  seacnCode()
  // #endif
}
</script>

<style scoped lang="scss">
.navbar-right {
  padding: 0 16rpx 0 0;
}

.navbar {
  display: flex;
  align-items: center;
}
</style>
