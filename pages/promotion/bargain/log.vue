<template>
  <view :style="themeStyle" class="box">
    <view v-if="bargainLog.length != 0" class="list">
      <view v-for="(item,index) in bargainLog" class="card" :key="index">
        <view class="goods-img">
          <u-image radius="12rpx" width="160rpx" height="160rpx" :src="item.thumbnail"></u-image>
        </view>
        <view class="goods">
          <view class="head">
            <view class="goods-name wes-2">{{ item.goodsName }}</view>
            <text class="tips" :class="item.status">{{ statusWay[item.status] }}</text>
          </view>
          <view class="foot">
            <view class="surplus">
              还剩<text class="surplusPrice">{{ unitPrice(item.surplusPrice) }}</text>元
            </view>
            <view v-if="item.status == 'START'" class="buy" @click="navigateToBargainDetail(item)">
              继续免费领
            </view>
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
import { ref, computed } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { getMineBargainLog } from '@/api/promotions'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

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
  background: #f5f5f5;
}
</style>
<style scoped lang="scss">
.box {
  min-height: 100vh;
  padding: 20rpx 24rpx 40rpx;
  background: #f5f5f5;
  box-sizing: border-box;
}
.card {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}
.goods-img {
  width: 160rpx;
  height: 160rpx;
  flex: 0 0 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.goods {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 160rpx;
}
.head {
  display: flex;
  align-items: flex-start;
}
.goods-name {
  flex: 1;
  min-width: 0;
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
}
.tips {
  flex-shrink: 0;
  margin-left: 16rpx;
  font-size: 24rpx;
  line-height: 1.4;
  color: #999;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}
.surplus {
  flex: 1;
  min-width: 0;
  color: #666;
  font-size: 24rpx;
  white-space: nowrap;
}
.surplusPrice {
  margin: 0 6rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: $light-color;
}
.buy {
  flex-shrink: 0;
  margin-left: 16rpx;
  height: 56rpx;
  padding: 0 28rpx;
  border-radius: 100rpx;
  background: $light-color;
  color: #fff;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
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
