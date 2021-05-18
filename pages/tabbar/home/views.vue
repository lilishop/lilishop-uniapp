<template>
  <div class="wrapper">
    <!-- uni 中不能使用 vue component 所以用if判断每个组件 -->
    <div v-for="(item,index) in pageData.list" :key="index">
      <u-navbar class="navbar" v-if="item.type == 'search'" :is-back="false">
        <search style="width:100%" :res="item.options" />
        <!-- #ifndef H5 -->
        <!-- 扫码功能 不兼容h5 详情文档: https://uniapp.dcloud.io/api/system/barcode?id=scancode -->
        <div slot="right" class="navbar-right">
          <u-icon name="scan" @click="scan()" color="#666" size="50"></u-icon>
        </div>
        <!-- #endif -->
      </u-navbar>
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
      <joinGroup v-if="item.type == 'joinGroup'" :res="item.options" />
      <flexOne v-if="item.type == 'flexOne'" :res="item.options" />
      <goods v-if="item.type == 'goods'" :res="item.options" />
      <integral v-if="item.type == 'integral'" :res="item.options" />
      <spike v-if="item.type == 'spike'" :res="item.options" />
      <group v-if="item.type == 'group'" :res="item.options" />
    </div>
    <u-no-network></u-no-network>
  </div>
</template>

<script>
// 引用组件
import tpl_banner from "@/pages/tabbar/home/template/tpl_banner";
import tpl_title from "@/pages/tabbar/home/template/tpl_title";
import tpl_left_one_right_two from "@/pages/tabbar/home/template/tpl_left_one_right_two";
import tpl_left_two_right_one from "@/pages/tabbar/home/template/tpl_left_two_right_one";
import tpl_top_one_bottom_two from "@/pages/tabbar/home/template/tpl_top_one_bottom_two";
import tpl_top_two_bottom_one from "@/pages/tabbar/home/template/tpl_top_two_bottom_one";
import tpl_flex_one from "@/pages/tabbar/home/template/tpl_flex_one";
import tpl_flex_two from "@/pages/tabbar/home/template/tpl_flex_two";
import tpl_flex_three from "@/pages/tabbar/home/template/tpl_flex_three";
import tpl_flex_five from "@/pages/tabbar/home/template/tpl_flex_five";
import tpl_flex_four from "@/pages/tabbar/home/template/tpl_flex_four";
import tpl_text_picture from "@/pages/tabbar/home/template/tpl_text_picture";
import tpl_menu from "@/pages/tabbar/home/template/tpl_menu";
import tpl_search from "@/pages/tabbar/home/template/tpl_search";
import tpl_join_group from "@/pages/tabbar/home/template/tpl_join_group";
import tpl_integral from "@/pages/tabbar/home/template/tpl_integral";
import tpl_spike from "@/pages/tabbar/home/template/tpl_spike";
import tpl_group from "@/pages/tabbar/home/template/tpl_group";
import tpl_goods from "@/pages/tabbar/home/template/tpl_goods";
// 结束引用组件
import { getFloorData } from "@/api/home";

import { modelNavigateTo } from "./template/tpl.js"; //跳转路径
import permision from "@/js_sdk/wa-permission/permission.js"; //权限
export default {
  data() {
    return {
      pageData: "",
    };
  },
  components: {
    carousel: tpl_banner,
    titleLayout: tpl_title,
    leftOneRightTwo: tpl_left_one_right_two,
    leftTwoRightOne: tpl_left_two_right_one,
    topOneBottomTwo: tpl_top_one_bottom_two,
    topTwoBottomOne: tpl_top_two_bottom_one,
    flexThree: tpl_flex_three,
    flexFive: tpl_flex_five,
    flexFour: tpl_flex_four,
    flexTwo: tpl_flex_two,
    textPicture: tpl_text_picture,
    menuLayout: tpl_menu,
    search: tpl_search,
    joinGroup: tpl_join_group,
    flexOne: tpl_flex_one,
    goods: tpl_goods,
    integral: tpl_integral,
    spike: tpl_spike,
    group: tpl_group,
  },

  mounted() {
    
     
    this.init();
  },
  methods: {
    /**
     * 实例化首页数据楼层
     */
    init() {
      getFloorData().then((res) => {
        if (res.data.success) {
          this.pageData = JSON.parse(res.data.result.pageData);
        }
      });
    },

    /**
     * 唤醒客户端扫码
     * 没权限去申请权限，有权限获取扫码功能
     */
    scan() {
     
      if (permision.judgeIosPermission("camera")) {
        uni.scanCode({
          success: function (res) {
            let path = encodeURIComponent(res.result);
            setTimeout(() => {
              uni.navigateTo({
                url: "/pages/tabbar/home/web-view?src=" + path,
              });
            }, 100);
          },
        });
      } else {
        uni.showModal({
          title: "提示",
          content: "您已经关闭相机权限,去设置",
          success: function (res) {
            if (res.confirm) {
              plus.runtime.openURL("app-settings:");
            }
          },
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.navbar-right {
  padding: 0 16rpx 0 0;
}
</style>
