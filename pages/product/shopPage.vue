<template>
  <view>
    <!-- 楼层装修店铺信息 -->
    <div>
      <!-- 基础店铺：返回 + 搜索；楼层装修无顶部搜索时：仅返回 -->
      <u-navbar
        v-if="!enablePageData || !floorHasTopSearch"
        class="shop-navbar"
        :border="false"
        :fixed="true"
        :placeholder="true"
        left-icon=""
        :auto-back="false"
      >
        <template #left>
          <view class="shop-navbar-inner">
            <view class="nav-back" @click.stop="back">
              <u-icon name="arrow-left" size="20"></u-icon>
            </view>
            <view v-if="!enablePageData" class="search-wrap" @click.stop>
              <u-search
                v-model="keyword"
                @search="search"
                @click="search"
                placeholder="请输入搜索"
                :show-action="false"
              ></u-search>
            </view>
          </view>
        </template>
      </u-navbar>
      <div class="wrapper">
        <!-- 店铺信息模块 -->
        <div class="store">
          <view class="store-logo">
            <u-image
              border-radius="10"
              width="100"
              height="100"
              :src="storeInfo.storeLogo || config.logo"
              mode="aspectFit"
            >
            </u-image>
          </view>
          <view class="store-main">
            <view class="store-top">
              <view class="store-name" @click="getStoreLicencePhoto">
                <text class="store-name-text">{{ storeInfo.storeName || "" }}</text>
              </view>
              <view class="collection">
                <view class="collection-btn" @click.stop="whetherCollection">
                  {{ isCollection ? "已关注" : "+ 关注" }}
                </view>
              </view>
            </view>
            <view class="store-message">
              <view class="store-stat">
                <text class="stat-num">{{ storeInfo.collectionNum || 0 }}</text>
                <text class="stat-label">关注</text>
              </view>
              <view class="store-stat">
                <text class="stat-num">{{ storeInfo.goodsNum || 0 }}</text>
                <text class="stat-label">件商品</text>
              </view>
            </view>
          </view>
        </div>
        <!-- 店铺简介 -->
        <div class="store-desc wes-2">
          {{ storeInfo.storeDesc || '' }}
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
              <text>满{{unitPrice(item.consumeThreshold) }}元可用</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 基础店铺模式 -->
      <div v-if="basePageData">
        <u-tabs
          :list="tabs"
          :lineColor="mainColor"
          :activeStyle="{ color: mainColor }"
          :scrollable="false"
          v-model:current="current"
        ></u-tabs>
        <div class="content" v-if="current == 0">
          <u-empty style='margin-top:100rpx' v-if="goodsList.length == 0" class="empty" text='暂无商品信息'></u-empty>
          <goodsTemplate style="width:100%;" v-else :res="goodsList" :storeName="false" />
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
        <div v-for="(item, index) in pageData.list || []" :key="index">
          <!-- 搜索栏，如果在楼层装修顶部则会自动浮动，否则不浮动 -->
          <u-navbar
            class="navbar shop-navbar"
            v-if="item.type == 'search'"
            :fixed="index === 1 ? false : true"
            :placeholder="index === 1 ? false : true"
            left-icon=""
            :auto-back="false"
          >
            <template #left>
              <view class="shop-navbar-inner">
                <view class="nav-back" @click.stop="back">
                  <u-icon name="arrow-left" size="20"></u-icon>
                </view>
                <view class="floor-search-wrap" @click.stop>
                  <search style="width: 100%" :res="item.options" :storeId="storeId" />
                </view>
              </view>
            </template>
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
  collectionStore,
  getStoreIsCollect,
} from "@/api/members.js";
import config from "@/config/config";

import { getGoodsList } from "@/api/goods.js";
import { getAllCoupons } from "@/api/promotions.js";
import { getFloorStoreData } from "@/api/home"; //获取楼层装修接口
export default {
  data() {
    return {
      config,
      pageData: { list: [] }, //楼层页面数据
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

  computed: {
    floorHasTopSearch() {
      const list = this.pageData && this.pageData.list;
      if (!list || !list.length) return false;
      return list.some((item, index) => item.type === "search" && index !== 1);
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
      this.talkIm(this.storeInfo.storeId)
    },
    back() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        uni.switchTab({ url: "/pages/tabbar/home/index" });
      }
    },
    /**
     * 实例化首页数据楼层
     */
    initPageData() {
      this.pageData = { list: [] };
      getFloorStoreData({
        pageType: "STORE",
        num: this.storeId,
      })
        .then((res) => {
          const result = res.data && res.data.result;
          const pageDataStr = result && result.pageData;
          if (res.data.success && pageDataStr) {
            try {
              const parsed = JSON.parse(pageDataStr);
              this.pageData =
                parsed && Array.isArray(parsed.list)
                  ? parsed
                  : { list: [] };
              this.enablePageData = true;
            } catch (e) {
              this.fallbackToBasePage();
            }
          } else {
            this.fallbackToBasePage();
          }
        })
        .catch(() => {
          this.fallbackToBasePage();
        });
    },
    fallbackToBasePage() {
      this.enablePageData = false;
      this.basePageData = true;
      this.pageData = { list: [] };
      this.getGoodsData();
      this.getCategoryData();
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
      if (this.isLogin("auth")) {
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
      let res = await getStoreIsCollect("STORE", this.storeId);
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
        collectionStore(this.storeId).then((res) => {
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
      if (!this.isLogin("auth")) {
        uni.showToast({
          icon: "none",
          duration: 3000,
          title: "请先登录！",
        });

        this.navigateToLogin("redirectTo");
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
  display: flex;
  align-items: center;

  .store-logo {
    flex-shrink: 0;
    width: 100rpx;
    height: 100rpx;
    overflow: hidden;

    :deep(.u-image),
    :deep(.u-image__image) {
      width: 100rpx !important;
      height: 100rpx !important;
    }
  }

  .store-main {
    flex: 1;
    min-width: 0;
    margin-left: 20rpx;
  }

  .store-top {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 56rpx;
  }

  .store-name {
    width: 100%;
    font-size: 34rpx;
    color: #333;
    letter-spacing: 1rpx;
    font-weight: bold;
    text-align: center;
  }

  .store-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    padding: 0 150rpx;
    box-sizing: border-box;
  }

  .store-message {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #999;
  }

  .store-stat {
    display: flex;
    align-items: baseline;
    white-space: nowrap;
    margin-right: 24rpx;
    font-size: 26rpx;
    color: #999;
  }

  .stat-num {
    font-size: 26rpx;
    font-weight: bold;
    color: #333;
    margin-right: 4rpx;
  }

  .stat-label {
    font-size: 26rpx;
    color: #999;
  }
}

.collection {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  flex-shrink: 0;
}

.collection-btn {
  background: $main-color;
  padding: 8rpx 0;
  width: 140rpx;
  font-size: 24rpx;
  color: #fff;
  border-radius: 100px;
  text-align: center;
  line-height: 1.2;
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

.shop-navbar {
  :deep(.u-navbar__content__left) {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2;
    width: auto !important;
    padding: 0 24rpx 0 8rpx !important;
    box-sizing: border-box;
  }
}

.shop-navbar-inner {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.search-wrap {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.floor-search-wrap {
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
}

.nav-back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 100%;
  flex-shrink: 0;
}
</style>
