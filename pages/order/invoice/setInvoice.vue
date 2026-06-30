<template>
  <u-popup closeable border-radius="28" @close="close" mode="bottom" height="80%" v-model:show="show">

    <div class="wrapper">
      <!-- 发票类型 -->
      <div class="invoice-title">发票类型</div>
      <div class="flex">
        <div class="invoice-item" @click="handleClickHeader(typeItem,index,invoiceType)"
          :class="{'active':typeItem.active,disabled:typeItem.disabled}" v-for="(typeItem,index) in invoiceType" :key="index">
          {{typeItem.title}}
        </div>
      </div>
      <div class="tips">
        {{tips}}
      </div>
      <div class="divider">
      </div>
      <!-- 发票抬头 -->
      <div class="invoice-title">发票抬头</div>

      <div class="flex" v-if="!isSpecialInvoice">
        <div class="invoice-item" @click="handleClickHeader(headerItem,index,invoiceHeader)" :class="{'active':headerItem.active,disabled:headerItem.disabled}"
          v-for="(headerItem,index) in invoiceHeader" :key="index">
          {{headerItem.title}}
        </div>
      </div>
      <div class="flex" v-else>
        <div class="invoice-item active">
          单位
        </div>
      </div>
      <div>
        <div class="form-item">
          <span> {{isSpecialInvoice ? '单位' : title}}名称</span>
          <u-input :placeholder="'请输入'+(isSpecialInvoice ? '单位' : title)+'名称'" v-model="titleName" />
        </div>
        <div class="form-item" v-if="taxpayerFlag || isSpecialInvoice">
          <span>纳税人识别号</span>
          <u-input placeholder="请输入纳税人识别号" v-model="submitData.taxpayerId" />
        </div>
        <div v-if="isSpecialInvoice">
          <div class="form-item">
            <span>单位地址</span>
            <u-input placeholder="请输入单位地址" v-model="submitData.companyAddress" />
          </div>
          <div class="form-item">
            <span>单位电话</span>
            <u-input placeholder="请输入单位电话" v-model="submitData.companyPhone" />
          </div>
          <div class="form-item">
            <span>开户银行</span>
            <u-input placeholder="请输入开户银行" v-model="submitData.bankName" />
          </div>
          <div class="form-item">
            <span>银行账号</span>
            <u-input placeholder="请输入银行账号" v-model="submitData.bankAccount" />
          </div>
        </div>

      </div>
      <div class="divider">
      </div>
      <div class="invoice-title">收票人信息</div>
      <div>
        <div class="form-item">
          <span>收票人手机</span>
          <u-input placeholder="请输入收票人手机" v-model="submitData.receiptPhone" />
        </div>
        <div class="form-item">
          <span>收票人邮箱</span>
          <u-input placeholder="请输入收票人邮箱(选填)" v-model="submitData.receiptEmail" />
        </div>
      </div>
      <div class="divider">
      </div>
      <div class="invoice-title">
        发票内容
      </div>
      <div class="flex" v-if="!isSpecialInvoice">
        <div class="invoice-item" @click="handleClickHeader(goodsItem,index,goodsType)" :class="{'active':goodsItem.active,disabled:goodsItem.disabled}" v-for="(goodsItem,index) in goodsType"
          :key="index">
          {{goodsItem.title}}
        </div>
      </div>
      <div class="flex" v-else>
        <div class="invoice-item active">
          商品明细
        </div>
      </div>

      <div class="submit" @click="submitInvoice()">确定</div>
    </div>
  </u-popup>
</template>
<script>
export default {
  props: ["res"],
  computed: {
    isSpecialInvoice() {
      return this.getActiveTitle(this.invoiceType) === "增值税专用发票";
    },
    titleName: {
      get() {
        return this.isUnitTitle()
          ? this.submitData.companyName
          : this.submitData.personalName;
      },
      set(value) {
        if (this.isUnitTitle()) {
          this.submitData.companyName = value;
        } else {
          this.submitData.personalName = value;
        }
        this.syncReceiptTitle();
      },
    },
  },
  watch: {
    invoiceType: {
      handler(val) {
        const currentType = this.getActiveTitle(val);
        const nextReceiptType =
          currentType === "增值税专用发票" ? "2" : "1";
        const previousReceiptType = this.submitData.receiptType;
        this.submitData.receiptType = nextReceiptType;

        if (
          this.shouldClearOnTypeChange &&
          previousReceiptType &&
          previousReceiptType !== nextReceiptType
        ) {
          this.clearInvoiceInfo();
        }

        if (currentType === "增值税专用发票") {
          this.setActiveByTitle(this.invoiceHeader, "单位");
          this.setActiveByTitle(this.goodsType, "商品明细");
          this.title = "单位";
          this.taxpayerFlag = true;
          this.submitData.receiptContent = "商品明细";
          this.syncReceiptTitle();
        } else {
          this.setActiveByTitle(this.invoiceHeader, "个人");
          this.setActiveByTitle(this.goodsType, "商品明细");
          this.title = "个人";
          this.taxpayerFlag = false;
          this.submitData.receiptContent = "商品明细";
          this.syncReceiptTitle();
        }
        this.shouldClearOnTypeChange = false;
      },
      deep: true,
    },
    invoiceHeader: {
      handler(val) {
        if (this.isSpecialInvoice) {
          this.title = "单位";
          this.taxpayerFlag = true;
          return;
        }

        this.title = this.getActiveTitle(val) || "个人";
        this.taxpayerFlag = this.title == "单位";
        if (!this.taxpayerFlag) {
          this.submitData.taxpayerId = "";
        }
        this.syncReceiptTitle();
      },
      deep: true,
    },
    goodsType: {
      handler(val) {
        this.submitData.receiptContent = val.filter((item) => {
          return item.active == true;
        })[0].title;
      },
      deep: true,
    },
  },

  data() {
    return {
      shouldClearOnTypeChange: false,
      taxpayerFlag: false,
      submitData: {
        receiptTitle: "", //发票抬头
        receiptType: "1", // 发票类型
        personalName: "",
        companyName: "",
        taxpayerId: "", //纳税人
        receiptContent: "",
        companyAddress: "", //单位地址
        companyPhone: "", //单位电话
        bankName: "", //开户银行
        bankAccount: "", //银行账号
        receiptPhone: "", //收票人手机
        receiptEmail: "", //收票人邮箱
      },
      show: true,
      title: "",
      tips:
        "电子发票即电子增值税发票，是税局认可的有效凭证，其法律效力、基本用途及使用规定同纸质发票。",
      //   发票类型
      invoiceType: [
        {
          title: "电子普通发票",
          active: true,
        },
        {
          title: "增值税专用发票",
          active: false,
        },
      ],
      //   发票抬头
      invoiceHeader: [
        {
          title: "个人",
          active: false,
        },
        {
          title: "单位",
          active: false,
        },
      ],
      //   商品类型
      goodsType: [
        {
          title: "商品明细",
          active: false,
        },
        {
          title: "商品类别",
          active: false,
        },
      ],
    };
  },
  mounted() {
    if (this.res) {
      this.submitData.receiptType = this.normalizeReceiptType(this.res.receiptType);
      this.submitData.personalName =
        this.res.personalName ||
        (!this.res.companyName && !this.res.taxpayerId ? this.res.receiptTitle || "" : "");
      this.submitData.companyName =
        this.res.companyName ||
        (this.res.taxpayerId ? this.res.receiptTitle || "" : "");
      this.submitData.taxpayerId = this.res.taxpayerId; //纳税人
      this.submitData.receiptContent = this.res.receiptContent;
      this.submitData.companyAddress = this.res.companyAddress || "";
      this.submitData.companyPhone = this.res.companyPhone || "";
      this.submitData.bankName = this.res.bankName || "";
      this.submitData.bankAccount = this.res.bankAccount || "";
      this.submitData.receiptPhone = this.res.receiptPhone || "";
      this.submitData.receiptEmail = this.res.receiptEmail || "";
      if (this.submitData.receiptType === "2") {
        this.setActiveByTitle(this.invoiceType, "增值税专用发票");
        this.setActiveByTitle(this.invoiceHeader, "单位");
        this.setActiveByTitle(this.goodsType, "商品明细");
      } else {
        this.setActiveByTitle(this.invoiceType, "电子普通发票");
        this.res.receiptContent == "商品类别"
          ? this.setActiveByTitle(this.goodsType, "商品类别")
          : this.setActiveByTitle(this.goodsType, "商品明细");
        this.res.taxpayerId
          ? this.setActiveByTitle(this.invoiceHeader, "单位")
          : this.setActiveByTitle(this.invoiceHeader, "个人");
      }
      this.syncReceiptTitle();
    } else {
      this.setActiveByTitle(this.invoiceType, "电子普通发票");
      this.setActiveByTitle(this.invoiceHeader, "个人");
      this.setActiveByTitle(this.goodsType, "商品明细");
      this.syncReceiptTitle();
    }

  },
  methods: {
    normalizeReceiptType(type) {
      return type === "2" || type === "VATOSPECIAL" ? "2" : "1";
    },
    getActiveTitle(list) {
      const current = list.find((item) => item.active);
      return current ? current.title : "";
    },
    setActiveByTitle(list, title) {
      list.forEach((item) => {
        item.active = item.title === title;
      });
    },
    isUnitTitle() {
      return this.isSpecialInvoice || this.title === "单位";
    },
    syncReceiptTitle() {
      this.submitData.receiptTitle = this.isUnitTitle()
        ? this.submitData.companyName
        : this.submitData.personalName;
    },
    clearInvoiceInfo() {
      this.submitData.receiptTitle = "";
      this.submitData.personalName = "";
      this.submitData.companyName = "";
      this.submitData.taxpayerId = "";
      this.submitData.receiptContent = "";
      this.submitData.companyAddress = "";
      this.submitData.companyPhone = "";
      this.submitData.bankName = "";
      this.submitData.bankAccount = "";
      this.submitData.receiptPhone = "";
      this.submitData.receiptEmail = "";
    },
    handleClickHeader(val, index, arr) {
      if (val.disabled) {
        return;
      }
      const previousTitle = this.getActiveTitle(arr);
      if (arr === this.invoiceType && previousTitle !== val.title) {
        this.shouldClearOnTypeChange = true;
      }
      arr.forEach((item) => {
        item.active = false;
      });
      val.active = true;
    },
    /**
     * 监听关闭
     */
    close(val) {
      this.$emit("callbackInvoice", val);
    },
    submitInvoice() {
      /**
       * 验证
       */
      const {
        receiptTitle,
        taxpayerId,
        companyAddress,
        companyPhone,
        bankName,
        bankAccount,
        receiptPhone,
        receiptEmail,
      } = this.submitData;
      this.syncReceiptTitle();

      if (this.$u.test.isEmpty(receiptTitle)) {
        uni.showToast({
          title: "请您填写发票抬头!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (
        !this.$u.test.isEmpty(receiptTitle) &&
        this.$u.test.isEmpty(taxpayerId) &&
        this.invoiceHeader[1].active == true
      ) {
        uni.showToast({
          title: "请您填写纳税人识别号!",
          duration: 2000,
          icon: "none",
        });

        return false;
      }
      if (this.isSpecialInvoice && this.$u.test.isEmpty(companyAddress)) {
        uni.showToast({
          title: "请您填写单位地址!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (this.isSpecialInvoice && this.$u.test.isEmpty(companyPhone)) {
        uni.showToast({
          title: "请您填写单位电话!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (this.isSpecialInvoice && this.$u.test.isEmpty(bankName)) {
        uni.showToast({
          title: "请您填写开户银行!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (this.isSpecialInvoice && this.$u.test.isEmpty(bankAccount)) {
        uni.showToast({
          title: "请您填写银行账号!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (this.$u.test.isEmpty(receiptPhone)) {
        uni.showToast({
          title: "请您填写收票人手机!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (!this.$u.test.mobile(receiptPhone)) {
        uni.showToast({
          title: "请输入正确的收票人手机号!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }
      if (!this.$u.test.isEmpty(receiptEmail) && !this.$u.test.email(receiptEmail)) {
        uni.showToast({
          title: "请输入正确的收票人邮箱!",
          duration: 2000,
          icon: "none",
        });
        return false;
      }

      this.show = false;
      this.close(this.submitData);
    },
  },
};
</script>
<style scoped lang="scss">
.form-item {
  display: flex;
  margin: 30rpx 0;
  align-items: center;
  > span {
    margin-right: 50rpx;
  }
}
.submit {
  width: 100%;
  margin-top: 100rpx;
  background: $main-color;
  text-align: center;
  line-height: 80rpx;
  height: 80rpx;
  margin: 100rpx auto 0 auto;
  color: #f2f2f2;
  border-radius: 100px;
}
.invoice-item {
  margin-right: 30rpx;
  color: #333;
  font-weight: 24rpx;

  padding: 12rpx 46rpx;
  border-radius: 100px;
  background: #eee;
  min-width: 100rpx;
  text-align: center;
}
.active {
  font-weight: bold;
  color: $main-color;
  border: 2rpx solid $main-color;
  background: rgba($color: $main-color, $alpha: 0.1);
}
.disabled {
  color: #b5b5b6;
}
.wrapper {
  padding: 30rpx;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}
.invoice-title {
  margin-bottom: 30rpx;
  font-weight: bold;
  font-size: 30rpx;
}
.tips {
  margin-top: 30rpx;
  color: #999;
  font-size: 24rpx;
}
.divider {
  margin: 30rpx 0;
  height: 1rpx;
  border-bottom: 1px solid #f2f3f5;
}
.flex {
  display: flex;
}
</style>
