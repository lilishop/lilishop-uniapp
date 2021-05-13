<template>
	<view class="notify">
		<u-cell-group>
			<u-cell-item  title="账户通知" :arrow="false">
				<u-switch slot="right-icon" active-color="#1abc9c" size="40" v-model="setting.account"></u-switch>
			</u-cell-item>
			<u-cell-item  title="物流通知" :arrow="false">
				<u-switch slot="right-icon" active-color="#1abc9c" size="40" v-model="setting.logistics"></u-switch>
			</u-cell-item>
			<u-cell-item  title="优惠促销" :arrow="false">
				<u-switch slot="right-icon" active-color="#1abc9c" size="40"  v-model="setting.cheap"></u-switch>
			</u-cell-item>
			<u-cell-item  title="服务通知" :arrow="false">
				<u-switch slot="right-icon" active-color="#1abc9c" size="40"  v-model="setting.service"></u-switch>
			</u-cell-item>
		</u-cell-group>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				setting:{
					account:false,
					logistics:false,
					cheap:false,
					service:false
				}
			};
		}
	}
</script>

<style lang="scss" scoped>
uni-view{
	font-size: 20rpx;
}
</style>
