<template>
  <div :style="themeStyle">
    <u-navbar
      :border="false"
      :fixed="true"
      :placeholder="true"
      left-icon="arrow-left"
      :auto-back="false"
      @left-click="back"
    >
      <template #center>
        <view class="search-wrap">
          <u-search placeholder="请输入店铺名称" @search="search" @clear="search" @custom="search" v-model="params.storeName">
          </u-search>
        </view>
      </template>
    </u-navbar>
    <div class="wrapper" v-if="storeList.length!=0">
      <div class="store-item" @click="handleClickStore(item)" v-for="(item,index) in storeList" :key="index">
        <div>
          <u-image shape="circle" width="100" height="100" :src="item.storeLogo">
          </u-image>
        </div>
        <div class="store-msg">
          <div class="store-name">
            {{item.storeName}}
          </div>
          <div class="goods-num">
            商品 {{item.goodsNum}}
          </div>
          <div class="flex store-distance">
            <div>
              <span class="store-score">{{unitPrice(item.serviceScore)}}</span>
              <span class="line">|</span>
              <span class="store-collection">收藏 {{item.collectionNum}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <u-empty style="margin-top:20%;" text="暂无店铺信息" v-else></u-empty>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import { getStoreList } from '@/api/store'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const params = reactive({
  pageNumber: 1,
  pageSize: 10,
  storeName: '',
})
const storeList = ref<any[]>([])

function back() {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.switchTab({ url: '/pages/tabbar/home/index' })
    },
  })
}

function handleClickStore(val: any) {
  uni.navigateTo({
    url: `/pages/product/shopPage?id=${val.id}`,
  })
}

function search() {
  storeList.value = []
  params.pageNumber = 1
  init()
}

async function init() {
  const res = await getStoreList(params)
  if (res.data.success) {
    const data = res.data.result
    storeList.value.push(...data.records)
  }
}

onReachBottom(() => {
  params.pageNumber++
  init()
})

onMounted(() => {
  init()
})
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 0 16rpx;
}
.store-item {
  display: flex;
  background: #fff;
  border-radius: 20rpx;
  margin: 20rpx 0;
  padding: 24rpx;
}
.store-msg {
  margin-left: 20rpx;
}
.store-name {
  font-weight: bold;
  font-size: 30rpx;
}
.goods-num,
.store-collection {
  color: #999;
  font-size: 24rpx;
  line-height: 1.5;
}
.store-goods {
  margin: 20rpx 0;
}
.store-goods-item {
  flex: 1;
  overflow: hidden;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  margin: 0 5rpx;
}
.wes {
  margin: 10rpx 0;
  width: 100%;
}
.store-score {
  color: $light-color;
  font-size: 24rpx;
  font-weight: bold;
}
.line {
  margin: 0 6rpx;
  color: #999;
}
.store-distance {
  justify-content: space-between;
}
.price {
  margin-top: 10rpx;
  color: $main-color;
}
.goods-price-bigshow {
  font-size: 34rpx;
  font-weight: bold;
}

.search-wrap {
  width: 100%;
  padding: 0 20rpx;
  box-sizing: border-box;
}
</style>
