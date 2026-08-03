<template>
  <view>
    <!-- 订单状态 -->
    <div class="info-view order-view">
      <div class="order-status" v-if="orderStatusMap[order.orderStatus]">
        <view class="order-status-title">{{ orderStatusMap[order.orderStatus].title }}</view>
        <view class="order-status-desc">{{ orderStatusMap[order.orderStatus].value }}</view>
      </div>

    </div>
    <!-- 物流信息 / 卡密入口 -->
    <view class="info-view logistics-view">
      <view class="logistics-List">
        <view v-if="isECouponOrder" class="card-key-entry">
          <view v-if="ecouponCardKeyDelivered" class="card-key-entry__btn" @click="goCardKeyDetail">
            查看卡密
          </view>
          <view v-else-if="order.orderStatus === 'CANCELLED'" class="card-key-entry__tip">
            订单已关闭
          </view>
          <view v-else class="card-key-entry__tip">
            {{ ecouponPendingMessage || '卡密尚未发放，请稍后刷新' }}
          </view>
        </view>
        <view class="verificationCode" v-else-if="order.verificationCode">
          券码： {{ order.orderStatus == 'CANCELLED' ?  '已失效' : order.verificationCode }}
        </view>
		<view @click="handleClickDeliver()" class="info-view logi-view"  v-else-if="orderPackage && orderPackage.length">
		  <view class="verificationCode">
		      当前订单有 {{ orderPackage.length }} 个包裹快递
		  </view>
		  <div>
		      点击此处查看
		  </div>
		</view>
        <view v-else-if="!isECouponOrder" class="logistics-List-title">
          {{ '暂无物流信息' }}
        </view>
      </view>
    </view>
    <!-- 地址 -->
    <view class="info-view" v-if="order.deliveryMethod === 'LOGISTICS' && !isNonPhysicalOrder">
      <view class="address-view">
        <view>
          <view class="address-title">
            <span>{{ order.consigneeName || "未填写昵称" }}</span>
            <span>{{ order.consigneeMobile ? secrecyMobile(order.consigneeMobile) : '未填写手机号' }}</span>
          </view>
          <view class="address">地址：{{ order.consigneeAddressPath }}
            {{ order.consigneeDetail }}</view>
        </view>
      </view>
    </view>

    <!-- 提货地址 -->
    <view class="info-view" v-if="order.deliveryMethod === 'SELF_PICK_UP'">
      <view class="address-view">
        <view>
          <view class="order-info-view">
            <view class="title">自提点地址:</view>
            <view class="value address-line-height">{{ order.storeAddressPath }}</view>
          </view>
          <view class="order-info-view" @click="handleCallPhone" >
            <view class="title">联系方式:</view>
            <view class="value">{{ order.storeAddressMobile }}<u-icon name='phone-fill' ></u-icon></view>
          </view>
         
        </view>
      </view>
    </view>

    <!-- 商品信息 -->
    <view>
      <view class="seller-view">
        <!-- 店铺名称 -->
        <view class="seller-info u-flex u-row-between">
          <view class="seller-name" @click="goToShopPage(order)">
            <view class="name">{{ order.storeName }}</view>
            <view class="status" v-if="orderStatusMap[order.orderStatus]"> {{ orderStatusMap[order.orderStatus].title
            }}</view>
          </view>
          <view class="order-sn"></view>
        </view>
        <view>
          <view v-for="(sku, skuIndex) in orderGoodsList" :key="skuIndex">
            <view class="goods-item-view">
              <view class="goods-img" @click="gotoGoodsDetail(sku)">
                <u-image border-radius="6" width="131rpx" height="131rpx" :src="sku.image"></u-image>
              </view>
              <view class="goods-info" @click="gotoGoodsDetail(sku)">
                <view class="goods-title u-line-2">{{ sku.goodsName }}</view>
                <view class="goods-price">
                  ￥{{unitPrice(sku.goodsPrice) }}
                  <!-- <span v-if="sku.point">+{{ sku.point }}积分</span> -->
				  <span style="font-size: 24rpx;margin-left: 14rpx;color: #ff9900;" v-if="!isECouponOrder && sku.isRefund && sku.isRefund !== 'NO_REFUND'">
				  {{refundPriceList(sku.isRefund)}} ({{unitPrice(sku.refundPrice, "￥") }})
				   </span>
                </view>
              </view>
              <view class="goods-num">
                <view>x{{ sku.num }}</view>
              </view>
            </view>

          </view>
        </view>
      </view>
    </view>
    <view class="info-view">
      <view>
        <view class="order-info-view">
          <view class="title">商品总价：</view>
          <view class="value">￥{{unitPrice(order.goodsPrice) }}</view>
        </view>
        <view class="order-info-view" v-if="order.freightPrice && !isECouponOrder">
          <view class="title">运费：</view>
          <view class="value">￥{{unitPrice(order.freightPrice) }}</view>
        </view>
        <view class="order-info-view" v-if="order.priceDetailDTO && Number(order.priceDetailDTO.couponPrice) > 0">
          <view class="title">优惠券：</view>
          <view class="value main-color">-￥{{unitPrice(order.priceDetailDTO.couponPrice) }}</view>
        </view>
        <view class="order-info-view" v-if="Number(order.discountPrice) > 0">
          <view class="title">活动优惠：</view>
          <view class="value main-color">-￥{{unitPrice(order.discountPrice) }}</view>
        </view>
        <view class="order-info-view" v-if="order.priceDetailDTO && Number(order.priceDetailDTO.giftCardPrice) > 0">
          <view class="title">礼品卡抵扣：</view>
          <view class="value main-color">-￥{{unitPrice(order.priceDetailDTO.giftCardPrice) }}</view>
        </view>
        <!-- <view class="order-info-view" v-if="order.use_point">
					<view class="title">使用积分：</view>
					<view class="value">{{ order.use_point }}</view>
				</view> -->
      </view>
    </view>
    <!-- 客户服务， 售后，取消订单，查看物流，投诉等 -->
    <view class="info-view">
      <view style="width: 100%">
        <view class="order-info-view">
          <view class="title">服务</view>
        </view>
        <view class="customer-list">
          <view class="customer-service"
            v-if="orderDetail.allowOperationVO && orderDetail.allowOperationVO.cancel == true"
            @click="onCancel(order.sn)">取消订单</view>
          <view class="customer-service" v-if="order.orderStatus == 'DELIVERED' && !isECouponOrder" @click="onLogistics(order)">查看物流</view>
          <view class="customer-service" v-if="order.orderStatus != 'UNPAID' && order.orderPromotionType == 'PINTUAN'"
            @click="ByUserMessage(order)">查看拼团信息</view>
            <view class="customer-service"
            @click="contact(order.storeId)">联系客服</view>
        </view>
      </view>
    </view>
    <view class="info-view">
      <view style="width: 100%">
        <view class="order-info-view">
          <view class="title">订单编号：</view>
          <view class="value order-sn-value">
            <text class="order-sn-text">{{ order.sn }}</text>
            <view class="copy" @click.stop="onCopy(order.sn)">
              <u-tag text="复制" type="info" plain size="mini" />
            </view>
          </view>
        </view>
        <view class="order-info-view">
          <view class="title">下单时间：</view>
          <view class="value">{{
              order.createTime
          }}</view>
        </view>
        <view class="order-info-view">
          <view class="title">订单备注：</view>
          <view class="value">{{
              order.remark || '暂无备注'
          }}</view>
        </view>
        <view class="order-info-view">
          <view class="title">支付状态：</view>
          <view class="value">
            {{
                order.payStatus == "UNPAID"
                  ? "未付款"
                  : order.payStatus == "PAID"
                    ? "已付款"
                    : ""
            }}</view>
        </view>
        <view class="order-info-view">
          <view class="title">支付方式：</view>
          <view class="value">{{ orderDetail.paymentMethodValue || '暂无'}}</view>
        </view>
      </view>
    </view>

    <view class="info-view" v-if="order.payStatus == 'PAID'">
      <view>
        <view class="invoice-info-view">
          <view class="invoice-title">发票信息：</view>
          <view v-if="!order.needReceipt" class="value">无需发票</view>
          <view v-else class="value" @click="onReceipt(orderDetail.receipt)">查看发票</view>
        </view>
      </view>
    </view>
    <view style="padding-bottom: 150rpx"></view>

    <view class="bottom_view">
      <view class="btn-view">
        <view class="description">
          <text v-if="order.payStatus === 'PAID'">已付金额：</text>
          <text v-else>应付金额：</text>
          <text class="price" v-if="order.priceDetailDTO">￥{{unitPrice(order.priceDetailDTO.flowPrice) }}</text>
        </view>
        <view class="goods-btn">
          <view
            class="pay-btn"
            v-if="orderDetail.allowOperationVO && orderDetail.allowOperationVO.pay"
            @click="toPay(order)"
          >立即付款</view>
          <view
            class="pay-btn"
            v-if="order.orderStatus == 'DELIVERED' && !isECouponOrder"
            @click="onRog(order.sn)"
          >确认收货</view>
          <view
            class="rebuy-btn"
            v-if="order.orderStatus == 'COMPLETE'"
            @click="onComment(order.sn)"
          >评价商品</view>
        </view>
      </view>
    </view>
    <u-popup class="cancel-popup" v-model:show="cancelShow" mode="bottom" length="60%">
      <view class="header">取消订单</view>
      <view class="body">
        <view class="title">取消订单后，本单享有的优惠可能会一并取消，是否继续？</view>
        <view>
          <u-radio-group v-model="reason">
            <view class="value">
              <view class="radio-view" v-for="(item, index) in cancelList" :key="index">
                <u-radio :active-color="lightColor" shape="circle" :name="item.reason"
                  :label="item.reason" @change="reasonChange"></u-radio>
              </view>
            </view>
          </u-radio-group>
        </view>
      </view>
      <view class="footer">
        <u-button size="medium" v-if="reason" shape="circle" @click="submitCancel">提交</u-button>
      </view>
    </u-popup>
    <u-toast ref="uToast" />
    <u-modal v-model:show="rogShow" :show-cancel-button="true" :content="'是否确认收货?'" :confirm-color="lightColor"
      @confirm="confirmRog"></u-modal>

    <!-- 分享 -->
    <shares v-if="shareFlag" :thumbnail="orderDetail.orderItems[0].image"
      :goodsName="orderDetail.orderItems[0].goodsName" @close="shareFlag = false" />

  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getExpress, getPackage } from '@/api/trade.js'
import { cancelOrder, confirmReceipt, getOrderDetail } from '@/api/order.js'
import shares from '@/components/m-share/index'
import { getClearReason } from '@/api/after-sale.js'
import {
	unitPrice,
	secrecyMobile,
	setClipboard,
	talkIm,
	callPhone,
} from '@/utils/filters.js'
import {
	isECouponOrder as checkECouponOrder,
	isNonPhysicalOrder as checkNonPhysicalOrder,
	orderHasCardKeyContent,
	collectCardKeyFulfillLines,
	resolveCardKeyFulfillMessage,
	CARD_KEY_FULFILL_STATUS,
} from '@/utils/goodsType.js'

const store = useStore()
const lightColor = computed(() => store.getters.lightColor)
const mainColor = computed(() => store.getters.mainColor)

const orderStatusMap: Record<string, { title: string; value?: string }> = {
	UNPAID: { title: '未付款', value: '商品暂未付款' },
	PAID: { title: '已付款', value: '买家已付款' },
	UNDELIVERED: { title: '待发货', value: '商品等待发货中' },
	PARTS_DELIVERED: { title: '部分发货', value: '商品已部分发货。' },
	DELIVERED: { title: '已发货', value: '商品已发货,请您耐心等待' },
	CANCELLED: { title: '已取消', value: '订单已取消' },
	COMPLETED: { title: '已完成', value: '订单已完成,祝您生活愉快' },
	STAY_PICKED_UP: { title: '待自提', value: '商品正在等待提取' },
	TAKE: { title: '待核验' },
}

const logisticsList = ref<any>('')
const shareFlag = ref(false)
const order = ref<Record<string, any>>({})
const cancelShow = ref(false)
const orderSn = ref('')
const orderGoodsList = ref<any[]>([])
const orderDetail = ref<Record<string, any>>({})
const sn = ref('')
const cancelList = ref<any[]>([])
const rogShow = ref(false)
const reason = ref('')
const orderPackage = ref<any>('')
const giftECouponOrders = ref<any[]>([])

// orderType=E_COUPON：无物流/核销码，卡密见 cardKeyDetail（API-B-01 orderItems[].cardKeys）
const isECouponOrder = computed(() => checkECouponOrder(order.value?.orderType))
const isNonPhysicalOrder = computed(() => checkNonPhysicalOrder(order.value?.orderType))
const ecouponCardKeyDelivered = computed(() =>
	orderHasCardKeyContent(orderGoodsList.value, giftECouponOrders.value)
)
const ecouponPendingMessage = computed(() => {
	const pending = collectCardKeyFulfillLines(
		orderGoodsList.value,
		giftECouponOrders.value
	).find((line) => line.status !== CARD_KEY_FULFILL_STATUS.DELIVERED)
	return pending ? resolveCardKeyFulfillMessage(pending) : ''
})

function hideLoadingIfNeeded() {
	if (store.state.isShowToast) uni.hideLoading()
}

onLoad((options) => {
	const orderSnParam = options?.sn || ''
	sn.value = orderSnParam
	loadData(orderSnParam)
})

function getOrderPackage() {
	getPackage(order.value.sn).then((res) => {
		if (res.data.success) {
			orderPackage.value = res.data.result
		}
	})
}

function handleClickDeliver() {
	uni.navigateTo({
		url: `/pages/order/deliverDetail?order_sn=${order.value.sn}`,
	})
}

function refundPriceList(status: string) {
	switch (status) {
		case 'ALL_REFUND':
			return '全部退款'
		case 'PART_REFUND':
			return '部分退款'
		case 'NO_REFUND':
			return '未退款'
		case 'REFUNDING':
			return '退款中'
		default:
			return ''
	}
}

function handleCallPhone() {
	if (order.value.storeAddressMobile) {
		callPhone(order.value.storeAddressMobile)
	}
}

function contact(storeId: string) {
	talkIm(storeId)
}

function goToShopPage(val: any) {
	uni.navigateTo({
		url: '/pages/product/shopPage?id=' + val.storeId,
	})
}

function loadLogistics(orderSnParam: string) {
	getExpress(orderSnParam).then((res) => {
		logisticsList.value = res.data.result
	})
}

function inviteGroup() {
	shareFlag.value = true
}

function ByUserMessage(orderItem: any) {
	uni.navigateTo({
		url:
			'/pages/cart/payment/shareOrderGoods?sn=' +
			orderItem.sn +
			'&sku=' +
			orderGoodsList.value[0].skuId +
			'&goodsId=' +
			orderGoodsList.value[0].goodsId,
	})
}

function loadData(orderSnParam: string) {
	uni.showLoading({ title: '加载中' })
	getOrderDetail(orderSnParam).then((res) => {
		const result = res.data.result
		order.value = result.order
		orderGoodsList.value = result.orderItems
		orderDetail.value = result
		giftECouponOrders.value = result.giftECouponOrders || []
		if (
			result.order.deliveryMethod === 'LOGISTICS' &&
			!checkECouponOrder(result.order.orderType) &&
			result.order.orderType !== 'VIRTUAL'
		) {
			// E_COUPON 无物流信息
			loadLogistics(orderSnParam)
			getOrderPackage()
		}
		hideLoadingIfNeeded()
	})
}

function goCardKeyDetail() {
	// 仅传 orderSn，卡密在二级页重新请求订单详情，不经路由/Vuex 传递明文
	if (!sn.value) return
	uni.navigateTo({
		url: `/pages/order/cardKey/cardKeyDetail?sn=${sn.value}`,
	})
}

function onReceipt(val: any) {
	uni.navigateTo({
		url: '/pages/order/invoice/invoiceDetail?id=' + val.id,
	})
}

function gotoGoodsDetail(sku: any) {
	uni.navigateTo({
		url: `/pages/product/goods?id=${sku.skuId}&goodsId=${sku.goodsId}`,
	})
}

function onCopy(orderSnText: string) {
	if (!orderSnText) {
		uni.showToast({ title: '暂无订单编号', icon: 'none' })
		return
	}
	setClipboard(String(orderSnText))
}

function onAfterSales(orderSnText: string, sku: any) {
	uni.navigateTo({
		url: `./afterSales/afterSalesSelect?sn=${orderSnText}&sku=${encodeURIComponent(
			JSON.stringify(sku)
		)}`,
	})
}

function toPay(val: any) {
	if (val.sn) {
		uni.navigateTo({
			url: '/pages/cart/payment/payOrder?order_sn=' + val.sn,
		})
	}
}

function onCancel(orderSnText: string) {
	orderSn.value = orderSnText
	uni.showLoading({ title: '加载中' })
	getClearReason().then((res) => {
		if (res.data.result.length >= 1) {
			cancelList.value = res.data.result
		}
		hideLoadingIfNeeded()
	})
	cancelShow.value = true
}

function submitCancel() {
	cancelOrder(orderSn.value, { reason: reason.value }).then((res) => {
		if (res.data.success) {
			uni.showToast({
				title: '已取消',
				duration: 2000,
				icon: 'none',
			})
			cancelShow.value = false
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/order/myOrder?status=0',
				})
			}, 500)
		} else {
			uni.showToast({
				title: res.data.message,
				duration: 2000,
				icon: 'none',
			})
			cancelShow.value = false
		}
	})
}

function onRog(orderSnText: string) {
	orderSn.value = orderSnText
	rogShow.value = true
}

function confirmRog() {
	confirmReceipt(orderSn.value).then((res) => {
		if (res.data.success) {
			uni.showToast({
				title: '已确认收货',
				duration: 2000,
				icon: 'none',
			})
			rogShow.value = false
			loadData(sn.value)
		}
	})
}

function onComment(_orderSnText: string) {
	uni.navigateTo({
		url: './evaluate/myEvaluate',
	})
}

function onLogistics(orderItem: any) {
	uni.navigateTo({
		url:
			'/pages/mine/msgTips/packageMsg/logisticsDetail?logi_id=' +
			orderItem.logi_id +
			'&ship_no=' +
			orderItem.ship_no +
			'&order_sn=' +
			orderItem.sn,
	})
}

function reasonChange(val: string) {
	reason.value = val
}

function reBuy(orderItem: any) {
	uni.navigateTo({
		url: '/pages/product/goods?id=' + orderItem.id + '&goodsId=' + orderItem.goodsId,
	})
}
</script>

<style lang="scss">
@import "./goods.scss";

.goods-item-view {
  .goods-info {
    .goods-title {
      font-size: 24rpx;
      line-height: 1.4;
    }
  }
}

.empty {
  width: 100%;
}

.customer-service {
  background: #ededed;
  // padding: 12rpx 40rpx;
  width: 48%;
  margin: 0 1%;
  height: 55rpx;
  line-height: 55rpx;
  margin-bottom: 10rpx;
  text-align: center;
  font-size: 24rpx;
  border-radius: 10rpx;
}

.customer-list {
  display: flex;
  flex-wrap: wrap;
}

.logistics-view {
  justify-content: space-between;
  padding: 30rpx !important;
  margin: 0 !important;
  transform: translateY(-10px);
}

.order-status {
  color: #fff;
  width: 100%;
  text-align: center;
  margin-top: 36rpx;

  .order-status-title {
    font-size: 44rpx;
    font-weight: 600;
  }

  .order-status-desc {
    font-size: 22rpx;
    font-weight: normal;
    margin-top: 8rpx;
    opacity: 0.95;
  }
}

.logistics-List-title {
  margin-bottom: 10rpx;
  font-size: 26rpx;
}

.logistics-List-time {
  font-size: 24rpx;
  color: #999;
}

.info-detail {
  margin-right: 30rpx;
  color: #333;
}

.order-view {
  margin: 0 !important;
  border-radius: 0 !important;
  width: 100%;
  height: 200rpx;
  padding: 0 !important;
  background-image: linear-gradient(to right,
      $light-color 0%,
      $aider-light-color 100%) !important;
}

page,
.content {
  background: #f1f1f1;
  height: 100%;
}

.info-line {
  align-items: center;
  display: flex;
  border-radius: 30rpx;
  flex-direction: row;
  justify-content: space-between;
  background-color: #fff;
  width: 100%;
  height: 110rpx;
  color: #333333;
  font-size: 28rpx;
  border-bottom: 1rpx solid #eeeeee;

  .info-title {
    margin: 0 30rpx;
    padding: 16rpx 0rpx;
  }
}

.seller-view {
  margin: 20rpx 0;
  padding: 15rpx 0;
  border-radius: 30rpx;
}

.address-title {
  font-size: 26rpx;
  font-weight: bold;

  >span {
    margin-right: 20rpx;
  }
}

.info-view {
  display: flex;
  margin: 0 0 20rpx 0;
  border-radius: 30rpx;
  flex-direction: row;
  padding: 15rpx 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .address-view {
    display: flex;
    flex-direction: row;
    padding: 16rpx 0;

    .address {
      color: $font-color-light;
      overflow: hidden;
      line-height: 1.75;
      font-size: 22rpx;
    }
  }

  .order-info-view {
    line-height: 60rpx;
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 10rpx 0rpx;

    .title {
      color: #666;
      width: 140rpx;
      font-size: 24rpx;
      font-weight: 600;
      flex:3;
      min-width: 160rpx;
    }

    .value {
      color: #666;
      font-size: 24rpx;
      flex:10;
    }

    .order-sn-value {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
    }

    .order-sn-text {
      word-break: break-all;
    }

    .copy {
      margin-left: 16rpx;
      flex-shrink: 0;
    }
  }

  .invoice-info-view {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin: 10rpx 0rpx;

    .invoice-title {
      width: 550rpx;
      font-size: 28rpx;
      color: #333333;
    }

    .value {
      color: $font-color-light;
    }
  }
}

.verificationCode {
  font-weight: bold;
  letter-spacing: 2rpx;
}

.card-key-entry {
  width: 100%;
  text-align: center;
}

.card-key-entry__btn {
  display: inline-block;
  padding: 20rpx 80rpx;
  border: 2rpx solid $main-color;
  border-radius: 12rpx;
  color: $main-color;
  font-size: 28rpx;
  font-weight: 600;
}

.card-key-entry__tip {
  font-size: 26rpx;
  color: #666;
}

.bottom_view {
  width: 100%;
  height: 100rpx;
  background-color: #ffffff;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 99;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);

  .btn-view {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100rpx;
    padding: 0 30rpx;
    font-size: 26rpx;

    .description {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      color: #909399;
      font-size: 26rpx;

      .price {
        color: $main-color;
        font-weight: 600;
      }
    }
  }

  .goods-btn {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    margin-left: 20rpx;
  }

  .pay-btn,
  .rebuy-btn {
    text-align: center;
    font-size: 26rpx;
    padding: 16rpx 36rpx;
    border-radius: 8rpx;
    white-space: nowrap;
  }

  .pay-btn {
    background-color: $main-color;
    color: #ffffff;
  }

  .rebuy-btn {
    color: $light-color;
    border: 1rpx solid $light-color;
    background-color: #ffffff;
  }

  .cancel-btn {
    color: #999999;
    border-color: #999999;
    margin-left: 15rpx;
    height: 60rpx;
  }
}

.cancel-popup {
  .header {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 15rpx 0rpx;
  }

  .body {
    padding: 30rpx;

    .title {
      font-weight: 600;
    }

    .value {
      display: flex;
      flex-direction: column;

      .radio-view {
        margin: 10rpx 0rpx;
      }
    }
  }

  .footer {
    text-align: center;
  }
}
.address-line-height{
  line-height: 1.75;
}
.seller-name{
  >.name{
    flex:10 !important;
  }
  >.status{
    flex:2;
  }
}
</style>
