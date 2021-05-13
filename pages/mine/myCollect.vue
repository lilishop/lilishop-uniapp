<template>
  <view class="content">
    <view class="navbar">
      <view v-for="(item, index) in navList" :key="index" class="nav-item" @click="tabClick(index)">
        <text :class="{current: tabCurrentIndex === index}">{{item.text}}</text>
      </view>
    </view>
    <view class="swiper-box" duration="300" @change="changeTab">
      <view v-if="tabCurrentIndex == 0" class="tab-content">
        <scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadMore">
          <!-- 空白页 -->
          <empty v-if="goodsEmpty"></empty>

          <!-- 数据 -->
          <u-swipe-action @open="openChange(item,index,'goods')" :show="item.selected" btn-width="180" :options="options" v-else v-for="(item,index) in goodList"
            @click="clickGoodsSwiperAction(item,index)" :index="index" :key="index">
            <view class="goods" @click="goGoodsDetail(item)">
              <u-image width="131rpx" height="131rpx" :src="item.image" mode="aspectFit">
                <u-loading slot="loading"></u-loading>
              </u-image>
              <view class="goods-intro">
                <view>{{item.goodsName}}</view>
                <view class="goods-sn">{{item.goods_sn}}</view>
                <view>￥{{item.price | unitPrice}}</view>
              </view>
              <!-- <button @click.stop="goSimilar(item)">找相似</button> -->
            </view>
          </u-swipe-action>

          <uni-load-more :status="goodLoad"></uni-load-more>
        </scroll-view>
      </view>
      <view v-else class="tab-content">
        <scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadMore">
          <!-- 空白页 -->
          <empty v-if="storeEmpty"></empty>
          <!-- 数据 -->

          <u-swipe-action @open="openChange(item,index,'store')" :show="item.selected" btn-width="180" :options="options" v-else v-for="(item,index) in storeList" :key="index"
            @click="clickstoreSwiperAction(item)">
            <view class="store" @click="gostoreMainPage(item.storeId)">
              <view class="intro">
                <view class="store-logo">
                  <u-image width="102rpx" height="102rpx" :src="item.logo" :alt="item.storeName" mode="aspectFit">
                    <u-loading slot="loading"></u-loading>
                  </u-image>
                </view>
                <view class="store-name">
                  <view>{{item.storeName}}</view>
                  <u-tag size="mini" type="error" :color="$mainColor" v-if="item.selfOperated" text="自营" mode="plain" shape="circle" />

                </view>
                <view class="store-collect">

                  <view>进店逛逛</view>
                </view>
              </view>
            </view>
          </u-swipe-action>
          <uni-load-more :status="storeLoad"></uni-load-more>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  getGoodsCollection,
  deleteGoodsCollection,
  deleteStoreCollection,
} from "@/api/members.js";
export default {
  data() {
    return {
      options: [
        {
          text: "取消",
          style: {
            backgroundColor: this.$lightColor,
          },
        },
      ],
      tabCurrentIndex: 0,
      navList: [
        {
          text: "商品(0)",
          loadingType: "more",
          params: {
            pageNumber: 1,
            pageSize: 10,
          },
        },
        {
          text: "店铺(0)",
          loadingType: "more",
          params: {
            pageNumber: 1,
            pageSize: 10,
          },
        },
      ],
      goodLoad: "more",
      storeLoad: "more",
      goodsEmpty: false,
      storeEmpty: false,
      goodList: [],
      storeList: [],
    };
  },
  onLoad() {
    // this.loadData();
    this.getGoodList();
    this.getstoreList();
  },

  methods: {
    openChange(val, index, type) {
      const { goodList, storeList } = this;
      let way;
      type == "goods" ? (way = goodList) : (way = storeList);

      way.forEach((item, ids) => {
        this.$set(item, "selected", false);
      });

      this.$set(val, "selected", false);
      val.selected = true;
      console.log(val.selected);
    },
    /*   openstore(val, index) {
      this.storeList.forEach((item, ids) => {
        this.$set(item, "selected", false);
      });

      this.$set(val, "selected", false);
      val.selected = true;
    }, */
    /** 点击取消按钮 */
    clickGoodsSwiperAction(val, index) {
      deleteGoodsCollection(val.skuId).then((res) => {
        console.log(res);
        if (res.statusCode == 200) {
          this.storeList = [];
          this.goodList = []
          this.getGoodList();
        }
      });
    },

    clickstoreSwiperAction(val) {
      deleteStoreCollection(val.storeId).then((res) => {
        if (res.statusCode == 200) {
          this.storeList = [];
          this.getstoreList();
        }
      });
    },

    //顶部tab点击
    tabClick(index) {
      this.tabCurrentIndex = index;
      console.log(this.tabCurrentIndex);
    },
    changeTab(e) {
      this.tabCurrentIndex = e.target.current;
    },
    goSimilar(goods) {
      //找相似
      uni.navigateTo({
        url:
          "/pages/user/similarGoods?goods=" +
          encodeURIComponent(JSON.stringify(goods)),
      });
    },
    goGoodsDetail(val) {
      //商品详情
      uni.navigateTo({
        url: "/pages/product/goods?id=" + val.skuId +"&goodsId="+val.goodsId,
      });
    },
    gostoreMainPage(id) {
      //店铺主页
      uni.navigateTo({
        url: "/pages/product/shopPage?id=" + id,
      });
    },
    getGoodList() {
      uni.showLoading({
        title: "加载中",
      });
      getGoodsCollection(this.navList[0].params, "GOODS").then((res) => {
        uni.hideLoading();
        uni.stopPullDownRefresh();
        if (res.statusCode == 200) {
          if (res.statusCode == 200) {
            let data = res.data.result;
            data.selected = false;
            this.navList[0].text = `商品(${data.total})`;
            if (data.total == 0) {
              this.goodsEmpty = true;
            } else if (data.total < 10) {
              this.goodLoad = "noMore";
              this.goodList.push(...data.records);
            } else {
              this.goodList.push(...data.records);
              if (data.total.length < 10) this.goodLoad = "noMore";
            }
          }
        }
      });
    },
    getstoreList() {
      uni.showLoading({
        title: "加载中",
      });
      getGoodsCollection(this.navList[1].params, "store").then((res) => {
        uni.hideLoading();
        uni.stopPullDownRefresh();
        if (res.statusCode == 200) {
          if (res.statusCode == 200) {
            let data = res.data.result;
            data.selected = false;
            this.navList[1].text = `店铺(${data.total})`;
            if (data.total == 0) {
              this.storeEmpty = true;
            } else if (data.total < 10) {
              this.storeLoad = "noMore";
              this.storeList.push(...data.records);
            } else {
              this.storeList.push(...data.records);
              if (data.total.length < 10) this.storeLoad = "noMore";
            }
          }
        }
      });
    },
    loadMore() {
      if (this.tabCurrentIndex == 0) {
        this.navList[0].params.pageNumber++;
        this.getGoodList();
      } else {
        this.navList[1].params.pageNumber++;
        this.getstoreList();
      }
    },
  },
  onPullDownRefresh() {
    if (this.tabCurrentIndex == 0) {
      this.navList[0].params.pageNumber = 1;
      this.goodList = [];
      this.getGoodList();
    } else {
      this.navList[1].params.pageNumber = 1;
      this.storeList = [];
      this.getstoreList();
    }
  },
};
</script>

<style lang="scss">

page,
.content {
  background: $page-color-base;
  height: 100%;
}
.content {
	width: 100%;
	overflow: hidden;
}
.swiper-box {

	overflow-y: auto;
}
.goods-price {
	text-align: left;
}
.list-scroll-content {
	height: 100%;
	width: 100%;
}
.goods-name {
	color: #333 !important;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 22rpx;
}
/deep/ .u-swipe-content{
	overflow: hidden;
}
.goods {
	background-color: #fff;
	border-bottom: 1px solid $border-color-light;
	height: 190rpx;
	display: flex;
	align-items: center;
	padding: 30rpx 20rpx;
	margin-top: 20rpx;
	image {
		width: 131rpx;
		height: 131rpx;
		border-radius: 10rpx;
	}
	.goods-intro {
		flex: 1;
		font-size: $font-base;
		line-height: 48rpx;
		margin-left: 30rpx;

		view:nth-child(1) {
			line-height: 1.4em;
			font-size: 24rpx;
			max-height: 2.8em; //height是line-height的整数倍，防止文字显示不全
			overflow: hidden;
			color: #666;
		}
		view:nth-child(2) {
			color: #cccccc;
			font-size: 24rpx;
		}
		view:nth-child(3) {
			color: $light-color;
		}
	}
	button {
		color: $main-color;
		height: 50rpx;
		width: 120rpx;
		font-size: $font-sm;
		padding: 0;
		line-height: 50rpx;
		background-color: #ffffff;
		margin-top: 80rpx;
		&::after {
			border-color: $main-color;
		}
	}
}
.store {
	background-color: #fff;
	border: 1px solid $border-color-light;
	border-radius: 16rpx;
	margin: 20rpx 10rpx;
	.intro {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 30rpx 0 40rpx;
		height: 170rpx;

		.store-logo {
			width: 102rpx;
			height: 102rpx;
			border-radius: 50%;
			overflow: hidden;
			image {
				width: 100%;
				height: 100%;
				border-radius: 50%;
			}
		}
		.store-name {
			flex: 1;
			margin-left: 30rpx;
			line-height: 2em;
			:first-child {
				font-size: $font-base;
			}
			:last-child {
				font-size: $font-sm;
				color: #999;
			}
		}
		.store-collect {
			border-left: 1px solid $border-color-light;
			padding-left: 20rpx;
			text-align: center;
			:last-child {
				color: #999;
				font-size: $font-sm;
			}
		}
	}
	.store-goods {
		// height: 300rpx;
		// width: 750rpx;
		white-space: nowrap;
		position: relative;
		padding: 30rpx 20rpx;
		&::before {
			content: "";
			width: calc(100% - 40rpx);
			position: absolute;
			top: 0;
			left: 20rpx;
			z-index: 2;
			border-top: 2rpx solid #eeeeee;
		}
		.store-item {
			display: inline-block;
			margin-left: 10rpx;
			width: 250rpx;
			overflow: hidden;
			image {
				width: 228rpx;
				height: 180rpx;
			}
			> .goods-price {
				color: $main-color;
				text:first-child {
					font-size: $font-sm;
				}
				text:last-child {
					font-size: $font-base;
					font-weight: bold;
				}
			}
		}
	}
}
.navbar {
	display: flex;
	height: 40px;
	padding: 0 5px;
	background: #fff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
	position: relative;
	z-index: 10;
	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 26rpx;
	
		text {
			position: relative;
		}
		text.current {
			color: $light-color;
			font-weight: bold;
			font-size: 28rpx;
			&::after {
				content: "";
				position: absolute;
				left: 20rpx;
				bottom: -10rpx;
				width: 30rpx;
				height: 0;
				border-bottom: 2px solid $light-color;
			}
		}
	}
}

</style>
