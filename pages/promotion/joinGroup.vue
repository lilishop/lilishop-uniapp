<template>
	<view class="wrapper">
		<u-navbar
			:border="false"
			:fixed="true"
			:placeholder="true"
			left-icon="arrow-left"
			:auto-back="false"
			@left-click="back"
		>
			<template #center>
				<view v-if="search" class="search-wrap">
					<u-search
						@search="searchFun()"
						@custom="searchFun()"
						v-model="params.goodsName"
					></u-search>
				</view>
				<text v-else class="nav-title">{{ title }}</text>
			</template>
			<template #right>
				<view class="nav-right" @click="searchFlag()">
					<text v-if="search">取消</text>
					<u-icon v-else size="22" name="search"></u-icon>
				</view>
			</template>
		</u-navbar>
		<!-- 顶部栏 -->
		<view class="header-wraper">
			<image class="header-banner" mode="aspectFit" src="/static/join-buy.png"></image>
		</view>
		<!-- 商品栏 -->
		<div class="swiper">
			<goodsTemplate v-if="goodsList.length" :res="goodsList" />
			
			<u-empty v-else style="margin-top:20%" text="暂无拼团活动" mode="data"></u-empty>
		</div>

	</view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad, onReachBottom, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import * as API_Promotions from '@/api/promotions'
import goodsTemplate from '@/components/m-goods-list/promotion.vue'

const is_empty = ref(false)
const search = ref(false)
const title = ref('拼团活动')
const popupFlag = ref(false)

const params = ref({
  pageNumber: 1,
  pageSize: 10,
  categoryPath: '',
  goodsName: '',
})

const goodsList = ref<any[]>([])

watch(search, (val) => {
  if (!val && !title.value) {
    title.value = '拼团活动'
  }
})

onReachBottom(() => {
  loadMore()
})

onNavigationBarButtonTap(() => {
  popupFlag.value = !popupFlag.value
})

onLoad(async () => {
  GET_AssembleGoods()
})

function back() {
  if (search.value) {
    search.value = false
    params.value.goodsName = ''
    goodsList.value = []
    params.value.pageNumber = 1
    GET_AssembleGoods()
    return
  }
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({
      url: '/pages/tabbar/home/index',
    })
  }
}

function loadMore() {
  params.value.pageNumber++
  GET_AssembleGoods()
}

function searchFlag() {
  search.value = !search.value
}

function toHref(goods: any) {
  uni.navigateTo({
    url: `/pages/product/goods?id=${goods.skuId}&goodsId=${goods.goodsId}`,
  })
}

function searchFun() {
  goodsList.value = []
  GET_AssembleGoods()
}

function GET_AssembleGoods() {
  const requestParams = JSON.parse(JSON.stringify(params.value))
  if (requestParams.category_id === 0) delete requestParams.category_id

  API_Promotions.getAssembleList(requestParams)
    .then((response) => {
      const data = response.data.result.records

      if (!data || !data.length) {
        is_empty.value = true
      } else {
        is_empty.value = false
        goodsList.value.push(...(data || []))
      }
    })
    .catch(() => {})
}
</script>

<style lang="scss" scoped>
	.search-wrap {
		width: 100%;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.nav-title {
		font-size: 32rpx;
		color: #303133;
	}

	.nav-right {
		margin-right: 24rpx;
		display: flex;
		align-items: center;
		font-size: 28rpx;
		color: #303133;
	}

	.header-wraper {
		background: url('/static/bg.png') no-repeat center center;
		background-size: cover;
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.header-banner {
			width: 188rpx;
			height: 60rpx;
			display: block;
		}
	}
</style>
