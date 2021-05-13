<template>
  <view class="wap">
    <view class="wrapper-show-money">
      <view class="money-view">
        <h3>预存款金额 </h3>
        <view class="money">￥{{walletNum | unitPrice }}</view>
      </view>
    </view>
    <view class="wrapper-tabs">
      
      <swiper class="swiper-box" @change="changeSwiper" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
        <swiper-item class="swiper-item" v-for="index in list.length" :key="index">
          <scroll-view class="scroll-v view-wrapper" enableBackToTop="true" scroll-with-animation scroll-y @scrolltolower="loadMore">
            <view v-if="datas.length!=0" class="view-item" v-for="(logItem, logIndex) in datas" :key="logIndex">
              <view class="view-item-detail">
                <view class="-title">{{logItem.detail}}</view>
                <!-- <view class="-number">{{logItem.detail}}</view> -->
              </view>
              <view class="view-item-change">
                <view class="-money green" v-if="logItem.serviceType == 'WALLET_PAY' || logItem.serviceType == 'WALLET_WITHDRAWAL'"> {{logItem.money | unitPrice}} </view>
                <view class="-money" v-if="logItem.serviceType == 'WALLET_REFUND' || logItem.serviceType == 'WALLET_RECHARGE' || logItem.serviceType == 'WALLET_COMMISSION' ">
                  +{{logItem.money | unitPrice}} </view>
                <view class="-time">{{logItem.createTime}}</view>
              </view>
            </view>

            <u-empty v-if="datas.length==0" mode="history" text="暂无记录" />
            <u-loadmore v-else bg-color='#f8f8f8' :status="status" />
          </scroll-view>

        </swiper-item>

      </swiper>
    </view>
  </view>
</template>

<script>
import { getUserRecharge, getWalletLog } from "@/api/members";
import storage from "@/utils/storage.js";
import { getUserWallet } from "@/api/members";
export default {
  data() {
    return {
      walletNum:0,
      status: "loadmore",
      current: 0,
      swiperCurrent: 0,
      userInfo: "", //用户详情信息
      params: {
        pageNumber: 1,
        pageSize: 10,
        order: "desc",
      },
      datas: [], //遍历的数据集合
      rechargeList: "", //充值明细列表
      walletLogList: "", //钱包变动列表
      list: [
        // {
        //   name: "充值明细",
        // },
        {
          name: "预存款变动明细",
        },
      ],
    };
  },
  watch: {
    swiperCurrent(index) {
      this.swiperCurrent = index;
    },
  },
  async mounted() {
    this.getWallet();
    let result = await getUserWallet(); //预存款
    console.log(result)
    this.walletNum = result.data.result.memberWallet;
  },
  methods: {
    /**分页获取预存款充值记录 */
    getRecharge() {
      this.status = "loading";
      getUserRecharge(this.params).then((res) => {
        if (res.data.success) {
          if (res.data.result.records.length != 0) {
            this.status = "loadmore";
            this.datas.push(...res.data.result.records);
          } else {
            this.status = "nomore";
          }
        }
      });
    },

    getWallet() {
      this.status = "loading";
      getWalletLog(this.params).then((res) => {
        if (res.data.success) {
          if (res.data.result.records.length != 0) {
            this.datas.push(...res.data.result.records);
          } else {
            this.status = "nomore";
          }
        }
      });
    },

    // 点击swiper的时候清空数据
    changeSwiper() {
      this.groupBuy = [];
    },
    changed(index) {
      this.datas = [];
      this.swiperCurrent = index;
      this.params.pageNumber = 1;
      if (index == 0) {
        // this.getRecharge();
        this.getWallet();
      } else {
        this.getWallet();
      }
    },

    // swiper-item左右移动，通知tabs的滑块跟随移动
    transition({ detail: { dx } }) {
      this.$refs.tabs.setDx(dx);
    },
    // 由于swiper的内部机制问题，快速切换swiper不会触发dx的连续变化，需要在结束时重置状态
    // swiper滑动结束，分别设置tabs和swiper的状态
    animationfinish(e) {
      // this.groupBuy = []
      let current = e.detail.current;
      this.$refs.tabs.setFinishCurrent(current);
      this.swiperCurrent = current;
      this.current = current;
    },
    loadMore() {
      this.params.pageNumber++;
      this.getWallet();
    },
  },
};
</script>

<style lang="scss" scoped>
.green {
  color: $aider-color-green !important;
}
.view-item {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.view-item-change {
  text-align: right;
  > .-money {
    font-size: 36rpx;
    color: $main-color;
    font-weight: bold;
  }
  > .-time {
    font-size: 22rpx;
    color: #999;
  }
}
.view-item-detail {
  line-height: 1.75;
  > .-title {
    font-size: 28rpx;
  }
  > .-number {
    font-size: 22rpx;
    color: #999;
  }
}
.submit-btn {
  line-height: 90rpx;
  text-align: center;

  color: #fff;
  background: $main-color;

  margin: 0 auto;
  height: 90rpx;
}
.wap {
}

.money {
  font-size: 40rpx;
  font-weight: bold;
}

.money-view {
  height: 100%;
  width: 100%;
  padding: 0 32rpx;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: column;
  color: #fff;
  background-image: linear-gradient(
    25deg,
    $main-color,
    $light-color,
    $aider-light-color
  );
}

.swiper-item,
.scroll-v {
  height: 100%;
}

.swiper-box {
  /* #ifndef H5 */
  height: calc(100vh - 200rpx);
  /* #endif */

  /* #ifdef H5 */
  height: calc(100vh - 288rpx);
  /* #endif */
}

.wap {
  width: 100%;
  height: calc(100vh - 44px);
}

.wrapper-show-money {
  height: 200rpx;
  // background-image: url('/static/img/main-bg.jpg');
}
</style>
