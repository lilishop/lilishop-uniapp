<template>
	<view class="page" :style="themeStyle">
		<u-navbar
			title="收藏"
			:fixed="true"
			:placeholder="true"
			:border="false"
			:auto-back="true"
		></u-navbar>

		<view class="tabs-wrap">
			<u-tabs
				:list="navList"
				:scrollable="false"
				:lineColor="lightColor"
				:activeStyle="{ color: lightColor, fontWeight: '600' }"
				:inactiveStyle="{ color: '#666' }"
				v-model:current="tabCurrentIndex"
				@change="onTabChange"
			></u-tabs>
		</view>

		<scroll-view
			class="list-scroll"
			scroll-y
			enable-back-to-top
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="onRefresh"
			@scrolltolower="loadMore"
		>
			<!-- 商品 -->
			<view v-if="tabCurrentIndex === 0" class="tab-content">
				<u-empty
					v-if="!goodsLoading && goodsEmpty"
					class="empty-box"
					text="暂无收藏商品"
					mode="favor"
				></u-empty>
				<template v-else>
					<u-swipe-action
						v-for="(item, index) in goodsList"
						:key="item.skuId || item.goodsId || index"
						class="collect-swipe"
					>
						<u-swipe-action-item
							@open="openSwipeItem(item, 'goods')"
							:show="item.selected"
							:options="swipeOptions"
							@click="removeGoodsCollection(item)"
							:name="index"
						>
							<view class="goods" @click="goGoodsDetail(item)">
								<u-image width="140rpx" height="140rpx" radius="12rpx" :src="item.image" mode="aspectFill">
									<template #loading><u-loading-icon></u-loading-icon></template>
								</u-image>
								<view class="goods-intro">
									<view class="goods-name wes-2">{{ item.goodsName }}</view>
									<view class="goods-price">￥{{ unitPrice(item.price) }}</view>
								</view>
							</view>
						</u-swipe-action-item>
					</u-swipe-action>
					<view class="load-status" v-if="goodsList.length">
						{{ goodsFinished ? '没有更多了' : goodsLoading ? '加载中...' : '上拉加载更多' }}
					</view>
				</template>
			</view>

			<!-- 店铺 -->
			<view v-else class="tab-content">
				<u-empty
					v-if="!storeLoading && storeEmpty"
					class="empty-box"
					text="暂无收藏店铺"
					mode="favor"
				></u-empty>
				<template v-else>
					<u-swipe-action
						v-for="(item, index) in storeList"
						:key="item.id || index"
						class="collect-swipe"
					>
						<u-swipe-action-item
							@open="openSwipeItem(item, 'store')"
							:show="item.selected"
							:options="swipeOptions"
							@click="removeStoreCollection(item)"
							:name="index"
						>
							<view class="store" @click="goStoreMainPage(item.id)">
								<view class="store-logo">
									<u-image
										width="96rpx"
										height="96rpx"
										shape="circle"
										:src="item.storeLogo"
										mode="aspectFill"
									>
										<template #loading><u-loading-icon></u-loading-icon></template>
									</u-image>
								</view>
								<view class="store-info">
									<view class="store-name-row">
										<text class="store-name wes">{{ item.storeName }}</text>
										<u-tag
											v-if="item.selfOperated"
											size="mini"
											type="error"
											:color="mainColor"
											text="自营"
											plain
											shape="circle"
										/>
									</view>
									<view class="store-tip">左滑可取消收藏</view>
								</view>
								<view class="store-enter">进店逛逛</view>
							</view>
						</u-swipe-action-item>
					</u-swipe-action>
					<view class="load-status" v-if="storeList.length">
						{{ storeFinished ? '没有更多了' : storeLoading ? '加载中...' : '上拉加载更多' }}
					</view>
				</template>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'
import {
	getGoodsCollection,
	getStoreCollection,
	deleteGoodsCollection,
	deleteStoreCollection,
} from '@/api/members.js'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const swipeOptions = computed(() => [
	{
		text: '取消',
		style: { backgroundColor: lightColor.value },
	},
])

const tabCurrentIndex = ref(0)
const navList = ref([
	{ name: '商品(0)' },
	{ name: '店铺(0)' },
])

const goodsParams = ref({ pageNumber: 1, pageSize: 10 })
const storeParams = ref({ pageNumber: 1, pageSize: 10 })

const goodsEmpty = ref(false)
const storeEmpty = ref(false)
const goodsList = ref<any[]>([])
const storeList = ref<any[]>([])
const goodsLoading = ref(false)
const storeLoading = ref(false)
const goodsFinished = ref(false)
const storeFinished = ref(false)
const refreshing = ref(false)
const inited = ref(false)

onShow(() => {
	if (!inited.value) {
		inited.value = true
		reloadAll()
		return
	}
	reloadCurrent()
})

function hideLoadingIfNeeded() {
	if (store.state.isShowToast) uni.hideLoading()
}

function onTabChange(e: any) {
	const index = typeof e === 'number' ? e : e?.index
	if (typeof index === 'number') {
		tabCurrentIndex.value = index
	}
	if (tabCurrentIndex.value === 0 && !goodsList.value.length && !goodsEmpty.value) {
		reloadGoods()
	}
	if (tabCurrentIndex.value === 1 && !storeList.value.length && !storeEmpty.value) {
		reloadStore()
	}
}

function onRefresh() {
	refreshing.value = true
	reloadCurrent()
}

function loadMore() {
	if (tabCurrentIndex.value === 0) {
		if (goodsLoading.value || goodsFinished.value || goodsEmpty.value) return
		goodsParams.value.pageNumber++
		fetchGoodsList()
	} else {
		if (storeLoading.value || storeFinished.value || storeEmpty.value) return
		storeParams.value.pageNumber++
		fetchStoreList()
	}
}

function reloadAll() {
	reloadGoods()
	reloadStore()
}

function reloadCurrent() {
	if (tabCurrentIndex.value === 0) {
		reloadGoods()
	} else {
		reloadStore()
	}
}

function reloadGoods() {
	goodsParams.value.pageNumber = 1
	goodsFinished.value = false
	goodsEmpty.value = false
	goodsList.value = []
	fetchGoodsList()
}

function reloadStore() {
	storeParams.value.pageNumber = 1
	storeFinished.value = false
	storeEmpty.value = false
	storeList.value = []
	fetchStoreList()
}

function openSwipeItem(val: any, type: 'goods' | 'store') {
	const targetList = type === 'goods' ? goodsList.value : storeList.value
	targetList.forEach((item) => {
		item.selected = false
	})
	val.selected = true
}

function removeGoodsCollection(val: any) {
	deleteGoodsCollection(val.skuId).then((res) => {
		if (res.statusCode === 200) {
			reloadGoods()
		}
	})
}

function removeStoreCollection(val: any) {
	deleteStoreCollection(val.id).then((res) => {
		if (res.statusCode === 200) {
			reloadStore()
		}
	})
}

function goGoodsDetail(val: any) {
	uni.navigateTo({
		url: `/pages/product/goods?id=${val.skuId}&goodsId=${val.goodsId}`,
	})
}

function goStoreMainPage(id: string) {
	uni.navigateTo({
		url: `/pages/product/shopPage?id=${id}`,
	})
}

function fetchGoodsList() {
	if (goodsLoading.value) return
	goodsLoading.value = true
	uni.showLoading({ title: '加载中' })
	getGoodsCollection(goodsParams.value, 'GOODS')
		.then((res) => {
			goodsLoading.value = false
			refreshing.value = false
			hideLoadingIfNeeded()
			if (res.data.success) {
				const data = res.data.result
				navList.value[0].name = `商品(${data.total || 0})`
				goodsEmpty.value = !data.total
				const records = (data.records || []).map((item: any) => ({
					...item,
					selected: false,
				}))
				if (goodsParams.value.pageNumber === 1) {
					goodsList.value = records
				} else {
					goodsList.value.push(...records)
				}
				goodsFinished.value =
					!records.length || goodsList.value.length >= (data.total || 0)
			}
		})
		.catch(() => {
			goodsLoading.value = false
			refreshing.value = false
			hideLoadingIfNeeded()
		})
}

function fetchStoreList() {
	if (storeLoading.value) return
	storeLoading.value = true
	uni.showLoading({ title: '加载中' })
	getStoreCollection(storeParams.value, 'STORE')
		.then((res) => {
			storeLoading.value = false
			refreshing.value = false
			hideLoadingIfNeeded()
			if (res.data.success) {
				const data = res.data.result
				navList.value[1].name = `店铺(${data.total || 0})`
				storeEmpty.value = !data.total
				const records = (data.records || []).map((item: any) => ({
					...item,
					selected: false,
				}))
				if (storeParams.value.pageNumber === 1) {
					storeList.value = records
				} else {
					storeList.value.push(...records)
				}
				storeFinished.value =
					!records.length || storeList.value.length >= (data.total || 0)
			}
		})
		.catch(() => {
			storeLoading.value = false
			refreshing.value = false
			hideLoadingIfNeeded()
		})
}
</script>

<style lang="scss">
page {
	background: #f8f8f8;
	height: 100%;
}
</style>

<style lang="scss" scoped>
.page {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f8f8f8;
	box-sizing: border-box;
}

.tabs-wrap {
	flex-shrink: 0;
	background: #fff;
	border-bottom: 1rpx solid #f0f0f0;
}

.list-scroll {
	flex: 1;
	height: 0;
	min-height: 0;
}

.tab-content {
	padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.empty-box {
	margin-top: 120rpx;
}

.collect-swipe,
:deep(.u-swipe-action),
:deep(.u-swipe-action-item),
:deep(.u-swipe-action-item__content) {
	width: 100%;
}

:deep(.u-swipe-action-item__content) {
	overflow: hidden;
}

.goods {
	display: flex;
	align-items: center;
	width: 100%;
	box-sizing: border-box;
	padding: 24rpx;
	margin-top: 16rpx;
	background: #fff;

	.goods-intro {
		flex: 1;
		min-width: 0;
		margin-left: 24rpx;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 140rpx;
	}

	.goods-name {
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}

	.goods-price {
		margin-top: 16rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: var(--theme-light, #ff6b35);
	}
}

.store {
	display: flex;
	align-items: center;
	box-sizing: border-box;
	width: calc(100% - 32rpx);
	margin: 16rpx auto 0;
	padding: 24rpx;
	background: #fff;
	border-radius: 16rpx;
}

.store-logo {
	flex-shrink: 0;
	width: 96rpx;
	height: 96rpx;
	border-radius: 50%;
	overflow: hidden;
	background: #f5f5f5;
}

.store-info {
	flex: 1;
	min-width: 0;
	margin: 0 20rpx;
}

.store-name-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.store-name {
	max-width: 360rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.store-tip {
	margin-top: 10rpx;
	font-size: 22rpx;
	color: #999;
}

.store-enter {
	flex-shrink: 0;
	padding: 12rpx 20rpx;
	border-radius: 100px;
	border: 1rpx solid var(--theme-light, #ff6b35);
	color: var(--theme-light, #ff6b35);
	font-size: 24rpx;
}

.load-status {
	padding: 24rpx 0 8rpx;
	text-align: center;
	font-size: 24rpx;
	color: #999;
}
</style>
