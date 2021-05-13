<template>
	<view class="edition-intro">
		<view class="logo c-content">
			<view>
				<image src="/static/img/edition.png" mode=""></image>
			</view>
			<view>版本不息&nbsp;优化不止</view>
		</view>
		<view class="edition c-content" v-for="(item,index) in editionHistory" :key="index">
			<view class="level">
				<text style="color: #1ABC9C;">{{item.version}}</text>
				<text>{{$u.timeFormat(item.update_time, 'yyyy-mm-dd')}}</text>
			</view>
			<view class="detail" v-html="item.content"></view>
		</view>
	</view>
</template>

<script>
	import * as API_Message from "@/api/message.js";
	export default {
		data() {
			return {
				editionHistory:[],
				params: {
				  pageNumber: 1,
				  pageSize: 5
				},
				loadStatus:'more'
			};
		},
		onLoad(){
			if (uni.getSystemInfoSync().platform === 'android') {
				this.params.type = 0;
			} else {
				this.params.type = 1;
			}
			this.GET_AppVersionList(true);
		},
		onReachBottom() {
			if(this.loadStatus!='noMore'){
				this.params.pageNumber++
				this.GET_AppVersionList(false)
			}
			
		},
		methods: {
			GET_AppVersionList(reset){
				if (reset) {
					this.params.pageNumber = 1
				 }
				uni.showLoading({
					title:"加载中"
				})
				API_Message.getAppVersionList(this.params).then(response => {
					uni.hideLoading()
					if(response.statusCode==200){
						const { data } = response
						if(data.data.length<10){
							this.loadStatus = 'noMore';
						}
						this.editionHistory.push(...data.data)
					}
				   
				 })
				
			}
		}
	}
</script>

<style lang="scss">
.edition-intro{
	.logo{
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-size: $font-lg;
		color: $font-color-light;
		height: 330rpx;
		margin-bottom: 20rpx;
		>view:nth-child(1){
			width: 144rpx;
			height: 144rpx;
			border: 1px solid #FFC71C;
			border-radius: 50%;
			position: relative;
			margin-bottom: 30rpx;
			image{
				width: 80rpx;
				height: 113rpx;
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				margin:auto;
			}
		}
		
	}
	.edition{
		margin-bottom: 20rpx;
		color: $font-color-light;
		font-size: $font-sm;
		.level{
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 20rpx 30rpx ;
			border-bottom: 1px solid $border-color-light;
			text:nth-child(1){
				font-size: $font-base;
				font-weight: 700;
			}
		}
		.detail{
			margin-left: 20rpx;
			line-height: 2em;
			padding: 20rpx 0;
		}
	}
}
</style>
