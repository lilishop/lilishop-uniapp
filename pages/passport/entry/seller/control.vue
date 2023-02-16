<template>
  <div>
    <u-navbar :border-bottom="false"></u-navbar>
    <step1 v-if="current == 1" :companyData="companyData" @callback="next()" />
    <step2 v-if="current == 2" :companyData="companyData" @callback="next()" />
    <step3
      v-if="current == 3"
      :companyData="companyData"
      @callback="finished()"
    />
  </div>
</template>

<script>
import { getCompanyDetail } from "@/api/entry";
import step1 from "./step1";
import step2 from "./step2";
import step3 from "./step3";
export default {
  data() {
    return {
      companyData: "",
      current: 1,
    };
  },
  components: {
    step1,
    step2,
    step3,
  },
  mounted() {
    this.init();
  },
  methods: {
    async init(next) {
      const res = await getCompanyDetail();
      if (res.data.success) {
        this.companyData = res.data.result;
        next ? this.current++ : "";
      }
    },
    next() {
      this.init("next");
    },
    finished() {
      uni.navigateTo({
        url: "/pages/passport/entry/seller/index",
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
