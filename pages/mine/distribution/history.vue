<template>
  <view class="log-list">
    <view class="log-way" v-for="(item, index) in datas" :key="index">
      <view class="log-item">
        <view class="log-item-view">
          <view class="title">{{
            item.distributionCashStatus == "APPLY"
              ? "待处理"
              : item.distributionCashStatus == "PASS"
              ? "通过"
              : "拒绝"
          }}</view>
          <view class="price">+{{ item.price | unitPrice }}</view>
        </view>
        <view class="log-item-view">
          <view>{{ item.createTime }}</view>
          <view></view>
        </view>
      </view>
    </view>
    <view class="empty" v-if="empty">
      <u-loadmore :status="status" :icon-type="iconType" bg-color="#f7f7f7" />

      <!-- <u-empty   text="暂无更多提现历史" mode="order"></u-empty> -->
    </view>
  </view>
</template>
<script>
import { cashLog, distributionOrderList } from "@/api/goods";
export default {
  data() {
    return {
      datas: "", //数据集合
      status: "loadmore",
      iconType: "flower",
      empty: false,
      params: {
        pageNumber: 1,
        pageSize: 10,
      },

      type: 0,
      routers: "",
      achParams: {
        distributionId: (this.routers && this.routers.id) || "", //分销商id
        distributionName: (this.routers && this.routers.name) || "", //分销商名称
        distributionOrderStatus: "", //分销商订单状态
        pageNumber: 1,
        pageSize: 10,
      },
    };
  },
  onLoad(option) {
    let title;
    option.type == 0 ? (title = "分销业绩") : (title = "提现记录");

    uni.setNavigationBarTitle({
      title: title, //这是修改后的导航栏文字
    });
    this.routers = option;
    console.log(this.routers);
    option.type == 0 ? this.achievement() : this.history();
  },
  mounted() {},
  onReachBottom() {
    this.status = "loading";
    this.params.pageNumber++;

    this.type == 1 ? this.history() : this.achievement();
  },
  methods: {
    // 业绩
    achievement() {
      distributionOrderList(this.achParams).then((res) => {});
    },
    // 初始化提现历史
    history() {
      uni.showLoading({
        title: "加载中",
      });
      cashLog(this.params).then((res) => {
        if (res.data.success && res.data.result.records.length >= 1) {
          this.datas = res.data.result.records;
        } else {
          this.status = "nomore";
          this.empty = true;
        }
        uni.hideLoading();
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.empty {
  margin: 40rpx 0;
}
.price {
  color: $main-color;
  font-weight: bold;
}
.log-list {
  padding: 0 8rpx;
  overflow: hidden;
  margin: 20rpx 0;
}
.log-way {
  margin: 10rpx 0;
  overflow: hidden;
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx 0;
}
.title {
  font-size: 30rpx;
  font-weight: bold;
}
.log-item-view {
  padding: 8rpx 32rpx;
  display: flex;
  justify-content: space-between;
}
</style>