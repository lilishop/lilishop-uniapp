<template>
  <div class="wrapper">
    <view class="status_bar">
      <!-- 这里是状态栏 -->
    </view>

    <u-navbar :isBack="false" title="购物车">

    </u-navbar>

    <!-- 空白页-->
    <view v-if="cartDetail.cartList == '' || cartDetail.cartList == [] || !cartDetail" class="empty">
      <image src="/static/emptyCart.jpg" mode="aspectFit"></image>
      <view class="empty-tips">
        空空如也
        <navigator class="navigator" url="/pages/tabbar/home/index" open-type="switchTab">随便逛逛></navigator>
      </view>
    </view>

    <!-- 店铺商品信息 -->
    <div class="content">
      <div class="box box2" :class="{ invalid: isInvalid(item) }" v-for="(item, index) in cartDetail.cartList" :key="index">

        <view class="tab">
          <view class="store-line">
            <u-checkbox-group class="store-line-check">
              <!-- #ifndef MP-WEIXIN -->
              <u-checkbox shape="circle" active-color="rgb(255, 107, 53)" v-model="item.checked" @change="checkboxChangeDP(item)"></u-checkbox>
              <!-- #endif -->
              <!-- 微信小程序这里 v-model出现问题，改用:value -->
              <!-- #ifdef MP-WEIXIN -->
              <u-checkbox shape="circle" active-color="rgb(255, 107, 53)" :value="item.checked" @change="checkboxChangeDP(item)"></u-checkbox>
              <!-- #endif -->
            </u-checkbox-group>
            <span class="ybname store-line-desc" @click.stop="tostore(item)">{{
              item.storeName
            }}</span>
          </view>
          <view class="right_Col" @click="toConpon(item)">
            <div class="right_Line"></div>
            <span>领劵</span>
          </view>

        </view>

        <u-swipe-action :show="skuItem.selected" @open="openAction(skuItem)" :options="options" bg-color="#fff" ref="swiperAction" class="cartItem" v-for="(skuItem, i) in item.skuList" :index="i"
          :key="skuItem.goodsSku.id" @click="longtap(skuItem)" @longpress="longtap(skuItem)">
          <!-- 满减活动 -->
          <div v-if="skuItem.promotions" v-for="(fullDiscount,fullDiscountIndex) in skuItem.promotions" :key="fullDiscountIndex">
            <div v-if="fullDiscount.promotionType == 'FULL_DISCOUNT'">
              <div class="promotion-notice" v-if="item.promotionNotice">
                <span class="tips">满减</span>
                <span style="flex:10;">{{item.promotionNotice}}</span>
              </div>
            </div>
          </div>
          <view class="goods-row" :class="{ invalid: isInvalid(skuItem) }">
            <view class="goods-config">
              <view>
                <u-checkbox-group v-if="skuItem.invalid == 0">
                  <!-- #ifndef MP-WEIXIN -->
                  <u-checkbox shape="circle" active-color="rgb(255, 107, 53)" class="c-left" v-model="skuItem.checked" @change="checkboxChange(skuItem)"></u-checkbox>
                  <!-- #endif -->
                  <!-- 微信小程序这里 v-model出现问题，改用:value -->
                  <!-- #ifdef MP-WEIXIN -->
                  <u-checkbox shape="circle" active-color="rgb(255, 107, 53)" class="c-left" :value="skuItem.checked" @change="checkboxChange(skuItem)"></u-checkbox>
                  <!-- #endif -->
                </u-checkbox-group>
                <span class="invalid" v-else style="font-size: 24rpx">失效</span>
              </view>
              <u-image border-radius="20" :fade="true" @click.native="toProduct(skuItem)" width="200rpx" height="200rpx" :src="skuItem.goodsSku.thumbnail" @click="toProduct(skuItem)" />
            </view>
            <view class="goods-content">
              <!-- 商品名称 -->
              <p class="sp-name" @click="toProduct(skuItem)">
                {{ skuItem.goodsSku.goodsName }}
              </p>
              <!-- 规格 -->
              <p class="sp-type">{{skuItem.goodsSku.simpleSpecs}}</p>
              <p class="sp-number">
                <view class="sp-price">
                  <div class="default-color" :class="{'theme-color':skuItem.promotions.length <=0  }">
                    ￥<span>{{ Fixed(skuItem.goodsSku.price)[0] }}</span>
                    <span>.{{ Fixed(skuItem.goodsSku.price)[1] }}</span>
                  </div>
                </view>
                <view>
                  <!-- #ifndef MP-WEIXIN -->
                  <u-number-box class="uNumber" :min="1" input-width="70" input-height="40" size="20" v-model="skuItem.num" @change="numChange(skuItem)"></u-number-box>
                  <!-- #endif -->
                  <!-- #ifdef MP-WEIXIN -->
                  <u-number-box class="uNumber" :min="1" input-width="70" input-height="40" size="20" :value="skuItem.num" @plus="numChange(skuItem, '1')" @change="numChange_WEIXIN" :skuItem="skuItem"
                    @minus="numChange(skuItem, '0')"></u-number-box>
                  <!-- #endif -->
                </view>
                <!-- 如果当有促销并且促销是 限时抢购 -->
                <!-- promotions -->
              <div class="promotions-list" v-if="skuItem.promotions" v-for="(seckill,seckillIndex) in skuItem.promotions" :key="seckillIndex">
                <div class="promotions-item-seckill" v-if="seckill.promotionType == 'SECKILL'">
                  距秒杀结束: <u-count-down show-border :hide-zero-day="true" :color="$mainColor" border-color="#ededed" font-size="24" :timestamp="getCountDownTime(seckill.endTime)">
                  </u-count-down>
                </div>

              </div>

              <!-- 如果有活动 并且是选中的状态,显示预估到手价格 -->
              <div class="priceDetail-flowPrice" :class="{'theme-color':skuItem.priceDetailDTO}"
                v-if="skuItem.priceDetailDTO && skuItem.invalid == 0  && skuItem.promotions.length!=0 && skuItem.checked && skuItem.checked">
                预估到手价 ￥<span>{{ Fixed(skuItem.priceDetailDTO.flowPrice)[0]}}</span>
                <span>.{{ Fixed(skuItem.priceDetailDTO.flowPrice)[1] }} </span>
              </div>

              </p>
            </view>
          </view>
        </u-swipe-action>
      </div>
    </div>
    <u-modal v-model="delshow" @confirm="confirm" show-cancel-button :content="delcontent" :async-close="true"></u-modal>
    <!-- 结账 -->
    <div class="box box6">
      <view class="navL">

        <u-checkbox shape="circle" active-color="rgb(255, 107, 53)" v-model="checkout" @change="checkOut()" label-size="24">全选</u-checkbox>
        <span class="price">
          <div class="prices">
            <div class="fullPrice">
              <span class="number" v-if="cartDetail && cartDetail.priceDetailDTO">
                总计: <span>¥{{ Fixed(cartDetail.priceDetailDTO.flowPrice)[0] }}</span>.<span>{{ Fixed(cartDetail.priceDetailDTO.flowPrice)[1] }}</span>
              </span>
              <span class="number" v-else>总计:0.00</span>
            </div>
            <div v-if="cartDetail.cartList && cartDetail.cartList.length!=0 && cartDetail.priceDetailDTO && cartDetail.priceDetailDTO.discountPrice!=0 " class="discountPrice">
              <span>优惠减:￥{{(cartDetail.priceDetailDTO.goodsPrice - cartDetail.priceDetailDTO.flowPrice) | unitPrice}} </span>
              <span class="discountDetails" @click="discountDetails">优惠明细</span>
            </div>
          </div>
        </span>
      </view>

      <!-- 优惠详情 -->
      <u-popup z-index="3" close mode="bottom" height="50%" closeable v-model="discountDetailsFlag" border-radius="20">
        <div class="discount-list">
          <view class="discount-title">优惠明细</view>
          <div class="discount-way">
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">
              <span>商品总额</span>
              <span>￥{{cartDetail.priceDetailDTO.goodsPrice | unitPrice}}</span>

            </div>
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">
              <span>优惠券</span>
              <span>-￥{{cartDetail.priceDetailDTO.couponPrice | unitPrice}}</span>

            </div>
            <div class="discount-item" v-if="cartDetail.priceDetailDTO">

              <span>其他优惠</span>
              <span>-￥{{cartDetail.priceDetailDTO.discountPrice | unitPrice}}</span>

            </div>
          </div>
        </div>
      </u-popup>

      <view v-if="isEdit" @click="delGoods()">
        <div class="navR">删除</div>
      </view>

      <view v-else @click="submitOrder()">
        <div class="navR">去结算</div>
      </view>
    </div>
    <u-toast ref="uToast" />

    <u-select :default-value="singleDefaultValue" v-model="singleFlag" @confirm="singleConfirm" value-name="activity_id" label-name="title" :list="singleList"></u-select>
  </div>
</template>
<script>
import * as API_Trade from "@/api/trade";
export default {
  data() {
    return {
      discountDetailsFlag: false,
      // 商品栏右侧滑动按钮
      options: [
        {
          text: "删除",
          style: {
            backgroundColor: this.$lightColor,
          },
        },
      ],
      singleList: [],
      singleVal: "",
      singleDefaultValue: [], //默认选择第几个
      singleFlag: false, //选择器开关
      isInvalid(val) {
        if (val.invalid == 1) {
          return true;
        } else {
          return false;
        }
      },
      delshow: false,
      delcontent: "删除该商品？",
      show: false,
      empty: false, //空白页现实  true|false,

      cartDetail: "",

      price: 0,
      point: 0,

      goodsVal: "",

      // 是否是编辑
      isEdit: false,

      checkout: true,
      cartBackbtn: {
        from: "",
        id: "",
      },
      WEIXIN_num: "",
    };
  },
  watch: {},
  onReady() {
    // this.windowChangeSize();
  },
  onShow() {
    this.delshow ? (this.delshow = false) : true;
    if (this.$refs.swiperAction) {
      this.$refs.swiperAction.forEach((item, index) => {
        item.show = false;
      });

      this.getCardData();
    } else {
      this.getCardData();
    }
  },

  mounted() {},
  methods: {
    getCountDownTime(val) {
      let date = new Date(val.replace(/-/g, "/"));
      let timeSimple = new Date(date).getTime() / 1000;
      return timeSimple - new Date().getTime() / 1000;
    },
    isPintuan(val) {
      val.forEach((item) => {
        if (item.promotionType == "PINTUAN") {
          delete val[item];
        } else {
          return true;
        }
      });
    },
    // 优惠明细
    discountDetails() {
      this.discountDetailsFlag = true;
    },

    // 格式化金钱  1999 --> [1999,00]
    Fixed(val) {
      if (typeof val == "undefined") {
        return val;
      }
      return val.toFixed(2).split(".");
    },

    /**左滑打开删除 */
    openAction(skuItem) {
      /**循环父级有多少个店铺 */
      this.cartDetail.cartList.forEach((cart_item, cart_index) => {
        if (cart_item.skuList) {
          cart_item.skuList.forEach((sku, sku_index) => {
            this.$set(sku, "selected", false);
          });
        }
      });
      this.$set(skuItem, "selected", true);
      // skuItem.selected = true
      console.log(skuItem.selected);
    },
    // 点击选择活动
    singleConfirm(val) {
      console.log("val", val);
      if (val[0].value) {
        this.singleList.forEach((item) => {
          if (item.activity_id == val[0].value && item.title == val[0].label) {
            this.singleVal.activity_id = item.activity_id;
            this.singleVal.promotion_type = item.promotion_type;
          }
        });
        API_Trade.changeActivity(this.singleVal).then((res) => {
          if (res.statusCode == 200) {
            this.getCardData();
          }
        });
      }
    },
    // 选择活动框显示
    singleClick(val, data, index) {
      this.singleDefaultValue[0] = index;
      this.singleFlag = true;
      this.singleList = val;
      this.singleVal = {
        storeId: data.storeId,
        skuId: data.skuId,
      };
    },
    longtap(val) {
      this.delshow = true;
      this.goodsVal = val;
    },
    pointFormat(point, num) {
      if (num > 0) {
        var result = (point * 1000) / num / 1000;
        if (result && (result + "").indexOf(".") > 0) {
          return 0;
        }
        return result;
      } else {
        return "";
      }
    },
    windowChangeSize() {
      let topWidth;
      uni.getSystemInfo({
        success: function (res) {
          // res - 各种参数
          let search = uni.createSelectorQuery().select(".u-swipe-content");
          search
            .boundingClientRect(function (data) {
              //data - 各种参数
              if (data && data.width) {
                topWidth = data.width; // 获取元素宽度
              }
            })
            .exec();
        },
      });
      if (topWidth <= 100) {
        console.log(topWidth);
        this.reLaunch({
          url: "./cart",
        });
      }
      this.getCardData();
    },

    // 点击编辑功能
    editCartMsg() {
      // 点击编辑出现删除功能
      this.isEdit = !this.isEdit;
    },

    // 点击删除
    confirm() {
      API_Trade.deleteSkuItem(this.goodsVal.goodsSku.id).then((res) => {
        if (res.statusCode == 200) {
          uni.showToast({
            title: "此商品删除成功",
            duration: 2000,
          });
          this.delshow = false;
          this.getCardData();
        }
      });
    },
    // 判断是 1 为true 0 为 false
    isOneOrZero(val) {
      return val == 1 ? true : false;
    },

    // 删除商品
    delGoods() {
      if (this.Config()) {
        var delData = [];
        this.cartDetail.cartList.forEach((item, index) => {
          item.skuList.forEach((goodsItem, index) => {
            if (goodsItem.checked) {
              delData.push(goodsItem.goodsSku.id);
            }
          });
        });

        if (delData && delData.length > 0) {
          // 执行删除
          API_Trade.deleteSkuItem(delData).then((res) => {
            if (res.data.success) {
              uni.showToast({
                title: "删除成功!",
                icon: "none",
              });

              this.getCardData();
            }
          });
        } else {
          uni.showToast({
            title: "请选择删除商品，如果商品失效，请左滑无效商品删除",
            icon: "none",
          });
        }
      }
    },

    // 跳转到店铺
    tostore(val) {
      uni.navigateTo({
        url: "../product/shopPage?id=" + val.storeId,
      });
    },
    // 跳转到优惠券
    toConpon(val) {
      uni.navigateTo({
        url: "/pages/cart/coupon/couponCenter?storeId=" + val.storeId,
      });
    },
    // 跳转到商品
    toProduct(val) {
      uni.navigateTo({
        url:
          "/pages/product/goods?id=" +
          val.goodsSku.id +
          "&goodsId=" +
          val.goodsSku.goodsId,
      });
    },
    numChange_WEIXIN(callback) {
      console.log(callback);
      this.WEIXIN_num = callback.value;
      console.log(this.WEIXIN_num);

      this.numChange(callback.data, "3");
    },
    // 点击
    numChange(val, nums) {
      // #ifdef MP-WEIXIN
      if (nums && nums == "1") {
        val.num++;
      } else if (nums && nums == "0") {
        val.num--;
      } else if (nums && nums == "3") {
        val.num = this.WEIXIN_num;
      }

      // #endif

      this.updateSkuNumFun(val.goodsSku.id, val.num);
    },

    submitOrder() {
      if (this.Config()) {
        this.navigateTo("/pages/order/fillorder?way=CART");
      }
    },

    Config() {
      let can_buy = false;
      this.cartDetail.cartList.forEach((item) => {
        if (item.checked) {
          can_buy = true;
        } else {
          item.skuList.forEach((skuItem) => {
            if (skuItem.checked) {
              can_buy = true;
            }
          });
        }
      });
      if (!can_buy) {
        uni.showToast({
          title: "您还没有选择商品",
          duration: 2000,
          icon: "none",
        });
        return false;
      } else {
        return true;
      }
    },

    // 跳转
    navigateTo(url) {
      uni.navigateTo({
        url,
      });
    },

    // 全选
    checkOut() {
      API_Trade.checkAll(this.checkout).then((result) => {
        if (result.data.success) {
          this.getCardData();
          return true;
        }
      });
    },

    // 获取店铺选中信息
    checkStoreFun(skuId, num) {
      API_Trade.checkStore(skuId, num).then((result) => {
        if (result.data.success) {
          this.getCardData();
        }
      });
    },

    // 店铺点击
    checkboxChangeDP(e) {
      // #ifdef MP-WEIXIN
      e.checked = !e.checked;
      // #endif
      this.checkStoreFun(e.storeId, e.checked);
    },

    // 获取购物车选中信息
    updateSkuCheckedFun(skuId, num) {
      API_Trade.updateSkuChecked(skuId, num).then((result) => {
        if (result.data.success) {
          this.getCardData();
        }
      });
    },

    // 更新商品购物车数量
    updateSkuNumFun(skuId, num) {
      API_Trade.updateSkuNum(skuId, num).then((result) => {
        if (result.statusCode == 200) {
          this.getCardData();
        } else {
          let _this = this;
          setTimeout(() => {
            _this.getCardData();
          }, 1000);
        }
      });
    },

    // 获取购物车数据
    getCardData() {
      if (this.$options.filters.isLogin("auth")) {
        uni.showLoading({
          mask: true,
        });
        API_Trade.getCarts()
          .then((result) => {
            if (result.data.success) {
              this.cartDetail = result.data.result;

              this.checkout = true;
              for (let i = 0; i < this.cartDetail.cartList.length; i++) {
                let item = this.cartDetail.cartList[i];
                if (item.checked == 0) {
                  this.checkout = false;
                }
                // 如果有拼团活动顺便删除
                item.skuList &&
                  item.skuList.forEach((sku) => {
                    sku.promotions &&
                      sku.promotions.forEach((pro, proIndex) => {
                        if (pro.promotionType == "PINTUAN") {
                          sku.promotions.splice(proIndex, 1);
                        }
                      });
                    console.log(sku);
                  });
              }
              uni.stopPullDownRefresh();
              uni.hideLoading();
            } else {
              uni.showToast({
                title: result.data.message,
                duration: 2000,
                icon: "none",
              });
            }
          })
          .catch((err) => {
            console.error(err);
            uni.hideLoading();
          });
      } else {
        uni.hideLoading();
      }
    },

    // 选中某个复选框时，由checkbox时触发
    checkboxChange(e) {
      // #ifdef MP-WEIXIN
      e.checked = !e.checked;
      // #endif
      this.updateSkuCheckedFun(e.goodsSku.id, e.checked);
    },
  },
};
</script>

<style scoped lang="scss">
// #ifdef MP-WEIXIN
@import "./mp-carui.scss";
// #endif
.u-image {
  box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.05);
}
.promotion-notice {
  margin-left: 68rpx;
  font-size: 24rpx;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
  /deep/ .tips {
    margin: 0 8rpx 0 0;
    background: $main-color;
    border-radius: 100px;
    display: block;
    flex: 1;
    padding: 2rpx 12rpx;
    color: #fff;
  }
}
.promotionNotice {
  font-size: 24rpx;
}
.sp_tag {
  display: inline;
  background: #f2f2f2;
  padding: 0 20rpx 0 10rpx;
  height: 20rpx;
  line-height: 20rpx;
  font-size: 24rpx;
  color: #262626;
  border-radius: 0.4em;
}

.goods-row {
  padding: 30rpx 0;

  display: flex;
  align-items: center;
}

.sp_promotion {
  margin: 4rpx 0;
}

.sp_tag_plain {
  margin-left: 8rpx;
  padding: 0 6rpx 0 6rpx;
  background: #fff;
  border: 1px solid $main-color;
  font-size: 24rpx;
  color: $main-color;
  border-radius: 50px;
}

.sp_tag_plain:nth-of-type(1) {
  margin-left: 0;
}

.sp_ingle {
  padding: 10rpx 0;
}

.sp_ingle_icon {
  margin-left: 4rpx;
  font-size: 24rpx;
}
.ybname {
  font-weight: bold;
}
.invalid {
  filter: grayscale(1);
}

.status_bar {
  position: fixed;
  height: var(--status-bar-height);
  width: 100%;
  background: #fff;
  z-index: 100;
}

.cartItem {
  border-radius: 0.4em;
  transition: 0.35s;
}

.index {
  padding-top: var(--status-bar-height);
}

.prohibition {
  position: fixed;
  width: 100%;
  z-index: 2;
  top: var(--status-bar-height);
}

.header {
  background: #fff;
  position: relative;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  font-size: 34rpx;

  .left,
  .right {
    position: absolute;
    width: max-content;
    height: max-content;
    top: 0;
    bottom: 0;
    margin: auto;
    font-size: 30rpx;
  }

  .left {
    float: left;
    top: 0;
    bottom: 0;
    left: 20rpx;
  }

  .right {
    float: right;
    right: 20rpx;
  }
}

/* 空白页 */
/deep/ .u-number-input {
  background: #fff !important;
  border: 1px solid #ededed;
  margin: 0 !important;
}

/deep/ .u-icon-minus,
/deep/ .u-icon-plus {
  background: #ffffff !important;
  border: 1px solid #ededed;
  color: #333 !important;
  width: 40rpx;
}

.empty {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 99;
  padding-bottom: 100rpx;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  background: #fff;

  image {
    width: 240rpx;
    height: 160rpx;
    margin-bottom: 30rpx;
  }

  .empty-tips {
    display: flex;
    font-size: $font-sm + 2rpx;
    color: $font-color-disabled;

    .navigator {
      color: $uni-color-primary;
      margin-left: 16rpx;
    }
  }
}

.navR {
  width: 180rpx;
  height: 70rpx;
  line-height: 70rpx;
  background: linear-gradient(91deg, $light-color 1%, $aider-light-color 99%);
  border-radius: 900rpx;
  text-align: center;
  color: #fff;
  margin-right: 10rpx;
}

.price {
  display: flex;
  align-items: center;

  /deep/ .number {
    line-height: 1;
    font-size: 30rpx;
    > span {
      font-weight: bold;
    }
  }
}

.box2 {
  border-radius: 30rpx;
  padding: 32rpx 40rpx 32rpx;

  .u-checkbox {
    display: flex;
    align-items: center;
    text-align: center;
  }
  background: #fff;
  margin-bottom: 20rpx;
}

.wrapper {
  height: 100%;
}

/deep/ .u-col {
  padding: 24rpx 0 !important;
}

.goods-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
  > p {
    padding-left: 20rpx;
  }
}

.allCheck {
  // padding: 0 10rpx;
  font-size: 24rpx;
}

.content {
  padding: 20rpx 0 20rpx 0;
  margin-bottom: 80rpx;
}

.line {
  float: left;
  width: 1px;
  height: 100%;
  border-right: 1px solid $light-color;
}

.store-line-check,
.store-line-img,
.store-line-desc {
  // #ifdef MP-WEIXIN
  float: left;
  // #endif
}

.store-line {
  // #ifndef MP-WEIXIN
  display: flex;
  // #endif
  overflow: hidden;
}

.goods-config {
  display: flex;
  align-items: center;
  /deep/ .invalid {
    display: block;
    width: 80rpx !important;
  }
}
.tab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
}
.couponIcon {
  margin-left: 20rpx;
}

.right_Col {
  color: $light-color;
  font-size: 26rpx;

  > span {
    margin-left: 20rpx;
  }
}

.right_Line {
  width: 3px;
  float: left;
  height: 40rpx;
  border-left: 1px solid #eeeeee;

  /deep/ span {
    margin-left: 20rpx;
  }
}

.box6 {
  justify-content: space-between;
  position: fixed;
  // #ifdef APP-PLUS || MP-WEIXIN
  bottom: 0;
  // #endif
  // #ifdef H5
  bottom: 100rpx;
  // #endif
  left: 0;
  border-top: 1px solid #ededed;
  display: flex;
  height: 100rpx;
  overflow: hidden;
  align-items: center;
  width: 100%;
  background: rgba(255, 255, 255, 1);
  color: #333;
  z-index: 99;
  > .navL {
    padding: 0 32rpx;
    display: flex;
    align-items: center;
  }
}

.sp-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}

.sp-type {
  color: $u-light-color;
  padding: 10rpx 0;
  font-size: 24rpx;
  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.default-color {
  color: #333;
}
.theme-color {
  color: $main-color;
}
.sp-number {
  font-weight: bold;

  display: flex;
  justify-content: space-between;
  > .sp-price {
    /deep/ span:nth-of-type(1) {
      font-size: 38rpx;
    }
    /deep/ span:nth-of-type(2) {
      font-size: 24rpx;
    }
  }
}
.priceDetail-flowPrice {
  font-weight: bold;
  padding-left: 20rpx;
  > span:nth-of-type(1) {
    font-size: 38rpx;
  }
}

.prices {
  display: flex;
  flex-direction: column;

  > .discountPrice {
    align-items: center;
    display: flex;
    font-size: 24rpx;
    color: rgb(201, 199, 199);
  }
}
.discountDetails {
  margin-left: 10px;
  color: #666;
  padding: 4rpx 10rpx;
  border-radius: 100px;
  background: rgba(201, 199, 199, 0.3);
}
.discount-item {
  display: flex;
  margin: 40rpx 0;
  justify-content: space-between;
  > span:nth-of-type(1) {
    color: #666;
  }
  > span:nth-of-type(2) {
    color: #333;
    font-weight: bold;
  }
}
.discount-title {
  font-size: 36rpx;
  margin-top: 20rpx;
  text-align: center;
}
.discount-way {
  width: 94%;
  margin: 0 3%;
}
.discount-list {
  width: 100%;
}
.promotions-list {
  margin-left: 20rpx;
  > .promotions-item-seckill {
    background: rgba($color: $main-color, $alpha: 0.1);
    font-size: 24rpx;
    color: $main-color;
    display: inline;
    padding: 0rpx 10rpx;
    border-radius: 100px;
  }
}
</style>
