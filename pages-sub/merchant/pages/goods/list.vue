<template>
  <view class="merchant-goods-page">
    <!-- 顶部吸顶搜索栏与 Tab -->
    <view class="sticky-header">
      <view class="search-bar">
        <u-icon name="search" size="18" color="#9ca3af"></u-icon>
        <input
          class="search-input"
          type="text"
          v-model="keywords"
          placeholder="搜索商品名称"
          placeholder-class="placeholder"
          @confirm="onSearch"
        />
        <view class="clear-btn" v-if="keywords" @click="clearSearch">
          <u-icon name="close-circle-fill" size="16" color="#d1d5db"></u-icon>
        </view>
      </view>

      <view class="tab-scroll-wrap">
        <view
          class="tab-item"
          v-for="item in tabList"
          :key="item.key"
          :class="{ active: currentTab === item.key }"
          @click="switchTab(item.key)"
        >
          <text class="tab-label">{{ item.label }}</text>
          <view class="indicator" v-if="currentTab === item.key"></view>
        </view>
      </view>
    </view>

    <!-- 商品列表主体 -->
    <view class="goods-list-body">
      <view
        class="goods-card"
        v-for="goods in goodsList"
        :key="goods.id"
        @click="goToDetail(goods.id)"
      >
        <view class="card-main">
          <image
            class="goods-img"
            :src="goods.thumbnail || goods.original || '/static/tabbar/home.png'"
            mode="aspectFill"
          ></image>
          <view class="goods-meta">
            <view class="title-row">
              <text class="goods-title">{{ goods.goodsName }}</text>
            </view>
            <view class="stock-sales-row">
              <text class="meta-tag">库存: {{ goods.quantity ?? 0 }}</text>
              <text class="meta-tag">销量: {{ goods.buyCount ?? 0 }}</text>
            </view>
            <view class="price-status-row">
              <view class="price-box">
                <text class="symbol">¥</text>
                <text class="price-num">{{ goods.price || goods.sellingPrice || '0.00' }}</text>
              </view>
              <view class="status-badge" :class="goods.marketEnable === 'UPPER' ? 'on-sale' : 'off-sale'">
                {{ goods.marketEnable === 'UPPER' ? '出售中' : '已下架' }}
              </view>
            </view>
          </view>
        </view>

        <!-- 底部快捷操作条 -->
        <view class="card-footer">
          <text class="goods-sn" v-if="goods.sn">商品货号：{{ goods.sn }}</text>
          <view class="actions-group">
            <view
              class="action-btn off"
              v-if="goods.marketEnable === 'UPPER'"
              @click.stop="toggleMarket(goods, 'DOWN')"
            >
              <text>下架商品</text>
            </view>
            <view
              class="action-btn on"
              v-else
              @click.stop="toggleMarket(goods, 'UPPER')"
            >
              <text>立即上架</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && goodsList.length === 0">
        <u-icon name="bag" size="56" color="#d1d5db"></u-icon>
        <text class="empty-text">暂无相关商品</text>
      </view>

      <!-- 加载提示 -->
      <view class="loading-more" v-if="loading">
        <text>正在加载商品列表...</text>
      </view>
      <view class="no-more" v-else-if="finished && goodsList.length > 0">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getStoreGoodsList, upGoods, downGoods } from '../../api/goods.js'

const keywords = ref('')
const currentTab = ref('ALL')
const loading = ref(false)
const finished = ref(false)
const pageNumber = ref(1)
const pageSize = ref(10)
const goodsList = ref([])

const tabList = [
  { key: 'ALL', label: '全部' },
  { key: 'UPPER', label: '出售中' },
  { key: 'DOWN', label: '已下架' },
]

onLoad((options) => {
  if (options?.tab) {
    currentTab.value = options.tab
  }
  fetchGoods(true)
})

onPullDownRefresh(async () => {
  await fetchGoods(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value && !loading.value) {
    pageNumber.value++
    fetchGoods(false)
  }
})

const fetchGoods = async (reset = false) => {
  if (reset) {
    pageNumber.value = 1
    goodsList.value = []
    finished.value = false
  }

  loading.value = true
  const params = {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
  }

  if (keywords.value.trim()) {
    params.goodsName = keywords.value.trim()
  }

  if (currentTab.value !== 'ALL') {
    params.marketEnable = currentTab.value
  }

  try {
    const res = await getStoreGoodsList(params)
    loading.value = false
    if (res.data && res.data.success && res.data.result) {
      const records = res.data.result.records || []
      if (reset) {
        goodsList.value = records
      } else {
        goodsList.value = [...goodsList.value, ...records]
      }
      if (records.length < pageSize.value) {
        finished.value = true
      }
    } else {
      finished.value = true
    }
  } catch (e) {
    loading.value = false
    finished.value = true
  }
}

const switchTab = (tabKey) => {
  if (currentTab.value === tabKey) return
  currentTab.value = tabKey
  fetchGoods(true)
}

const onSearch = () => {
  fetchGoods(true)
}

const clearSearch = () => {
  keywords.value = ''
  fetchGoods(true)
}

const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages-sub/merchant/pages/goods/detail?id=${id}`,
  })
}

// 快捷上下架切换
const toggleMarket = (goods, targetStatus) => {
  const isUp = targetStatus === 'UPPER'
  const actionText = isUp ? '上架' : '下架'

  uni.showModal({
    title: `${actionText}提示`,
    content: `确定要${actionText}商品「${goods.goodsName}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: `正在${actionText}...` })
        try {
          const apiCall = isUp ? upGoods(goods.id) : downGoods(goods.id)
          const resp = await apiCall
          uni.hideLoading()
          if (resp.data && resp.data.success) {
            uni.showToast({ title: `${actionText}成功`, icon: 'success' })
            fetchGoods(true)
          } else {
            uni.showToast({
              title: resp.data?.message || `${actionText}失败`,
              icon: 'none',
            })
          }
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '网络连接异常', icon: 'none' })
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.merchant-goods-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding-bottom: 40rpx;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .search-bar {
    display: flex;
    align-items: center;
    background: #f3f4f6;
    margin: 20rpx 28rpx;
    padding: 16rpx 24rpx;
    border-radius: 16rpx;

    .search-input {
      flex: 1;
      margin-left: 16rpx;
      font-size: 26rpx;
      color: #111827;
    }

    .placeholder {
      color: #9ca3af;
      font-size: 26rpx;
    }
  }

  .tab-scroll-wrap {
    display: flex;
    border-bottom: 1rpx solid #f0f0f0;
    padding: 0 16rpx;

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 20rpx 0;
      position: relative;

      .tab-label {
        font-size: 28rpx;
        color: #6b7280;
        font-weight: 500;
      }

      &.active {
        .tab-label {
          color: #111827;
          font-weight: 700;
        }

        .indicator {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40rpx;
          height: 6rpx;
          background: #111827;
          border-radius: 3rpx;
        }
      }
    }
  }
}

.goods-list-body {
  padding: 24rpx 28rpx;

  .goods-card {
    background: #ffffff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    .card-main {
      display: flex;

      .goods-img {
        width: 170rpx;
        height: 170rpx;
        border-radius: 16rpx;
        background: #f3f4f6;
      }

      .goods-meta {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title-row {
          .goods-title {
            font-size: 28rpx;
            font-weight: 600;
            color: #111827;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        .stock-sales-row {
          display: flex;
          gap: 16rpx;
          margin-top: 8rpx;

          .meta-tag {
            font-size: 22rpx;
            color: #6b7280;
            background: #f3f4f6;
            padding: 4rpx 12rpx;
            border-radius: 8rpx;
          }
        }

        .price-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12rpx;

          .price-box {
            display: flex;
            align-items: baseline;
            color: #ff3c2a;

            .symbol {
              font-size: 22rpx;
              font-weight: 700;
            }

            .price-num {
              font-size: 34rpx;
              font-weight: 700;
              margin-left: 4rpx;
            }
          }

          .status-badge {
            font-size: 22rpx;
            padding: 4rpx 14rpx;
            border-radius: 8rpx;
            font-weight: 500;

            &.on-sale {
              background: #ecfdf5;
              color: #059669;
            }

            &.off-sale {
              background: #f3f4f6;
              color: #9ca3af;
            }
          }
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f9fafb;

      .goods-sn {
        font-size: 22rpx;
        color: #9ca3af;
      }

      .actions-group {
        display: flex;
        gap: 16rpx;

        .action-btn {
          padding: 10rpx 28rpx;
          border-radius: 12rpx;
          font-size: 24rpx;
          font-weight: 600;

          &.off {
            background: #fef2f2;
            color: #dc2626;
            border: 1rpx solid #fecaca;
          }

          &.on {
            background: #111827;
            color: #ffffff;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 120rpx 0;

    .empty-text {
      font-size: 26rpx;
      color: #9ca3af;
      margin-top: 20rpx;
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 24rpx 0;
    font-size: 22rpx;
    color: #9ca3af;
  }
}
</style>
