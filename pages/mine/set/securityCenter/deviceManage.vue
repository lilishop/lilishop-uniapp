<template>
	<view class="device-manage">
		<u-cell-group>
			<u-cell-item class="border-top" :arrow="false" title="常用设备保护">
				<u-switch slot="right-icon" active-color="#1abc9c" size="40" v-model="checked"></u-switch>
			</u-cell-item>
		</u-cell-group>
		<view class="describe">开启常用设备保护后，在不常用的手机上登录时，需要进行账号及密码验证，通过后继续登录。</view>
		<view class="title">常用设备</view>
		<u-cell-group class="">
			<u-cell-item 
			title="HUAWEI Mate30" 
			:center="true" 
			label="最近使用：2020-06-28北京市" 
			value="正在使用" 
			:value-style="{color:'#1abc9c','font-size':'14px'}"
			:title-style="{'color':'#333'}"
			>
			</u-cell-item>
		</u-cell-group>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				checked:true
			};
		}
	}
</script>

<style lang="scss">
.device-manage{
	.title{
		padding:0 30rpx 20rpx;
	}
}
</style>
