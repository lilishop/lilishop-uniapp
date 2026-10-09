<template>
	<view class="msg-page" :style="themeStyle">
		<view class="msg-tabs">
			<u-tabs
				:list="list"
				:scrollable="false"
				:inactiveStyle="{ color: '#333' }"
				v-model:current="current"
				:lineColor="lightColor"
				:activeStyle="{ color: lightColor }"
				@change="change"
			></u-tabs>
		</view>
		<view v-if="showLoading" class="loading-box">
			<u-loading-icon mode="flower"></u-loading-icon>
			<text>正在加载中</text>
		</view>
		<template v-else>
			<view class="msg-list" v-if="current == 0">
				<template v-for="(item, index) in lists" :key="index">
					<view class="msg-card" v-if="item.status == 'UN_READY'" @click="linkMsgDetail(item)">
						<view class="msg-card-head">
							<view class="msg-title">{{item.title}}</view>
							<view class="msg-dot"></view>
						</view>
						<view class="msg-content">{{item.content}}</view>
						<view class="msg-time">{{item.createTime}}</view>
					</view>
				</template>
				<u-empty marginTop="160" v-if="!lists.length" text="暂无未读消息"></u-empty>
			</view>
			<view class="msg-list" v-if="current == 1">
				<template v-for="(item, index) in lists" :key="index">
					<view class="msg-card read" v-if="item.status == 'ALREADY_READY'" @click="linkMsgDetail(item)">
						<view class="msg-card-head">
							<view class="msg-title">{{item.title}}</view>
						</view>
						<view class="msg-content">{{item.content}}</view>
						<view class="msg-time">{{item.createTime}}</view>
					</view>
				</template>
				<u-empty marginTop="160" v-if="!lists.length" text="暂无已读消息"></u-empty>
			</view>
		</template>
	</view>
</template>

<script setup lang="ts">
	import { ref, reactive, computed } from 'vue'
	import { onShow, onReachBottom } from '@dcloudio/uni-app'
	import { messages, editMessages } from '@/api/message.js'
	import { useStore } from '@/store'
	import { getThemeStyle } from '@/utils/theme'
	import { isLogin } from '@/utils/filters.js'

	const store = useStore()
	const themeStyle = computed(() => getThemeStyle(store.state.theme))
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
					lists.value.forEach((item: any, index: number) => {
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
			if (res.data.success) {
				showLoading.value = false
				if (res.data.result.records == '') {
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
							return cur
						},
						[]
					)
				})
			}
		})
	}
</script>

<style lang="scss" scoped>
	.msg-page {
		min-height: 100vh;
		background: #f7f8fa;
	}

	.msg-tabs {
		background: #fff;
	}

	.loading-box {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		height: 600rpx;
		color: #999;
		font-size: 26rpx;
	}

	.msg-list {
		padding: 20rpx 24rpx;
	}

	.msg-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);

		&.read {
			.msg-title {
				color: #999;
				font-weight: 500;
			}

			.msg-content {
				color: #aaa;
			}
		}
	}

	.msg-card-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.msg-title {
		flex: 1;
		min-width: 0;
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.msg-dot {
		flex-shrink: 0;
		width: 16rpx;
		height: 16rpx;
		margin-left: 16rpx;
		border-radius: 50%;
		background: $main-color;
	}

	.msg-content {
		margin-top: 12rpx;
		font-size: 26rpx;
		color: #888;
		line-height: 1.5;
		word-break: break-all;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.msg-time {
		margin-top: 16rpx;
		font-size: 24rpx;
		color: #bbb;
	}

	:deep(.u-tabs),
	:deep(.u-tabs__wrapper),
	:deep(.u-tabs__wrapper__scroll-view-wrapper),
	:deep(.u-tabs__wrapper__scroll-view),
	:deep(.u-tabs__wrapper__nav) {
		background: #fff;
		height: 88rpx;
	}

	:deep(.u-tabs__wrapper__nav__item) {
		min-height: 88rpx;
	}

	:deep(.u-tabs__wrapper__nav__item__text) {
		color: #333;
		font-size: 28rpx;
	}
</style>
