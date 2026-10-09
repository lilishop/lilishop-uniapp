<template>
  <view :style="themeStyle">
    <view class="seller-view" v-for="(item, index) in complaionData" :key="index">
      <view class="seller-info u-flex u-row-between">
        <view class="seller-name">
          <view class="name">{{ item.storeName }}</view>
        </view>
        <view class="order-sn">{{ statusData[item.complainStatus] }}</view>
      </view>
      <u-line color="#DCDFE6"></u-line>
      <view class="goods-item-view">
        <view class="goods-img" @click="handleToGoods(item)">
          <u-image radius="6rpx" width="131rpx" height="131rpx" :src="item.goodsImage"></u-image>
        </view>
        <view class="goods-info" @click="handleToGoods(item)">
          <view class="goods-title u-line-2">{{ item.goodsName }}</view>
          <view class="goods-price">
            ￥{{unitPrice(item.goodsPrice) }}
            <!-- <span>+{{ '1' }}积分</span> -->
          </view>
        </view>
        <view class="goods-num">
          <view>x{{ item.num }}</view>
        </view>
      </view>
      <view class="complain-item-view">
        <view class="complain-time"> {{ item.createTime }} </view>
        <view class="complain-speak"> {{ item.complainTopic }} </view>
      </view>
      <view class="complain-btn">
        <u-tag plain @click="handleClear(item)" class="complain-tag" text="撤销投诉" type="info"
		 v-if="item.complainStatus === 'APPLYING' || item.complainStatus === 'NEW'" />
        <u-tag plain @click="handleInfo(item)" class="complain-tag" text="投诉详情" type="info" />
      </view>
    </view>

    <u-empty v-if="empty" :style="{'marginTop':complaionDetail.total == 0 ? '200rpx':'0rpx'}" class="empty" style="" text="暂无投诉列表" mode="list"></u-empty>

    <u-modal show-cancel-button @confirm="handleClearConfirm" v-model:show="show" :content="content"></u-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { unitPrice } from '@/utils/filters.js'
import { getComplain, clearComplain } from '@/api/after-sale'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const statusData: Record<string, string> = {
  NEW: '新投诉',
  NO_APPLY: '未申请',
  APPLYING: '申请中',
  COMPLETE: '已完成',
  EXPIRED: '已失效',
  CANCEL: '已取消',
  WAIT_ARBITRATION: '等待仲裁',
}

const show = ref(false)
const content = ref('是否撤销投诉？')
const params = ref({ pageNumber: 1, pageSize: 20 })
const complaionDetail = ref<any>(null)
const complaionData = ref<any[]>([])
const empty = ref(false)
const checkComplainData = ref<any>(null)

onLoad(() => {
  init()
})

onReachBottom(() => {
  if (
    complaionDetail.value &&
    complaionDetail.value.total > params.value.pageNumber * params.value.pageSize
  ) {
    params.value.pageNumber++
    init()
  }
})

function handleToGoods(val: any) {
  uni.navigateTo({
    url: '/pages/product/goods?id=' + val.skuId + '&goodsId=' + val.goodsId,
  })
}

function handleClear(val: any) {
  show.value = true
  checkComplainData.value = val
}

function handleClearConfirm() {
  clearComplain(checkComplainData.value.id).then((res) => {
    if (res.data.success) {
      uni.showToast({
        title: '撤销成功',
        duration: 2000,
        icon: 'none',
      })
      complaionData.value = []
      params.value.pageNumber = 1
      init()
    }
  })
}

function handleInfo(val: any) {
  uni.navigateTo({
    url: './complainInfo?id=' + val.id,
  })
}

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function init() {
  uni.showLoading({
    title: '加载中',
  })
  getComplain(params.value).then((res) => {
    complaionDetail.value = res.data.result
    if (res.data.result.records.length >= 1) {
      complaionData.value.push(...res.data.result.records)
    } else {
      empty.value = true
    }
    hideLoadingIfNeeded()
  })
}
</script>

<style lang="scss" scoped>
.seller-view {
  background-color: #fff;
  margin: 20rpx 0;
}

.seller-info {
  height: 70rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.seller-name {
  width: auto;
  min-width: 0;
  font-size: 33rpx;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 90rpx;
}

.name {
  margin-left: 15rpx;
  margin-top: -2rpx;
  font-size: 28rpx;
  flex: 1;
}

.order-sn {
  color: #ff0000;
  font-size: 26rpx;
  flex-shrink: 0;
  margin-left: 20rpx;
}

.goods-item-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 30rpx;
}

.goods-img {
  width: 131rpx;
  height: 131rpx;
  flex: 0 0 131rpx;
}

.goods-info {
  padding-left: 30rpx;
  min-width: 0;
  flex: 1;
}

.goods-title {
  margin-bottom: 10rpx;
  color: $font-color-dark;
}

.goods-price {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #ff5a10;
}

.goods-num {
  text-align: center;
  flex: 0 0 60rpx;
  width: 60rpx;
  color: $main-color;
}

.complain-item-view {
  border-bottom: 2rpx solid #f5f7fa;
  border-top: 2rpx solid #f5f7fa;
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.complain-time {
  font-size: 24rpx;
  color: #999;
}
.complain-btn {
  padding: 20rpx 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 30rpx;
}
.complain-tag {
  margin-left: 10rpx;
}
.empty {
  margin-top: 40rpx;
}
</style>
