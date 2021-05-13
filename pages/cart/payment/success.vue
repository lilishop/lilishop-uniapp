<template>
  <div class="wrapper">
    <div class="pay-wrapper">
      <div class="pay-money">
        ￥{{ payPrice | unitPrice }}
      </div>
      <div class="pay-btns">
        <div v-show="!from" @click="navigateTo('/pages/order/myOrder?status=0')">查看订单</div>
        <div @click="navigateTo('/pages/tabbar/home/index', 'switch')">回到首页</div>

      </div>
    </div>
    <div class="pay-box">
      <div class="pay-tag-box">
        <h2>订单支付成功!</h2>

        <div class="pay-item">
          <div>
            支付方式：
          </div>
          <div>{{paymentMethod | paymentTypeFilter}}</div>
        </div>

      </div>
      <!-- #ifdef MP-WEIXIN -->
      <div class="subscribe flex">
        <div>订阅订单状态</div>
        <div>
          <u-switch size="50" :disabled="checked" :active-color="activeColor" @change="changeStatus" v-model="checked"></u-switch>
        </div>
      </div>
      <!-- #endif -->
    </div>
    <div class="goods-recommend">--商品推荐--</div>
    <div class="goods-list">
      <div @click="handleClick(item)" class="goods-item" v-for="(item, item_index) in goodsList" :key="item_index">
        <div class="goods-img">
          <u-image :src="item.thumbnail" mode="aspectFill" height="350rpx" width="100%">
            <u-loading slot="loading"></u-loading>
          </u-image>
        </div>
        <div class="goods-desc">
          <div class="goods-title">
            {{ item.goodsName }}
          </div>
          <div class="goods-bottom">
            <div class="goods-price">￥{{ item.price | unitPrice }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  </div>
</template>
<script>
import { getGoodsList } from "@/api/goods.js";
import { getWeChatMpMessage } from "@/api/message.js";

export default {
  data() {
    return {
      checked: false,
      paymentMethod: "",
      from: "",
      payPrice: 0,
      goodsList: [],
	  activeColor:this.$mainColor,
      params: {
        pageSize: 12,
        pageNumber: 0,
      },
    };
  },
  filters: {
    paymentTypeFilter(val) {
      switch (val) {
        case "WECHAT":
          return "微信";
        case "ALIPAY":
          return "支付宝";
        case "WALLET":
          return "余额支付";
        default:
          return "";
      }
    },
  },
  onLoad(options) {
    this.paymentMethod = options.paymentMethod || "";
    this.from = options.from || "";
    this.payPrice = parseInt(options.payPrice) || 0;
    //搜索商品
    this.initGoods();
  },
  methods: {
    changeStatus(val) {
      if (val) {
        this.sendMessage();
      }
    },
    async initGoods() {
      let goodsList = await getGoodsList(this.params);
      this.goodsList.push(...goodsList.data.result.content);
    },
    sendMessage() {
      //订阅消息
      //#ifdef MP-WEIXIN
      getWeChatMpMessage().then((res) => {
        var message = res.data.result;
        var templateid = message.map((item) => item.code);
        uni.requestSubscribeMessage({
          tmplIds: templateid,
          success: (res) => {
			  for(let key in res){
				  if(res[key] == "reject"){
					  this.checked = false;
				  }
			  }
           
          },
          fail: (res) => {
            uni.removeStorageSync("acceptSubscribeMessage");
            this.checked = false;
          },
        });
      });
      //#endif
    },

    handleClick(item) {
      uni.navigateTo({
        url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
      });
    },

    navigateTo(url, type) {
      if (type === "switch") {
        uni.switchTab({
          url,
        });
      } else {
        uni.redirectTo({
          url,
        });
      }
    },
  },
};
</script>
<style scoped lang="scss">
.subscribe {
  justify-content: space-between;
  align-items: center;
  margin: 0 auto 40rpx auto;
  padding: 0 20rpx 20rpx;
  width: 80%;
   
}
.pay-btns {
  display: flex;
  width: 50%;
  justify-content: space-between;
  margin: 0 auto;
  color: #fff;

  > div {
    padding: 6px 12px;
    border: 1px solid #fff;
    border-radius: 100px;
  }
}

.pay-money {
  line-height: 1;
  font-size: 50rpx;
  color: #fff;
  margin-bottom: 100rpx;
}

.pay-item {
  font-weight: bold;
  margin: 32rpx 0;
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: rgba($color: $main-color, $alpha: 0.8);
}

.pay-box {
  overflow: hidden;
}

.pay-tag-box {
  width: 80%;
  margin: 80rpx auto 40rpx auto;
  padding: 20rpx;
  border-radius: 20rpx;
  background: rgba($color: $main-color, $alpha: 0.2);

  > h2 {
    margin-top: 20rpx;
    font-size: 40rpx;
    color: $main-color;
  }
}

.pay-wrapper {
  background-image: linear-gradient(90deg, #fa123b, #ff6b35, #ff9f28, #ffcc03);
  height: 480rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.pay-box {
  transform: translateY(-100rpx);
  width: 100%;
  background: #fff;
  border-top-right-radius: 100rpx;
}

/**商品代码 */
$w_94: 94%;

.goods-recommend {
  background: #f7f7f7;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: bold;
}

.goods-list {
  display: flex;

  flex-wrap: wrap;
  background: #f7f7f7;
}

.goods-item {
  width: 50%;
  margin-bottom: 10px;
  border-radius: 0.4em;
  overflow: hidden;
}

.goods-img {
  position: relative;
  margin: 0 auto;
  // width: 158px;
  width: $w_94;
  height: 350rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;

  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
  }
}

.goods-desc {
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
  width: $w_94;
  background: #fff;
  padding: 8rpx 0 8rpx 8rpx;
  margin: 0 auto;

  > .goods-title {
    font-size: 12px;
    height: 70rpx;
    display: -webkit-box;
    font-weight: 500;
    -webkit-box-orient: vertical;

    -webkit-line-clamp: 2;

    overflow: hidden;
  }

  > .goods-bottom {
    display: flex;
    font-weight: bold;

    > .goods-price {
      line-height: 2;
      color: $main-color;
    }
  }
}

.goods-icon {
  right: 10rpx;
  top: 10rpx;
  position: absolute;
}
</style>
