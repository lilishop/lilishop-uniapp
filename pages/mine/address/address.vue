<template>
  <view class="address">
    <view class="bar"></view>
    <empty v-if="empty"></empty>
    <view class="list" v-else>
      <view class="item c-content" v-for="(item, index) in addressList" :key="index">
        <view class="basic" @click="selectAddressData(item)">
          <text>{{ item.name }}</text>
          <text>{{ item.mobile }}</text>
          <text class="default" v-show="item.isDefault">默认</text>
          <view>
            <div class="region">
              <span v-if="item.consigneeAddressPath[0]">{{
                item.consigneeAddressPath[0]
              }}</span>
              <span v-if="item.consigneeAddressPath[1]">{{
                item.consigneeAddressPath[1]
              }}</span>
              <span v-if="item.consigneeAddressPath[2]">{{
                item.consigneeAddressPath[2]
              }}</span>
              <span v-if="item.consigneeAddressPath[3]">{{
                item.consigneeAddressPath[3]
              }}</span>
              <span>
                {{ item.detail }}
              </span>
            </div>
          </view>
        </view>
        <view class="edit">
          <view class="relative" @click="setDefault(item)">
            <view v-if="item.isDefault" class="alifont icon-xuanzhong"></view>
            <text v-else class="unchecked"></text>
            <text>{{ item.isDefault ? "默认地址" : "设为默认" }}</text>
          </view>
          <view class="relative">
            <view class="alifont icon-bianji-copy"></view>
            <text class="mr-40" @click="addAddress(item.id)">编辑</text>
            <view class="alifont icon-lajitong"></view>
            <text @click="delAddress(item.id)">删除</text>
          </view>
        </view>
      </view>
      <view style="height: 100px"></view>
    </view>
    <button type="default" class="btn" @click="addAddress('')">
      <u-icon name="plus-circle"></u-icon>
      添加新收货人
    </button>
    <u-action-sheet :list="delList" :tips="tips" v-model="showAction" @click="deleteAddressMessage"></u-action-sheet>
  </view>
</template>

<script>
import * as API_Trade from "@/api/trade";
import * as API_Address from "@/api/address.js";
export default {
  data() {
    return {
      ifOnShow: false, //组件加载为true 离开为false
      activeClass: "activeClass",
      addressList: [],
      showAction: false,
      empty: false,
      delList: [
        {
          text: "确定",
        },
      ],
      tips: {
        text: "确定要删除该收货人信息吗？",
      },
      delId: "",
      addid: "",
      routerVal: "",
      params: {
        pageNumber: 1,
        pageSize: 50,
      },
    };
  },

  onLoad: function (val) {
    this.routerVal = val;
  },
  onShow() {
    this.addressList = [];
    this.getAddressList();
  },
  onHide() {},
  onBackPress(e) {
    uni.redirectTo({
      url: "/pages/order/fillorder?way=" + this.routerVal.way,
    });
    return true;
  },

  methods: {
    async selectAddressData(val) {
      await API_Trade.setAddressId(val.id, this.routerVal.way);

      uni.redirectTo({
        url: `/pages/order/fillorder?way=${this.routerVal.way}`,
      });
    },
    //获取地址列表
    getAddressList() {
      uni.showLoading();

      API_Address.getAddressList(
        this.params.pageNumber,
        this.params.pageSize
      ).then((res) => {
        console.log("加载");
        if (res.data.result.records.length == 0) {
          this.empty = true;
        } else {
          res.data.result.records.forEach((item) => {
            item.consigneeAddressPath = item.consigneeAddressPath.split(",");
          });

          this.$set(this, "addressList", res.data.result.records);

          
          console.log(this.addressList);
        }

        uni.hideLoading();
      });
    },
    //删除地址
    delAddress(id) {
      this.delId = id;
      this.showAction = true;
    },
    deleteAddressMessage() {
      API_Address.deleteAddress(this.delId).then((res) => {
        if (res.statusCode == 200) {
          uni.showToast({
            icon: "none",
            title: "删除成功",
          });
          this.getAddressList();
        } else {
          uni.showToast({
            icon: "none",
            title: res.data.message,
            duration: 2000,
          });
        }
      });
    },
    //新建。编辑地址
    addAddress(id) {
      console.log("点击");
      if (id) {
        uni.navigateTo({
          url:
            "/pages/mine/address/add?id=" +
            id +
            "&way=" +
            this.routerVal.way +
            "&type=order",
        });
      } else {
        uni.navigateTo({
          url:
            "/pages/mine/address/add?way=" + this.routerVal.way + "&type=order",
        });
      }
    },
    //设为默认地址
    setDefault(item) {
      delete item.updateBy;
      delete item.updateTime;
      delete item.deleteFlag;

      item.isDefault ? "" : (item.isDefault = !item.isDefault);

      API_Address.editAddress(item).then((res) => {
        uni.showToast({
          title: "设置默认地址成功",
          icon: "none",
        });
        this.getAddressList();
      });
    },

    // 地址id
    addId(params) {
      API_Trade.setAddressId(params.address_id).then((res) => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.active {
  background: #f19736;
}

.alifont {
  display: inline-block;
}

.region {
  span {
    margin: 0 4rpx !important;
  }
}
.address {
  .bar {
    height: 20rpx;
    overflow: hidden;
    width: 100%;
    background: url("/pages/floor/imgs/line.png") no-repeat;
    background-size: 100%;
    position: relative;
    top: 0;
    left: 0;
    transform: scale(1, 0.8);
  }
  .default {
    border: 1px solid #ff6262;
    color: #ff6262;
    font-size: 22rpx;
    border-radius: 6rpx;
    align-self: center;
    padding: 2rpx 20rpx;
  }
  .list {
    .item:hover {
      background: #ededed;
    }

    .item {
      margin-top: 20rpx;
      font-size: $font-base;
      color: #666;

      .basic {
        padding: 30rpx;
        line-height: 1.5em;
        border-bottom: 1px solid $border-color-light;

        :nth-child(2) {
          margin: 0 20rpx;
        }

        :nth-child(4) {
          color: $font-color-light;
          font-size: $font-sm;

          margin-top: 10rpx;

          text:nth-child(2) {
            margin: 0;
          }

          view {
            font-size: 28rpx;
          }
        }
      }

      .edit {
        display: flex;
        justify-content: space-between;
        align-items: center;
        vertical-align: middle;
        height: 80rpx;
        font-size: $font-sm;
        color: $font-color-light;
        padding: 0 30rpx;

        .unchecked {
          width: 28rpx;
          height: 28rpx;
          border-radius: 50%;
          border: 1px solid #e0e0e0;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8rpx;
          position: relative;
          top: -2rpx;
          left: 0;
        }

        view:nth-child(1) {
          view:nth-child(1) {
            font-size: $font-base;
            color: $main-color;
            margin-right: 8rpx;
            vertical-align: middle;
          }
        }

        view:nth-child(2) {
          text {
            margin-left: 5rpx;
          }

          .alifont {
            font-size: 32rpx;
          }

          .icon-bianji-copy {
            font-size: 28rpx;
            position: relative;
            top: 2rpx;
            left: 0;
          }

          .icon-lajitong {
            position: relative;
            top: 4rpx;
          }
        }

        .mr-40 {
          margin-right: 40rpx;
        }
      }
    }
  }

  .btn {
    background: $light-color;
    position: fixed;
    width: 690rpx;
    bottom: 60rpx;
    height: 80rpx;
    left: 30rpx;
    font-size: 30rpx;
    line-height: 80rpx;

    .u-icon {
      margin-right: 10rpx;
    }
  }
}
</style>
