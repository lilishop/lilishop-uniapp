<template>
  <view class="content">
    <view class="u-tabs-box">
      <u-tabs
        :list="list"
        :scrollable="false"
        v-model:current="current"
        @change="change"
        :lineColor="$lightColor"
        :activeStyle="{ color: $lightColor }"
      ></u-tabs>
    </view>
    <div class="u-tabs-search">
      <u-search
        placeholder="请输入订单编号/商品名称/售后单号"
        @search="submitSearchOrderList(current)"
        @clear="clear(current)"
        @custom="submitSearchOrderList(current)"
        v-model="keywords"
      >
      </u-search>
    </div>
    <scroll-view class="body-view" scroll-y @scrolltolower="renderDate">
      <view
        class="seller-view"
        v-for="(order, orderIndex) in orderList"
        :key="orderIndex"
      >
        <!-- 店铺名称 -->
        <view class="seller-info" v-if="current == 0">
          <view class="seller-name wes">{{ order.storeName }}</view>
          <view class="order-sn wes">订单编号:{{ order.sn }}</view>
        </view>
        <!-- 申请记录 选项卡 -->
        <view class="seller-info" v-if="current != 0">
          <view class="order-sn wes">售后单号：{{ order.service_sn || order.sn }}</view>
          <view class="order-sn service-type">{{ order.serviceType_text }}</view>
        </view>
        <view v-for="(sku, goodsIndex) in order.orderItems" :key="goodsIndex">
          <view class="goods-item-view" @click="onDetail(order, sku)">
            <view class="goods-img">
              <u-image
                border-radius="6"
                width="131rpx"
                height="131rpx"
                mode="aspectFill"
                :src="getGoodsImage(sku, order, goodsIndex)"
              ></u-image>
            </view>
            <view class="goods-info">
              <view class="goods-title">{{ getGoodsName(sku) }}</view>
              <!-- 如果商品多个则不显示每个商品价格-->
              <view class="goods-price" v-if="order.orderItems.length <= 1">
                ￥{{ unitPrice(order.flowPrice) }}
              </view>
            </view>
            <view class="goods-num">
              <view>x{{ sku.num }}</view>
            </view>
          </view>
          <view class="description">
            <!-- 售后申请  -->
            <view v-if="current === 0 && sku.afterSaleStatus">
              <view
                v-if="sku.afterSaleStatus.includes('ALREADY_APPLIED')"
                class="cannot_apply not_center"
              >
                <u-icon class="icon" name="info-circle-fill"></u-icon>
                该商品已申请售后服务
              </view>
            </view>
            <view v-if="current === 0 && sku.afterSaleStatus">
              <view
                v-if="sku.afterSaleStatus.includes('EXPIRED')"
                class="cannot_apply not_center"
                @click="tipsShow = true"
              >
                <u-icon class="icon" name="info-circle-fill"></u-icon>
                该商品无法申请售后
              </view>
            </view>

            <div v-if="current === 1 || current === 2">
              <!-- 申请中 -->
              <view
                class="cannot_apply not_center"
                v-if="order.serviceType == 'RETURN_GOODS'"
              >
                退货处理-{{serviceStatusList(order.serviceStatus) }}</view
              >
              <view
                class="cannot_apply not_center"
                v-if="order.serviceType == 'SUPPLY_AGAIN_GOODS'"
              >
                补发商品-{{serviceStatusList(order.serviceStatus) }}</view
              >
              <view
                class="cannot_apply not_center"
                v-if="order.serviceType == 'RETURN_MONEY'"
              >
                退款-{{serviceStatusList(order.serviceStatus) }}</view
              >
              <view
                class="cannot_apply not_center"
                v-if="order.serviceType == 'EXCHANGE_GOODS'"
              >
                换货-{{serviceStatusList(order.serviceStatus) }}</view
              >
              <view
                class="cannot_apply not_center"
                v-if="order.serviceType == 'CANCEL'"
              >
                取消订单-{{serviceStatusList(order.serviceStatus) }}</view
              >
            </div>

            <!-- 申请记录 -->
          </view>
          <view class="btn-view">
            <!-- 售后申请  -->

            <div class="sale" v-if="current === 0 && sku.afterSaleStatus">
              <div
                v-if="
									order.flowPrice != 0 &&
                  sku.afterSaleStatus.includes('NOT_APPLIED') ||
                  sku.afterSaleStatus.includes('PART_AFTER_SALE')
                "
                @click="applyService(sku.sn, order, sku)"
              >
                <view class="default-btn border"> 申请售后 </view>
              </div>
            </div>
            <view class="after-line">
              <!-- 申请中 -->
              <view
                class="default-btn border"
                v-if="
                  current === 2 &&
                  order.serviceStatus &&
                  order.serviceStatus == 'PASS' &&
                  order.serviceType != 'RETURN_MONEY'
                "
                @click="onExpress(order, sku)"
              >
                提交物流
              </view>
              <view
                @click="close(order, sku)"
                v-if="current === 1"
                class="default-btn close"
              >
                取消售后
              </view>
              <view
                @click="afterDetails(order, sku)"
                v-if="current === 1 || current === 2"
                class="default-btn border"
              >
                售后详情
              </view>
            </view>
          </view>
        </view>
        <view
          v-if="
            current === 0 &&
            order.groupAfterSaleStatus &&
            order.groupAfterSaleStatus != 'ALREADY_APPLIED' &&
            order.orderItems.length >= 1
          "
          class="btn-view order-total"
        >
          <!-- 多个商品显示订单总价格 -->
          <view class="cannot_apply">
            订单总金额:<span class="countMoney"
              >￥{{unitPrice(order.flowPrice) }}</span
            >
          </view>
        </view>
      </view>
      <u-loadmore bg-color="#f8f8f8" :status="status" />
    </scroll-view>
    <u-modal
      show-cancel-button
      @confirm="closeService"
      v-model:show="cancelShow"
      content="确认取消售后"
    ></u-modal>
    <u-modal
      v-model:show="tipsShow"
      content="当订单未确认收货|已过售后服务有效期|已申请售后服务时，不能申请售后"
    ></u-modal>
  </view>
</template>

<script>
import uniLoadMore from "@/components/uni-load-more/uni-load-more.vue";
import { getAfterSaleList, cancelAfterSale } from "@/api/after-sale.js";
import { getOrderList } from "@/api/order.js";
import storage from "@/utils/storage";

export default {
  components: {
    uniLoadMore,
  },
  data() {
    return {
      list: [
        //tab表头
        {
          name: "售后申请",
        },
        {
          name: "申请中",
        },
        {
          name: "申请记录",
        },
      ],
      current: 0, //当前表头索引
      tipsShow: false, //提示开关
      cancelShow: false, //取消显示开关
      selectedOrder: "", //选中的order
      orderList: [], //订单集合
      params: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        flowPrice: 0,
        order: "desc",
      },

      logParams: {
        pageNumber: 1,
        pageSize: 10,
      },
      status: "loadmore",
      keywords: "", // 搜索订单sn
    };
  },
  onLoad(options) {
    this.orderList = [];
    this.params.pageNumber = 1;
    if (options.orderSn) this.params.keywords = options.orderSn;
    this.searchOrderList(this.current);
  },
  onPullDownRefresh() {
    this.change(this.current);
  },
  methods: {
    getGoodsName(sku) {
      return sku.goodsName || sku.name || "";
    },
    getGoodsImage(goods, order, index) {
      let image = goods.image || goods.goodsImage || goods.thumbnail;
      if (!image && order.groupImages) {
        const images = String(order.groupImages).split(",");
        image = images[index] || images[0];
      }
      return this.parseGoodsImageUrl(image);
    },
    /**
     * 点击搜索执行搜索
     */
    submitSearchOrderList(current) {
      this.params.pageNumber = 1;
      this.logParams.pageNumber = 1;
      this.orderList = [];
      this.searchOrderList(current);
    },
    // 清空
    clear(current){
      this.params.pageNumber = 1;
      this.logParams.pageNumber = 1;
      this.params.keywords = ''
      this.orderList = [];
      this.searchOrderList(current);
    },
    /**
     * 切换tab页时，初始化数据
     */
    change(e) {
      const index = typeof e === 'object' && e != null ? e.index : e;
      this.current = index;
      this.params = {
        pageNumber: 1,
        pageSize: 10,
      };
      this.orderList = [];
      //如果是2 则读取售后申请记录列表
      this.searchOrderList(index);
      uni.stopPullDownRefresh();
    },

    /**
     * 搜索初始化
     * 根据当前tab传值的索引进行更改
     */
    searchOrderList(index) {
      if (index == 0) {
        this.keywords ? (this.params.keywords = this.keywords) : "";
        this.getOrderList();
      } else {
        this.logParams = {
          pageNumber: 1,
          pageSize: 10,
          sort: "createTime",
          order: "desc",
        };
        if (index === 1) {
          this.logParams.serviceStatus = "APPLY";
        }
        this.keywords ? (this.logParams.keywords = this.keywords) : "";
        this.orderList = [];
        this.getAfterSaleLogList();
      }
    },

    /**
     * 获取订单列表
     */
    getOrderList() {
      uni.showLoading({
        title: "加载中",
        mask: true,
      });
      getOrderList(this.params).then((res) => {
         if (this.$store.state.isShowToast){ uni.hideLoading() };
        const orderList = res.data.result.records;
        if (orderList.length > 0) {
          this.orderList = this.orderList.concat(orderList);
          this.params.pageNumber += 1;
        }
        if (orderList.length < 10) {
          this.status = "nomore";
        } else {
          this.status = "loading";
        }
      });
    },

    close(order, sku) {
      console.log(order, sku);
      this.selectedOrder = order;
      this.cancelShow = true;
    },

    async closeService() {
      uni.showLoading({
        title: "加载中",
      });
      console.log(this.selectedOrder);
      let res = await cancelAfterSale(this.selectedOrder.sn);
      if (res.data.success) {
        uni.showToast({
          title: "取消成功!",
          duration: 2000,
          icon: "none",
        });
      }
      this.orderList = [];
      this.searchOrderList(this.current);

       if (this.$store.state.isShowToast){ uni.hideLoading() };
    },

    /**
     * 售后详情
     */
    afterDetails(order) {
      uni.navigateTo({
        url: "./applyDetail?sn=" + order.sn,
      });
    },

    /**
     * 申请记录列表
     */
    getAfterSaleLogList() {
      getAfterSaleList(this.logParams).then((res) => {
        let afterSaleLogList = res.data.result.records;

        afterSaleLogList.forEach((item) => {
          item.orderItems = [
            {
              image: item.goodsImage,
              skuId: item.skuId,
              name: item.goodsName,
              num: item.num,
              price: item.flowPrice,
            },
          ];
        });

        this.orderList = this.orderList.concat(afterSaleLogList);

        if (afterSaleLogList.length < 10) {
          this.status = "nomore";
        } else {
          this.status = "loading";
        }
      });
    },

    /**
     * 申请售后
     */
    applyService(sn, order, sku) {
      let data = {
        ...order,
        ...sku,
      };
      storage.setAfterSaleData(data);
      uni.navigateTo({
        url: `/pages/order/afterSales/afterSalesSelect?sn=${sn}`,
      });
    },

    /**
     * 提交物流信息
     */
    onExpress(order, sku) {
      sku.storeName = order.storeName;
      let data = {
        ...order,
        ...sku,
      };

      storage.setAfterSaleData(data);
      uni.navigateTo({
        url: `./afterSalesDetailExpress?serviceSn=${order.sn}`,
      });
    },

    /**
     * 查看详情
     */
    onDetail(goods, sku) {
      // 售后申请
      if (this.current == 0) {
        uni.navigateTo({
          url: `/pages/product/goods?id=${sku.skuId}&goodsId=${
            sku.goodsId || sku.goodsId
          }`,
        });
      } else {
        uni.navigateTo({
          url: `/pages/product/goods?id=${goods.skuId}&goodsId=${
            goods.goodsId || goods.goodsId
          }`,
        });
      }
    },

    /**
     * 底部加载数据
     */
    renderDate() {
      if (this.current === 0) {
        this.params.pageNumber += 1;
        this.getOrderList();
      } else {
        this.logParams.pageNumber += 1;
        this.getAfterSaleLogList();
      }
    },
  },
};
</script>

<style lang="scss">
page,
.content {
  background: $page-color-base;
  height: 100%;
}

.body-view {
  overflow-y: auto;
  height: calc(100vh - 44px - 80rpx - 104rpx);
  padding: 0 20rpx;
  box-sizing: border-box;
}

.u-tabs-search {
  padding: 20rpx;
  background: #fff;
}

.countMoney {
  margin-left: 7rpx;
  color: $main-color;
  font-size: 28rpx;
}

.seller-view {
  background-color: #fff;
  margin: 20rpx 0;
  padding: 0 20rpx 24rpx;
  border-radius: 20rpx;

  .seller-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 70rpx;
    padding: 20rpx 0 16rpx;
    gap: 20rpx;

    .seller-name {
      flex-shrink: 0;
      max-width: 40%;
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .order-sn {
      flex: 1;
      min-width: 0;
      font-size: 22rpx;
      color: #909399;
      text-align: right;
    }

    .service-type {
      flex-shrink: 0;
      text-align: right;
    }
  }

  .goods-item-view {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 16rpx 0;

    .goods-img {
      flex-shrink: 0;
      width: 131rpx;
      height: 131rpx;
      border-radius: 6rpx;
      overflow: hidden;
    }

    .goods-info {
      flex: 1;
      min-width: 0;
      padding: 0 20rpx;

      .goods-title {
        margin-bottom: 10rpx;
        color: #333333;
        font-size: 26rpx;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
      }

      .goods-specs {
        font-size: 24rpx;
        margin-bottom: 10rpx;
        color: #cccccc;
      }

      .goods-price {
        font-size: 28rpx;
        color: #ff5a10;
      }
    }

    .goods-num {
      flex-shrink: 0;
      min-width: 60rpx;
      text-align: right;
      color: $main-color;
      font-size: 26rpx;
      line-height: 1.4;
    }
  }

  .btn-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 16rpx 0 0;

    .after-line {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 15rpx;
    }
  }

  .order-total {
    justify-content: flex-start;
    padding-top: 8rpx;
    padding-bottom: 4rpx;

    .cannot_apply {
      text-align: left;
      height: auto;
      line-height: 1.5;
    }
  }
}

.description {
  color: #909399;
  size: 25rpx;
}

.cannot_apply {
  text-align: center;
  font-size: 22rpx;

  color: #999999;
  height: 70rpx;
  line-height: 70rpx;
}
.not_center {
  text-align: left;
}

.icon {
  margin-right: 10rpx;
}

.sale {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.default-btn {
  background-color: #ffffff;
  margin-left: 15rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 24rpx;
  padding: 0 24rpx;
  border-radius: 200px;
}

.close {
  color: $light-color;
}

.border {
  border: 2rpx solid $light-color;
  color: $light-color;
}
</style>
