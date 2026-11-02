<template>
  <view class="merchant-order-page">
    <!-- 顶部吸顶搜索栏与 Tab -->
    <view class="sticky-header">
      <!-- 搜索栏 -->
      <view class="search-box">
        <view class="search-input-wrap">
          <u-icon name="search" size="18" color="#9ca3af"></u-icon>
          <input
            class="search-input"
            type="text"
            v-model="keywords"
            placeholder="搜索订单号 / 买家手机号"
            placeholder-class="placeholder"
            confirm-type="search"
            @confirm="onSearch"
          />
          <view class="clear-btn" v-if="keywords" @click="clearSearch">
            <u-icon name="close-circle-fill" size="16" color="#d1d5db"></u-icon>
          </view>
        </view>
        <view class="search-action-btn" v-if="keywords" @click="onSearch">
          <text>搜索</text>
        </view>
      </view>

      <!-- 状态横向滑动 Tab 栏（绝不折行） -->
      <scroll-view class="tab-scroll" scroll-x :show-scrollbar="false" :scroll-with-animation="true">
        <view class="tab-inner">
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
      </scroll-view>
    </view>

    <!-- 订单列表主体 -->
    <view class="order-list-body">
      <!-- 列表数据 -->
      <view
        class="order-card"
        v-for="order in orderList"
        :key="order.sn"
        @click="goToDetail(order.sn)"
      >
        <!-- 头部：单号与状态 -->
        <view class="card-head">
          <view class="sn-box" @click.stop="copySn(order.sn)">
            <text class="order-sn">单号：{{ order.sn }}</text>
            <u-icon name="file-text" size="14" color="#9ca3af"></u-icon>
          </view>
          <view class="status-badge" :class="getStatusClass(order.orderStatus)">
            {{ getStatusText(order.orderStatus) }}
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="goods-container">
          <view
            class="goods-item"
            v-for="goods in (order.orderItems || [])"
            :key="goods.id || goods.goodsId"
          >
            <image class="goods-thumb" :src="goods.image || '/static/tabbar/home.png'" mode="aspectFill"></image>
            <view class="goods-info">
              <text class="goods-name">{{ getGoodsName(goods, order) }}</text>
              <view class="spec-pill" v-if="getSpecText(goods)">
                <text>{{ getSpecText(goods) }}</text>
              </view>
              <view class="price-qty-row">
                <text class="goods-price">¥{{ goods.unitPrice || goods.goodsPrice || '0.00' }}</text>
                <text class="goods-qty">x{{ goods.num || 1 }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单金额与买家信息 -->
        <view class="card-foot">
          <view class="buyer-info" v-if="order.consigneeMobile || order.memberPhone">
            <u-icon name="account" size="14" color="#9ca3af"></u-icon>
            <text class="buyer-tel">{{ maskPhone(order.consigneeMobile || order.memberPhone) }}</text>
          </view>
          <view class="buyer-info" v-else>
            <text class="order-type-tag" v-if="order.orderType === 'APPOINTMENT_GOODS'">预约商品单</text>
            <text class="order-type-tag" v-else-if="order.verificationCode">自提单</text>
          </view>

          <view class="total-bar">
            <text class="total-label">实付：</text>
            <text class="total-symbol">¥</text>
            <text class="total-price">{{ order.flowPrice || '0.00' }}</text>
          </view>
        </view>

        <!-- 核销专属快捷动作 -->
        <view class="card-actions" v-if="order.verificationCode || order.orderType === 'APPOINTMENT_GOODS' || order.orderStatus === 'TAKE'">
          <view class="action-btn verify" @click.stop="quickVerify(order)">
            <u-icon name="scan" size="15" color="#ffffff"></u-icon>
            <text class="btn-lbl">扫码/输码核销</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && orderList.length === 0">
        <u-icon name="order" size="64" color="#d1d5db"></u-icon>
        <text class="empty-text">暂无相关订单记录</text>
      </view>

      <!-- 加载提示 -->
      <view class="loading-more" v-if="loading">
        <text>正在加载订单数据...</text>
      </view>
      <view class="no-more" v-else-if="finished && orderList.length > 0">
        <text>— 没有更多了 —</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getStoreOrderList } from '../../api/order.js'

const keywords = ref('')
const currentTab = ref('ALL')
const loading = ref(false)
const finished = ref(false)
const pageNumber = ref(1)
const pageSize = ref(10)
const orderList = ref<any[]>([])

// 优化 Tab 标题，保持精练统一、绝不换行
const tabList = [
  { key: 'ALL', label: '全部' },
  { key: 'TAKE', label: '待核销' },
  { key: 'UNDELIVERED', label: '待发货' },
  { key: 'DELIVERED', label: '待收货' },
  { key: 'COMPLETED', label: '已完成' },
]

onLoad((options: any) => {
  if (options?.tab) {
    currentTab.value = options.tab
  }
  fetchOrders(true)
})

onPullDownRefresh(async () => {
  await fetchOrders(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value && !loading.value) {
    pageNumber.value++
    fetchOrders(false)
  }
})

const fetchOrders = async (reset = false) => {
  if (reset) {
    pageNumber.value = 1
    orderList.value = []
    finished.value = false
  }

  loading.value = true

  const params: any = {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
    keywords: keywords.value.trim() || undefined,
  }

  if (currentTab.value !== 'ALL') {
    params.orderStatus = currentTab.value
  }

  try {
    const res: any = await getStoreOrderList(params)
    loading.value = false

    if (res?.data && res.data.success) {
      const records = res.data.result?.records || []
      if (reset) {
        orderList.value = records
      } else {
        orderList.value = [...orderList.value, ...records]
      }

      if (records.length < pageSize.value) {
        finished.value = true
      }
    } else {
      uni.showToast({
        title: res?.data?.message || '获取订单列表失败',
        icon: 'none',
      })
    }
  } catch (e) {
    loading.value = false
    uni.showToast({ title: '网络连接异常', icon: 'none' })
  }
}

const switchTab = (key: string) => {
  if (currentTab.value === key) return
  currentTab.value = key
  fetchOrders(true)
}

const onSearch = () => {
  fetchOrders(true)
}

const clearSearch = () => {
  keywords.value = ''
  fetchOrders(true)
}

const goToDetail = (sn: string) => {
  uni.navigateTo({
    url: `/pages-sub/merchant/pages/order/detail?sn=${sn}`,
  })
}

// 快捷核销
const quickVerify = (order: any) => {
  uni.navigateTo({
    url: `/pages-sub/merchant/pages/order/detail?sn=${order.sn}&autoVerify=1`,
  })
}

// 复制单号
const copySn = (sn: string) => {
  if (!sn) return
  uni.setClipboardData({
    data: sn,
    success: () => {
      uni.showToast({ title: '单号已复制', icon: 'none' })
    },
  })
}

// 提取商品名（容错兜底）
const getGoodsName = (goods: any, order: any) => {
  if (goods.goodsName && goods.goodsName.trim()) return goods.goodsName
  if (goods.name && goods.name.trim()) return goods.name
  if (order.orderName && order.orderName.trim()) return order.orderName
  if (goods.specs && goods.specs.trim()) return goods.specs
  return '精选商品'
}

// 提取规格文本（智能剔除多余字段）
const getSpecText = (goods: any) => {
  const specs = goods.specs
  if (!specs || !String(specs).trim()) return ''
  if (specs === goods.goodsName) return ''

  // 处理 JSON 字符串形式
  if (typeof specs === 'string' && (specs.startsWith('{') || specs.startsWith('['))) {
    try {
      const obj = JSON.parse(specs)
      if (typeof obj === 'object') {
        const values = Object.values(obj).filter(Boolean)
        if (values.length) return values.join(' / ')
      }
    } catch (e) {}
  }
  return String(specs)
}

// 手机号脱敏
const maskPhone = (phone: string) => {
  if (!phone) return ''
  const str = String(phone).trim()
  if (str.length === 11) {
    return str.substring(0, 3) + '****' + str.substring(7)
  }
  return str
}

// 状态文字映射
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    UNPAID: '待付款',
    PAID: '已付款',
    UNDELIVERED: '待发货',
    DELIVERED: '待收货',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    TAKE: '待核销',
  }
  return map[status] || status || '处理中'
}

// 状态样式类
const getStatusClass = (status: string) => {
  switch (status) {
    case 'TAKE':
      return 'status-take'
    case 'COMPLETED':
      return 'status-done'
    case 'CANCELLED':
      return 'status-cancel'
    default:
      return 'status-normal'
  }
}
</script>

<style lang="scss" scoped>
.merchant-order-page {
  min-height: 100vh;
  background-color: #f4f5f7;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .search-box {
    padding: 16rpx 28rpx 10rpx 28rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;

    .search-input-wrap {
      flex: 1;
      height: 72rpx;
      background: #f3f4f6;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 24rpx;

      .search-input {
        flex: 1;
        margin-left: 12rpx;
        font-size: 26rpx;
        color: #111827;
      }

      .placeholder {
        color: #9ca3af;
        font-size: 26rpx;
      }

      .clear-btn {
        padding: 6rpx;
      }
    }

    .search-action-btn {
      font-size: 28rpx;
      color: #2563eb;
      font-weight: 600;
      padding: 0 8rpx;
    }
  }

  .tab-scroll {
    width: 100%;
    white-space: nowrap;

    .tab-inner {
      display: flex;
      align-items: center;
      padding: 0 16rpx;
      min-width: 100%;
      box-sizing: border-box;

      .tab-item {
        flex: 1;
        min-width: 130rpx;
        text-align: center;
        padding: 22rpx 12rpx;
        position: relative;
        white-space: nowrap;

        .tab-label {
          font-size: 28rpx;
          color: #6b7280;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        &.active {
          .tab-label {
            color: #111827;
            font-weight: 700;
            font-size: 30rpx;
          }

          .indicator {
            position: absolute;
            bottom: 4rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 44rpx;
            height: 6rpx;
            background: #111827;
            border-radius: 3rpx;
          }
        }
      }
    }
  }
}

.order-list-body {
  padding: 24rpx 28rpx;

  .order-card {
    background: #ffffff;
    border-radius: 24rpx;
    padding: 28rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20rpx;
      border-bottom: 1rpx solid #f3f4f6;

      .sn-box {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .order-sn {
          font-size: 24rpx;
          color: #6b7280;
          font-weight: 500;
        }
      }

      .status-badge {
        font-size: 22rpx;
        font-weight: 600;
        padding: 6rpx 16rpx;
        border-radius: 10rpx;

        &.status-take {
          background: #ecfdf5;
          color: #059669;
        }
        &.status-done {
          background: #f3f4f6;
          color: #6b7280;
        }
        &.status-cancel {
          background: #f9fafb;
          color: #9ca3af;
        }
        &.status-normal {
          background: #fff7ed;
          color: #ea580c;
        }
      }
    }

    .goods-container {
      padding: 10rpx 0;

      .goods-item {
        display: flex;
        padding: 16rpx 0;
        border-bottom: 1rpx solid #fafafa;

        &:last-child {
          border-bottom: none;
        }

        .goods-thumb {
          width: 140rpx;
          height: 140rpx;
          border-radius: 14rpx;
          background: #f9fafb;
          border: 1rpx solid #f3f4f6;
          flex-shrink: 0;
        }

        .goods-info {
          flex: 1;
          margin-left: 20rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          .goods-name {
            font-size: 28rpx;
            font-weight: 600;
            color: #111827;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .spec-pill {
            margin-top: 6rpx;

            text {
              font-size: 22rpx;
              color: #6b7280;
              background: #f3f4f6;
              padding: 4rpx 12rpx;
              border-radius: 6rpx;
            }
          }

          .price-qty-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-top: 10rpx;

            .goods-price {
              font-size: 28rpx;
              font-weight: 700;
              color: #111827;
            }

            .goods-qty {
              font-size: 22rpx;
              color: #9ca3af;
            }
          }
        }
      }
    }

    .card-foot {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #f9fafb;

      .buyer-info {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .buyer-tel {
          font-size: 24rpx;
          color: #6b7280;
          font-weight: 500;
        }

        .order-type-tag {
          font-size: 20rpx;
          color: #2563eb;
          background: #eff6ff;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
        }
      }

      .total-bar {
        display: flex;
        align-items: baseline;

        .total-label {
          font-size: 24rpx;
          color: #6b7280;
        }

        .total-symbol {
          font-size: 24rpx;
          font-weight: 700;
          color: #ef4444;
        }

        .total-price {
          font-size: 34rpx;
          font-weight: 700;
          color: #ef4444;
          margin-left: 2rpx;
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 20rpx;
      margin-top: 16rpx;
      border-top: 1rpx dashed #e5e7eb;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 14rpx 28rpx;
        border-radius: 36rpx;
        font-size: 26rpx;
        font-weight: 600;

        &.verify {
          background: #111827;
          color: #ffffff;
          box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.15);

          .btn-lbl {
            font-size: 24rpx;
          }
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #9ca3af;
      margin-top: 24rpx;
    }
  }

  .loading-more,
  .no-more {
    text-align: center;
    padding: 30rpx 0;
    font-size: 24rpx;
    color: #9ca3af;
  }
}
</style>
