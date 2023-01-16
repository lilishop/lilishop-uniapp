<template>
  <div class="wrapper">
    <u-popup v-model="showCp" mode="center" width="550rpx" height="400px">
      <view style="height:130rpx;">
        <view style="width:200rpx;height:120rpx;float:left;line-height:120rpx;font-size:35rpx;color:#28A4F2;font-weight:600;margin-left:20rpx;">优惠券活动</view>
        <view style="width:120rpx;height:120rpx;float:right;">
          <image @click="showCp = false" src="/static/cpauto1.png" style="width:100%;height:100%;"></image>
        </view>
      </view>
			<scroll-view scroll-y="true" style="height: 620rpx;">
        <!-- {{coupList}} -->
        <view v-for="(item,index) in coupList" :key="index" >
          <view class="grad1">
            <view style="float:right;">
              <view v-if="item.couponType == 'DISCOUNT'">{{ item.couponDiscount }}折</view>
							<view v-else>优惠金额：<span style="color:red;font-size:32rpx;">{{ item.price | unitPrice}}</span>元</view>
              <view>满<span style="color:red;font-size:32rpx;">{{ item.consumeThreshold | unitPrice }}元</span>可用</view>
              <view v-if="item.scopeType == 'ALL' && item.storeId == '0'">全平台</view>
							<view v-if="item.scopeType == 'PORTION_GOODS_CATEGORY'">仅限品类</view>
              <view v-else>{{ item.storeName == 'platform' ? '全平台' :item.storeName+'店铺' }}使用
							</view>
              <view v-if="item.endTime">有效期至：{{ item.endTime.split(" ")[0] }}</view>
            </view>
            <view style="color:white;font-size:28rpx;font-weight:500;float:left;writing-mode:vertical-rl;flex: auto;height:100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;" @click="showCp = false">
              立即使用
            </view>
          </view>
        </view>
				</scroll-view>
		</u-popup>
    <!-- uni 中不能使用 vue component 所以用if判断每个组件 -->
    <div v-for="(item, index) in pageData.list" :key="index">
      <!-- 搜索栏，如果在楼层装修顶部则会自动浮动，否则不浮动 -->
      <u-navbar class="navbar" v-if="item.type == 'search'" :is-back="false" :is-fixed="index === 1 ? false : true">
        <search style="width: 100%" :res="item.options" />
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
      <flexOne v-if="item.type == 'flexOne'" :res="item.options" />
      <goods :enableBottomLoad="enableLoad" v-if="item.type == 'goods'" :res="item.options" />
      <group v-if="item.type == 'group'" :res="item.options" />
      <notice v-if="item.type == 'notice'" :res="item.options" />
      <promotions v-if="item.type == 'promotionDetail'" :res="item.options" />
      <!-- <joinGroup v-if="item.type == 'joinGroup'" :res="item.options" /> -->
      <!-- <integral v-if="item.type == 'integral'" :res="item.options" /> -->
      <!-- <spike v-if="item.type == 'spike'" :res="item.options" /> -->
    </div>
    <u-no-network @retry="init" @isConnected="isConnected"></u-no-network>
  </div>
</template>

<script>
// 引用组件
import tpl_banner from "@/pages/tabbar/home/template/tpl_banner"; //导航栏模块
import tpl_title from "@/pages/tabbar/home/template/tpl_title"; //标题栏模块
import tpl_left_one_right_two from "@/pages/tabbar/home/template/tpl_left_one_right_two"; //左一右二模块
import tpl_left_two_right_one from "@/pages/tabbar/home/template/tpl_left_two_right_one"; //左二右一模块
import tpl_top_one_bottom_two from "@/pages/tabbar/home/template/tpl_top_one_bottom_two"; //上一下二模块
import tpl_top_two_bottom_one from "@/pages/tabbar/home/template/tpl_top_two_bottom_one"; //上二下一模块
import tpl_flex_one from "@/pages/tabbar/home/template/tpl_flex_one"; //单行图片模块
import tpl_flex_two from "@/pages/tabbar/home/template/tpl_flex_two"; //两张横图模块
import tpl_flex_three from "@/pages/tabbar/home/template/tpl_flex_three"; //三列单行图片模块
import tpl_flex_five from "@/pages/tabbar/home/template/tpl_flex_five"; //五列单行图片模块
import tpl_flex_four from "@/pages/tabbar/home/template/tpl_flex_four"; //四列单行图片模块
import tpl_text_picture from "@/pages/tabbar/home/template/tpl_text_picture"; //文字图片模板
import tpl_menu from "@/pages/tabbar/home/template/tpl_menu"; //五列菜单模块
import tpl_search from "@/pages/tabbar/home/template/tpl_search"; //搜索栏
import tpl_group from "@/pages/tabbar/home/template/tpl_group"; //
import tpl_goods from "@/pages/tabbar/home/template/tpl_goods"; //商品分类以及分类中的商品
// 结束引用组件
import { getFloorData } from "@/api/home"; //获取楼层装修接口
import permision from "@/js_sdk/wa-permission/permission.js"; //权限工具类
import config from "@/config/config";
import {getAutoCoup} from "@/api/login"
import tpl_notice from "@/pages/tabbar/home/template/tpl_notice"; //标题栏模块
import tpl_promotions from "@/pages/tabbar/home/template/tpl_promotions_detail"; //标题栏模块
import storage from "@/utils/storage.js";
// import {receiveCoupons} from "@/api/members"

export default {
  data () {
    return {
      config,
      storage,
      coupList:[],
      showCp:false,
      pageData: "", //楼层页面数据
      isIos: "",
      enableLoad: false, //触底加载 针对于商品模块
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
    flexOne: tpl_flex_one,
    goods: tpl_goods,
    group: tpl_group,
    notice: tpl_notice,
    promotions: tpl_promotions,
  },

  mounted () {
    this.init();
    // #ifdef MP-WEIXIN
    // 小程序默认分享
    uni.showShareMenu({ withShareTicket: true });
    // #endif
    this.firstGetAuto()
  },
  methods: {
    firstGetAuto(){
      // console.log(123123213)
      let data  = new Date()
      let datas = data.getDate()
      let huors = data.getHours()
      let flagCoup = storage.getAutoCp()
      console.log(flagCoup)
      console.log(datas)
      if(storage.getAutoCp() && storage.getAutoCp() != '' && storage.getAutoCp() != undefined && storage.getAutoCp() != null){
        if(Number(datas) > Number(flagCoup)){
          if(Number(huors) >= 6){
            storage.setAutoCp(datas)
            this.getAutoCp()
          }
        }
      }else{
        this.getAutoCp()
      }
      
    },
    getAutoCp(){
      let data  = new Date()
      let datas = data.getDate()
      getAutoCoup().then(res=>{ 
        console.log(res)
        if(res.data.success){
          this.coupList.push(...res.data.result)
          if(this.coupList != ''){
            this.showCp = true
          }else{
            this.showCp = false
          }
          storage.setAutoCp(datas)
          let objs = {};
            this.coupList = this.coupList.reduce((cur, next) => {
              //对象去重
              if (next.id != undefined) {
                objs[next.id]
                  ? ""
                  : (objs[next.id] = true && cur.push(next));
              }
              return cur;
            }, []);
        }
      })
    },
    // receiveCoupons(v){

    // },
    /**
     * 实例化首页数据楼层
     */
    init () {
      this.pageData = "";
      getFloorData().then((res) => {
        if (res.data.success) {
          const result = JSON.parse(res.data.result.pageData)
          this.pageData = result;
          if (result.list.length) {
            // 如果最后一个装修模块是商品模块的话 默认启用自动加载
            result.list[result.list.length - 1] ? result.list[result.list.length - 1].model == 'goods' ? this.enableLoad = true : '' : ''
          }
        }
      });
    },
    // 是否有网络链接
    isConnected (val) {
      val ? this.init() : ''
    },

    /**
     * TODO 扫码功能后续还会后续增加
     * 应该实现的功能目前计划有：
     * 扫描商品跳转商品页面
     * 扫描活动跳转活动页面
     * 扫描二维码登录
     * 扫描其他站信息 弹出提示，返回首页。
     */
    seacnCode () {
      uni.scanCode({
        success: function (res) {
          let path = encodeURIComponent(res.result);



          if (path != undefined && path.indexOf("QR_CODE_LOGIN_SESSION") == 0) {
            console.log(path)
            //app扫码登录
            uni.navigateTo({
              url: "/pages/passport/scannerCodeLoginConfirm?token=" + path
            });
            return;
          }


          // WX_CODE 为小程序码
          if (res.scanType == "WX_CODE") {
            console.log(res);
            uni.navigateTo({
              url: `/${res.path}`,
            });
          } else {
            config.scanAuthNavigation.forEach((src) => {
              if (res.result.indexOf(src) != -1) {
                uni.navigateTo({
                  url: `/${res.result.substring(src.length)}`,
                });
              } else {
                setTimeout(() => {
                  uni.navigateTo({
                    url: "/pages/tabbar/home/web-view?src=" + path,
                  });
                }, 100);
              }
            });
          }
        },
      });
    },

    /**
     * 提示获取权限
     */
    tipsGetSettings () {
      uni.showModal({
        title: "提示",
        content: "您已经关闭相机权限,去设置",
        success: function (res) {
          if (res.confirm) {
            if (this.isIos) {
              plus.runtime.openURL("app-settings:");
            } else {
              permision.gotoAppPermissionSetting();
            }
          }
        },
      });
    },

    /**
     * 唤醒客户端扫码
     * 没权限去申请权限，有权限获取扫码功能
     */
    async scan () {
      // #ifdef APP-PLUS
      this.isIos = plus.os.name == "iOS";
      // 判断是否是Ios
      if (this.isIos) {
        const iosFirstCamera = uni.getStorageSync("iosFirstCamera"); //是不是第一次开启相机
        if (iosFirstCamera !== "false") {
          uni.setStorageSync("iosFirstCamera", "false"); //设为false就代表不是第一次开启相机
          this.seacnCode();
        } else {
          if (permision.judgeIosPermission("camera")) {
            this.seacnCode();
          } else {
            // 没有权限提醒是否去申请权限
            this.tipsGetSettings();
          }
        }
      } else {
        /**
         * TODO 安卓 权限已经授权了，调用api总是显示用户已永久拒绝申请。人傻了
         * TODO 如果xdm有更好的办法请在 https://gitee.com/beijing_hongye_huicheng/lilishop/issues 提下谢谢
         */
        this.seacnCode();
      }

      // #endif

      // #ifdef MP-WEIXIN
      this.seacnCode();
      // #endif
    },
  },
};
</script>

<style scoped lang="scss">
.navbar-right {
  padding: 0 16rpx 0 0;
}

.grad1 {
    width: 500rpx;
    height: 200rpx;
    background: radial-gradient(circle at right top, transparent 20rpx,  #ff6b35 0) top left / 120rpx 51% no-repeat,
      radial-gradient(circle at right bottom, transparent 20rpx,  #ff6b35 0) bottom left /120rpx 51% no-repeat,
      radial-gradient(circle at left top, transparent 20rpx, #ffffff 0) top right /380rpx 51% no-repeat,
      radial-gradient(circle at left bottom, transparent 20rpx, #ffffff 0) bottom right /380rpx 51% no-repeat;
    filter: drop-shadow(6rpx 6rpx  6rpx  rgba(0,0,0,.3));
    margin: 30rpx auto;
    padding-top: 2rpx;
    padding-bottom: 10rpx;
    padding-left: 38rpx;
    padding-right: 30rpx;
}
// .grad2 {
//     width: 100px;
//     height: 120px;
// 	background:
//                     radial-gradient(circle at left bottom, transparent 10px, #28A4F2 0) top left /60px 30px no-repeat,
//                     radial-gradient(circle at right bottom, transparent 10px, #28A4F2 0) top right /60px 30px no-repeat,
//                     radial-gradient(circle at left top, transparent 10px, #EFEFF4 0) bottom left /60px 90px no-repeat,
//                     radial-gradient(circle at right top, transparent 10px, #EFEFF4 0) bottom right /60px 90px no-repeat;
//    filter: drop-shadow(3rpx 3rpx 3rpx rgba(0,0,0,.3));
// }

</style>
