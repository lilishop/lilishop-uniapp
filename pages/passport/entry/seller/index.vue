<template>
  <div class="wrapper">
       <u-navbar :border-bottom="false"></u-navbar>
    <div>
      <div class="title">店铺入驻</div>
      <div class="step-list">
        <div
          class="step-item"
          :class="{ active: current == index }"
          v-for="(item, index) in entrySteps"
          :key="index"
        >
          {{ item.title }}
        </div>
      </div>
      <div class="submit" @click="keepOn()">开始填写</div>
      <div class="notice" @click="getEntryNotice">查看店铺入驻协议</div>
    </div>
  </div>
</template>

<script>
import { getCompanyDetail } from "@/api/entry";
export default {
  components: {},

  data() {
    return {
      current: 999,
      entrySteps: [
        {
          title: "填写资质信息",
          value: "APPLY",
        },
        {
          title: "提交审核",
          value: "APPLYING",
        },
      ],

      storeStatusWay: [
        {
          title: "申请已通过，请联系管理员",
          value: "OPEN",
        },
        {
          title: "店铺已关闭，重申请联系管理员",
          value: "CLOSED",
        },
        {
          title: "审核未通过,请修改资质信息",
          value: "REFUSED",
        },
      ],

      companyData: "", // 公司信息
    };
  },
  onShow() {
    if(this.$options.filters.tipsToLogin()){
        this.init();
    }
  },

  mounted() {},

  onLoad(options) {},
  methods: {
    getEntryNotice() {
      uni.navigateTo({
        url: "/pages/mine/help/tips?type=STORE_REGISTER",
      });
    },
    keepOn() {
      if (this.companyData && this.companyData.storeDisable == "OPEN") {
        uni.showToast({
          title:"审核已通过",
          icon:"none"
        })
      } else {
        uni.navigateTo({
          url: "/pages/passport/entry/seller/control",
        });
      }
    },
    async init() {
      this.entrySteps = [
        {
          title: "填写资质信息",
          value: "APPLY",
        },
        {
          title: "提交审核",
          value: "APPLYING",
        },
      ];
      const res = await getCompanyDetail();
      if (res.data.success) {
        this.companyData = res.data.result;

        if (this.companyData) {
          this.storeStatusWay.forEach((item) => {
            if (item.value == this.companyData.storeDisable) {
              this.entrySteps.push(item);
            }
          });

          this.current =
            this.entrySteps.findIndex(
              (item) => item.value == this.companyData.storeDisable
            ) || 0;
        } else {
          this.current = 0;
        }
      }
    },
  },
};
</script>
<style>
page {
  background: #fff;
}
</style>
<style lang="scss" scoped>
@import url("./entry.scss");
.wrapper {
  padding: 0 80rpx;
}

.title {
  padding-top: calc(104rpx);
  font-style: normal;
  line-height: 1;
  font-weight: 500;
  font-size: 56rpx;
  color: #333;
  padding-left: 20rpx;
}
.step-item {
  padding: 30rpx 20rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #666;
}
.step-list {
  margin: 80rpx 0;
  overflow: hidden;
}
.active {
  color: $light-color;
  background: rgba($color: $light-color, $alpha: 0.1);
  border-radius: 20rpx;
}
.submit {
  color: #fff;
  margin-top: 120rpx;
  background: rgba($light-color, 0.8);
}
.notice {
  margin-top: 40rpx;
  color: #333;
  background: $bg-color;
}
</style>
