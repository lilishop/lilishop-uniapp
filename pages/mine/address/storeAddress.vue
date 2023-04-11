<template>
  <view class="address">

    <u-empty class="empty" v-if="storeAddressList.length == 0" text="暂无自提地址" mode="address"></u-empty>
    <view class="list" v-else>
      <view class="item c-content" v-for="(item, index) in storeAddressList" :key="index">
        <view class="basic" @click="selectAddressData(item)">
          <text>{{ item.addressName }}</text>
          <text>{{ item.mobile }}</text>
          <view>
            <div class="region">
              <span>{{ item.address }}</span>
            </div>
          </view>
        </view>
      </view>
      <view style="height: 100px"></view>
    </view>
    <u-action-sheet :list="removeList" :tips="tips" v-model="showAction" @click="deleteAddressMessage"></u-action-sheet>
  </view>
</template>

<script>
import * as API_Trade from "@/api/trade";
import * as API_Store from "@/api/store.js";
export default {
  data() {
    return {
      storeAddressList: [], //地址列表
      showAction: false, //是否显示下栏框
      removeList: [
        {
          text: "确定",
        },
      ],
      tips: {
        text: "确定要删除该收货人信息吗？",
      },
      removeId: "", //删除的地址id
      routerVal: "",
      params: {
        pageNumber: 1,
        pageSize: 1000,
      },
    };
  },
  onPullDownRefresh() {
    //下拉刷新
    this.storeAddressList = [];
    this.getAddressList();
  },
  onLoad: function (val) {
    this.routerVal = val;
  },
  onShow() {
    this.storeAddressList = [];
    this.getAddressList();
  },
  onHide() {},
  methods: {
    async selectAddressData(val) {
      await API_Trade.setStoreAddressId(val.id, this.routerVal.way);

      uni.navigateBack({
        delta: 1,
      });
    },
    //获取地址列表
    getAddressList() {
      uni.showLoading();

      API_Store.getStoreAddress(
        this.routerVal.storeId,
        this.params
      ).then((res) => {
        this.storeAddressList = res.data.result.records;
        console.log(this.storeAddressList);

         if (this.$store.state.isShowToast){ uni.hideLoading() };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./address.scss";
</style>
