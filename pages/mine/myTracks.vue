<template>
	<view class="myTracks">
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
		<view class="tracks-tip">
			<u-icon name="volume" color="#f9ae3d" size="19"></u-icon>
			<text class="tracks-tip-text">右划删除浏览记录</text>
		</view>
		<u-empty text="暂无历史记录" style="margin-top:200rpx;" mode="history" v-if="isEmpty"></u-empty>
		<view v-else class="tracks-list">
			<block v-for="(item, index) in trackList" :key="index">
				<view
					class="myTracks-title"
					v-if="getStoreName(item)"
					@click="navigateToStore(item)"
				>{{ getStoreName(item) }}</view>
				<u-swipe-action class="myTracks-swipe">
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
								<image class="track-thumb" :src="item.thumbnail"></image>
							</view>
							<view class="myTracks-item-content" @click.stop="navigateToDetail(item)">
								<view class="myTracks-item-title">
									{{ item.goodsName }}
								</view>
								<view class="myTracks-item-price">
									￥{{ unitPrice(item.price) }}
								</view>
							</view>
						</view>
					</u-swipe-action-item>
				</u-swipe-action>
				<view class="myTracks-divider"></view>
			</block>
			<view v-if="isEdit" class="submit" @click="deleteSelectedTracks">
				删除所选
			</view>
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

const store = useStore()
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
	const index = typeof e === 'object' ? (e.name ?? e.index) : e
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
		padding-top: 2rpx;
	}

	.tracks-tip {
		display: flex;
		align-items: center;
		padding: 18rpx 24rpx;
		background: #fdf6ec;
	}

	.tracks-tip-text {
		margin-left: 10rpx;
		font-size: 28rpx;
		color: #f9ae3d;
		line-height: 1.4;
	}

	.tracks-list {
		width: 100%;
	}

	.myTracks-swipe,
	:deep(.u-swipe-action),
	:deep(.u-swipe-action-item),
	:deep(.u-swipe-action-item__content) {
		width: 100%;
	}

	:deep(.u-swipe-action-item__content) {
		overflow: hidden;
	}

	.myTracks-title {
		width: 100%;
		height: 110rpx;
		padding: 0 20rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: bold;
		background-color: #fff;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.myTracks-item {
		width: 100%;
		min-height: 226rpx;
		padding: 30rpx 20rpx;
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
		margin-right: 20rpx;
		flex-shrink: 0;

		.track-thumb {
			width: 130rpx;
			height: 130rpx;
			border-radius: 8rpx;
			display: block;
		}
	}

	.myTracks-item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.myTracks-item-title {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.myTracks-item-price {
		font-size: 28rpx;
		color: $light-color;
		padding-top: 10rpx;
	}

	.myTracks-divider {
		width: 100%;
		height: 20rpx;
		background: #f5f5f5;
	}

	.edit {
		padding-right: 32rpx;
	}
</style>
