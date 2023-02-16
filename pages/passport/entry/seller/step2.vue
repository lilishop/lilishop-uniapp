<template>
  <div class="wrapper">
    <u-form label-width="250" :model="form" ref="uForm">
      <div class="column">
        <div class="flag-title light-color">基础信息</div>
        <u-form-item
          required
          :border-bottom="false"
          prop="settlementBankAccountName"
          label="银行开户名"
          ><u-input
            v-model="form.settlementBankAccountName"
            :custom-style="defaultInputStyle"
        /></u-form-item>

        <u-form-item
          required
          :border-bottom="false"
          prop="settlementBankAccountNum"
          label="银行账号"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.settlementBankAccountNum"
        /></u-form-item>
        <u-form-item
          required
          :border-bottom="false"
          prop="settlementBankBranchName"
          label="开户银行支行名称"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.settlementBankBranchName"
        /></u-form-item>

        <u-form-item
          required
          :border-bottom="false"
          prop="settlementBankJointName"
          label="支行联行号"
          ><u-input
            :custom-style="defaultInputStyle"
            v-model="form.settlementBankJointName"
        /></u-form-item>
      </div>
    </u-form>
    <div class="submit" @click="validatorStep2Form">提交/下一步</div>
  </div>
</template>

<script>
import { applySecond } from "@/api/entry";

export default {
  data() {
    return {
      defaultInputStyle: {
        background: "#f7f7f7",
        padding: "0 20rpx",
        "border-radius": "10rpx",
      },
      form: {
        settlementBankAccountName: "",
        settlementBankAccountNum: "",
        settlementBankBranchName: "",
        settlementBankJointName: "",
      },

      rules: {
        // 验证规则
        settlementBankAccountName: [
          { required: true, message: "请填写银行开户名称" },
        ],
        settlementBankAccountNum: [
          { required: true, message: "请填写银行账号" },
        ],
        settlementBankBranchName: [
          { required: true, message: "请填写开户银行支行名称" },
        ],
        settlementBankJointName: [
          { required: true, message: "请填写支行联行号" },
        ],
      },
    };
  },
  mounted() {
    this.$refs.uForm.setRules(this.rules);
  },
  props: ["companyData"],
  watch: {
    companyData: {
      handler(val) {
        this.$set(this, "form", val);
        console.log(this.form)
      },
      deep: true,
      immediate:true
    },
  },
  methods: {
    validatorStep2Form() {
      this.$refs.uForm.validate(async (valid) => {
        if (valid) {
          const params = { ...this.form };
          const res = await applySecond(params);
          if (res.data.success) {
            uni.showToast({
              title: "提交成功!",
              icon: "none",
            });
            this.$emit("callback");
          }
        }
      });
    },
  },
};
</script>
<style>
/* page {
  background: #fff;
} */
</style>
<style lang="scss" scoped>
@import url("./entry.scss");
.wrapper {
  // padding: 50rpx 32rpx 16rpx 32rpx;
}
.column {
  padding: 32rpx;
  margin-bottom: 20rpx;
  background: #fff;
}
.submit {
  color: #fff;
  margin-top: 120rpx;
  background: rgba($light-color, 0.8);
}
.tips {
  color: #999;
  font-size: 24rpx;
  line-height: 1.2;
  margin-top: 10rpx;
}
</style>
