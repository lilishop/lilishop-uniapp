<template>
  <view class="page-wrap">
    <scroll-view scroll-y class="page-scroll">
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
          <template v-for="(item,index) in sku.orderItems" :key="index">
          <view class="goods-item-view" v-if="item.sn == sn"
            @click="gotoGoodsDetail(sku.goodsId || sku.goods_id)">
            <view class="goods-img">
              <u-image
                border-radius="6"
                width="131rpx"
                height="131rpx"
                mode="aspectFill"
                :src="getGoodsImage(item)"
              ></u-image>
            </view>
            <view class="goods-info">
              <view class="goods-title">{{ getGoodsName(item) }}</view>
              <view class="goods-price">
                <text>￥{{ unitPrice(applyInfo.applyRefundPrice) }}</text>
                <text class="num">购买数量: {{ item.num }}</text>
              </view>
            </view>
          </view>
          </template>
        </view>
        <view class="after-num">
          <text class="after-num-label">申请数量</text>
          <u-number-box
            :value="parseInt(form.num)"
            disabled-input
            :min="1"
            :max="parseInt(sku.num)"
            bg-color="#fff"
            @change="valChange"
          ></u-number-box>
        </view>
      </view>

      <view class="body-view">
        <!-- 退款原因 -->
        <view class="opt-view form-block">
          <view class="form-row" @click="openReasonPicker">
            <text class="form-row-label">申请原因</text>
            <view class="form-row-value">
              <text class="form-value" :class="{ placeholder: !form.reason }">
                {{ form.reason || '请选择申请原因' }}
              </text>
              <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
            </view>
          </view>
          <u-form-item label="申请说明" label-width="150" :border-bottom="false" class="desc-item">
            <u-input
              v-model="form.problemDesc"
              type="textarea"
              border="none"
              input-align="right"
              height="120"
              placeholder="请描述申请售后的说明"
            />
          </u-form-item>
        </view>

        <!-- 退款方式 / 银行信息 -->
        <view class="opt-view form-block">
          <u-form-item label="退款方式" label-width="150" :border-bottom="true">
            <view class="form-value">{{
              applyInfo.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款'
            }}</view>
          </u-form-item>
          <template v-if="
              applyInfo.accountType === 'BANK_TRANSFER' &&
              applyInfo.applyRefundPrice != 0
            ">
            <u-form-item label="银行开户行" label-width="150" :border-bottom="true">
              <u-input
                v-model="form.bankDepositName"
                border="none"
                input-align="right"
                placeholder="请输入银行开户行"
              />
            </u-form-item>
            <u-form-item label="银行开户名" label-width="150" :border-bottom="true">
              <u-input
                v-model="form.bankAccountName"
                border="none"
                input-align="right"
                placeholder="请输入银行开户名"
              />
            </u-form-item>
            <u-form-item label="银行账号" label-width="150" :border-bottom="true" class="bank-account-item">
              <u-input
                v-model="form.bankAccountNumber"
                border="none"
                input-align="right"
                placeholder="请输入银行账号"
              />
            </u-form-item>
          </template>

          <u-form-item
            v-if="form.serviceType !== 'RETURN_MONEY'"
            label="返回方式"
            label-width="150"
            :border-bottom="false"
          >
            <view class="form-value">快递至第三方卖家</view>
          </u-form-item>
        </view>

        <!-- 上传凭证 -->
        <view class="opt-view upload-block">
          <view class="img-title">上传凭证（最多5张）</view>
          <view class="images-view">
            <u-upload
              :file-list="fileList"
              :auto-upload="false"
              width="150"
              @afterRead="onUploadAfterRead"
              :max-count="5"
            ></u-upload>
          </view>
        </view>

        <view class="opt-tip">提交服务单后，售后专员可能与您电话沟通，请保持手机畅通</view>
      </view>
      </u-form>
    </scroll-view>

    <view class="submit-view">
      <u-button
        type="primary"
        ripple
        shape="circle"
        v-if="applyInfo.refundWay"
        :custom-style="{ backgroundColor: $lightColor, width: '100%' }"
        @click="onSubmit"
      >提交申请</u-button>
    </view>
    <u-picker
      v-model:show="reasonSelectShow"
      :columns="[reasonList]"
      keyName="label"
      valueName="value"
      title="申请原因"
      @confirm="reasonSelectConfirm"
    ></u-picker>
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
import { handleUploadAfterRead } from "@/utils/uploadHelper.js";
import storage from "@/utils/storage.js";
export default {
  component: {
    city,
  },
  data() {
    return {
      storage,
      list: [{ id: "", localName: "请选择", children: [] }],
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
    this.sku = storage.getAfterSaleData();;

    this.form.orderItemSn = options.sn;
    this.form.skuId = this.sku.skuId;
    this.form.num = this.sku.num;
    this.form.goodsId = this.sku.goodsId;
    this.getReasonActions(this.form.serviceType);

    this.init(options.sn);
  },
  methods: {
    getGoodsName(item) {
      return item.goodsName || item.name || "";
    },
    getGoodsImage(item) {
      const image = item.image || item.goodsImage || item.thumbnail;
      return this.parseGoodsImageUrl(image);
    },
    gotoGoodsDetail(goodsId) {
      if (!goodsId) return;
      uni.navigateTo({
        url: `/pages/product/goods?id=${this.form.skuId}&goodsId=${goodsId}`,
      });
    },
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
       if (this.$store.state.isShowToast){ uni.hideLoading() };
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

    openReasonPicker() {
      if (!this.reasonList.length) {
        uni.showToast({
          title: "暂无可选原因",
          icon: "none",
        });
        return;
      }
      this.reasonSelectShow = true;
    },

    //退款原因
    reasonSelectConfirm(val) {
      const selected = val?.value?.[0] || val?.[0];
      if (selected) {
        this.form.reason = selected.label || selected.text || "";
      }
    },

    //修改申请数量
    valChange(e) {
      this.form.num = e.value;
    },
    onUploadAfterRead(event) {
      handleUploadAfterRead(event, this.fileList, (urls) => {
        this.form.images = urls;
      });
    },
    showToast(message, type = "error") {
      const text = message || (type === "success" ? "操作成功" : "操作失败");
      if (this.$refs.uToast) {
        this.$refs.uToast.show({ message: text, type });
        return;
      }
      uni.showToast({
        title: text,
        icon: type === "success" ? "success" : "none",
      });
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
         if (this.$store.state.isShowToast){ uni.hideLoading() };
        if (resp.data.success) {
          this.showToast("提交成功", "success");
          uni.redirectTo({
            url: "/pages/order/afterSales/applySuccess",
          });
        } else {
          this.showToast(resp.data.message || "提交失败", "error");
        }
      });
    },
    //检测提交参数
    handleCheckParams() {
      if (this.$u.test.isEmpty(this.form.reason)) {
        this.showToast("请选择退款原因");
        return false;
      }
      if (this.$u.test.isEmpty(this.form.problemDesc)) {
        this.showToast("请输入退款说明");
        return false;
      }

      if (
        this.applyInfo.accountType === "BANK_TRANSFER" &&
        this.applyInfo.applyRefundPrice != 0
      ) {
        if (this.$u.test.isEmpty(this.form.bankDepositName)) {
          this.showToast("请输入银行开户行");
          return false;
        }
        if (this.$u.test.isEmpty(this.form.bankAccountName)) {
          this.showToast("请输入银行开户名");
          return false;
        }
        if (this.$u.test.isEmpty(this.form.bankAccountNumber)) {
          this.showToast("请输入银行账号");
          return false;
        }
        if (this.$u.test.chinese(this.form.bankAccountName) === false) {
          this.showToast("银行开户名需为中文");
          return false;
        }
        if (this.$u.test.chinese(this.form.bankDepositName) === false) {
          this.showToast("银行开户行需为中文");
          return false;
        }
      }

      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
page {
  background: $page-color-base;
  height: 100%;
}

.page-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $page-color-base;
}

.page-scroll {
  flex: 1;
  height: 0;
  box-sizing: border-box;
}

.body-view {
  padding-bottom: 24rpx;
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

    .seller-name {
      color: $main-color;
    }
  }

  .goods-item-view {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 24rpx 30rpx;
    background-color: #eef1f2;

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
      padding-left: 24rpx;

      .goods-title {
        margin-bottom: 12rpx;
        color: $font-color-dark;
        font-size: 26rpx;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
      }

      .goods-price {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 28rpx;
        color: $light-color;

        .num {
          flex-shrink: 0;
          margin-left: 16rpx;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
}

.after-num {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 30rpx;
  padding: 24rpx 0;
  border-top: 1px solid #f0f0f0;

  .after-num-label {
    font-size: 30rpx;
    color: #333;
  }
}

.opt-tip {
  margin-top: 20rpx;
  padding: 10rpx 30rpx 30rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}

.opt-view {
  background-color: #fff;
  margin-top: 20rpx;
}

.form-block {
  padding: 0;

  .form-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 100rpx;
    padding: 0 30rpx;
    border-bottom: 1px solid #f0f0f0;

    .form-row-label {
      flex-shrink: 0;
      width: 150rpx;
      font-size: 30rpx;
      color: #333;
    }

    .form-row-value {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 8rpx;
    }
  }

  :deep(.u-form-item) {
    padding: 0 30rpx;
    min-height: 100rpx;
  }

  :deep(.u-form-item__body) {
    min-height: 100rpx;
    align-items: center;
  }

  :deep(.u-form-item__body__left__content__label) {
    font-size: 30rpx;
    color: #333;
  }

  :deep(.u-form-item__body__right__content__slot) {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  :deep(.u-input) {
    padding: 0 !important;
  }

  :deep(.u-input__content) {
    background: transparent !important;
  }

  :deep(.u-input__content__field-wrapper__field) {
    font-size: 28rpx !important;
    color: #666 !important;
  }
}

.upload-block {
  padding: 24rpx 30rpx 30rpx;

  .img-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 20rpx;
  }

  .images-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;

  &.placeholder {
    color: #c0c4cc;
  }
}

.desc-item {
  :deep(.u-form-item__body) {
    align-items: flex-start;
    padding-top: 24rpx;
    padding-bottom: 24rpx;
    min-height: auto;
  }

  :deep(.u-form-item__body__left) {
    padding-top: 8rpx;
  }

  :deep(.u-form-item__body__right__content__slot) {
    justify-content: flex-end;
    align-items: flex-start;
  }

  :deep(.u-input__content__field-wrapper__field) {
    text-align: right !important;
  }

  :deep(.u-input__content__field-wrapper__field--placeholder) {
    text-align: right !important;
  }
}

.submit-view {
  flex-shrink: 0;
  z-index: 999;
  box-sizing: border-box;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1px solid #f2f2f2;
}
</style>
