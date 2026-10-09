<template>
  <div :style="themeStyle" class="page">
    <u-navbar :auto-back="false" @leftClick="back" left-icon-color="#fff" :bg-color="background.backgroundColor" :border="false" >
    </u-navbar>
    <div class="wrapper">
      <!-- 砍价列表 -->
      <div class="box">
        <!-- 已砍的商品 -->
        <goodsTemplate type="kanJia" v-if="bargainList.length!=0" :res="bargainList" />
        <div class="bargain empty" v-else>
          <u-empty text="暂无活动" mode="list"></u-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { getBargainList } from '@/api/promotions'
import goodsTemplate from '@/components/m-goods-list/promotion'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const background = ref({
  backgroundColor: 'transparent',
})

const params = ref({
  promotionStatus: 'START',
  pageNumber: 1,
  pageSize: 20,
})

const bargainList = ref<any[]>([])

onShow(() => {
  params.value.pageNumber = 1
  bargainList.value = []
  init()
})

onReachBottom(() => {
  params.value.pageNumber++
  init()
})

function back() {
  uni.switchTab({
    url: '/pages/tabbar/home/index',
  })
}

async function init() {
  const res = await getBargainList(params.value)
  if (res.data.success) {
    bargainList.value.push(...res.data.result.records)
  }
}

function navigateToBargainDetail(val: any) {
  uni.navigateTo({
    url: `/pages/promotion/bargain/detail?id=${val.id}`,
  })
}
</script>
<style lang="scss">
page {
  background-color: $light-color !important;
}
</style>
<style lang="scss" scoped>
.wrapper {
  background: url("https://lili-system.oss-cn-beijing.aliyuncs.com/kanjia.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 506rpx;
  width: 100%;
}

.box {
  background: #fff;
  border-radius: 20rpx;
  position: relative;
  top: 560rpx;
  width: 94%;
  margin: 0 auto;
  > .bargain {
    padding: 32rpx;
  }
}
.bargain-item {
  align-items: center;
  border-bottom: 1rpx solid #f6f6f6;
  padding: 32rpx 0;
}
.goods-config {
  flex: 8;
  margin-left: 20rpx;
  > .goods-title {
    height: 80rpx;
    font-weight: bold;
  }
}
.max-price {
  color: $main-color;
  font-size: 24rpx;
  > span {
    font-size: 32rpx;
    font-weight: bold;
  }
}
.goods-buy {
  margin: 10rpx 0;
  align-items: center;
  justify-content: space-between;
}
.bargaining {
  font-size: 24rpx;
  color: #fff;
  background: $light-color;
  padding: 10rpx 24rpx;
  border-radius: 100px;
}
.empty {
  height: 400rpx;
}
</style>
