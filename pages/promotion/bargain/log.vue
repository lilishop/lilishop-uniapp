<template>
  <view class="box">
    <view v-if="bargainLog.length != 0">
      <view v-for="(item,index) in bargainLog" class="flex" :key="index">
        <view class="goods-img">
          <u-image radius="20rpx" width="230rpx" height="230rpx" :src="item.thumbnail"></u-image>
        </view>
        <view class="goods">
          <view class="wes-2">
            {{item.goodsName}}
          </view>
          <view class="surplus">
            还剩<text class="surplusPrice">{{unitPrice(item.surplusPrice)}}元</text>
          </view>

          <view @click="navigateToBargainDetail(item)" v-if="item.status == 'START'" class="buy">
            继续免费领
          </view>
        </view>
        <view class="tips-box">
          <view class="tips" :class="[item.status]">
            {{statusWay[item.status]}}
          </view>
        </view>
      </view>
    </view>
    <view v-else>
      <u-empty style="margin-top:20%;" text="暂无砍价活动"></u-empty>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { getMineBargainLog } from '@/api/promotions'
import { unitPrice } from '@/utils/filters.js'

const params = ref({
  pageNumber: 1,
  pageSize: 10,
})

const bargainLog = ref<any[]>([])

const statusWay: Record<string, string> = {
  START: '砍价开始',
  FAIL: '砍价失败',
  SUCCESS: '砍价成功',
  END: '活动结束',
}

onReachBottom(() => {
  params.value.pageNumber++
  init()
})

onShow(() => {
  params.value.pageNumber = 1
  bargainLog.value = []
  init()
})

async function init() {
  const res = await getMineBargainLog(params.value)
  if (res.data.success) {
    bargainLog.value.push(...res.data.result.records)
  }
}

function navigateToBargainDetail(val: any) {
  uni.navigateTo({
    url: `/pages/promotion/bargain/detail?id=${val.kanjiaActivityGoodsId}`,
  })
}
</script>
<style>
page {
  background: #fff;
}
</style>
<style scoped lang="scss">
.box {
  padding: 0 32rpx;
  background: #fff;
}
.goods-img {
  width: 230rpx;
  height: 230rpx;
  flex: 0 0 230rpx;
}
.buy {
  background: $light-color;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
  border-radius: 100rpx;
  width: 200rpx;
  font-size: 24rpx;
  margin-top: 20rpx;
}
.tips-box {
  flex: 1;
  justify-content: center;
  display: flex;

  align-items: center;
}
.tips {
  color: #999;

  margin-top: 20rpx;
}
.surplusPrice {
  font-size: 40rpx;
  margin-left: 10rpx;
  font-weight: bold;
  color: $light-color;
}
.surplus {
  color: #333;
  font-size: 26rpx;
  margin-top: 12rpx;
}
.goods {
  margin: 0 20rpx;
  display: flex;
  flex: 2;
  flex-direction: column;
  justify-content: center;
}
.flex {
  border-bottom: 1rpx solid #f7f7f7;
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin: 10rpx 0;
}
.SUCCESS {
  color: $light-color;
}
.START {
  color: $aider-light-color;
}
.END {
  color: #999;
}
.FAIL {
  color: $main-color;
}
</style>
