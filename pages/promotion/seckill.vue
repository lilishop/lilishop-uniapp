<template>
	<view :style="themeStyle" class="sale">
		<u-navbar
			title="限时抢购"
			:fixed="true"
			:placeholder="true"
			left-icon="arrow-left"
			:auto-back="false"
			@left-click="back"
		></u-navbar>
		<view class="header-wraper">
			<image class="header-banner" mode="aspectFit" src="/static/seckill.png"></image>
		</view>
		<scroll-view scroll-x>
			<view class="index-navs">
				<view class="index-nav-v">
					<view class="index-nav" :class="{ 'index-nav-active': nav == index }"
						@click="clickNavigateTime(index)" v-for="(item, index) in timeLine" :key="index">
						{{ item.timeLine }}:00
						<view class="index-nav-desc">{{ index === 0 && item.distanceStartTime === 0 ? '抢购中' : '即将开始' }}
						</view>
					</view>
				</view>
			</view>
			
		</scroll-view>
		<view class="sale-items" v-if="goodsList.length > 0">
			<goodsTemplate :res="goodsList" />

		</view>
		<view v-else>
			<view class="nodata">
				<image style="height: 240rpx;width: 320rpx;" src="/static/nodata.png" alt="" />
				<div>暂无商品</div>
			</view>
		</view>

	</view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onUnload } from '@dcloudio/uni-app'
import { getSeckillTimeLine, getSeckillTimeGoods } from '@/api/promotions.js'
import Foundation from '@/utils/Foundation.js'
import goodsTemplate from '@/components/m-goods-list/promotion.vue'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const nav = ref(0)
const timeLine = ref<any[]>([])
const resTime = ref(0)
const time = ref(0)
const times = ref<any>({})
const onlyOne = ref(false)
const goodsList = ref<any[]>([])
const diffTime = ref(0)

const params = ref<{
  pageNumber: number
  pageSize: number
  timeLine?: string | number
}>({
  pageNumber: 1,
  pageSize: 10,
})

let setTimeInterval: ReturnType<typeof setInterval> | null = null

onShow(async () => {
  await getTimeLine()
  if (!timeLine.value.length) {
    await uni.showToast({
      icon: 'none',
      duration: 2000,
      title: '今天没有活动，明天再来吧',
    })
  }
  setTimeInterval = setInterval(() => {
    if (time.value <= 0) {
      if (setTimeInterval) clearInterval(setTimeInterval)
      getGoodsList()
      getTimeLine()
    } else {
      times.value = Foundation.countTimeDown(time.value)
      time.value--
    }
  }, 1000)
})

onUnload(() => {
  if (setTimeInterval) clearInterval(setTimeInterval)
})

function back() {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({
        url: '/pages/tabbar/home/index',
      })
    },
  })
}

async function getTimeLine() {
  const res = await getSeckillTimeLine()
  if (res.data.success && res.data.result.length > 0) {
    const sorted = res.data.result.sort(
      (x: any, y: any) => Number(x.timeLine) - Number(y.timeLine)
    )
    timeLine.value = sorted.slice(0, 5)
    resTime.value = parseInt(String(new Date().getTime() / 1000))
    onlyOne.value = res.data.result.length === 1
    diffTime.value = parseInt(String(new Date().getTime() / 1000)) - resTime.value

    time.value =
      timeLine.value[nav.value].distanceStartTime ||
      (timeLine.value[nav.value + 1] &&
        timeLine.value[nav.value + 1].distanceStartTime) ||
      Foundation.theNextDayTime() - diffTime.value
    times.value = Foundation.countTimeDown(time.value)

    getGoodsList()
  }
}

async function getGoodsList() {
  if (!timeLine.value.length) return
  params.value.timeLine = timeLine.value[nav.value].timeLine
  const res = await getSeckillTimeGoods(params.value.timeLine)
  if (res.data.success && res.data.result.length != 0) {
    goodsList.value = res.data.result
  } else {
    goodsList.value = []
  }
}

function clickNavigateTime(type: number) {
  nav.value = type
  goodsList.value = []
  diffTime.value = parseInt(String(new Date().getTime() / 1000)) - resTime.value
  time.value =
    timeLine.value[nav.value].distanceStartTime ||
    (timeLine.value[nav.value + 1] &&
      timeLine.value[nav.value + 1].distanceStartTime) ||
    Foundation.theNextDayTime() - diffTime.value

  times.value = Foundation.countTimeDown(time.value)
  getGoodsList()
}
</script>

<style lang="scss" scoped>
	.sale {
		width: 100%;
		min-height: 100vh;
		background-color: #f7f7f7;
	}

	.nodata {
		flex-direction: column;
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		margin-top: 40rpx;

		>div {
			font-size: 24rpx;
			margin-top: 20rpx;
			color: #666;
		}
	}

	.header-wraper {
		background: url('/static/bg.png') no-repeat center center;
		background-size: cover;
		height: 200rpx;
		display: flex;
		align-items: center;
		justify-content: center;

		.header-banner {
			width: 300rpx;
			height: 100rpx;
			display: block;
		}
	}

	.sale-items {
		padding-top: 20rpx;
	}

	.index-navs {
		background: #fff;
		background-color: #f7f7f7;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.index-nav-v {
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
	}

	.index-nav {
		font-size: 28rpx;
		display: -webkit-box;
		display: -webkit-flex;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 150rpx;
		flex-direction: column;
		color: #bababa;
		height: 115rpx;
		line-height: 1em;
		position: relative;
		font-size: 32rpx;
		font-weight: bold;

		&-active {
			color: $main-color;
			position: relative;
			z-index: 30;
			.index-nav-desc {
				color: #fff;
				font-weight: bold;
				background: $main-color;
				padding: 6rpx 16rpx;
				border-radius: 50px;
			}
		}
	}

	.index-nav-desc {
		margin-top: 8rpx;
		font-size: 22rpx;
		color: #bababa;
	}
</style>
