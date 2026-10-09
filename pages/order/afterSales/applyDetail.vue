<template>
  <view :style="themeStyle" v-if="serviceDetail">
    <view class="after-sales-goods-detail-view">
      <view class="header">
        <view>
          本次售后服务将由
          <text class="seller-name">{{ serviceDetail.storeName }}</text>
          为您提供
        </view>
      </view>
      <view class="apply-info-view">
        <view class="status-info">
          <view class="status-info-box">
            <view class="status-val">{{ serviceStatusList(serviceDetail.serviceStatus) }}</view>
            <view class="status-tip">{{ statusFilter(serviceDetail.serviceStatus) }}</view>
          </view>
        </view>
        <view class="log-box-top" @click="onProgress()">
          <view class="top01">
            <view class="log-title">审核日志</view>
            <view class="log-first-show wes" v-if="logs[0]">{{ logs[0].message }}</view>
          </view>
          <u-icon name="arrow-right" size="16" color="#999"></u-icon>
        </view>
      </view>
      <view class="goods-info">
        <view class="info-box">
          <view class="goods-item-view" @click="navigateToGoodsDetail(serviceDetail)">
            <view class="goods-img">
              <u-image
                border-radius="6"
                width="131rpx"
                height="131rpx"
                mode="aspectFill"
                :src="parseGoodsImageUrl(serviceDetail.goodsImage)"
              ></u-image>
            </view>
            <view class="goods-content">
              <view class="goods-title">{{ serviceDetail.goodsName }}</view>
              <view class="goods-price">
                <text class="price">￥{{ unitPrice(serviceDetail.flowPrice) }}</text>
                <text class="num">申请售后数量：{{ serviceDetail.num }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="apply-detail-view">
      <view class="detail-item">
        <view class="title">服务单号:</view>
        <view class="value">{{ serviceDetail.sn }}</view>
      </view>
      <view class="detail-item">
        <view class="title">订单编号:</view>
        <view class="value">{{ serviceDetail.orderSn }}</view>
      </view>
      <view class="detail-item" v-if="serviceDetail.new_order_sn">
        <view class="title">新订单编号:</view>
        <view class="value">{{ serviceDetail.new_order_sn }}</view>
      </view>
      <view class="detail-item">
        <view class="title">服务类型:</view>
        <view class="value">{{
          serviceTypeList[serviceDetail.serviceType]
        }}</view>
      </view>
      <view class="detail-item">
        <view class="title">申请原因:</view>
        <view class="value">{{ reason }}</view>
      </view>
      <!-- <view class="detail-item" v-if="serviceDetail.apply_vouchers">
				<view class="title">申请凭证:</view>
				<view class="value">{{ serviceDetail.apply_vouchers }}</view>
			</view> -->
      <view class="detail-item" v-if="serviceDetail.problemDesc">
        <view class="title">问题描述:</view>
        <view class="value">{{ serviceDetail.problemDesc }}</view>
      </view>

      <view class="detail-item" v-if="
          serviceDetail.afterSaleImage &&
          serviceDetail.afterSaleImage.split(',').length != 0
        ">
        <view v-for="(img, index) in serviceDetail.afterSaleImage.split(',')" :key="index">
          <u-image width="100" height="100" :src="img" @click="preview(serviceDetail.afterSaleImage.split(','), index)"
            ></u-image>
        </view>
      </view>
      <!-- 如果服务类型为退款则不显示 -->
      <view class="detail-item"
        v-if="serviceDetail.serviceType != 'RETURN_MONEY' && serviceDetail.serviceStatus != 'APPLY'">
        <view class="title">收货地址:</view>
        <view class="value">
          <span v-if="storeAfterSaleAddress.salesConsigneeAddressPath">{{
            storeAfterSaleAddress.salesConsigneeAddressPath
          }}</span>
        </view>
      </view>
      <!-- 如果服务类型为退款则不显示 -->
      <view class="detail-item"
        v-if="serviceDetail.serviceType != 'RETURN_MONEY'  && serviceDetail.serviceStatus != 'APPLY'">
        <view class="title">联系人:</view>
        <view class="value">{{ storeAfterSaleAddress.salesConsigneeName }}</view>
      </view>
      <!-- 如果服务类型为退款则不显示 -->
      <view class="detail-item"
        v-if="serviceDetail.serviceType != 'RETURN_MONEY'  && serviceDetail.serviceStatus != 'APPLY'">
        <view class="title">联系方式:</view>
        <view class="value">{{
          storeAfterSaleAddress.salesConsigneeMobile
            ? secrecyMobile(storeAfterSaleAddress.salesConsigneeMobile)
            : ''
        }}</view>
      </view>
      <view v-if="refundShow">
        <view class="detail-item">
          <view class="title">退款金额:</view>
          <view class="value">{{unitPrice(serviceDetail.flowPrice, "￥")
          }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.agree_price">
          <view class="title">同意退款:</view>
          <view class="value">{{unitPrice(serviceDetail.agree_price, "￥")
          }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.actual_price">
          <view class="title">实际退款:</view>
          <view class="value">{{unitPrice(serviceDetail.actual_price, "￥")
          }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.actual_price">
          <view class="title">退款时间:</view>
          <view class="value">{{unixToDate(serviceDetail.refund_time)
          }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.refund_price !== 0">
          <view class="title">退款方式:</view>
          <view class="value">{{refundWayFilter(serviceDetail.refundWay)
          }}</view>
        </view>
        <view class="detail-item" v-if="accountShow && serviceDetail.refund_price != 0">
          <view class="title">账户类型:</view>
          <view class="value">{{accountTypeFilter(serviceDetail.accountType)
          }}</view>
        </view>
        <view class="detail-item" v-if="
            accountShow && !bankShow && serviceDetail.actualRefundPrice != 0
          ">
          <view class="title">退款账号:</view>
          <view class="value">{{ serviceDetail.bankAccountNumber }}</view>
        </view>
        <view class="detail-item" v-if="bankShow">
          <view class="title">银行名称:</view>
          <view class="value">{{ serviceDetail.bankAccountName }}</view>
        </view>
        <view class="detail-item" v-if="bankShow">
          <view class="title">银行账号:</view>
          <view class="value">{{ serviceDetail.bankAccountNumber }}</view>
        </view>
        <view class="detail-item" v-if="bankShow">
          <view class="title">银行开户名:</view>
          <view class="value">{{ serviceDetail.bankAccountName }}</view>
        </view>
        <view class="detail-item" v-if="bankShow">
          <view class="title">银行开户行:</view>
          <view class="value">{{ serviceDetail.bankDepositName }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.mlogisticsName">
          <view class="title">回寄快递:</view>
          <view class="value">{{ serviceDetail.mlogisticsName }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.mlogisticsNo">
          <view class="title">回寄运单号:</view>
          <view class="value">{{ serviceDetail.mlogisticsNo }}</view>
        </view>
        <view class="detail-item" v-if="serviceDetail.mDeliverTime">
          <view class="title">回寄时间:</view>
          <view class="value">{{ serviceDetail.mDeliverTime }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import {
  unitPrice,
  parseGoodsImageUrl,
  serviceStatusList,
  secrecyMobile,
  unixToDate,
} from '@/utils/filters.js'
import {
  getServiceDetail,
  getStoreAfterSaleAddress,
  getAfterSaleLog,
  getAfterSaleReason,
} from '@/api/after-sale.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const reason = ref('')
const serviceTypeList: Record<string, string> = {
  CANCEL: '取消',
  RETURN_GOODS: '退货',
  EXCHANGE_GOODS: '换货',
  RETURN_MONEY: '退款',
}
const serviceDetail = ref<any>(null)
const logs = ref<any[]>([])
const storeAfterSaleAddress = ref<any>({})
const refundShow = ref(false)
const accountShow = ref(false)
const bankShow = ref(false)
const sn = ref('')

onLoad((options) => {
  uni.setNavigationBarTitle({ title: '服务单详情' })
  sn.value = options?.sn || ''
  loadDetail()
  fetchAddress()
  fetchLog(sn.value)
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function statusFilter(val: string) {
  switch (val) {
    case 'APPLY':
      return '售后服务申请成功，等待商家审核'
    case 'PASS':
      return '售后服务申请审核通过'
    case 'REFUSE':
      return '售后服务申请已被商家拒绝，如有疑问请及时联系商家'
    case 'FULL_COURIER':
      return '申请售后的商品已经寄出，等待商家收货'
    case 'STOCK_IN':
      return '商家已将售后商品入库'
    case 'WAIT_FOR_MANUAL':
      return '等待平台进行人工退款'
    case 'REFUNDING':
      return '商家退款中，请您耐心等待'
    case 'COMPLETED':
      return '售后服务已完成，感谢您的支持'
    case 'ERROR_EXCEPTION':
      return '系统生成新订单异常，等待商家手动创建新订单'
    case 'CLOSED':
      return '售后服务已关闭'
    case 'WAIT_REFUND':
      return '等待平台进行退款'
    default:
      return ''
  }
}

function refundWayFilter(val: string) {
  switch (val) {
    case 'OFFLINE':
      return '账户退款'
    case 'ORIGINAL':
      return '原路退回'
    default:
      return ''
  }
}

function accountTypeFilter(val: string) {
  switch (val) {
    case 'WEIXINPAY':
      return '微信'
    case 'ALIPAY':
      return '支付宝'
    case 'BANK_TRANSFER':
      return '银行卡'
    default:
      return ''
  }
}

function preview(urls: string[], index: number) {
  uni.previewImage({
    current: index,
    urls,
    longPressActions: {
      itemList: ['保存图片'],
      success: () => {},
      fail: () => {},
    },
  })
}

function fetchAddress() {
  getStoreAfterSaleAddress(sn.value).then((res) => {
    if (res.data.success) {
      storeAfterSaleAddress.value = res.data.result
    }
  })
}

function fetchLog(serviceSn: string) {
  getAfterSaleLog(serviceSn).then((res) => {
    logs.value = res.data.result
  })
}

function fetchReasonList(serviceType: string) {
  getAfterSaleReason(serviceType).then((res) => {
    if (res.data.success) {
      reason.value = serviceDetail.value.reason
    }
  })
}

function loadDetail() {
  uni.showLoading({ title: '加载中' })
  getServiceDetail(sn.value).then((res) => {
    hideLoadingIfNeeded()
    serviceDetail.value = res.data.result
    if (
      serviceDetail.value.serviceType == 'RETURN_GOODS' ||
      serviceDetail.value.serviceType === 'RETURN_MONEY'
    ) {
      refundShow.value = true
    }

    accountShow.value =
      (serviceDetail.value.serviceType === 'RETURN_GOODS' ||
        serviceDetail.value.serviceType === 'ORDER_CANCEL') &&
      serviceDetail.value.refundWay === 'OFFLINE'

    bankShow.value =
      serviceDetail.value.accountType === 'BANK_TRANSFER' &&
      serviceDetail.value.refundWay === 'OFFLINE' &&
      ((serviceDetail.value.serviceType === 'RETURN_GOODS') |
        (serviceDetail.value.serviceType === 'ORDER_CANCEL') ||
        serviceDetail.value.serviceType === 'RETURN_MONEY')

    fetchReasonList(serviceDetail.value.serviceType)
  })
}

function navigateToGoodsDetail(item: any) {
  uni.navigateTo({
    url: `/pages/product/goods?id=${item.id}&goodsId=${item.goodsId}`,
  })
}

function onProgress() {
  uni.navigateTo({
    url: `./applyProgress?sn=${
      serviceDetail.value.sn
    }&createTime=${encodeURIComponent(serviceDetail.value.createTime)}
         &logs=${encodeURIComponent(JSON.stringify(logs.value))}&serviceStatus=${
      serviceDetail.value.serviceStatus
    }`,
  })
}
</script>

<style lang="scss" scoped>
page {
  background: $page-color-base;
}

.after-sales-goods-detail-view {
  background-color: #fff;

  .header {
    background-color: #f7f7f7;
    color: #999999;
    font-size: 22rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    line-height: 70rpx;

    .seller-name {
      color: $main-color;
    }
  }

  .apply-info-view {
    background: $page-color-base;
    padding-bottom: 8rpx;
  }

  .goods-info {
    background: #fff;
  }

  .goods-item-view {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 24rpx 30rpx;
    background-color: #eef1f2;

    .goods-img {
      flex-shrink: 0;
      width: 131rpx;
      height: 131rpx;
      border-radius: 6rpx;
      overflow: hidden;
    }

    .goods-content {
      flex: 1;
      min-width: 0;
      padding-left: 24rpx;

      .goods-title {
        margin-bottom: 12rpx;
        font-size: 26rpx;
        line-height: 1.4;
        color: $font-color-dark;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        word-break: break-all;
      }

      .goods-price {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 24rpx;
        color: #999999;

        .price {
          color: $light-color;
          font-size: 28rpx;
        }

        .num {
          flex-shrink: 0;
          margin-left: 16rpx;
        }
      }
    }
  }
}

.status-info {
  display: flex;
  background-color: $light-color;
  padding: 32rpx 54rpx 56rpx;

  .status-info-box {
    display: flex;
    flex-direction: column;
    color: #fff;
    line-height: 1.5;

    .status-val {
      font-size: 32rpx;
      font-weight: 600;
    }

    .status-tip {
      margin-top: 12rpx;
      font-size: 24rpx;
      opacity: 0.95;
    }
  }
}

.log-box-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: -36rpx 22rpx 0;
  padding: 28rpx 32rpx;
  background-color: #fff;
  border-radius: 22rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);

  .top01 {
    flex: 1;
    min-width: 0;
    padding-right: 16rpx;

    .log-title {
      font-size: 28rpx;
      color: #333;
      line-height: 1.4;
    }

    .log-first-show {
      margin-top: 12rpx;
      font-size: 22rpx;
      color: #8c8c8c;
      line-height: 1.4;
    }
  }
}

.info-box {
  background-color: #eef1f2;
}

.apply-detail-view {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 8rpx 30rpx 30rpx;
  color: #666666;

  .detail-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24rpx 0;
    font-size: 28rpx;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .title {
      flex-shrink: 0;
      width: 160rpx;
      color: #333;
    }

    .value {
      flex: 1;
      min-width: 0;
      text-align: right;
      color: #666;
      word-break: break-all;
    }
  }
}
</style>
