<template>
  <view :style="themeStyle" class="log-list">
    <view
      class="log-way"
      v-if="withdrawLogList.length != 0"
      v-for="(item, index) in withdrawLogList"
      :key="'cash-' + index"
    >
      <view class="log-item">
        <view class="log-item-view">
          <view class="title">{{
            item.distributionCashStatus == 'APPLY'
              ? '待处理'
              : item.distributionCashStatus == 'VIA_AUDITING'
                ? '通过'
                : '拒绝'
          }}</view>
          <view class="price">+{{ unitPrice(item.price) }}</view>
        </view>
        <view class="log-item-view">
          <view>{{ item.createTime }}</view>
        </view>
      </view>
    </view>

    <view
      class="log-way"
      v-if="achievementList.length != 0"
      v-for="(item, index) in achievementList"
      :key="'ach-' + index"
    >
      <view class="log-item">
        <view class="log-item-view">
          <view class="title">{{ item.goodsName }}</view>
          <view class="price">提成金额：+{{ unitPrice(item.commissionAmount) }}</view>
        </view>
        <view class="log-item-view">
          <view>创建时间：{{ item.createTime }}</view>
        </view>
        <view class="log-item-footer">
          <view>会员名称：{{ item.memberName }}</view>
        </view>
        <view class="log-item-footers">
          <view>订单号：{{ item.orderSn }}</view>
        </view>
      </view>
    </view>

    <view class="empty" v-if="isEmpty">
      <u-loadmore :status="loadStatus" :icon-type="iconType" bg-color="#f7f7f7" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { cashLog, getDistributionOrders } from '@/api/distribution'
import { unitPrice } from '@/utils/filters.js'
import { assertActiveDistributor } from '@/utils/distributionStatus'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const withdrawLogList = ref<any[]>([])
const achievementList = ref<any[]>([])
const loadStatus = ref('loadmore')
const iconType = ref('flower')
const isEmpty = ref(false)
const listType = ref(0)
const routeQuery = ref<Record<string, string>>({})

const withdrawParams = ref({ pageNumber: 1, pageSize: 10 })
const achievementParams = ref({ pageNumber: 1, pageSize: 10, orderType: 'PROMOTION' })

onLoad((option) => {
  const type = Number(option.type != null ? option.type : 0)
  listType.value = type
  routeQuery.value = option || {}
  uni.setNavigationBarTitle({
    title: type === 0 ? '分销业绩' : '提现记录',
  })
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    type === 0 ? fetchAchievementList() : fetchWithdrawLog()
  })
})

onReachBottom(() => {
  loadStatus.value = 'loading'
  if (listType.value === 0) {
    achievementParams.value.pageNumber++
    fetchAchievementList()
  } else {
    withdrawParams.value.pageNumber++
    fetchWithdrawLog()
  }
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function fetchAchievementList() {
  uni.showLoading({ title: '加载中' })
  getDistributionOrders(achievementParams.value).then((res) => {
    const records = res.data.success ? res.data.result?.records || [] : []
    if (records.length) {
      achievementList.value.push(...records)
      if (records.length < achievementParams.value.pageSize) {
        loadStatus.value = 'nomore'
      }
    } else {
      loadStatus.value = 'nomore'
      isEmpty.value = achievementList.value.length === 0
    }
    hideLoadingIfNeeded()
  })
}

function fetchWithdrawLog() {
  uni.showLoading({ title: '加载中' })
  cashLog(withdrawParams.value).then((res) => {
    if (res.data.success && res.data.result.records.length >= 1) {
      withdrawLogList.value.push(...res.data.result.records)
    } else {
      loadStatus.value = 'nomore'
      isEmpty.value = true
    }
    hideLoadingIfNeeded()
  })
}
</script>

<style lang="scss" scoped>
.empty {
  margin: 40rpx 0;
}
.price {
  color: $main-color;
  font-weight: bold;
}
.log-list {
  padding: 0 8rpx;
  overflow: hidden;
  margin: 20rpx 0;
}
.log-way {
  margin: 10rpx 0;
  overflow: hidden;
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx 0;
}
.title {
  font-size: 30rpx;
  font-weight: bold;
}
.log-item-view {
  padding: 8rpx 32rpx;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
}
.log-item-footer,
.log-item-footers {
  padding: 8rpx 32rpx;
  display: flex;
  font-size: 13px;
  justify-content: space-between;
}
</style>
