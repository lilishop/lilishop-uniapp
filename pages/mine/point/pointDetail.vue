<template>
	<view class="point-detail">
		<empty v-if="nomsg"></empty>
		<view v-else class="box" v-for="(con,conIndex) in content" :key="con.conIndex">
			<view class="time">
				<view> <u-icon name="calendar"></u-icon>&nbsp; {{getMonth(con.months)}}</view>
				<view>获得：{{con.point}} 使用：{{con.consumer_point}}</view>
			</view>
			<view class="dataList" v-for="(item,index) in con.history" :key="index">
				<view>
					<view>{{item.reason}}</view>
					<view>{{item.time | unixToDate}}</view>
				</view>
				<view :class="{colorRed:item.consum_point_type==0}">{{item.consum_point_type==0?'-':'+'}}{{item.consum_point}}</view>
				<view>{{item.point}}</view>
			</view>
		</view>
		<uni-load-more :status="loadStatus"></uni-load-more>
	</view>
</template>

<script>
	import {getPointsDataDetail} from '@/api/members.js';
	export default {
		data() {
			return {
				params:{
					pageNumber:1,
					pageSize:10,
					start_time:0,
					end_time:0
				},
				content:[],
				loadStatus:'more',
				nomsg:false,
			};
		},
		onLoad() {
			this.getDetailList()
		},
		methods:{
			getDetailList(){
				uni.showLoading({
					title:'加载中'
				})
				getPointsDataDetail(this.params).then(res=>{
					uni.stopPullDownRefresh();
					uni.hideLoading()
					if (res.statusCode == 200) {
						console.log(res)
						let data = res.data;
						if (data.length==0) {
							if(this.content.length==0){
								this.nomsg = true;
							}else{
								this.loadStatus = 'noMore';
							}
							
						}else if(data[data.length-1].history.length<10){
							this.content.push(...res.data);
							this.loadStatus = 'noMore';
						}else{
							this.content.push(...res.data);
						}
						
					}
					
				})
			},
			getMonth(time){
				console.log(time)
				let str = time+'';
				let arr = str.split('');
				arr.splice(4,0,'-');
				return arr.join('')
			}
		},
		onReachBottom(){
			if(this.loadStatus == 'more'){
				this.params.pageNumber++;
				this.getDetailList()
			}
		}
	}
</script>

<style lang="scss" scoped>
.point-detail{
	.box{
		.time{
			display: flex;
			justify-content: space-between;
			padding: 0 20rpx;
			align-items: center;
			height: 112rpx;
			color: #999999;
			font-size: $font-sm;
		}
		.dataList {
			width: 100%;
			height: 120rpx;
			border-top: 1px solid #f2f2f2;
			padding: 30rpx;
			background: #ffffff;
			font-size: $font-sm;
			// line-height: 1.5em;
			margin-bottom: 10rpx;
			display: flex;
			justify-content: end;
			align-items: center;
			.colorRed{
				color: #f04844;
			}
			>view:nth-child(1){
				flex: 1;
				line-height: 1.5em;
				:nth-child(1){
					color: #666666;
				}
				:nth-child(2){
					color: #999;
				}
			}
			>view:nth-child(2){
				width: 80rpx;
				text-align: center;
			}
			>view:nth-child(3){
				width: 100rpx;
				text-align: center;
			}
		}
	}
}
</style>
