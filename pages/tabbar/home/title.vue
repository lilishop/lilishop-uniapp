<template>
	<view>
		<view>
			<u-tabs
				:list="list"
				:scrollable="false"
				v-model:current="current"
				@change="change"
			></u-tabs>
			<view v-if="showLoading" style="width:500rpx;margin:0 auto;text-align: center;height:800rpx;line-height: 800rpx;">
				<u-loading-icon mode="flower" ></u-loading-icon>
				<text>正在加载中</text>
			</view>
			<u-cell-group v-if="current == 0">
				<view v-for="(item,index) in lists" :key="index">
					<u-cell :isLink="false" v-if="item.status =='UN_READY'" style="position: relative;"
						@click="linkMsgDetail(item)">
						<template #label>
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
					</u-cell>
				</view>

			</u-cell-group>
			<u-cell-group v-if="current == 1">
				<view v-for="(item,index) in lists" :key="index">
					<u-cell :isLink="false" v-if="item.status == 'ALREADY_READY'" style="position: relative;"
						@click="linkMsgDetail(item)">
						<template #label>
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
					</u-cell>
				</view>
			</u-cell-group>
		</view>

	</view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { messages, editMessages } from '@/api/message.js'
import { useStore } from '@/store'
import { isLogin } from '@/utils/filters.js'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const aiderLightColor = computed(() => store.getters.aiderLightColor)

const showLoading = ref(true)
const params = reactive({
	pageSize: 20,
	pageNumber: 1,
	memberId: '',
	messageId: '',
	status: 'UN_READY'
})
const loadText = {
	loadmore: '轻轻上拉',
	loading: '努力加载中',
	nomore: '实在没有了'
}
const list = [
	{ name: '未读' },
	{ name: '已读' }
]
const current = ref(0)
const lists = ref<any[]>([])
const status = ref('loadmore')

onShow(() => {
	getMessage()
})

onReachBottom(() => {
	params.pageNumber++
	status.value = 'loading'
	getMessage()
})

function linkMsgDetail(v: any) {
	if (v.status == 'UN_READY') {
		const editParams: any = {}
		editParams.messageId = v.memberId
		editMessages(v.id, editParams).then((res: any) => {
			if (res.data.success) {
				console.log(lists.value)
				lists.value.forEach((item: any, index: number) => {
					console.log(item)
					if (item.id == v.id) {
						lists.value.splice(index, 1)
					}
				})
			}
		})
	}
}

/**
 * 返回
 */
function back() {
	if (getCurrentPages().length == 1) {
		uni.switchTab({
			url: '/pages/tabbar/home/index'
		})
	} else {
		uni.navigateBack()
	}
}

function change(e: any) {
	const index = typeof e === 'object' && e != null ? e.index : e
	showLoading.value = true
	current.value = index
	if (index == 0) {
		params.status = 'UN_READY'
		params.pageNumber = 1
	} else if (index == 1) {
		params.status = 'ALREADY_READY'
		params.pageNumber = 1
	}
	lists.value = []
	getMessage()
}

function getMessage() {
	params.memberId = isLogin().id

	messages(params).then((res: any) => {
		console.log(res)
		if (res.data.success) {
			showLoading.value = false
			if (res.data.result.records == '') {
				console.log(11111)
				status.value = 'nomore'
			}
			res.data.result.records.forEach((item: any) => {
				lists.value.push(item)
				let obj: Record<string, any> = {}
				lists.value = lists.value.reduce(
					(cur: any[], next: any) => {
						// 对象去重
						if (next.id != undefined) {
							!obj[next.id] && (obj[next.id] = true) && cur.push(next)
						}
						console.log(cur)
						return cur
					},
					[]
				)
			})
		}
	})
}
</script>
<style>
	.foot {
		position: fixed;
		bottom: 0;
	}
</style>
