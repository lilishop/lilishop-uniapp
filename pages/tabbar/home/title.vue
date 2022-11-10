<template>
	<view>
		<view>
			<u-tabs :list="list" :is-scroll="false" :current="current" @change="change"></u-tabs>
			<view v-if="showLoading" style="width:500rpx;margin:0 auto;text-align: center;height:800rpx;line-height: 800rpx;">
				<u-loading mode="flower" ></u-loading>
				<text>正在加载中</text>
			</view>
			<u-cell-group v-if="current == 0">
				<view v-for="(item,index) in lists" :key="index">
					<u-cell-item :arrow="false" v-if="item.status =='UN_READY'" style="position: relative;"
						@click="linkMsgDetail(item)">
						<template slot="label">
							<view style="display: inline-block;
                width: 100%;
                height: auto;
                font-family: Gibson;
                font-size: 25rpx;
                word-break: break-all;
                text-overflow: ellipsis;
                word-wrap: break-word;
                white-space: pre-wrap;">
								<view style="color:black;font-size:30rpx;font-weight:500;">{{item.title}}</view>
								<view>{{item.content}}</view>
								<view style="width:400rpx;padding: 10rpx 0;">{{item.createTime}}</view>
							</view>
						</template>
						<!-- <button  style="width:100rpx;height:60rpx;float:right;font-size:20rpx;line-height:60rpx;background:#000000;color:white;">未读</button> -->
					</u-cell-item>
				</view>

			</u-cell-group>
			<u-cell-group v-if="current == 1">
				<view v-for="(item,index) in lists" :key="index">
					<u-cell-item :arrow="false" v-if="item.status == 'ALREADY_READY'" style="position: relative;"
						@click="linkMsgDetail(item)">
						<template slot="label">
							<view style="display: inline-block;
							  width: 100%;
							  height: auto;
							  font-family: Gibson;
							  font-size: 25rpx;
							  word-break: break-all;
							  text-overflow: ellipsis;
							  word-wrap: break-word;
							  
							  white-space: pre-wrap;">
							  <view style="color:black;font-size:30rpx;font-weight:500;">{{item.title}}</view>
							  <view>{{item.content}}</view>
							  <view style="width:400rpx;padding: 10rpx 0;">{{item.createTime}}</view>
							</view>
						</template>
						<!-- <button  style="width:100rpx;height:60rpx;float:right;font-size:20rpx;line-height:60rpx;background:#F3F3FA;color:black;">已读</button> -->
					</u-cell-item>
				</view>
			</u-cell-group>
		</view>

	</view>
</template>

<script>
	import {
		messages,
		editMessages
	} from "@/api/message.js"
	export default {
		data() {
			return {
				showLoading:true,
				params: {
					pageSize: 20,
					pageNumber: 1,
					memberId: "",
					messageId: "",
					status:"UN_READY"
				},
				loadText: {
					loadmore: '轻轻上拉',
					loading: '努力加载中',
					nomore: '实在没有了'
				},
				list: [{
					name: "未读"
				}, {
					name: "已读"
				}],
				current: 0,
				lists: [],
				status: "loadmore"
			}
		},
		onShow() {
			this.getMessage()
		},
		onReachBottom() {
			this.params.pageNumber++;
			this.statuss = "loading";
			this.getMessage()
		},
		methods: {
			linkMsgDetail(v) {

				if (v.status == 'UN_READY') {
					let params = {}
					params.messageId = v.memberId
					editMessages(v.id, params).then(res => {
						if (res.data.success) {
                            console.log( this.lists)
                            this.lists.forEach((item,index)=>{
                                console.log(item)
                                if(item.id == v.id){
                                    this.lists.splice(index, 1)
                                }
                            })
						}
					})
				}
				
				// uni.navigateTo({
				// 	url:`/pages/tabbar/home/messageDetail?data=${encodeURIComponent(JSON.stringify(v))}`
				// })
				

			},
			/**
			 * 返回
			 */
			back() {
				if (getCurrentPages().length == 1) {
					uni.switchTab({
						url: "/pages/tabbar/home/index",
					});
				} else {
					uni.navigateBack();
				}
			},
			change(e) {
				this.showLoading = true;
				console.log(e)
				this.current = e;
				if (e == 0) {
					this.params.status = "UN_READY"
					this.params.pageNumber = 1;
				} else if (e == 1) {
					this.params.status = "ALREADY_READY"
					this.params.pageNumber = 1;
				}
				this.lists = []
				this.getMessage()
			},
			getMessage() {
				this.params.memberId = this.$options.filters.isLogin().id;
				
				messages(this.params).then(res => {
					console.log(res)
					if (res.data.success) {
						this.showLoading = false
						if (res.data.result.records == '') {
							console.log(11111)
							this.status = "nomore"
						}
						res.data.result.records.forEach(item => {
							this.lists.push(item)
							let obj = {};
							this.lists = this.lists.reduce(
								(cur, next) => {
									//对象去重
									if (next.id != undefined) {
										obj[next.id] ?
											"" :
											(obj[next.id] = true && cur.push(next));
									}
									console.log(cur);
									return cur;
								},
								[]
							)
						})

					}
				})
			}
		},
	}
</script>
<style>
	.foot {
		position: fixed;
		bottom: 0;
	}
</style>
