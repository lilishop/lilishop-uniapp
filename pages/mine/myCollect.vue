<template>
	<view class="content">
		<u-navbar
			:fixed="true"
			:placeholder="true"
			:border="false"
			:auto-back="true"
			title=""
		>
			<template #center>
				<view class="slot-wrap">
					<u-tabs
						:lineColor="lightColor"
						:activeStyle="{ color: lightColor }"
						class="collect-tabs"
						:list="navList"
						:scrollable="false"
						v-model:current="tabCurrentIndex"
					></u-tabs>
				</view>
			</template>
		</u-navbar>
		<view class="collect-body">
			<!-- 显示商品栏 -->
			<view v-if="tabCurrentIndex === 0" class="tab-content">
				<u-empty style="margin-top: 40rpx" text="暂无收藏商品数据" mode="favor" v-if="goodsEmpty"></u-empty>
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
							@click="removeGoodsCollection(item, index)"
							:name="index"
						>
							<view class="goods" @click="goGoodsDetail(item)">
								<u-image width="131rpx" height="131rpx" :src="item.image" mode="aspectFit">
									<template #loading><u-loading-icon></u-loading-icon></template>
								</u-image>
								<view class="goods-intro">
									<view class="goods-name">{{ item.goodsName }}</view>
									<view class="goods-sn">{{ item.goods_sn }}</view>
									<view class="goods-price">￥{{ unitPrice(item.price) }}</view>
								</view>
							</view>
						</u-swipe-action-item>
					</u-swipe-action>
				</template>
			</view>
			<!-- 显示收藏的店铺栏 -->
			<view v-else class="tab-content">
				<u-empty style="margin-top: 40rpx" text="暂无收藏店铺数据" mode="favor" v-if="storeEmpty"></u-empty>
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
								<view class="intro">
									<view class="store-logo">
										<u-image width="102rpx" height="102rpx" :src="item.storeLogo" :alt="item.storeName"
											mode="aspectFit">
											<template #loading><u-loading-icon></u-loading-icon></template>
										</u-image>
									</view>
									<view class="store-name">
										<view>{{ item.storeName }}</view>
										<u-tag size="mini" type="error" :color="mainColor" v-if="item.selfOperated"
											text="自营" mode="plain" shape="circle" />
									</view>
									<view class="store-collect">
										<view>进店逛逛</view>
									</view>
								</view>
							</view>
						</u-swipe-action-item>
					</u-swipe-action>
				</template>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import {
	getGoodsCollection,
	getStoreCollection,
	deleteGoodsCollection,
	deleteStoreCollection,
} from '@/api/members.js'

const store = useStore()

const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)

const swipeOptions = computed(() => [
	{
		text: '取消',
		style: { backgroundColor: lightColor.value },
	},
])

const tabCurrentIndex = ref(0)
const navList = ref([
	{ name: '商品(0)', params: { pageNumber: 1, pageSize: 10 } },
	{ name: '店铺(0)', params: { pageNumber: 1, pageSize: 10 } },
])
const goodsEmpty = ref(false)
const storeEmpty = ref(false)
const goodsList = ref<any[]>([])
const storeList = ref<any[]>([])

onShow(() => {
	reloadOrLoadMore('reload')
})

onReachBottom(() => {
	reloadOrLoadMore('next')
})

onPullDownRefresh(() => {
	if (tabCurrentIndex.value === 0) {
		navList.value[0].params.pageNumber = 1
		goodsList.value = []
		fetchGoodsList()
	} else {
		navList.value[1].params.pageNumber = 1
		storeList.value = []
		fetchStoreList()
	}
})

function hideLoadingIfNeeded() {
	if (store.state.isShowToast) uni.hideLoading()
}

function reloadOrLoadMore(type: 'reload' | 'next') {
	if (type === 'next') {
		navList.value[tabCurrentIndex.value].params.pageNumber++
		if (tabCurrentIndex.value === 0) {
			fetchGoodsList()
		} else {
			fetchStoreList()
		}
		return
	}
	navList.value[0].params.pageNumber = 1
	navList.value[1].params.pageNumber = 1
	goodsEmpty.value = false
	storeEmpty.value = false
	goodsList.value = []
	storeList.value = []
	fetchGoodsList()
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
			goodsList.value = []
			navList.value[0].params.pageNumber = 1
			fetchGoodsList()
		}
	})
}

function removeStoreCollection(val: any) {
	deleteStoreCollection(val.id).then((res) => {
		if (res.statusCode === 200) {
			storeList.value = []
			navList.value[1].params.pageNumber = 1
			fetchStoreList()
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
	uni.showLoading({ title: '加载中' })
	getGoodsCollection(navList.value[0].params, 'GOODS')
		.then((res) => {
			hideLoadingIfNeeded()
			uni.stopPullDownRefresh()
			if (res.data.success) {
				const data = res.data.result
				navList.value[0].name = `商品(${data.total})`
				goodsEmpty.value = data.total === 0
				if (data.records?.length) {
					const records = data.records.map((item: any) => ({ ...item, selected: false }))
					goodsList.value.push(...records)
				}
			}
		})
		.catch(() => {
			hideLoadingIfNeeded()
			uni.stopPullDownRefresh()
		})
}

function fetchStoreList() {
	uni.showLoading({ title: '加载中' })
	getStoreCollection(navList.value[1].params, 'STORE')
		.then((res) => {
			hideLoadingIfNeeded()
			uni.stopPullDownRefresh()
			if (res.data.success) {
				const data = res.data.result
				navList.value[1].name = `店铺(${data.total})`
				storeEmpty.value = data.total === 0
				if (data.records?.length) {
					const records = data.records.map((item: any) => ({ ...item, selected: false }))
					storeList.value.push(...records)
				}
			}
		})
		.catch(() => {
			hideLoadingIfNeeded()
			uni.stopPullDownRefresh()
		})
}
</script>

<style lang="scss">
	page,
	.content {
		background: $page-color-base;
		height: 100%;
	}

	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.slot-wrap {
		flex: 1;
		display: flex;
		justify-content: center;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.collect-tabs {
		width: 100%;
	}

	.collect-body {
		flex: 1;
		width: 100%;
	}

	.tab-content {
		width: 100%;
	}

	:deep(.u-tabs),
	:deep(.u-tabs__wrapper),
	:deep(.u-tabs__wrapper__scroll-view-wrapper),
	:deep(.u-tabs__wrapper__scroll-view),
	:deep(.u-tabs__wrapper__nav) {
		width: 100%;
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
		background-color: #fff;
		border-bottom: 1px solid $border-color-light;
		min-height: 190rpx;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		margin-top: 20rpx;
		width: 100%;

		.goods-intro {
			flex: 1;
			min-width: 0;
			font-size: $font-base;
			line-height: 48rpx;
			margin-left: 30rpx;

			.goods-name {
				line-height: 1.4em;
				font-size: 24rpx;
				max-height: 2.8em;
				overflow: hidden;
				color: #666;
			}

			.goods-sn {
				color: #cccccc;
				font-size: 24rpx;
			}

			.goods-price {
				color: $light-color;
			}
		}
	}

	.store {
		background-color: #fff;
		border: 1px solid $border-color-light;
		border-radius: 16rpx;
		margin: 20rpx 10rpx;
		width: calc(100% - 20rpx);
		box-sizing: border-box;

		.intro {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 30rpx 0 40rpx;
			min-height: 170rpx;

			.store-logo {
				width: 102rpx;
				height: 102rpx;
				border-radius: 50%;
				overflow: hidden;
				flex-shrink: 0;
			}

			.store-name {
				flex: 1;
				min-width: 0;
				margin-left: 30rpx;
				line-height: 2em;

				:first-child {
					font-size: $font-base;
				}
			}

			.store-collect {
				flex-shrink: 0;
				border-left: 1px solid $border-color-light;
				padding-left: 20rpx;
				text-align: center;
				color: #999;
				font-size: $font-sm;
			}
		}
	}
</style>
