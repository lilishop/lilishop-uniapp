<template>
	<view class="content" :class="{ 'content--goods': isShowSeachGoods }" :style="themeStyle">
		<u-navbar
			:bg-color="navObj.background"
			:auto-back="false"
			:fixed="true"
			:placeholder="true"
			:border="false"
			left-icon=""
			title=""
			class="search-navbar"
		>
			<template #left>
				<view class="search-navbar-wrap" :style="searchNavbarStyle">
					<mSearch
						ref="mSearchRef"
						class="mSearch-input-box"
						@clickLeft="back"
						:mode="2"
						:placeholder="defaultKeyword"
						@search="doSearch(false)"
						@confirm="doSearch(false)"
						@SwitchType="doSearchSwitch()"
						v-model="keyword"
						:isFocusVal="!isShowSeachGoods"
					></mSearch>
				</view>
			</template>
		</u-navbar>

		<view class="search-keyword" v-if="!isShowSeachGoods">
			<scroll-view class="keyword-list-box" v-show="isShowKeywordList" scroll-y>
				<block v-for="(row, index) in keywordList" :key="index">
					<view class="keyword-entry" hover-class="keyword-entry-tap">
						<view class="keyword-text" @tap.stop="doSearch(keywordList[index].words)"><rich-text :nodes="row.words"></rich-text></view>
					</view>
				</block>
			</scroll-view>
			<div class="keyword-box" v-show="!isShowKeywordList">
				<view class="keyword-block add1" v-if="hotKeywordList.length">
					<view class="keyword-list-header">
						<view class="u-tips">热门搜索</view>
					</view>
					<view class="tag-list">
						<view
							class="tag-item wes"
							v-for="(keyword, index) in hotKeywordList"
							:key="index"
							@tap="doSearch(keyword)"
						>{{ keyword }}</view>
					</view>
				</view>
				<view class="keyword-block" v-if="oldKeywordList.length > 0">
					<view class="keyword-list-header">
						<view class="u-tips">搜索历史</view>
					</view>
					<view class="tag-list">
						<template v-for="(keyword, index) in oldKeywordList" :key="index">
							<view
								class="tag-item wes"
								v-if="keyword"
								@tap="doSearch(keyword)"
							>{{ keyword }}</view>
						</template>
						<view
							class="tag-item tag-more"
							v-if="oldKeywordIndex > loadIndex"
							@tap="showMore"
						>展示更多</view>
					</view>
				</view>

				<view class="clear mp-iphonex-bottom" @tap="oldDelete">清空搜索历史</view>
			</div>
		</view>
		<!-- 搜索 -->
		<view class="goods-content" :class="{ 'goods-content--h5': isShowSeachGoods }" v-if="isShowSeachGoods">
			<view class="navbar sort-navbar">
				<view class="nav-item" :class="{ current: filterIndex === 0 }" @click="tabClick(0)">综合排序</view>
				<view class="nav-item" :class="{ current: filterIndex === 3 }" @click="tabClick(3, 'buyCount')">
					<text>销量</text>
					<view class="p-box">
						<view class="index-nav-arrow">
							<image class="img" src="/static/index/arrow-up-1.png" v-if="params.sort === 'buyCount' && params.order === 'asc'" mode="aspectFit"></image>
							<image class="img" src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
						</view>
						<view class="index-nav-arrow">
							<image class="img" src="/static/index/arrow-down.png" v-if="params.sort === 'buyCount' && params.order === 'desc'" mode="aspectFit"></image>
							<image class="img" src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
						</view>
					</view>
				</view>
				<view class="nav-item" :class="{ current: filterIndex === 4 }" @click="tabClick(4, 'price')">
					<text>价格</text>
					<view class="p-box">
						<view class="index-nav-arrow">
							<image class="img" src="/static/index/arrow-up-1.png" v-if="params.sort === 'price' && params.order === 'asc'" mode="aspectFit"></image>
							<image class="img" src="/static/index/arrow-up.png" v-else mode="aspectFit"></image>
						</view>
						<view class="index-nav-arrow">
							<image class="img" src="/static/index/arrow-down.png" v-if="params.sort === 'price' && params.order === 'desc'" mode="aspectFit"></image>
							<image class="img" src="/static/index/arrow-down-1.png" v-else mode="aspectFit"></image>
						</view>
					</view>
				</view>
				<view class="nav-item" @click="sortGoods">筛选</view>
			</view>
			<!-- #ifdef H5 || APP-PLUS -->
			<view v-if="!empty && isSWitch" class="goods-list-wrap">
				<goodsList :res="goodsListData" type="oneColumns" :keyword="keyword" :tab-bar-gap="false" />
				<uni-load-more :status="loadingType" @clickLoadMore="loadmore"></uni-load-more>
			</view>
			<view v-if="!empty && !isSWitch && goodsListData.length" class="goods-list-wrap">
				<goodsList :res="goodsListData" :keyword="keyword" :tab-bar-gap="false" />
				<uni-load-more :status="loadingType" @clickLoadMore="loadmore"></uni-load-more>
			</view>
			<!-- #endif -->
			<!-- #ifdef MP -->
			<!-- 一行一个商品展示 -->
			<scroll-view
				v-if="!empty && isSWitch"
				class="goods-scroll"
				enableBackToTop="true"
				lower-threshold="250"
				@scrolltolower="loadmore()"
				scroll-with-animation
				scroll-y
			>
				<goodsList :res="goodsListData" type="oneColumns" :keyword="keyword" :tab-bar-gap="false" />
				<uni-load-more :status="loadingType" @loadmore="loadmore()"></uni-load-more>
			</scroll-view>
			<!-- 一行两个商品展示 -->
			<scroll-view
				v-if="!empty && !isSWitch && goodsListData.length"
				class="goods-scroll"
				scroll-anchoring
				enableBackToTop="true"
				@scrolltolower="loadmore()"
				scroll-with-animation
				scroll-y
				lower-threshold="250"
			>
				<goodsList :res="goodsListData" :keyword="keyword" :tab-bar-gap="false" />
				<uni-load-more :status="loadingType"></uni-load-more>
			</scroll-view>
			<!-- #endif -->

			<view class="empty" v-if="empty">
				<image class="empty-img" src="/static/nodata.png" mode="aspectFit"></image>
				<view class="empty-text">
					<text>没有找到相关的商品信息</text>
					<text>请换一个关键词试试吧</text>
				</view>
			</view>
		</view>

		<u-popup border-radius="20" mode="right" width="90%" v-model:show="sortPopup">
			<view class="status_bar"></view>
			<view class="sort-box  ">
				<view class="sort-list">
					<view class="sort-item">
						<view class="sort-title">品牌</view>
						<view class="flex" v-if="sortData.brands">
							<view class="sort-brand-item" :key="brandsIndex" v-for="(brand, brandsIndex) in sortData.brands" @click="handleSort(brand, brandsIndex, 'brand')">
								<view
									class="sort-radius"
									:class="{
										'sort-active': brand.__selected
									}"
								>
									{{ brand.name }}
								</view>
							</view>
						</view>
						<!-- <u-empty v-else text="暂无品牌" mode="list"></u-empty> -->
					</view>
					<view class="sort-item">
						<view class="sort-title">全部分类</view>
						<view class="flex" style="flex-wrap: wrap;" v-if="sortData.categories">
							<view
								class="sort-brand-item"
								:key="categoriesIndex"
								v-for="(categoryId, categoriesIndex) in sortData.categories"
								@click="handleSort(categoryId, categoriesIndex, 'categoryId')"
							>
								<view
									class="sort-radius"
									:class="{
										'sort-active': categoryId.__selected
									}"
								>
									{{ categoryId.name }}
								</view>
							</view>
						</view>
						<!-- <u-empty v-else text="暂无分类" mode="list"></u-empty> -->
					</view>
				</view>
				<view class="sort-list">
					<view class="sort-item">
						<view class="sort-title">价格区间</view>
						<view style="display:flex;  margin-top:20rpx;    align-items: center;">
							<view class="sort-brand-item uinput">
								<view class="sort-radius"><u-input v-model="minPrice" type="number" placeholder="最低价" input-align="center" /></view>
							</view>
							<view>-</view>
							<view class="sort-brand-item uinput">
								<view class="sort-radius"><u-input v-model="maxPrice" type="number" placeholder="最高价" input-align="center" /></view>
							</view>
						</view>
					</view>
				</view>

				<view class="sort-list" v-if="sortData.paramOptions">
					<view class="sort-item" :key="paramIndex" v-for="(param, paramIndex) in sortData.paramOptions">
						<view class="sort-title">{{ param.key }}</view>
						<view class="flex" style="flex-warp:warp" v-if="param.values">
							<view class="sort-brand-item" :key="i" v-for="(value, i) in param.values" @click="handleSort(value, i, 'prop', param)">
								<view
									class="sort-radius"
									:class="{
										'sort-active': value.__selected
									}"
								>
									{{ value.title }}
								</view>
							</view>
						</view>
					</view>
				</view>

				<div class="null-view"></div>
				<view class="sort-btn mp-iphonex-bottom">
					<view class="sort-btn-repick" @click="repick">重置</view>
					<view class="sort-btn-confim" @click="sortConfirm">确定</view>
				</view>
			</view>
		</u-popup>
		<u-back-top :scroll-top="scrollTop"></u-back-top>
	</view>
</template>

<script setup lang="ts">
import {
	ref,
	reactive,
	computed,
	watch,
	nextTick,
} from 'vue'
import {
	onLoad,
	onReady,
	onReachBottom,
	onPageScroll,
} from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getGoodsList, getGoodsRelated } from '@/api/goods.js'
import goodsList from '@/components/m-goods-list/list.vue'
import { getHotKeywords } from '@/api/home.js'
import mSearch from '@/components/m-search-revision/m-search-revision.vue'
import storage from '@/utils/storage'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()

// 注入主题色 CSS 变量，商品价格、排序选中态、标签等随之联动
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const mSearchRef = ref<any>(null)

const empty = ref(false)
const scrollTop = ref(0)
const loadIndex = ref(10)
const oldKeywordIndex = ref(0)
const selectedWay = reactive<{
	brand: any[]
	categoryId: any[]
	prop: any[]
}>({
	brand: [],
	categoryId: [],
	prop: [],
})

const sortPopup = ref(false)
const navObj = reactive({
	background: '#fff',
})
const typeSortData = reactive({
	type: '',
	index: '',
})
const defaultKeyword = ref('')
const keyword = ref('')
const oldKeywordList = ref<string[]>([])
const hotKeywordList = ref<string[]>([])
const keywordList = ref<any[]>([])
const goodsListData = ref<any[]>([])

const cateMaskState = ref(0)
const loadingType = ref('more')
const filterIndex = ref(0)
const cateId = ref(0)
const priceOrder = ref(0)
const cateList = ref<any[]>([])
const isShowSeachGoods = ref(false)
const isShowKeywordList = ref(false)
const sortData = ref<any>('')
const isSWitch = ref(false)

const params = ref<any>({
	pageNumber: 1,
	pageSize: 10,
	keyword: '',
})
const minPrice = ref('')
const maxPrice = ref('')
const sortParams = ref<any>({
	pageNumber: 1,
	pageSize: 10,
	categoryId: '',
})

const routerVal = ref<any>('')
const capsuleInsetRight = ref(0)
const searchNavbarWidth = ref(0)

const searchNavbarStyle = computed(() => {
	if (searchNavbarWidth.value) {
		return {
			width: `${searchNavbarWidth.value}px`,
		}
	}
	return {
		width: '100%',
	}
})

onPageScroll((e) => {
	scrollTop.value = e.scrollTop
})

onLoad((val) => {
	init()
	routerVal.value = val

	if (routerVal.value.category) {
		params.value.categoryId = routerVal.value.category
		sortParams.value.categoryId = routerVal.value.category
		isShowSeachGoods.value = true
		nextTick(() => {
			if (mSearchRef.value) {
				mSearchRef.value.isShowSeachGoods = true
			}
		})
	}
	if (routerVal.value.keyword) {
		params.value.keyword = routerVal.value.keyword
		isShowSeachGoods.value = true
	}
	if (routerVal.value.storeId) {
		params.value.storeId = routerVal.value.storeId
		isShowSeachGoods.value = true
	}
	if (routerVal.value.promotionType) {
		params.value.promotionType = routerVal.value.promotionType
		isShowSeachGoods.value = true
	}
	if (routerVal.value.promotionsId) {
		params.value.promotionsId = routerVal.value.promotionsId
		isShowSeachGoods.value = true
	}
	loadData()
})

onReady(() => {
	setSearchNavbarWidth()
})

watch(keyword, (val) => {
	if (val) {
		if (val) {
			defaultKeyword.value = val
		}
	} else {
		defaultKeyword.value = '请输入搜索商品'
	}
})

watch(sortPopup, (val) => {
	if (val) {
		selectedWay.brand = []
		selectedWay.categoryId = []
		selectedWay.prop = []
	}
})

onReachBottom(() => {
	// #ifdef H5 || APP-PLUS
	if (!isShowSeachGoods.value || loadingType.value !== 'more') {
		return
	}
	loadmore()
	// #endif
})

function setSearchNavbarWidth() {
	// #ifdef MP-WEIXIN
	try {
		const menuButton = uni.getMenuButtonBoundingClientRect()
		const { windowWidth } = uni.getWindowInfo()
		capsuleInsetRight.value = windowWidth - menuButton.left
		const leftPadding = uni.upx2px(16)
		const gap = uni.upx2px(8)
		searchNavbarWidth.value =
			windowWidth - capsuleInsetRight.value - leftPadding - gap
	} catch (e) {
		searchNavbarWidth.value = 280
	}
	// #endif
}

function getPromotion(item: any) {
	if (item.promotionMap) {
		const array: string[] = []
		Object.keys(item.promotionMap).forEach((child) => {
			if (!array.includes(child.split('-')[0])) {
				array.push(child.split('-')[0])
			}
		})
		return array
	}
}

function showMore() {
	loadOldKeyword(oldKeywordIndex.value)
}

function sortConfirm() {
	if (!params.value.brandId) {
		params.value.brandId = []
	} else {
		params.value.brandId = [params.value.brandId]
	}

	selectedWay.brand.forEach((item) => {
		if (item.__selected) {
			params.value.brandId.push(item.value)
		}
	})

	params.value.brandId = params.value.brandId.join('@') || ''

	if (selectedWay.categoryId[0]) {
		params.value.categoryId = selectedWay.categoryId[0].value
	}
	if (!params.value.prop) {
		params.value.prop = []
	} else {
		params.value.prop = [params.value.prop]
	}

	selectedWay.prop.forEach((item) => {
		if (item.__selected) {
			params.value.prop.push(`${item.parent}_${item.title}`)
		}
	})
	params.value.prop = params.value.prop.join('@')

	if (minPrice.value || maxPrice.value) {
		params.value.price = `${minPrice.value}_${maxPrice.value}`
	} else {
		params.value.price = 0
	}

	goodsListData.value = []
	params.value.pageNumber = 1
	sortParams.value = params.value

	loadData()
	sortPopup.value = false
}

function repick() {
	sortParams.value = {
		pageNumber: 1,
		pageSize: 10,
		categoryId: routerVal.value.category || '',
	}
	sortPopup.value = false
	initSortGoods()
	minPrice.value = ''
	maxPrice.value = ''
	params.value = {
		pageNumber: 1,
		pageSize: 10,
		categoryId: routerVal.value.category || '',
	}
	goodsListData.value = []
	loadData()
}

function handleSort(val: any, _index: number, type: string, parent?: any) {
	if (type == 'prop') {
		val.parent = parent.key
	}
	selectedWay[type as keyof typeof selectedWay].push(val)
	if (type == 'categoryId') {
		sortData.value.categories.forEach((item: any) => {
			item.__selected = false
		})
		val.__selected = true
	} else {
		val.__selected ? (val.__selected = false) : (val.__selected = true)
	}
}

function init() {
	loadOldKeyword(loadIndex.value)
	loadHotKeyword()
}

function blur() {
	uni.hideKeyboard()
}

function back() {
	uni.navigateBack({
		delta: 1,
	})
}

function navigateToDetailPage(item: any) {
	uni.navigateTo({
		url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
	})
}

function navigateToStoreDetailPage(item: any) {
	uni.navigateTo({
		url: `/pages/product/shopPage?id=${item.storeId}`,
	})
}

function loadmore() {
	if (loadingType.value !== 'more') {
		return
	}
	params.value.pageNumber++
	loadData()
}

function initSortGoods() {
	getGoodsRelated(sortParams.value).then((res) => {
		if (res.data.success) {
			for (const item of Object.keys(res.data.result)) {
				res.data.result[item].forEach((child: any) => {
					child.__selected = false

					if (child.values) {
						child.values = child.values.map((v: string) => ({
							title: v,
							__selected: false,
						}))
					}
				})
			}
			sortData.value = res.data.result
		}
	})
}

function sortGoods() {
	sortPopup.value = true
}

function tabClick(index: number, type?: string) {
	params.value.pageNumber = 1
	params.value.pageSize = 10
	if (params.value.sort == type) {
		params.value.order == 'asc'
			? (params.value.order = 'desc')
			: (params.value.order = 'asc')

		params.value['sort'] = type
	} else {
		params.value.order = 'desc'
		params.value['sort'] = type
	}

	if (index == 0) {
		params.value.sort = 'releaseTime'
		params.value.order = 'desc'
	}

	filterIndex.value = index

	uni.pageScrollTo({
		duration: 300,
		scrollTop: 0,
	})
	loadData('refresh', 1)
	uni.showLoading({
		title: '正在加载',
	})
}

function loadDefaultKeyword() {
	if (hotKeywordList.value.length != 0) {
		defaultKeyword.value = hotKeywordList.value[0]
	} else {
		defaultKeyword.value = '请输入搜索商品'
	}
}

function loadOldKeyword(index: number) {
	oldKeywordList.value = []
	uni.getStorage({
		key: 'OldKeys',
		success: (res) => {
			const OldKeys = JSON.parse(res.data)
			oldKeywordIndex.value = OldKeys.length
			for (let i = 0; i < index; i++) {
				oldKeywordList.value.push(OldKeys[i])
			}
		},
	})
}

function getHistoryKeywords(limit = 10) {
	try {
		const raw = uni.getStorageSync('OldKeys')
		const list = raw ? JSON.parse(raw) : []
		return Array.isArray(list) ? list.filter(Boolean).slice(0, limit) : []
	} catch {
		return []
	}
}

async function loadHotKeyword() {
	const cached = storage.getHotWords() || {}
	const now = Date.now() / 1000
	let keywords: string[] = []

	if (cached.time && cached.time > now && Array.isArray(cached.keywords) && cached.keywords.length) {
		keywords = cached.keywords
	} else {
		try {
			const res = await getHotKeywords(10)
			if (res?.data?.success && Array.isArray(res.data.result)) {
				keywords = res.data.result.filter(Boolean)
			}
		} catch {
			keywords = []
		}
		storage.setHotWords({
			time: now + 30 * 5,
			keywords,
		})
	}

	if (!keywords.length) {
		keywords = getHistoryKeywords(10)
	}

	hotKeywordList.value = keywords
	loadDefaultKeyword()
}

async function loadData(type?: string, _loading?: number) {
	loadingType.value = 'loading'
	if (type == 'refresh') {
		goodsListData.value = []
	}
	const goodsListRes = await getGoodsList(params.value)
	const records = goodsListRes.data.result.records || []
	if (records.length < 10) {
		loadingType.value = 'noMore'
	} else {
		loadingType.value = 'more'
	}
	goodsListData.value.push(...records)
	empty.value = goodsListData.value.length === 0

	initSortGoods()
	if (store.state.isShowToast) {
		uni.hideLoading()
	}
}

function drawCorrelativeKeyword(keywords: any[], keyword: string) {
	const len = keywords.length
	const keywordArr = []
	for (let i = 0; i < len; i++) {
		const row = keywords[i]
		const html = row[0].replace(
			keyword,
			"<span style='color: #9f9f9f;'>" + keyword + '</span>'
		)
		const htmlStr = '<div>' + html + '</div>'
		const tmpObj = {
			keyword: row[0],
			htmlStr: htmlStr,
		}
		keywordArr.push(tmpObj)
	}
	return keywordArr
}

function setKeyword(index: number) {
	keyword.value = keywordList.value[index].keyword
}

function oldDelete() {
	uni.showModal({
		content: '确定清除历史搜索记录？',
		success: (res) => {
			if (res.confirm) {
				oldKeywordList.value = []
				uni.removeStorage({
					key: 'OldKeys',
				})
			}
		},
	})
}

function doSearchSwitch() {
	isSWitch.value = !isSWitch.value
	isShowSeachGoods.value = true
	params.value.pageNumber = 1
	params.value.pageSize = 10
	loadData('refresh', 1)
}

function doSearch(searchKeyword: string | false) {
	let resolvedKeyword = searchKeyword === false ? keyword.value : searchKeyword

	if (!resolvedKeyword) {
		resolvedKeyword =
			(hotKeywordList.value.length && hotKeywordList.value[0]) || ''
	}
	defaultKeyword.value == '请输入搜索商品' ? (resolvedKeyword = '') : ''

	resolvedKeyword ? (keyword.value = resolvedKeyword) : ''
	saveKeyword(resolvedKeyword)
	isShowSeachGoods.value = true
	if (mSearchRef.value) {
		mSearchRef.value.isShowSeachGoods = true
		mSearchRef.value.setInputValue(resolvedKeyword)
	}
	params.value.keyword = keyword.value
	params.value.pageNumber = 1
	sortParams.value['keyword'] = resolvedKeyword
	loadData('refresh', 1)
}

function saveKeyword(saveKey: string) {
	if (!saveKey) return false
	uni.getStorage({
		key: 'OldKeys',
		success: (res) => {
			const OldKeys = JSON.parse(res.data)
			const findIndex = OldKeys.indexOf(saveKey)
			if (findIndex == -1) {
				OldKeys.unshift(saveKey)
			} else {
				OldKeys.splice(findIndex, 1)
				OldKeys.unshift(saveKey)
			}
			OldKeys.length > 10 && OldKeys.pop()

			uni.setStorage({
				key: 'OldKeys',
				data: JSON.stringify(OldKeys),
			})
			oldKeywordList.value = OldKeys
		},
		fail: () => {
			const OldKeys = [saveKey]
			uni.setStorage({
				key: 'OldKeys',
				data: JSON.stringify(OldKeys),
			})
			oldKeywordList.value = OldKeys
		},
	})
}
</script>
<style lang="scss" scoped>
@import './search.scss';
</style>
<style lang="scss">
/* #ifdef H5 || APP-PLUS */
page {
  height: auto;
  min-height: 100vh;
  overflow-y: auto;
}
/* #endif */
</style>
