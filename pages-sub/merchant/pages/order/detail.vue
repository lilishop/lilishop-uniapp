<template>
  <view class="merchant-order-detail">
    <!-- 状态头部 -->
    <view class="status-banner" :class="getStatusClass(orderDetail?.order?.orderStatus)">
      <view class="status-icon">
        <u-icon :name="getStatusIcon(orderDetail?.order?.orderStatus)" size="28" color="#ffffff"></u-icon>
      </view>
      <view class="status-text-box">
        <text class="status-title">{{ getStatusText(orderDetail?.order?.orderStatus) }}</text>
        <view class="sn-row" @click="copySn(orderSn)">
          <text class="status-sub">订单编号：{{ orderSn }}</text>
          <u-icon name="file-text" size="13" color="rgba(255,255,255,0.8)"></u-icon>
        </view>
      </view>
    </view>

    <!-- 核销码专属卡片 -->
    <view class="verify-code-card" v-if="orderDetail?.order?.verificationCode || isAppointment">
      <view class="card-title-row">
        <text class="card-title">核销凭证</text>
        <view class="code-badge">
          {{ isAppointment ? '预约核销' : '自提核销' }}
        </view>
      </view>
      <view class="code-box">
        <text class="code-number">{{ orderDetail?.order?.verificationCode || '--' }}</text>
        <view
          class="verify-now-btn"
          v-if="orderDetail?.order?.orderStatus === 'TAKE'"
          @click="handleDirectVerify"
        >
          立即核销
        </view>
      </view>
    </view>

    <!-- 买家 / 收货信息 -->
    <view class="info-card">
      <view class="card-title-row">
        <text class="card-title">买家信息</text>
      </view>
      <view class="info-row">
        <text class="info-label">收货人/自提人：</text>
        <text class="info-value">{{ orderDetail?.order?.consigneeName || '匿名买家' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">联系电话：</text>
        <text class="info-value">{{ maskPhone(orderDetail?.order?.consigneeMobile) }}</text>
      </view>
      <view class="info-row" v-if="orderDetail?.order?.consigneeAddressPath">
        <text class="info-label">地址：</text>
        <text class="info-value">{{ orderDetail?.order?.consigneeAddressPath }} {{ orderDetail?.order?.consigneeDetail || '' }}</text>
      </view>
    </view>

    <!-- 商品清单（干净规范，拒绝裸露 JSON） -->
    <view class="info-card">
      <view class="card-title-row">
        <text class="card-title">商品清单</text>
      </view>
      <view
        class="goods-row"
        v-for="(item, idx) in (orderDetail?.orderItems || [])"
        :key="item.id || item.goodsId || idx"
      >
        <image class="goods-img" :src="getGoodsImage(item)" mode="aspectFill"></image>
        <view class="goods-detail">
          <text class="goods-title">{{ getGoodsTitle(item) }}</text>
          <view class="sku-tag" v-if="getCleanSpecs(item)">
            <text>{{ getCleanSpecs(item) }}</text>
          </view>
          <view class="goods-bottom">
            <text class="price">¥{{ item.unitPrice || item.goodsPrice || '0.00' }}</text>
            <text class="qty">x{{ item.num || 1 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单财务明细 -->
    <view class="info-card">
      <view class="card-title-row">
        <text class="card-title">费用明细</text>
      </view>
      <view class="fee-row">
        <text class="fee-label">商品总价</text>
        <text class="fee-val">¥{{ orderDetail?.order?.goodsPrice || '0.00' }}</text>
      </view>
      <view class="fee-row" v-if="orderDetail?.order?.discountPrice">
        <text class="fee-label">优惠金额</text>
        <text class="fee-val discount">-¥{{ orderDetail?.order?.discountPrice }}</text>
      </view>
      <view class="fee-row" v-if="orderDetail?.order?.freightPrice">
        <text class="fee-label">运费</text>
        <text class="fee-val">+¥{{ orderDetail?.order?.freightPrice }}</text>
      </view>
      <view class="fee-divider"></view>
      <view class="fee-row total">
        <text class="fee-label">实收金额</text>
        <text class="fee-val total-price">¥{{ orderDetail?.order?.flowPrice || '0.00' }}</text>
      </view>
    </view>

    <!-- 订单参数（支付方式中文人性化映射） -->
    <view class="info-card">
      <view class="info-row">
        <text class="info-label">下单时间：</text>
        <text class="info-value">{{ orderDetail?.order?.createTime || '--' }}</text>
      </view>
      <view class="info-row" v-if="orderDetail?.order?.paymentTime">
        <text class="info-label">支付时间：</text>
        <text class="info-value">{{ orderDetail?.order?.paymentTime }}</text>
      </view>
      <view class="info-row" v-if="orderDetail?.order?.paymentMethod">
        <text class="info-label">支付方式：</text>
        <text class="info-value pay-method-val">{{ formatPaymentMethod(orderDetail?.order?.paymentMethod) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStoreOrderDetail, storeOrderTake } from '../../api/order.js'
import { parseGoodsImageUrl } from '@/utils/filters.js'

const orderSn = ref('')
const orderDetail = ref<any>(null)

const isAppointment = computed(() => {
  return orderDetail.value?.order?.orderType === 'APPOINTMENT_GOODS'
})

onLoad((options: any) => {
  if (options?.sn) {
    orderSn.value = options.sn
    fetchDetail()
  }
})

const fetchDetail = async () => {
  uni.showLoading({ title: '加载中...' })
  try {
    const res: any = await getStoreOrderDetail(orderSn.value)
    uni.hideLoading()
    if (res?.data && res.data.success && res.data.result) {
      orderDetail.value = res.data.result
    } else {
      uni.showToast({ title: '获取订单详情失败', icon: 'none' })
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '网络连接异常', icon: 'none' })
  }
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

// 提取商品标题
const getGoodsTitle = (item: any) => {
  if (item.goodsName && item.goodsName.trim()) return item.goodsName
  if (item.name && item.name.trim()) return item.name
  if (orderDetail.value?.order?.orderName) return orderDetail.value.order.orderName
  return '精选商品'
}

// 智能提取商品图片，过滤并兼顾富文本/JSON 结构
const getGoodsImage = (item: any) => {
  if (item.image) {
    const parsed = parseGoodsImageUrl(item.image)
    if (parsed) return parsed
  }
  // 若 image 为空，尝试从 specs JSON 里抓取合法的图片 url
  if (item.specs && typeof item.specs === 'string') {
    const match = item.specs.match(/https?:\/\/[^\s"'\\}]+\.(jpeg|jpg|png|webp|gif)/i)
    if (match) return match[0]
  }
  return '/static/tabbar/home.png'
}

// 智能提炼清洁规格，绝不裸露冗长的原始 JSON
const getCleanSpecs = (item: any) => {
  const specs = item.specs
  if (!specs || !String(specs).trim()) return ''
  const trimmed = String(specs).trim()

  // 若为 JSON 格式
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const obj = JSON.parse(trimmed)
      const ignoreKeys = ['images', 'code', 'message', 'result', 'success', 'showProgress', 'url', 'status']
      const pairs: string[] = []
      for (const [k, v] of Object.entries(obj)) {
        if (!ignoreKeys.includes(k) && typeof v === 'string' && !v.startsWith('http') && v.length < 50) {
          pairs.push(`${k}: ${v}`)
        }
      }
      if (pairs.length > 0) return pairs.join(' / ')
    } catch (e) {}

    // 解析失败正则提取业务键值对
    const matches = [...trimmed.matchAll(/"([^"]{1,20})"\s*:\s*"([^"]{1,30})"/g)]
    const ignoreKeys = ['code', 'message', 'success', 'url', 'result', 'showProgress', 'status', 'name']
    const pairs: string[] = []
    for (const m of matches) {
      const k = m[1]
      const v = m[2]
      if (!ignoreKeys.includes(k) && !v.startsWith('http')) {
        pairs.push(`${k}: ${v}`)
      }
    }
    if (pairs.length > 0) return pairs.join(' / ')

    return ''
  }

  // 纯文本规格
  return trimmed
}

// 支付方式中文映射
const formatPaymentMethod = (method: string) => {
  if (!method) return '--'
  const map: Record<string, string> = {
    WALLET: '余额支付',
    ALIPAY: '支付宝支付',
    ALIPAY_PC: '支付宝支付',
    ALIPAY_WAP: '支付宝支付',
    ALIPAY_APP: '支付宝支付',
    WECHAT: '微信支付',
    WEIXIN: '微信支付',
    WECHAT_MP: '微信支付',
    WEIXIN_MP: '微信支付',
    WX_JSAPI: '微信支付',
    WX_APP: '微信支付',
    WX_NATIVE: '微信支付',
    WX_H5: '微信支付',
    BANK_TRANSFER: '银行转账',
    POINT: '积分兑换',
    CASH: '现金支付',
    OFFLINE: '线下支付',
    FREE: '免费免付',
  }
  const key = String(method).toUpperCase().trim()
  return map[key] || method
}

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

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

const getStatusClass = (status: string) => {
  if (status === 'TAKE') return 'bg-take'
  if (status === 'COMPLETED') return 'bg-done'
  if (status === 'CANCELLED') return 'bg-cancel'
  return 'bg-normal'
}

const getStatusIcon = (status: string) => {
  if (status === 'TAKE') return 'checkmark-circle-fill'
  if (status === 'COMPLETED') return 'checkmark'
  if (status === 'CANCELLED') return 'close'
  return 'clock'
}

// 直接在详情页核销
const handleDirectVerify = async () => {
  const code = orderDetail.value?.order?.verificationCode
  if (!code) {
    uni.showToast({ title: '该订单暂无可核销码', icon: 'none' })
    return
  }

  uni.showModal({
    title: '确认核销',
    content: `确认核销此单？核销码：${code}`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '正在核销...' })
        try {
          const takeRes: any = await storeOrderTake(orderSn.value, code)
          uni.hideLoading()
          if (takeRes?.data && takeRes.data.success) {
            uni.showToast({ title: '核销成功', icon: 'success' })
            fetchDetail()
          } else {
            uni.showToast({
              title: takeRes?.data?.message || '核销失败',
              icon: 'none',
            })
          }
        } catch (e) {
          uni.hideLoading()
          uni.showToast({ title: '核销异常，请稍后重试', icon: 'none' })
        }
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.merchant-order-detail {
  min-height: 100vh;
  background-color: #f4f5f7;
  padding-bottom: calc(50rpx + env(safe-area-inset-bottom));
}

.status-banner {
  padding: 44rpx 36rpx;
  color: #ffffff;
  display: flex;
  align-items: center;

  &.bg-take {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  }
  &.bg-normal {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  &.bg-done {
    background: #6b7280;
  }
  &.bg-cancel {
    background: #9ca3af;
  }

  .status-icon {
    width: 68rpx;
    height: 68rpx;
    border-radius: 34rpx;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
  }

  .status-text-box {
    display: flex;
    flex-direction: column;

    .status-title {
      font-size: 36rpx;
      font-weight: 700;
    }

    .sn-row {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-top: 8rpx;

      .status-sub {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.85);
      }
    }
  }
}

.verify-code-card {
  margin: -24rpx 28rpx 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .card-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #111827;
    }

    .code-badge {
      font-size: 22rpx;
      font-weight: 500;
      color: #059669;
      background: #ecfdf5;
      padding: 4rpx 14rpx;
      border-radius: 8rpx;
    }
  }

  .code-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f9fafb;
    border-radius: 16rpx;
    padding: 20rpx 28rpx;

    .code-number {
      font-size: 44rpx;
      font-weight: 700;
      color: #10b981;
      letter-spacing: 4rpx;
    }

    .verify-now-btn {
      background: #111827;
      color: #ffffff;
      padding: 14rpx 32rpx;
      border-radius: 14rpx;
      font-size: 26rpx;
      font-weight: 600;
      box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.2);
    }
  }
}

.info-card {
  margin: 0 28rpx 24rpx 28rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

  .card-title-row {
    margin-bottom: 20rpx;
    padding-bottom: 14rpx;
    border-bottom: 1rpx solid #f9fafb;

    .card-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #111827;
    }
  }

  .info-row {
    display: flex;
    align-items: flex-start;
    font-size: 26rpx;
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      color: #6b7280;
      width: 180rpx;
      flex-shrink: 0;
    }

    .info-value {
      color: #111827;
      flex: 1;
      font-weight: 500;
      line-height: 1.4;

      &.pay-method-val {
        color: #2563eb;
        font-weight: 600;
      }
    }
  }

  .goods-row {
    display: flex;
    padding: 18rpx 0;
    border-bottom: 1rpx solid #f9fafb;

    &:last-child {
      border-bottom: none;
    }

    .goods-img {
      width: 140rpx;
      height: 140rpx;
      border-radius: 14rpx;
      background: #f9fafb;
      border: 1rpx solid #f3f4f6;
      flex-shrink: 0;
    }

    .goods-detail {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .goods-title {
        font-size: 28rpx;
        color: #111827;
        font-weight: 600;
        line-height: 1.4;
      }

      .sku-tag {
        margin-top: 6rpx;

        text {
          font-size: 22rpx;
          color: #6b7280;
          background: #f3f4f6;
          padding: 4rpx 12rpx;
          border-radius: 6rpx;
        }
      }

      .goods-bottom {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-top: 10rpx;

        .price {
          font-size: 30rpx;
          font-weight: 700;
          color: #111827;
        }

        .qty {
          font-size: 22rpx;
          color: #9ca3af;
        }
      }
    }
  }

  .fee-row {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    margin-bottom: 14rpx;
    color: #6b7280;

    .discount {
      color: #10b981;
    }

    &.total {
      margin-top: 16rpx;
      margin-bottom: 0;
      font-size: 28rpx;
      font-weight: 700;
      color: #111827;

      .total-price {
        font-size: 36rpx;
        font-weight: 700;
        color: #ef4444;
      }
    }
  }

  .fee-divider {
    height: 1rpx;
    background: #f3f4f6;
    margin: 16rpx 0;
  }
}
</style>
