<template>
  <view :style="themeStyle">
    <!-- 商品模块 -->
    <view class="seller-view">
      <view class="seller-info u-flex u-row-between">
        <view class="seller-name">
          <view class="name">{{ order.storeName || "" }}</view>
          <view class="status">{{ orderStatusMap[order.orderStatus] }}</view>
        </view>
        <view class="order-sn"></view>
      </view>
      <u-line color="#DCDFE6"></u-line>
      <template v-for="(sku, index) in orderGoodsList" :key="index">
      <view class="goods-item-view" v-if="sku.skuId == skuId">
        <view class="goods-img">
          <u-image border-radius="6" width="131rpx" height="131rpx" :src="sku.image"></u-image>
        </view>
        <view class="goods-info">
          <view class="goods-title u-line-2">{{ sku.goodsName }}</view>
          <view class="goods-price">
            ￥{{unitPrice(sku.flowPrice) }}
          </view>
        </view>
        <view class="goods-num">
          <view>x{{ sku.num }}</view>
        </view>
      </view>
      </template>
    </view>

    <!-- 投诉主题 -->
    <u-select @confirm="confirmComplain" v-model:show="complainShow" :list="complainList"></u-select>
    <!-- 投诉模块 -->
    <view class="cell">
      <view class="cell-item between" @click="complainShow = true">
        <view class="cell-title"> 投诉主题 </view>
        <view class="cell-view"> {{ complainTopic }} </view>
        <u-icon style="margin-left: 20rpx" name="arrow-down"></u-icon>
      </view>

      <view class="cell-item complain-content">
        <view class="cell-title title"> 投诉内容 </view>
        <view class="cell-view content">
          <u-input type="textarea" height="70rpx" auto-height v-model="complainValue" />
        </view>
      </view>
      <view class="cell-item">
        <view class="cell-title"> 投诉凭证 </view>
        <view class="cell-view">
          <u-upload :file-list="uploadFileList" :auto-upload="false" width="200" @afterRead="onUploadAfterRead" :max-count="5">
          </u-upload>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="handleSubmit">提交</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getOrderDetail } from '@/api/order.js'
import { getComplainReason, addComplain } from '@/api/after-sale.js'
import { handleUploadAfterRead } from '@/utils/uploadHelper.js'
import { unitPrice } from '@/utils/filters.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const orderStatusMap: Record<string, string> = {
  UNDELIVERED: '待发货',
  PARTS_DELIVERED: '部分发货',
  UNPAID: '未付款',
  PAID: '已付款',
  DELIVERED: '已发货',
  CANCELLED: '已取消',
  COMPLETE: '已完成',
  TAKE: '已完成',
}

const uploadFileList = ref<any[]>([])
const complainValue = ref('')
const complainShow = ref(false)
const complainTopic = ref('')
const complainList = ref<any[]>([])
const images = ref<string[]>([])
const order = ref<Record<string, any>>({})
const orderGoodsList = ref<any[]>([])
const sn = ref('')
const skuId = ref('')

onLoad((option) => {
  loadData(option.sn)
  sn.value = option.sn
  skuId.value = option.skuId
  getReasion()
})

function onUploadAfterRead(event: any) {
  handleUploadAfterRead(event, uploadFileList.value, (urls) => {
    images.value = urls
  })
}

function handleSubmit() {
  if (!images.value.length && !complainValue.value) {
    uni.showToast({
      title: '请上传图片凭证和投诉内容',
      icon: 'none',
    })
    return
  }
  const goods = orderGoodsList.value.filter((item) => item.skuId == skuId.value)
  const data = {
    complainTopic: complainTopic.value,
    content: complainValue.value,
    goodsId: goods[0].goodsId,
    images: images.value,
    orderSn: sn.value,
    skuId: skuId.value,
  }
  addComplain(data).then((res) => {
    if (res.data.success) {
      uni.showToast({
        title: '提交成功!',
        duration: 2000,
        icon: 'none',
      })
      setTimeout(() => {
        uni.redirectTo({
          url: '/pages/order/complain/complainList',
        })
      }, 1000)
    }
  })
}

function getReasion() {
  getComplainReason().then((res) => {
    if (res.data.result.length >= 1) {
      res.data.result.forEach((item: any) => {
        complainList.value.push({
          value: item.reason,
          label: item.reason,
        })
      })
      complainTopic.value = res.data.result[0].reason
    }
  })
}

function loadData(orderSn: string) {
  uni.showLoading({ title: '加载中' })
  getOrderDetail(orderSn).then((res) => {
    const result = res.data.result
    order.value = result.order
    orderGoodsList.value = result.orderItems
    if (store.state.isShowToast) uni.hideLoading()
    if (result?.order?.orderStatus === 'CANCELLED') {
      uni.showToast({ title: '订单已取消，无法发起投诉', icon: 'none' })
      setTimeout(() => { uni.navigateBack() }, 1500)
    }
  })
}

function confirmComplain(e: any[]) {
  complainTopic.value = e[0].label
}
</script>

<style lang="scss" scoped>
@import "../goods.scss";
.cell {
  width: 100%;
  background: #fff;
  padding: 26rpx;
}
.cell-item {
  padding: 30rpx 0;
  border-bottom: 2rpx solid #f5f7fa;
  display: flex;
  align-items: center;
}
.complain-content {
  display: flex;
  align-items: center;
  .content {
    width: 100%;
  }
  .title {
    width: 140rpx;
  }
}

::v-deep .u-input__textarea {
  padding: 0;
}
.cell-title {
  font-weight: bold;
  margin-right: 20rpx;
}
.submit-btn {
  width: 70%;
  margin: 0 auto;
  height: 80rpx;
  line-height: 80rpx;
  color: #fff;
  text-align: center;
  background: $light-color;
  margin-top: 20px;
  border-radius: 200px;
}
</style>
