<template>
  <view>
    <view class="-list">
      <view class="title">提现类型</view>
      <view class="content">
        <view class="price">
          <u-input disabled :value="type === 'ALI' ? '支付宝' : '微信'" placeholder="" />
        </view>
	  </view>
    </view>
	<view class="-list">
	  <view class="title">提现金额</view>
	  <view class="content">
		<view class="price">
	      <span> ￥</span>
	      <u-input v-model="price" placeholder="" type="number" />
	    </view>
	
	    <view class="all">
	      <view @click="handleAll" :style="{ color: $mainColor }">全部</view>
	      <view style="font-size: 24rpx; color: #999">可提现金额<span>{{ walletNum | unitPrice }}</span>元</view>
	    </view>
	
	  </view>
	  <view class="tips">
	    最低提现金额为 {{ minPrice }} 元
	  </view>
	</view>
	<view class="-list" v-if="type === 'ALI'">
	  <view class="title">真实姓名</view>
	  <view class="content">
		<view class="price">
		  <u-input v-model="realName" placeholder="" />
		</view>
	  </view>
	</view>
	<view class="-list" v-if="type === 'ALI'">
	  <view class="title">第三方登录账号</view>
	  <view class="content">
		<view class="price">
		  <u-input v-model="connectNumber" placeholder="" />
		</view>
	  </view>
	</view>

    <view class="submit" @click="cashd">提现</view>
  </view>
</template>
<script>
import { getUserWallet, withdrawalApply, withdrawalSettingVO } from "@/api/members";
export default {
  data() {
    return {
      price: 0,
      walletNum: 0,
	  minPrice: 0,
	  type: '',
	  connectNumber: '',
	  realName: ''
    };
  },
  async mounted() {
    let result = await getUserWallet(); //预存款
	let res = await withdrawalSettingVO();
    this.walletNum = result.data.result.memberWallet;
	this.minPrice = res.data.result.minPrice;
	this.type = res.data.result.type;
  },

  methods: {
    cashd() {
      this.price = this.price + "";

      if (this.$u.test.amount(parseInt(this.price))) {
		let params = { price: this.price };
		if (this.type === 'ALI') {
			if (!this.connectNumber || !this.realName) {
				uni.showToast({
				  title: "请输入真实姓名和第三方登录账号",
				  duration: 2000,
				  icon: "none",
				});
				return;
			}
			params.connectNumber = this.connectNumber;
			params.realName = this.realName;
		}
        withdrawalApply(params).then((res) => {
          if (res.data.success) {
            uni.showToast({
              title: "提现成功!",
              duration: 2000,
              icon: "none",
            });
            setTimeout(() => {
              uni.navigateBack({
                delta: 1,
              });
            }, 1000);
          }
        });
      } else {
        uni.showToast({
          title: "请输入正确金额",
          duration: 2000,
          icon: "none",
        });
      }
    },
    handleAll() {
      this.price = this.walletNum;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./style.scss";
.tips {
  font-size: 24rpx;
  color: #999;
}
</style>