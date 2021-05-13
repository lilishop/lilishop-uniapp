<template>
  <view class="selected-store">
    <!-- 点击搜索出现搜索框 -->
    <!-- <div v-show="searchHandle" class="searchBox">
			<u-search placeholder="请输入关键字" :clearabled="true" :show-action="false" v-model="pageParams.name"   @blur="searchStore()" @clear="clearSearch()"	 @confirm="searchStore()"  ></u-search>
		</div> -->
    <div>
      <empty v-if="nomsg"></empty>
      <div class="swiper-item">
        <scroll-view class="scroll-v" enableBackToTop="true" scroll-with-animation scroll-y>
          <view class="index-item" v-for="(store,storeIndex) in stores" :key="storeIndex" @click.prevent="storeDetail(store.id)">
            <div class="item-goods">
              <u-image width="51px" height="51px" class="item-title-img" :src="store.storeLogo || noLogo">
                <u-loading slot="loading"></u-loading>
              </u-image>
              <view class="item-content">
                <view>
                  <span>{{ store.storeName }}</span><span class="self-store" v-if="store.selfOperated">自营</span>
                </view>
                <view>
                  <u-rate size="24" :count="5" :disabled="true" v-model="store.descriptionScore"></u-rate>
                </view>
                <view>{{ store.store_collect }} 关注</view>
                <button v-if="store.is_connect==0" @click.stop="collectstore(store.id)" class="collect btn-mini">
                  <u-icon name="plus"></u-icon>关注
                </button>
                <button v-if="store.is_connect==1" @click.stop="collectstore(store.id)" class="collect btn-mini"></u-icon>已关注</button>
              </view>
              <view class="store-num">
                <!-- <view> {{store.goods_num}}</view> -->
                <view>进店逛逛</view>
              </view>

            </div>
          </view>
          <uni-load-more :status="loadStatus"></uni-load-more>
        </scroll-view>

      </div>
    </div>
  </view>
</template>

<script>
import { collectionStore } from "@/api/members.js";
import { getstoreList } from "@/api/store.js";
export default {
  data() {
    return {
      tabIndex: 0,
      currentLeft: 0,
      stores: [],
      pageParams: {
        pageNumber: 1, //页码
        pageSize: 10, //分页大小
        category_id: 0, //分类
        key_words: "", //搜索关键字
        name: "", //店铺名字
      },
      loadStatus: "more",
      nomsg: false,
      noLogo: require("@/static/logo.png"),
    };
  },
  onLoad() {
    this.searchStore();
  },
  watch: {
    tabIndex(val) {
      this.pageParams.pageNumber = 1;
      this.stores = [];
      this.loadStatus = "more";
      this.searchStore();
    },
  },
  onReachBottom() {
   
    this.pageParams.pageNumber++;
    this.searchStore();
  },
  methods: {
    // 清空店铺
    clearSearch() {
      (this.pageParams = {
        pageNumber: 1, //页码
        pageSize: 10, //分页大小
        category_id: 0, //分类
        key_words: "", //搜索关键字
        name: "", //店铺名字
      }),
        this.searchStore();
    },

    async searchStore() {
      uni.showLoading({
        title: "加载中",
      });

      //获取商品数据
      let response = await getstoreList(this.pageParams);
      uni.hideLoading();
      if (this.pageParams.name) {
        this.stores = [];
      }

      this.stores = this.stores.concat(response.data.result.records);
      uni.hideLoading();
      if (
        response.data.result.total <=
        response.data.result.current * response.data.result.size
      ) {
        this.loadStatus = "noMore";
      } else {
        this.loadStatus = "loadmore";
      }
      if (this.stores.length == 0) {
        this.nomsg = true;
        return;
      }
    },

    collectstore(id) {
      //收藏店铺
      collectionStore(id).then((res) => {
        if (res.statusCode == 200) {
          this.$api.msg("收藏成功");
          this.pageParams.pageNumber = 1;
          this.stores = [];
          this.searchStore();
        }
      });
    },
    storeDetail(id) {
      uni.navigateTo({
        url: "/pages/product/shopPage?id=" + id,
      });
    },
  },
};
</script>
<style>
page {
  height: 100%;
}
</style>
<style lang="scss" scoped>
.searchBox {
  margin: 20rpx 0;
}

.selected-store {
  height: 100%;

  .list-scroll-content {
    position: relative;
    width: 100%;
    display: flex;
    white-space: nowrap;
    align-items: center;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    color: #333;

    .tab-item {
      width: 160rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      display: inline-block;
    }

    .active {
      border-bottom: 2px solid #ffffff;
      broder-width: 60rpx;
      font-size: 30rpx;
      padding-bottom: 4rpx;
    }
  }

  .swiper-box {
    height: calc(100% - 80rpx);

    .scroll-v {
      height: 100%;
    }
  }
  .index-item {
    // height: 535rpx;
    margin: 20rpx;
    background-color: #ffffff;
    border-radius: 14rpx;

    .item-goods {
      height: 170rpx;
      margin: 0 20rpx;
      padding: 30rpx 0;
      // border-bottom: 1px solid #eeeeee;
      display: flex;
      align-items: center;

      image {
        width: 102rpx;
        height: 102rpx;
        border-radius: 50%;
      }
      .item-title-img {
        width: 102rpx !important;
        height: 102rpx !important;
        border-radius: 50% !important;
      }

      .item-content {
        flex: 1;
        line-height: 2em;
        font-size: $font-sm;
        position: relative;
        .collect {
          position: absolute;
          width: 100rpx;
          height: 40rpx;
          font-size: 26rpx;
          bottom: 20rpx;
          right: 30rpx;
          padding: 0;
          line-height: 40rpx;
          text-align: right;
          padding-right: 14rpx;
          .u-icon {
            font-size: 26rpx;
            position: absolute;
            top: 7rpx;
            left: 10rpx;
            margin-right: 5rpx;
          }
        }
        > view:first-child {
          font-size: $font-base;
          color: #333333;
          font-weight: 700;
          position: relative;

          span:nth-child(2) {
            position: absolute;
            font-weight: 400;
            top: 12rpx;
            font-size: 18rpx;
            margin-left: 20rpx;
            height: 26rpx;
            width: 50rpx;
            line-height: 26rpx;
            text-align: center;
            color: #ffffff;
            background-color: #ff6262;
            border-radius: 4rpx;
          }
        }

        color: #999;
        margin-left: 30rpx;
      }

      .store-num {
        width: 150rpx;
        text-align: center;
        border-left: 1px solid #eeeeee;

        :nth-child(1) {
          font-size: 26rpx;
        }

        :nth-child(2) {
          font-size: 18rpx;
          color: #999;
        }
      }
    }
  }

  .goods-in-store {
    height: 364rpx;
    white-space: nowrap;
    padding: 20rpx 0 20rpx 20rpx;

    .goods-item {
      width: 195rpx;
      display: inline-block;
      white-space: normal;
      margin-right: 20rpx;
      font-size: $font-sm;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      image {
        width: 195rpx;
        height: 195rpx;
        border-radius: 8rpx;
      }

      > view {
        margin-top: 10rpx;
      }
      .goods-item-img {
        width: 195rpx !important;
        height: 195rpx !important;
        border-radius: 8rpx !important;
      }

      > view:nth-child(2) {
        color: #ff5a10;
      }

      .goods-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
  }
}
</style>
