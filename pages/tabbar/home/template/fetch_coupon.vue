<template>
  <div>
    <u-popup v-model="enableShowCoupon" mode="center" width="550rpx" height="400px">
      <view style="height: 130rpx">
        <view
          style="
            width: 200rpx;
            height: 120rpx;
            float: left;
            line-height: 120rpx;
            font-size: 35rpx;
            color: #28a4f2;
            font-weight: 600;
            margin-left: 20rpx;
          "
          >优惠券活动</view
        >
        <view style="width: 120rpx; height: 120rpx; float: right">
          <image
            @click="enableShowCoupon = false"
            src="/static/cpauto1.png"
            style="width: 100%; height: 100%"
          ></image>
        </view>
      </view>
      <scroll-view scroll-y="true" style="height: 620rpx">
        <!-- {{coupList}} -->
        <view v-for="(item, index) in coupList" :key="index">
          <view class="grad1">
            <view style="float: right">
              <view v-if="item.couponType == 'DISCOUNT'"
                >{{ item.discount }}折</view
              >
              <view v-else
                >优惠金额：<span style="color: red; font-size: 32rpx">{{
                  item.price | unitPrice
                }}</span
                >元</view
              >
              <view
                >满<span style="color: red; font-size: 32rpx"
                  >{{ item.consumeThreshold | unitPrice }}元</span
                >可用</view
              >
              <view v-if="item.scopeType == 'ALL' && item.storeId == '0'"
                >全平台</view
              >
              <view v-if="item.scopeType == 'PORTION_GOODS_CATEGORY'"
                >仅限品类</view
              >
              <view v-else
                >{{
                  item.storeName == "platform"
                    ? "全平台"
                    : item.storeName + "店铺"
                }}使用
              </view>
              <view v-if="item.endTime"
                >有效期至：{{ item.endTime.split(" ")[0] }}</view
              >
            </view>
            <view
              style="
                color: white;
                font-size: 28rpx;
                font-weight: 500;
                float: left;
                writing-mode: vertical-rl;
                flex: auto;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              "
              @click="enableShowCoupon = false"
            >
              立即使用
            </view>
          </view>
        </view>
      </scroll-view>
    </u-popup>
  </div>
</template>

<script>
import { getAutoCoup } from "@/api/login";
import storage from "@/utils/storage.js";
export default {
  data() {
    return {
      storage,
      enableShowCoupon: false,
      coupList:[]
    };
  },
  mounted() {
    this.firstGetAuto();
  },
  methods: {
    firstGetAuto() {
      if(!this.$options.filters.isLogin('auth')) return false
      let data = new Date();
      let now = data.getDate();
      let hours = data.getHours();
      let flagCoup = storage.getAutoCp();
      if (
        storage.getAutoCp() &&
        storage.getAutoCp() != "" &&
        storage.getAutoCp() != undefined &&
        storage.getAutoCp() != null
      ) {
        if (Number(now) > Number(flagCoup)) {
          if (Number(hours) >= 6) {
            storage.setAutoCp(now);
            this.getAutoCp();
          }
        }
      } else {
        this.getAutoCp();
      }
    },
    getAutoCp() {
      let data = new Date();
      let now = data.getDate();
      getAutoCoup().then((res) => {
        console.log(res);
        if (res.data.success) {
          this.coupList.push(...res.data.result);
          if (this.coupList != "") {
            this.enableShowCoupon = true;
          } else {
            this.enableShowCoupon = false;
          }
          storage.setAutoCp(now);
          let objs = {};
          this.coupList = this.coupList.reduce((cur, next) => {
            //对象去重
            if (next.id != undefined) {
              objs[next.id] ? "" : (objs[next.id] = true && cur.push(next));
            }
            return cur;
          }, []);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.grad1 {
  width: 500rpx;
  height: 200rpx;
  background: radial-gradient(circle at right top, transparent 20rpx, #ff6b35 0)
      top left / 120rpx 51% no-repeat,
    radial-gradient(circle at right bottom, transparent 20rpx, #ff6b35 0) bottom
      left / 120rpx 51% no-repeat,
    radial-gradient(circle at left top, transparent 20rpx, #ffffff 0) top right /
      380rpx 51% no-repeat,
    radial-gradient(circle at left bottom, transparent 20rpx, #ffffff 0) bottom
      right / 380rpx 51% no-repeat;
  filter: drop-shadow(6rpx 6rpx 6rpx rgba(0, 0, 0, 0.3));
  margin: 30rpx auto;
  padding-top: 2rpx;
  padding-bottom: 10rpx;
  padding-left: 38rpx;
  padding-right: 30rpx;
}
</style>
