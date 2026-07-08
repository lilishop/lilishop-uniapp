<template>
  <view class="box">
    <u-navbar
      class="navbar"
      :border="false"
      :fixed="true"
      :placeholder="true"
      left-icon="arrow-left"
      :auto-back="false"
      @left-click="back"
    >
      <template #center>
        <view class="slot-wrap">
          <u-search placeholder="搜索直播间" @custom="searchLive" @clear="clear" @search="searchLive" v-model="keyword"></u-search>
        </view>
      </template>
    </u-navbar>
    <!-- 轮播图 -->
    <u-swiper @click="clickSwiper" class="swiper" keyName="image" :list="swiperImg">

    </u-swiper>
    <u-tabs
      :scrollable="false"
      v-model:current="current"
      @change="changeTabs"
      :lineColor="activeColor"
      :activeStyle="{ color: activeColor }"
      :inactiveStyle="{ color: '#606266' }"
      ref="tabs"
      :list="tabs"
    ></u-tabs>

    <view class="wrapper">
      <view
        class="live-item"
        :class="{ invalid: item.status == 'END' }"
        v-for="(item, index) in liveList"
        :key="item.id || item.roomId || index"
        @click="handleLivePlayer(item)"
      >
        <view class="live-cover-img">
          <view class="tips">
            <view class="live-box" v-if="item.status === 'START'">
              <image class="live-gif" src="/pages/promotion/static/live.gif" mode="aspectFit"></image>
            </view>
            <text>{{ item.status == 'END' ? '已结束' : item.status == 'NEW' ? '未开始' : '直播中' }}</text>
          </view>
          <view class="bg"></view>
          <u-image
            class="cover-image"
            width="326rpx"
            height="354rpx"
            mode="aspectFill"
            :src="item.shareImg"
          />
        </view>
        <view class="live-goods">
          <view class="live-goods-name">{{ item.name }}</view>
          <view class="live-store">
            <text class="wes">{{ config.name }}</text>
          </view>
          <view class="live-goods-list" v-if="item.roomGoodsList && item.roomGoodsList.length">
            <view
              class="live-goods-item"
              v-for="(goodsImg, goodsIndex) in item.roomGoodsList.slice(0, 2)"
              :key="goodsIndex"
            >
              <u-image
                border-radius="20"
                :src="goodsImg"
                width="100%"
                height="140rpx"
                mode="aspectFill"
              ></u-image>
            </view>
          </view>
        </view>
      </view>
      <u-loadmore v-if="liveList.length > 0" bg-color="#f8f8f8" :status="status" />
      <view class="empty-live" v-if="!liveList.length && status === 'noMore'">暂无直播间</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getLiveList } from '@/api/promotions.js'
import config from '@/config/config'
import { useStore } from '@/store'
import { onReachBottom, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const store = useStore()

const activeColor = computed(() => store.getters.lightColor)

const status = ref('loadmore')
const current = ref(0)
const keyword = ref('')

const tabs = ref([
  { name: '直播中' },
  { name: '全部' },
])

const background = ref({
  background: '#ff9f28',
})

const params = ref([
  {
    pageNumber: 1,
    pageSize: 10,
    status: 'START',
  },
  {
    pageNumber: 1,
    pageSize: 4,
  },
])

const recommendParams = ref({
  pageNumber: 1,
  pageSize: 3,
  recommend: 0,
})

const liveList = ref<any[]>([])
const recommendLiveList = ref<any[]>([])

const swiperImg = ref<any[]>([
  {
    image:
      'https://lilishop-oss.oss-cn-beijing.aliyuncs.com/48d789cb9c864b7b87c1c0f70996c3e8.jpeg',
  },
])

onShow(() => {
  params.value[current.value].pageNumber = 1
  liveList.value = []
  getLives()
  getRecommendLives()
})

onReachBottom(() => {
  params.value[current.value].pageNumber++
  getLives()
})

function back() {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/tabbar/home/index' })
    },
  })
}

function changeTabs() {
  params.value[current.value].pageNumber = 1
  init()
}

function init() {
  liveList.value = []
  status.value = 'loadmore'
  getLives()
}

function clear() {
  delete params.value[current.value].name
  init()
}

function clickSwiper(val: number) {
  console.log(swiperImg.value[val])
  handleLivePlayer(swiperImg.value[val])
}

function searchLive(val: string) {
  params.value[current.value].pageNumber = 1
  params.value[current.value].name = val
  init()
}

async function getRecommendLives() {
  status.value = 'loading'
  const recommendLives = await getLiveList(recommendParams.value)
  if (recommendLives.data.success) {
    if (recommendLives.data.result.records.length) {
      status.value = 'loadmore'
      recommendLiveList.value = recommendLives.data.result.records
    } else {
      status.value = 'noMore'
    }

    if (!recommendLiveList.value.length) {
      if (liveList.value[0] && liveList.value[0].shareImg) {
        swiperImg.value = [
          {
            image: liveList.value[0].shareImg,
            roomId: liveList.value[0].roomId,
          },
        ]
      }
    } else {
      recommendLiveList.value.forEach((item) => {
        swiperImg.value = [{ image: item.shareImg, roomId: item.roomId }]
      })
    }
  }
}

async function getLives() {
  status.value = 'loading'
  const res = await getLiveList(params.value[current.value])
  if (res.data.success) {
    if (res.data.result.records.length) {
      status.value = 'loadmore'
      liveList.value.push(...res.data.result.records)
    } else {
      status.value = 'noMore'
    }
    res.data.result.total >
    params.value[current.value].pageNumber *
      params.value[current.value].pageSize
      ? (status.value = 'loadmore')
      : (status.value = 'noMore')

    liveList.value.forEach((item) => {
      if (item.roomGoodsList && typeof item.roomGoodsList === 'string') {
        try {
          item.roomGoodsList = JSON.parse(item.roomGoodsList)
        } catch (e) {
          item.roomGoodsList = []
        }
      }
    })
  }
}

function handleLivePlayer(val: any) {
  const id = val.id || val.roomId
  if (!id) return
  uni.navigateTo({
    url: `/pages/promotion/live/room?id=${id}`,
  })
}
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.box {
  width: 100%;
  min-height: 100vh;
  background: #f8f8f8;
  box-sizing: border-box;
}

.slot-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  padding-right: 24rpx;
}

.invalid {
  filter: grayscale(1);
}

.wrapper {
  padding: 0 24rpx 40rpx;
  box-sizing: border-box;
}

.live-item {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
  border-radius: 20rpx;
  background: #fff;
  margin: 20rpx 0;
}

.live-cover-img {
  position: relative;
  flex-shrink: 0;
  width: 326rpx;
  height: 354rpx;
  overflow: hidden;
  border-radius: 20rpx 0 0 20rpx;
}

.cover-image {
  display: block;
  width: 100%;
  height: 100%;
}

.swiper {
  margin: 20rpx 24rpx;
}

.live-goods {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.live-goods-name {
  min-height: 84rpx;
  font-weight: bold;
  font-size: 30rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: #333;
}

.live-store {
  display: flex;
  align-items: center;
  margin: 12rpx 0 20rpx;
  overflow: hidden;
  font-size: 24rpx;
  color: #999;
}

.live-gif {
  width: 20rpx;
  height: 20rpx;
}

.live-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 40rpx;
  margin-right: 10rpx;
  height: 40rpx;
  flex-shrink: 0;
  background: linear-gradient(90deg, #ff6b35, #ff9f28, #ffcc03);
}

.live-goods-list {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: auto;
}

.live-goods-item {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  border-radius: 20rpx;
}

.tips {
  display: flex;
  position: absolute;
  z-index: 9;
  align-items: center;
  top: 20rpx;
  left: 20rpx;
  padding: 4rpx 12rpx 4rpx 4rpx;
  font-size: 24rpx;
  border-radius: 100px;
  color: #fff;
  background: rgba(0, 0, 0, 0.46);
}

.bg {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100rpx;
  z-index: 8;
  pointer-events: none;
  background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.25), transparent 82%);
}

.empty-live {
  padding: 80rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}
</style>
