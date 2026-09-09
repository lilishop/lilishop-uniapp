<template>
  <view class="page">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <template v-else>
    <view class="search-bar">
      <view class="search-inner">
        <u-icon name="search" color="#bbb" size="18" />
        <input
          class="search-input"
          v-model="keyword"
          confirm-type="search"
          placeholder="商品搜索: 请输入商品关键字"
          placeholder-class="search-placeholder"
          @confirm="onSearch"
        />
      </view>
    </view>

    <view class="sort-bar">
      <view
        v-for="item in sortTabs"
        :key="item.field"
        class="sort-item"
        :class="{ active: sortField === item.field }"
        @click="onSortTab(item.field)"
      >
        <text>{{ item.label }}</text>
        <view class="sort-arrows">
          <image
            class="arrow-img"
            :src="sortField === item.field && sortOrder === 'ASC' ? '/static/index/arrow-up-1.png' : '/static/index/arrow-up.png'"
            mode="aspectFit"
          />
          <image
            class="arrow-img"
            :src="sortField === item.field && sortOrder === 'DESC' ? '/static/index/arrow-down-1.png' : '/static/index/arrow-down.png'"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>

    <scroll-view
      class="goods-scroll"
      scroll-y
      :lower-threshold="80"
      @scrolltolower="loadMore"
    >
      <view v-if="loading && !goodsList.length" class="state-wrap">
        <text class="state-text">加载中...</text>
      </view>

      <view v-else-if="!goodsList.length" class="state-wrap">
        <text class="state-text">暂无推广商品</text>
      </view>

      <view v-else class="goods-list">
        <view
          v-for="item in goodsList"
          :key="item.id"
          class="goods-card"
        >
          <image
            class="goods-image"
            :src="item.thumbnail"
            mode="aspectFill"
            @click="goGoodsDetail(item)"
          />
          <view class="goods-body">
            <view class="goods-name" @click="goGoodsDetail(item)">{{ item.goodsName }}</view>
            <view class="goods-detail-row">
              <view class="goods-info" @click="goGoodsDetail(item)">
                <view class="goods-earn">赚 ¥{{ formatMoney(item.commission) }}</view>
                <view class="goods-price">¥{{ formatMoney(item.price) }}</view>
              </view>
              <view class="share-btn" @click.stop="shareGoods(item)">立即分享</view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="goodsList.length" class="load-more">
        <text>{{ finished ? '没有更多了' : (loadingMore ? '加载中...' : '上拉加载更多') }}</text>
      </view>
    </scroll-view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { distributionGoods, getDistributionGoodsSetting } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const DEFAULT_SORT_MAP: Record<string, { field: string; order: string }> = {
  HIGHEST_COMMISSION: { field: 'COMMISSION', order: 'DESC' },
  HIGHEST_PRICE: { field: 'PRICE', order: 'DESC' },
  HIGHEST_SALES: { field: 'SALES', order: 'DESC' },
  LATEST_LISTING: { field: 'LATEST', order: 'DESC' },
}

const sortTabs = [
  { field: 'COMMISSION', label: '佣金' },
  { field: 'LATEST', label: '最新' },
  { field: 'SALES', label: '销量' },
  { field: 'PRICE', label: '价格' },
]

const pageReady = ref(false)
const routeQuery = ref<Record<string, string>>({})
const keyword = ref('')
const sortField = ref('COMMISSION')
const sortOrder = ref<'ASC' | 'DESC'>('DESC')
const goodsList = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const finished = ref(false)

const queryParams = ref({
  pageNumber: 1,
  pageSize: 10,
  goodsName: '',
  sortField: 'COMMISSION',
  sortOrder: 'DESC',
})

const distributionId = computed(() => routeQuery.value.id || '')

onLoad((options) => {
  routeQuery.value = (options || {}) as Record<string, string>
  initPage()
})

async function initPage() {
  const distributor = await assertActiveDistributor()
  if (!distributor) {
    return
  }
  pageReady.value = true
  await loadGoodsSetting()
  resetAndFetch()
}

async function loadGoodsSetting() {
  try {
    const res = await getDistributionGoodsSetting()
    if (res.data?.success && res.data.result) {
      const setting = res.data.result
      const mapped = DEFAULT_SORT_MAP[setting.defaultSort] || DEFAULT_SORT_MAP.HIGHEST_COMMISSION
      sortField.value = mapped.field
      sortOrder.value = mapped.order as 'ASC' | 'DESC'
      queryParams.value.sortField = mapped.field
      queryParams.value.sortOrder = mapped.order
    }
  } catch (error) {
    console.warn('load distribution goods setting failed', error)
  }
}

function formatMoney(val: number | string) {
  const num = Number(val || 0)
  return num.toFixed(2)
}

function resetAndFetch() {
  goodsList.value = []
  finished.value = false
  queryParams.value.pageNumber = 1
  queryParams.value.goodsName = keyword.value.trim()
  fetchGoodsList()
}

function onSearch() {
  resetAndFetch()
}

function onSortTab(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'DESC' ? 'ASC' : 'DESC'
  } else {
    sortField.value = field
    sortOrder.value = 'DESC'
  }
  queryParams.value.sortField = sortField.value
  queryParams.value.sortOrder = sortOrder.value
  resetAndFetch()
}

function fetchGoodsList() {
  if (queryParams.value.pageNumber > 1) {
    if (loadingMore.value || finished.value) return
    loadingMore.value = true
  } else {
    loading.value = true
  }

  distributionGoods(queryParams.value)
    .then((res) => {
      const records = res.data?.result?.records || []
      const total = Number(res.data?.result?.total || 0)
      if (res.data?.success) {
        goodsList.value.push(...records)
        finished.value = goodsList.value.length >= total || records.length < queryParams.value.pageSize
      }
    })
    .catch(() => {
      if (!goodsList.value.length) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      }
    })
    .finally(() => {
      loading.value = false
      loadingMore.value = false
    })
}

function loadMore() {
  if (loading.value || loadingMore.value || finished.value) return
  queryParams.value.pageNumber += 1
  fetchGoodsList()
}

function goGoodsDetail(item: any) {
  if (!item?.skuId || !item?.goodsId) return
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.skuId}&goodsId=${item.goodsId}`,
  })
}

function shareGoods(item: any) {
  const distId = distributionId.value
  if (!item?.skuId || !item?.goodsId || !distId) {
    uni.showToast({ title: '分享信息不完整', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/mine/distribution/share?skuId=${item.skuId}&goodsId=${item.goodsId}&distributionId=${distId}`,
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}

.search-inner {
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: #f5f5f5;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.search-placeholder {
  color: #bbb;
  font-size: 26rpx;
}

.sort-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.sort-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 28rpx;

  &.active {
    color: #ff6b35;
    font-weight: 600;
  }
}

.sort-arrows {
  display: flex;
  flex-direction: column;
  margin-left: 6rpx;
}

.arrow-img {
  width: 14rpx;
  height: 14rpx;
}

.goods-scroll {
  flex: 1;
  height: calc(100vh - 200rpx);
}

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 28rpx;
}

.goods-list {
  padding: 16rpx 0 24rpx;
}

.goods-card {
  display: flex;
  margin: 0 20rpx 20rpx;
  padding: 22rpx;
  border-radius: 20rpx;
  background: #fff;
}

.goods-image {
  flex-shrink: 0;
  width: 176rpx;
  height: 176rpx;
  border-radius: 12rpx;
  background: #f4f4f4;
}

.goods-body {
  flex: 1;
  min-width: 0;
  padding-left: 16rpx;
  display: flex;
  flex-direction: column;
}

.goods-name {
  color: #333;
  font-size: 28rpx;
  line-height: 40rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.goods-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10rpx;
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-earn {
  display: inline-block;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  background: #fff0f0;
  color: #ff4d4f;
  font-size: 22rpx;
  line-height: 1.4;
}

.goods-price {
  margin-top: 10rpx;
  color: #222;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.2;
}

.share-btn {
  flex-shrink: 0;
  margin-left: 12rpx;
  padding: 14rpx 24rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff8f3f 0%, #ff6b35 100%);
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
  white-space: nowrap;
}

.load-more {
  padding: 24rpx 0 40rpx;
  text-align: center;
  color: #bbb;
  font-size: 24rpx;
}
</style>
