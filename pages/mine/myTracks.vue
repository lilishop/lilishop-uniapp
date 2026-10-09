<template>
	<view :style="themeStyle" class="myTracks">
		<u-navbar
			title="我的足迹"
			:fixed="true"
			:placeholder="true"
			:auto-back="true"
		>
			<template #right>
        <view class="light-color edit" @click="isEdit = !isEdit">{{ !isEdit ? '编辑' : '完成'}}</view>
      </template>
		</u-navbar>
		<u-empty text="暂无历史记录" style="margin-top:200rpx;" mode="history" v-if="isEmpty"></u-empty>
		<view v-else class="tracks-list" :class="{ 'is-editing': isEdit }">
			<u-swipe-action
				v-for="(item, index) in trackList"
				:key="item.id || index"
				class="myTracks-swipe"
			>
				<u-swipe-action-item
					:show="item.show"
					:name="index"
					@click="deleteTracks"
					@open="openSwipe"
					:options="swipeOptions"
				>
					<view class="myTracks-item">
						<u-checkbox-group v-if="isEdit" class="store-line-check">
							<u-checkbox
								usedAlone
								shape="circle"
								:active-color="lightColor"
								v-model:checked="item.checked"
								@change="onTrackCheckChange(item)"
							></u-checkbox>
						</u-checkbox-group>
						<view class="myTracks-item-img" @click.stop="navigateToDetail(item)">
							<image v-if="item.thumbnail" class="track-thumb-img" mode="aspectFill" :src="item.thumbnail"></image>
						</view>
						<view class="myTracks-item-content" @click.stop="navigateToDetail(item)">
							<view class="myTracks-item-title">{{ item.goodsName }}</view>
							<view
								v-if="getStoreName(item)"
								class="myTracks-item-store"
								@click.stop="navigateToStore(item)"
							>{{ getStoreName(item) }}</view>
							<view class="myTracks-item-price">￥{{ unitPrice(item.price) }}</view>
						</view>
					</view>
				</u-swipe-action-item>
			</u-swipe-action>
			<view v-if="isEdit" class="submit" @click="deleteSelectedTracks">删除所选</view>
		</view>

	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import { myTrackList, deleteHistoryListId } from '@/api/members.js'
import { getStoreBaseInfo } from '@/api/store.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const lightColor = computed(() => store.getters.lightColor)

const isEdit = ref(false)
const isEmpty = ref(false)
const params = ref({
	pageNumber: 1,
	pageSize: 10,
	order: 'desc',
	sort: 'updateTime',
})
const swipeOptions = [{ text: '删除', style: { backgroundColor: '#dd524d' } }]
const trackList = ref<any[]>([])
const storeNameMap = ref<Record<string, string>>({})

onReachBottom(() => {
	params.value.pageNumber++
	fetchTrackList()
})

onShow(() => {
	params.value.pageNumber = 1
	trackList.value = []
	fetchTrackList()
})

onPullDownRefresh(() => {
	params.value.pageNumber = 1
	trackList.value = []
	fetchTrackList()
})

function getStoreName(item: any) {
	return item.storeName || storeNameMap.value[item.storeId] || ''
}

async function enrichStoreNames(records: any[]) {
	const storeIds = [
		...new Set(
			records
				.filter((item) => !item.storeName && item.storeId)
				.map((item) => item.storeId)
		),
	].filter((storeId) => !storeNameMap.value[storeId])

	await Promise.all(
		storeIds.map(async (storeId) => {
			try {
				const res = await getStoreBaseInfo(storeId)
				const name = res.data?.result?.storeName
				if (name) {
					storeNameMap.value[storeId] = name
				}
			} catch {
				// ignore
			}
		})
	)
}

function onTrackCheckChange(_val: any) {
	// 勾选状态由 v-model:checked 维护
}

function deleteSelectedTracks() {
	const ids = trackList.value.filter((item) => item.checked).map((item) => item.goodsId)
	if (!ids.length) {
		uni.showToast({ title: '请选择删除数据', icon: 'none' })
		return
	}
	deleteTracks(0, ids)
}

function navigateToStore(val: any) {
	uni.navigateTo({ url: `/pages/product/shopPage?id=${val.storeId}` })
}

function openSwipe(index: number) {
	trackList.value[index].show = true
	trackList.value.forEach((val, idx) => {
		if (index !== idx) val.show = false
	})
}

function navigateToDetail(item: any) {
	uni.navigateTo({
		url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
	})
}

function fetchTrackList() {
	uni.showLoading({ title: '加载中' })
	myTrackList(params.value).then(async (res) => {
		uni.stopPullDownRefresh()
		uni.hideLoading()
		if (res.statusCode === 200) {
			const records = res.data.result.records || []
			records.forEach((item: any) => {
				item.show = false
				item.checked = false
			})

			if (!records.length) {
				if (trackList.value.length === 0) {
					isEmpty.value = true
				}
			} else {
				isEmpty.value = false
				await enrichStoreNames(records)
				trackList.value.push(...records)
			}
		}
	})
}

function deleteTracks(e: any, ids?: any) {
	const index = typeof e === 'object' ? (e.name != null ? e.name : e.index) : e
	const goodsId = ids || trackList.value[index]?.goodsId
	if (!goodsId) return
	deleteHistoryListId(goodsId).then((res) => {
		if (res.data.code === 200) {
			trackList.value = []
			params.value.pageNumber = 1
			fetchTrackList()
		} else {
			uni.showToast({
				title: res.data.message,
				duration: 2000,
				icon: 'none',
			})
		}
	})
}
</script>

<style lang="scss" scoped>
	.submit {
		position: fixed;
		bottom: calc(20rpx + constant(safe-area-inset-bottom));
		bottom: calc(20rpx + env(safe-area-inset-bottom));
		left: 10%;
		width: 80%;
		height: 80rpx;
		color: #fff;
		border-radius: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: $light-color;
		z-index: 99;
	}

	.myTracks {
		width: 100%;
		min-height: 100vh;
		background: #f5f5f5;
		padding-top: 2rpx;
		box-sizing: border-box;
	}

	.tracks-list {
		padding: 20rpx 24rpx 40rpx;
		box-sizing: border-box;

		&.is-editing {
			padding-bottom: calc(140rpx + constant(safe-area-inset-bottom));
			padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
		}
	}

	.myTracks-swipe {
		display: block;
		margin-bottom: 20rpx;
		border-radius: 16rpx;
		overflow: hidden;
		background: #fff;
	}

	:deep(.u-swipe-action),
	:deep(.u-swipe-action-item),
	:deep(.u-swipe-action-item__content) {
		width: 100%;
	}

	:deep(.u-swipe-action-item__content) {
		overflow: hidden;
		background: #fff;
	}

	.myTracks-item {
		width: 100%;
		padding: 24rpx;
		background-color: #fff;
		box-sizing: border-box;
		display: flex;
		align-items: center;
	}

	.store-line-check {
		margin-right: 16rpx;
		flex-shrink: 0;
	}

	.myTracks-item-img {
		width: 160rpx;
		height: 160rpx;
		margin-right: 20rpx;
		flex-shrink: 0;
		border-radius: 12rpx;
		background: #f3f4f6;
		overflow: hidden;

		.track-thumb-img {
			width: 100%;
			height: 100%;
			display: block;
		}
	}

	.myTracks-item-content {
		flex: 1;
		min-width: 0;
		min-height: 160rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.myTracks-item-title {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.myTracks-item-store {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #999;
		line-height: 1.4;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.myTracks-item-price {
		margin-top: 12rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: $light-color;
		line-height: 1.2;
	}

	.edit {
		padding-right: 32rpx;
	}
</style>
