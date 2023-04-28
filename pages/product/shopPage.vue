<template>
  <view>
    <!-- 楼层装修店铺信息 -->
    <div>
      <u-navbar :border-bottom="false">
        <u-search
          v-model="keyword"
          @search="search"
          @click="search"
          placeholder="请输入搜索"
        ></u-search>
      </u-navbar>
      <div class="wrapper">
        <!-- 店铺信息模块 -->
        <div class="store flex">
          <u-image
            border-radius="10"
            width="150"
            height="150"
            :src="storeInfo.storeLogo || config.logo"
            mode="aspectFit"
          >
          </u-image>
          <div class="box">
            <div class="store-name" @click="getStoreLicencePhoto">
              {{ storeInfo.storeName || "" }}
              <u-icon style="margin-left: 10rpx" name="arrow-right"></u-icon>
            </div>
            <div class="flex store-message">
              <div>
                <span>{{ storeInfo.collectionNum || 0 }}</span
                >关注
              </div>
              <div>
                <span>{{ storeInfo.goodsNum || 0 }}</span
                >件商品
              </div>
            </div>
          </div>
          <div class="collection">
            <div class="collection-btn" @click="whetherCollection">
              {{ isCollection ? "已关注" : "+ 关注" }}
            </div>
          </div>
        </div>
        <!-- 店铺简介 -->
        <div class="store-desc wes-2">
          {{ storeInfo.storeDesc }}
        </div>

        <!-- 联系客服 -->
        <div class="kefu" @click="talk">
          <u-icon name="kefu-ermai"></u-icon>
          联系客服
        </div>
      </div>
      <!-- 优惠券 -->
      <scroll-view
        scroll-x="true"
        show-scrollbar="false"
        class="discount"
        v-if="couponList.length > 0"
      >
        <view class="card-box" v-for="(item, index) in couponList" :key="index">
          <view class="card" @click="getCoupon(item)">
            <view class="money">
              <view>
                <span v-if="item.couponType == 'DISCOUNT'"
                  >{{ item.couponDiscount }}折</span
                >
                <span v-else>{{ item.price }}元</span>
              </view>
            </view>
            <view class="xian"></view>
            <view class="text">
              <text>{{ "领取优惠券" }}</text>
              <text>满{{ item.consumeThreshold | unitPrice }}元可用</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 基础店铺模式 -->
      <div v-if="basePageData">
        <u-tabs :list="tabs" :active-color="mainColor" :is-scroll="false" :current="current" @change="changeTab"></u-tabs>
        <div class="content" v-if="current == 0">
          <u-empty style='margin-top:100rpx' v-if="goodsList.length == 0" class="empty" text='暂无商品信息'></u-empty>
          <goodsTemplate v-else :res="goodsList" :storeName="false" />
        </div>
        <!-- 全部分类 -->
        <div class="category" v-if="current == 1">
          <div class="category-item" v-for="(item,index) in categoryList" :key="index">
            <div class="flex" @click="getCategoryGoodsList(item)">
              <div>{{item.labelName}}</div>
              <div>
                <u-icon color="#999" name="arrow-right"></u-icon>
              </div>
            </div>
            <!-- 分类子级 -->
            <div class="child-list" v-if="item.children && item.children.length!=0">
              <div class="child" @click="getCategoryGoodsList(child)" :key='i' v-for="(child,i) in item.children">{{child.labelName}}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 楼层装修模式 -->
      <div v-if="enablePageData">
        <!-- uni 中不能使用 vue component 所以用if判断每个组件 -->
        <div v-for="(item, index) in pageData.list" :key="index">
          <!-- 搜索栏，如果在楼层装修顶部则会自动浮动，否则不浮动 -->
          <u-navbar
            class="navbar"
            v-if="item.type == 'search'"
            :is-fixed="index === 1 ? false : true"
          >
            <div class="navbar-right"></div>

            <search style="width: 100%" :res="item.options" :storeId = "storeId"/>         
          </u-navbar>
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
          <!-- <joinGroup v-if="item.type == 'joinGroup'" :res="item.options" /> -->
          <!-- <integral v-if="item.type == 'integral'" :res="item.options" /> -->
          <!-- <spike v-if="item.type == 'spike'" :res="item.options" /> -->
        </div>
      </div>
      <u-no-network></u-no-network>
    </div>
  </view>
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
import goodsTemplate from '@/components/m-goods-list/list'
import { getStoreBaseInfo, getStoreCategory } from "@/api/store.js";
import {
  receiveCoupons,
  deleteStoreCollection,
  collectionGoods,
  getGoodsIsCollect,
} from "@/api/members.js";
import config from "@/config/config";

import { getGoodsList } from "@/api/goods.js";
import { getAllCoupons } from "@/api/promotions.js";
import { getFloorStoreData } from "@/api/home"; //获取楼层装修接口
export default {
  data() {
    return {
      config,
      pageData: "", //楼层页面数据
      enablePageData: false, //是否显示楼层装修内容
      basePageData: false, //基础店铺信息
      scrollTop: 0,
      mainColor: this.$mainColor, //主色调
      current: 0, //初始tabs的索引
      tabs: [
        {
          name: "全部商品",
        },
        {
          name: "分类查看",
        },
      ], // 标签
      storeId: "",
      keyword: "",
      storeInfo: {}, //店铺详情
      isCollection: false, //是否关注
      goodsList: [], //推荐货物
      couponList: [], //优惠券列表
      categoryList: [],
      couponParams: {
        pageNumber: 1,
        pageSize: 50,
        storeId: "",
      },
      goodsParams: {
        pageNumber: 1,
        pageSize: 10,
        storeId: "",
      },
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
    goodsTemplate
    // spike: tpl_spike,
    // joinGroup: tpl_join_group,
    // integral: tpl_integral,
  },
  watch: {
    current(val) {
      val == 0
        ? () => {
            this.goodsList = [];
            this.getGoodsData();
          }
        : this.getCategoryData();
    },
  },

  /**
   * 加载
   */
  async onLoad(options) {
    this.storeId = options.id;
    console.log(this.storeId,'this.storeId')

    this.goodsParams.storeId = options.id;
    this.couponParams.storeId = options.id;
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
  onPullDownRefresh() {
    this.init();
  },
  mounted() {
    // #ifdef MP-WEIXIN
    // 小程序默认分享
    uni.showShareMenu({
      withShareTicket: true,
    });
    // #endif
    this.init();
  },

  // 下拉加载
  onReachBottom() {
    this.goodsParams.pageNumber++;
    this.getGoodsData();
  },

  methods: {
    talk(){
      this.$options.filters.talkIm(this.storeInfo.storeId)
    },
    back() {
      uni.navigateBack();
    },
    /**
     * 实例化首页数据楼层
     */
    initPageData() {
      this.pageData = "";
      getFloorStoreData({
        pageType: "STORE",
        num: this.storeId,
      }).then((res) => {
        if (res.data.success) {
          this.pageData = JSON.parse(res.data.result.pageData);
        }
      });
    },
    getStoreLicencePhoto() {
      uni.navigateTo({
        url: `/pages/product/licencePhoto?id=${this.storeId}`,
      });
    },
    /**
     * 初始化信息
     */
    init() {
      this.goodsList = [];
      this.categoryList = [];
      this.couponList = [];
      this.goodsParams.pageNumber = 1;
      if (this.$options.filters.isLogin("auth")) {
        this.enableGoodsIsCollect();
      }
      // 店铺信息
      this.getStoreData();
    },
    /**
     * 联系客服
     */
    linkKefuDetail() {
      // 客服
      // #ifdef MP-WEIXIN

      const params = {
        // originalPrice: this.goodsDetail.original || this.goodsDetail.price,
        uuid: storage.getUuid(),
        token: storage.getAccessToken(),
        sign: this.storeInfo.yzfSign,
        mpSign: this.storeInfo.yzfMpSign,
      };
      uni.navigateTo({
        url:
          "/pages/mine/im/index"
      });
      // uni.navigateTo({
      //   url:
      //     "/pages/product/customerservice/index?params=" +
      //     encodeURIComponent(JSON.stringify(params)),
      // });
      // // #endif
      // // #ifndef MP-WEIXIN
      // const sign = this.storeInfo.yzfSign;
      // uni.navigateTo({
      //   url:
      //     "/pages/tabbar/home/web-view?src=https://yzf.qq.com/xv/web/static/chat/index.html?sign=" +
      //     sign,
      // });
      // #endif
    },

    /** 获取店铺分类 */
    async getCategoryData() {
      let res = await getStoreCategory(this.storeId);
      if (res.data.success) {
        this.categoryList = res.data.result;
      }
    },
    /**是否收藏店铺 */
    async enableGoodsIsCollect() {
      let res = await getGoodsIsCollect("STORE", this.storeId);
      if (res.data.success) {
        this.isCollection = res.data.result;
      }
    },

    /**商品分类中商品集合 */
    getCategoryGoodsList(val) {
      uni.navigateTo({
        url: `/pages/product/shopPageGoods?title=${val.labelName}&id=${val.id}&storeId=${this.storeId}`,
      });
    },

    /**
     * 搜索
     */
    search() {
      uni.navigateTo({
        url: `/pages/navigation/search/searchPage?storeId=${this.storeId}&keyword=${this.keyword}`,
      });
    },

    /** 点击tab */
    changeTab(index) {
      this.current = index;
    },

    /**
     * 店铺信息
     */
    async getStoreData() {
      let res = await getStoreBaseInfo(this.storeId);
      if (res.data.success) {
        this.storeInfo = res.data.result;
        // 优惠券信息
        this.getCouponsData();
        if(res.data.result.pageShow == '1'){
          // 开启了楼层装修店铺
          this.initPageData();
          this.enablePageData = true;
        }
        else{
          // 商品信息
          this.getGoodsData();
          // 店铺分类
          this.getCategoryData();
          
          this.basePageData = true;
        }
      } else {
        uni.reLaunch({
          url: "/",
        });
      }
    },

    /** 加载商品 */
    async getGoodsData() {
      let res = await getGoodsList(this.goodsParams);
      if (res.data.success) {
        this.goodsList.push(...res.data.result.records);
      }
    },

    /** 加载优惠券 */
    async getCouponsData() {
      this.couponParams.storeId = this.storeId;
      let res = await getAllCoupons(this.couponParams);
      if (res.data.success) {
        this.couponList.push(...res.data.result.records);
      }
    },

  

    /**
     *  是否收藏
     */
    whetherCollection() {
      if (this.isCollection) {
        deleteStoreCollection(this.storeId).then((res) => {
          if (res.data.success) {
            this.isCollection = false;
            uni.showToast({
              icon: "none",
              duration: 3000,
              title: "取消关注成功！",
            });
          }
        });
      } else {
        collectionGoods("STORE", this.storeId).then((res) => {
          if (res.data.success) {
            this.isCollection = true;
            uni.showToast({
              icon: "none",
              duration: 3000,
              title: "关注成功！",
            });
          }
        });
      }
    },

    /**
     * 领取
     */
    getCoupon(item) {
      if (!this.$options.filters.isLogin("auth")) {
        uni.showToast({
          icon: "none",
          duration: 3000,
          title: "请先登录！",
        });

        this.$options.filters.navigateToLogin("redirectTo");
        return false;
      }
      receiveCoupons(item.id).then((res) => {
        if (res.data.success) {
          uni.showToast({
            icon: "none",
            duration: 3000,
            title: "领取成功！",
          });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  background: #fff;
  padding: 32rpx;
}

.store {
  align-items: center;

  > .box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 30rpx;
    font-size: 24rpx;
    color: #999;
    flex: 2;

    > .store-name {
      font-size: 34rpx;
      color: #333;
      letter-spacing: 1rpx;
      font-weight: bold;
    }

    > .store-message {
      margin-top: 25rpx;

      > div {
        font-size: 26rpx;
        margin: 0 5rpx;

        > span {
          font-size: 26rpx;
          font-weight: bold;
          color: #333;
          margin-right: 8rpx;
        }
      }
    }
  }
}

.collection-btn {
  background: $main-color;
  padding: 6rpx 0;
  width: 140rpx;
  font-size: 24rpx;
  color: #fff;
  border-radius: 100px;
  text-align: center;
}

.store-desc {
  margin: 40rpx 0 0 0;
  color: #999;
}

.content {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  > .empty {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
  }

  .item {
    overflow: hidden;

    background: #fff;
    width: 49%;
    height: 484rpx;
    font-size: 26rpx;
    display: flex;
    flex-direction: column;
    border: 1px solid #f8f8f8;
    margin-bottom: 20rpx;

    .name {
      text-align: left !important;
      color: #333;
      padding: 0 20rpx;
      margin-top: 20rpx;
      height: 80rpx;
      overflow: hidden;
    }

    .price {
      font-weight: 500;
      color: $main-color;
      font-size: 30rpx;
      padding: 0 20rpx;
      margin-top: 20rpx;
      white-space: nowrap;
    }

    .buyCount {
      display: flex;
      padding: 0 20rpx;
      font-size: 24upx;
      justify-content: space-between;
      color: #999;
    }
  }
}

.discount {
  height: 154rpx;
  border-top: 1px solid #f6f6f6;
  border-bottom: 18rpx solid #f6f6f6;
  background: #f6f6f6;
  overflow: hidden;
  white-space: nowrap;

  .card-box {
    display: inline-block;
    padding-top: 25rpx;
  }

  .card {
    width: 324rpx;
    height: 116rpx;
    background: #fff;
    margin-left: 20rpx;
    border-radius: 5px;
    display: flex;
    align-items: center;

    .money {
      width: 45%;
      color: #fd6466;
      font-weight: 500;
      text-align: center;

      text {
        font-size: 50rpx;
      }
    }

    .xian {
      height: 66rpx;
      border: 1px dashed #f6f6f6;
      position: relative;

      &:before,
      &:after {
        content: "";
        width: 22rpx;
        height: 12rpx;
        position: absolute;
        background: #f6f6f6;
      }

      &:before {
        border-radius: 0 0 22rpx 22rpx;
        top: -30rpx;
        left: -10rpx;
      }

      &:after {
        border-radius: 22rpx 22rpx 0 0;
        bottom: -30rpx;
        left: -10rpx;
      }
    }

    .text {
      flex: 1;
      color: $aider-light-color;
      font-size: 24rpx;
      display: flex;
      flex-direction: column;
      margin-left: 14rpx;

      text:nth-of-type(2) {
        color: #ccc;
      }

      .cur:nth-of-type(1) {
        color: #ccc;
      }
    }
  }
}

.category-item {
  background: #fff;
  padding: 22rpx;
  margin: 20rpx 10rpx;

  > .flex {
    color: #666;
    justify-content: space-between;
  }

  > .child-list {
    display: flex;
    margin: 20rpx 0;
    flex-wrap: wrap;

    > .child {
      justify-content: center;
      margin: 1% 0;
      display: flex;
      width: 48%;
      font-size: 24rpx;
      color: #999;
      margin-right: 1%;
      border: 1rpx solid #ededed;
      box-sizing: border-box;
      height: 70rpx;
      text-align: center;
      line-height: 70rpx;
    }
  }
}

.kefu {
  background: #f7f7f7;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  color: #999;
}
</style>
