<template>
  <view class="content">
    <u-form :model="form" ref="uForm">
      <view class="after-sales-goods-detail-view">
        <view class="header">
          <view>
            本次售后服务将由
            <text class="seller-name">{{ sku.storeName }}</text>
            为您提供
          </view>
        </view>
        <view>
          <view class="goods-item-view" v-for="(item,index) in sku.orderItems" v-if="item.sn == sn" @click="gotoGoodsDetail(sku.goods_id)">
            <view class="goods-img">
              <u-image border-radius="6" width="131rpx" height="131rpx" :src="item.image"></u-image>
            </view>
            <view class="goods-info">
              <view class="goods-title u-line-2">{{ item.name }}</view>
              <view class="goods-price">
                <span>￥{{ applyInfo.applyRefundPrice }}</span>

                <span class="num">购买数量:{{ item.num }}</span>
              </view>
            </view>
          </view>
        </view>
        <view class="after-num">
          <view>申请数量</view>
          <view>
            <u-number-box :value="parseInt(form.num)" disabled-input :min="1" :max="parseInt(sku.num)" bg-color="#fff" @change="valChange"></u-number-box>
          </view>
        </view>
      </view>

      <view class="body-view">
        <!-- 退款原因 -->
        <view class="opt-view">
          <u-form-item label="申请原因" :label-width="150">
            <u-input v-model="form.reason" type="select" input-align="right" :select-open="reasonSelectShow" @click="reasonSelectShow = true" placeholder="请选择申请原因" />
          </u-form-item>
          <u-form-item label="申请说明" :label-width="150">
            <u-input input-align="right" type="textarea" v-model="form.problemDesc" placeholder="请描述申请售后的说明" />
          </u-form-item>
        </view>

        <!-- 上传凭证 -->
        <view class="opt-view">
          <view class="img-title">上传凭证（最多5张）</view>
          <view class="images-view">
            <u-upload :header=" { accessToken: storage.getAccessToken() }" :action="action" width="150" @on-uploaded="onUploaded" :max-count="5" :show-progress="false"></u-upload>
          </view>
        </view>

        <view class="opt-view">
          <u-form-item label="退款方式" :label-width="150">
            <u-input :value="
                applyInfo.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款'
              " type="text" input-align="right" :disabled="true" />
          </u-form-item>
          <view v-if="
              applyInfo.accountType === 'BANK_TRANSFER' &&
              applyInfo.applyRefundPrice != 0
            ">
            <u-form-item label="银行开户行" :label-width="150">
              <u-input v-model="form.bankDepositName" type="text" input-align="right" placeholder="请输入银行开户行" />
            </u-form-item>
            <u-form-item label="银行开户名" :label-width="150">
              <u-input v-model="form.bankAccountName" type="text" input-align="right" placeholder="请输入银行开户名" />
            </u-form-item>
            <u-form-item label="银行账号" :label-width="150">
              <u-input v-model="form.bankAccountNumber" type="text" input-align="right" placeholder="请输入银行账号" />
            </u-form-item>
          </view>

          <u-form-item label="返回方式" :label-width="150">
            <u-input type="text" input-align="right" value="快递至第三方卖家" :disabled="true" />
          </u-form-item>
        </view>

        <view class="opt-tip">提交服务单后，售后专员可能与您电话沟通，请保持手机畅通</view>
      </view>
    </u-form>

    <view class="submit-view">
      <u-button type="primary" ripple shape="circle" v-if="applyInfo.refundWay" :custom-style="customStyle" @click="onSubmit">提交申请</u-button>
    </view>
    <u-select mode="single-column" :list="reasonList" v-model="reasonSelectShow" @confirm="reasonSelectConfirm"></u-select>
    <u-select mode="single-column" :list="typeList" v-model="typeSelectShow" @confirm="typeSelectConfirm"></u-select>
    <u-select mode="single-column" :list="returnList" v-model="returnSelectShow" @confirm="returnSelectConfirm"></u-select>
    <u-toast ref="uToast" />
  </view>
</template>

<script>
import {
  getAfterSaleReason,
  applyReturn,
  getAfterSaleInfo,
} from "@/api/after-sale";

import city from "@/components/m-city/m-city";
import { upload } from "@/api/common.js";

import storage from "@/utils/storage.js";
export default {
  component: {
    city,
  },
  data() {
    return {
      storage,
      list: [{ id: "", localName: "请选择", children: [] }],
      action: upload, //图片上传数据
      fileList: [],
      sn: "",
      sku: {},
      typeValue: 0,
      value: "",
      type: "textarea",
      border: true,
      //退款原因 弹出框
      reasonSelectShow: false,
      reasonList: [],
      //退款方式为账号退款 账号类型弹出框
      typeSelectShow: false,
      typeList: [
        {
          value: "ALIPAY",
          label: "支付宝",
        },
        {
          value: "WEIXINPAY",
          label: "微信",
        },
        {
          value: "BANK_TRANSFER",
          label: "银行卡",
        },
      ],
      //返回方式
      returnSelectShow: false,
      returnList: [
        {
          value: 1,
          label: "快递至第三方卖家",
        },
      ],

      customStyle: {
        backgroundColor: this.$lightColor,
      },
      applyInfo: {},
      form: {
        orderItemSn: "", // 订单sn
        skuId: "",
        reason: "", //退款原因
        problemDesc: "", //退款说明
        images: [], //图片凭证
        num: 1, //退货数量
        goodsId: "", //商品id
        accountType: "",
        applyRefundPrice: "",
        refundWay: "",
        serviceType: "", //申请类型
      },
    };
  },

  /**
   * 判断当前内容并生成数据
   */
  onLoad(options) {
    let navTitle = "申请售后";
    this.form.serviceType = "RETURN_GOODS";
    if (options.value == 1) {
      navTitle = "申请退货";
      this.form.serviceType = "RETURN_GOODS";
    }
    if (options.value == 2) {
      navTitle = "申请换货";
      this.form.serviceType = "EXCHANGE_GOODS";
    }
    if (options.value == 3) {
      navTitle = "申请退款";
      this.form.serviceType = "RETURN_MONEY";
    }
    this.typeValue = options.value;
    uni.setNavigationBarTitle({
      title: navTitle, //此处写页面的title
    });
    this.sn = options.sn;
    let dsku = decodeURIComponent(options.sku);
    let newSku = JSON.parse(dsku);
    this.sku = newSku
 
    this.form.orderItemSn = options.sn;
    this.form.skuId = this.sku.skuId;
    this.form.num = this.sku.num;
    this.form.goodsId = this.sku.goodsId;
    this.getReasonActions(this.form.serviceType);

    this.init(options.sn);
  },
  methods: {
    /** 获取申请原因下拉框数据 */
    async getReasonActions(serviceType) {
      uni.showLoading({
        title: "加载中",
      });
      await getAfterSaleReason(serviceType).then((res) => {
        if (res.data.success) {
          let action = [];
          res.data.result.forEach((item) => {
            action.push({
              value: item.id,
              label: item.reason,
            });
          });

          this.reasonList = action;
        }
      });
      uni.hideLoading();
    },
    //打开地区选择器
    showCitySelect() {
      this.$refs.cityPicker.show();
    },

    // 初始化数据
    init(sn) {
      getAfterSaleInfo(sn).then((response) => {
        if (response.data.code == 400) {
          uni.showToast({
            title: response.data.message,
            duration: 2000,
            icon: "none",
          });
        } else {
          this.applyInfo = response.data.result;

          this.form.accountType = response.data.result.accountType;
        }
      });
    },

    //退款原因
    reasonSelectConfirm(e) {
      this.form.reason = e[0].label;
    },
    //退款方式
    typeSelectConfirm(e) {
      this.form.accountType = e[0].value;
      this.form.accountType_label = e[0].label;
    },
    //返回方式
    returnSelectConfirm(e) {
     
    },

    //修改申请数量
    valChange(e) {
      this.form.num = e.value;
    },
    //图片上传
    onUploaded(lists) {
    
      let images = [];

      lists.forEach((item) => {
        images.push(item.response.result);
      });
      this.form.images = images;
    },
    //提交申请
    onSubmit() {
      //提交申请前检测参数
      if (!this.handleCheckParams()) {
        return;
      }
      uni.showLoading({
        title: "加载中",
      });
      this.form.accountType = this.applyInfo.accountType;
      this.form.refundWay = this.applyInfo.refundWay;
      this.form.applyRefundPrice = this.applyInfo.applyRefundPrice;

      applyReturn(this.sn, this.form).then((resp) => {
        uni.hideLoading();
        if (resp.data.success) {
          this.$refs.uToast.show({ title: "提交成功", type: "success" });
          uni.redirectTo({
            url: "/pages/order/afterSales/applySuccess",
          });
        } else {
          this.$refs.uToast.show({ title: resp.data.message, type: "error" });
        }
      });
    },

    /**
     * 验证银行卡号
     */
    checkBankno(bankno) {
      var lastNum = bankno.substr(bankno.length - 1, 1); //取出最后一位（与luhm进行比较）
      var first15Num = bankno.substr(0, bankno.length - 1); //前15或18位
      var newArr = [];

      for (var i = first15Num.length - 1; i > -1; i--) {
        //前15或18位倒序存进数组
        newArr.push(first15Num.substr(i, 1));
      }

      var arrJiShu = []; //奇数位*2的积 <9
      var arrJiShu2 = []; //奇数位*2的积 >9
      var arrOuShu = []; //偶数位数组
      for (var j = 0; j < newArr.length; j++) {
        if ((j + 1) % 2 == 1) {
          //奇数位
          if (parseInt(newArr[j]) * 2 < 9)
            arrJiShu.push(parseInt(newArr[j]) * 2);
          else arrJiShu2.push(parseInt(newArr[j]) * 2);
        } //偶数位
        else arrOuShu.push(newArr[j]);
      }

      var jishu_child1 = []; //奇数位*2 >9 的分割之后的数组个位数
      var jishu_child2 = []; //奇数位*2 >9 的分割之后的数组十位数
      for (var h = 0; h < arrJiShu2.length; h++) {
        jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
        jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
      }

      var sumJiShu = 0; //奇数位*2 < 9 的数组之和
      var sumOuShu = 0; //偶数位数组之和
      var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
      var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
      var sumTotal = 0;
      for (var m = 0; m < arrJiShu.length; m++) {
        sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
      }
      for (var n = 0; n < arrOuShu.length; n++) {
        sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
      }
      for (var p = 0; p < jishu_child1.length; p++) {
        sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
        sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
      }
      //计算总和
      sumTotal =
        parseInt(sumJiShu) +
        parseInt(sumOuShu) +
        parseInt(sumJiShuChild1) +
        parseInt(sumJiShuChild2);
      //计算Luhm值
      var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
      var luhm = 10 - k;
      if (lastNum == luhm) {
        return true;
      } else {
        return false;
      }
    },

    //检测提交参数
    handleCheckParams() {
     
      if (this.$u.test.isEmpty(this.form.reason)) {
        this.$refs.uToast.show({ title: "请选择 退款原因", type: "error" });
        return false;
      }
      if (this.$u.test.isEmpty(this.form.problemDesc)) {
        this.$refs.uToast.show({ title: "请输入 退款说明", type: "error" });
        return false;
      }

      if (this.form.accountType == "BANK_TRANSFER") {
        // 银行开户行校验
        if (this.$u.test.isEmpty(this.form.bankDepositName)) {
          this.$refs.uToast.show({
            title: "请输入 银行开户行",
            type: "error",
          });
          return false;
        }
        // 银行开户名校验
        if (this.$u.test.isEmpty(this.form.bankAccountName)) {
          this.$refs.uToast.show({
            title: "请输入 银行开户名",
            type: "error",
          });
          return false;
        }
        // 银行账号校验
        if (this.$u.test.isEmpty(this.form.bankAccountNumber)) {
          this.$refs.uToast.show({
            title: "请输入 银行账号",
            type: "error",
          });
          return false;
        } else if (this.checkBankno(this.form.bankAccountNumber) === false) {
          this.$refs.uToast.show({
            title: "银行卡卡号不正确",
            type: "error",
          });
          return false;
        } else if (this.$u.test.chinese(this.form.bankAccountName) === false) {
          this.$refs.uToast.show({
            title: "银行开户名输入错误",
            type: "error",
          });
          return false;
        } else if (this.$u.test.chinese(this.form.bankDepositName) === false) {
          this.$refs.uToast.show({
            title: "银行开户行输入错误",
            type: "error",
          });
          return false;
        }
      }

      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: $page-color-base;
  height: 100%;
}
.body-view {
  margin-bottom: 150rpx;
}
.after-sales-goods-detail-view {
  background-color: #fff;
  .header {
    background-color: #f7f7f7;
    color: #999999;
    font-size: 22rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    line-height: 70rpx;
    .header-text {
      background-color: #999999;
      padding: 10rpx 30rpx;
      border-radius: 50rpx;
    }
    .seller-name {
      color: $main-color;
    }
  }

  .goods-item-view {
    display: flex;
    flex-direction: row;
    padding: 10rpx 30rpx;
    background-color: #eef1f2;

    .goods-info {
      padding-left: 30rpx;
      flex: 1;
      .goods-title {
        margin-bottom: 10rpx;
        color: $font-color-dark;
      }
      .goods-specs {
        font-size: 24rpx;
        margin-bottom: 10rpx;
        color: #cccccc;
      }
      .goods-price {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 28rpx;
        margin-bottom: 10rpx;
        color: $light-color;
        .num {
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
    .goods-num {
      width: 60rpx;
      color: $main-color;
    }
  }
}
.after-num {
  margin: 0rpx 30rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
}

.opt-tip {
  margin-top: 20rpx;
  padding: 10rpx 30rpx;
  font-size: 22rpx;
}
.opt-view {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 10rpx 30rpx;
  .how-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    border-bottom: 1px solid $page-color-base;
  }
  .explain-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 150rpx;
  }
  .img-title {
    height: 80rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .images-view {
    padding: 20rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}
.item-apply-voucher {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
.submit-view {
  position: fixed;
  z-index: 999;
  bottom: 0px;
  left: 0px;
  margin-top: 100rpx;
  border: solid 2rpx #f2f2f2;
  background-color: #ffffff;
  height: 100rpx;
  width: 750rpx;
  align-items: center;
  padding: 0rpx 20rpx;
}
</style>
