<template>
  <view :style="themeStyle" class="page-wrap">
    <scroll-view scroll-y class="page-scroll">
      <up-form
        :model="form"
        ref="uForm"
        label-position="left"
        label-width="180rpx"
      >
        <view class="after-sales-goods-detail-view">
        <view class="header">
          <view>
            本次售后服务将由
            <text class="seller-name">{{ sku.storeName }}</text>
            为您提供
          </view>
        </view>
        <view>
          <template v-for="(item,index) in sku.orderItems" :key="index">
          <view class="goods-item-view" v-if="item && item.sn == sn"
            @click="gotoGoodsDetail(sku.goodsId || sku.goods_id)">
            <view class="goods-img">
              <u-image
                border-radius="6"
                width="131rpx"
                height="131rpx"
                mode="aspectFill"
                :src="getGoodsImage(item)"
              ></u-image>
            </view>
            <view class="goods-info">
              <view class="goods-title">{{ getGoodsName(item) }}</view>
              <view class="goods-price">
                <text>￥{{ unitPrice(displayRefundPrice) }}</text>
                <text class="num">购买数量: {{ item.num || 0 }}</text>
              </view>
            </view>
          </view>
          </template>
        </view>
        <view class="after-num">
          <text class="after-num-label">申请数量</text>
          <u-number-box
            :value="applyNum"
            disabled-input
            :min="1"
            :max="maxApplyNum"
            bg-color="#fff"
            @change="valChange"
          ></u-number-box>
        </view>
      </view>

      <view class="body-view">
        <!-- 退款原因 -->
        <view class="opt-view form-block">
          <view class="form-row" @click="openReasonPicker">
            <text class="form-row-label">申请原因</text>
            <view class="form-row-value">
              <text class="form-value" :class="{ placeholder: !form.reason }">
                {{ form.reason || '请选择申请原因' }}
              </text>
              <u-icon name="arrow-right" color="#ccc" size="16"></u-icon>
            </view>
          </view>
          <up-form-item label="申请说明" label-width="180rpx" :border-bottom="false" class="desc-item">
            <u-input
              v-model="form.problemDesc"
              type="textarea"
              border="none"
              input-align="right"
              height="120"
              placeholder="请描述申请售后的说明"
            />
          </up-form-item>
        </view>

        <!-- 退款方式 / 银行信息 -->
        <view class="opt-view form-block">
          <up-form-item label="退款方式" label-width="180rpx" :border-bottom="true">
            <view class="form-value">{{
              applyInfo.refundWay == 'ORIGINAL' ? '原路退回' : '账号退款'
            }}</view>
          </up-form-item>
          <template v-if="
              applyInfo.accountType === 'BANK_TRANSFER' &&
              applyInfo.applyRefundPrice != 0
            ">
            <up-form-item label="银行开户行" label-width="180rpx" :border-bottom="true">
              <u-input
                v-model="form.bankDepositName"
                border="none"
                input-align="right"
                placeholder="请输入银行开户行"
              />
            </up-form-item>
            <up-form-item label="银行开户名" label-width="180rpx" :border-bottom="true">
              <u-input
                v-model="form.bankAccountName"
                border="none"
                input-align="right"
                placeholder="请输入银行开户名"
              />
            </up-form-item>
            <up-form-item label="银行账号" label-width="180rpx" :border-bottom="true" class="bank-account-item">
              <u-input
                v-model="form.bankAccountNumber"
                border="none"
                input-align="right"
                placeholder="请输入银行账号"
              />
            </up-form-item>
          </template>

          <up-form-item
            v-if="form.serviceType !== 'RETURN_MONEY'"
            label="返回方式"
            label-width="180rpx"
            :border-bottom="false"
          >
            <view class="form-value">快递至第三方卖家</view>
          </up-form-item>
        </view>

        <!-- 上传凭证 -->
        <view class="opt-view upload-block">
          <view class="img-title">上传凭证（最多5张）</view>
          <view class="images-view">
            <u-upload
              :file-list="fileList"
              :auto-upload="false"
              width="150"
              @afterRead="onUploadAfterRead"
              :max-count="5"
            ></u-upload>
          </view>
        </view>

        <view class="opt-tip">提交服务单后，售后专员可能与您电话沟通，请保持手机畅通</view>
      </view>
      </up-form>
    </scroll-view>

    <view class="submit-view">
      <u-button
        type="primary"
        ripple
        shape="circle"
        v-if="applyInfo.refundWay"
        :custom-style="{ backgroundColor: lightColor, width: '100%' }"
        @click="onSubmit"
      >提交申请</u-button>
    </view>
    <u-picker
      v-model:show="reasonSelectShow"
      :columns="[reasonList]"
      keyName="label"
      valueName="value"
      title="申请原因"
      @confirm="reasonSelectConfirm"
    ></u-picker>
    <u-toast ref="toastRef" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { unitPrice, parseGoodsImageUrl } from '@/utils/filters.js'
import { getAfterSaleReason, applyReturn, getAfterSaleInfo } from '@/api/after-sale'
import { isAppointmentOrder } from '@/utils/goodsType.js'
import { computePartialRefundPrice } from '@/utils/appointmentGoods.js'
import { handleUploadAfterRead } from '@/utils/uploadHelper.js'
import storage from '@/utils/storage.js'
import { getThemeStyle } from '@/utils/theme'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const { proxy } = getCurrentInstance()!
const $u = proxy!.$u

const lightColor = computed(() => store.getters.lightColor)

const fileList = ref<any[]>([])
const sn = ref('')
const sku = ref<any>({})
const reasonSelectShow = ref(false)
const reasonList = ref<any[]>([])
const applyInfo = ref<any>({})
const toastRef = ref<any>(null)
const isAppointmentAfterSale = ref(false)

const form = reactive({
  orderItemSn: '',
  skuId: '',
  reason: '',
  problemDesc: '',
  images: [] as string[],
  num: 1,
  goodsId: '',
  accountType: '',
  applyRefundPrice: '',
  refundWay: '',
  serviceType: 'RETURN_GOODS',
  bankDepositName: '',
  bankAccountName: '',
  bankAccountNumber: '',
})

const displayRefundPrice = computed(() => {
  if (!isAppointmentAfterSale.value) return applyInfo.value?.applyRefundPrice
  return computePartialRefundPrice(applyInfo.value, form.num)
})

const maxApplyNum = computed(() => {
  const value = Number(sku.value?.num)
  return value > 0 ? value : 1
})

const applyNum = computed(() => {
  const value = Number(form.num)
  return value > 0 ? value : 1
})

onLoad((options) => {
  let navTitle = '申请售后'
  form.serviceType = 'RETURN_GOODS'
  if (options?.value == '1') {
    navTitle = '申请退货'
    form.serviceType = 'RETURN_GOODS'
  }
  if (options?.value == '2') {
    navTitle = '申请换货'
    form.serviceType = 'EXCHANGE_GOODS'
  }
  if (options?.value == '3') {
    navTitle = '申请退款'
    form.serviceType = 'RETURN_MONEY'
  }
  uni.setNavigationBarTitle({ title: navTitle })
  sn.value = options?.sn || ''
  const cached = storage.getAfterSaleData()
  sku.value = cached && typeof cached === 'object' ? cached : { orderItems: [] }
  if (!Array.isArray(sku.value.orderItems)) sku.value.orderItems = []
  isAppointmentAfterSale.value = isAppointmentOrder(sku.value?.orderType)
  form.orderItemSn = options?.sn || ''
  form.skuId = sku.value.skuId || ''
  form.num = Number(sku.value.num) > 0 ? Number(sku.value.num) : 1
  form.goodsId = sku.value.goodsId || ''
  fetchReasonActions(form.serviceType)
  init(options?.sn || '')
})

function hideLoadingIfNeeded() {
  if (store.state.isShowToast) uni.hideLoading()
}

function getGoodsName(item: any) {
  return item.goodsName || item.name || ''
}

function getGoodsImage(item: any) {
  const image = item.image || item.goodsImage || item.thumbnail
  return parseGoodsImageUrl(image)
}

function gotoGoodsDetail(goodsId: string) {
  if (!goodsId) return
  uni.navigateTo({
    url: `/pages/product/goods?id=${form.skuId}&goodsId=${goodsId}`,
  })
}

async function fetchReasonActions(serviceType: string) {
  uni.showLoading({ title: '加载中' })
  await getAfterSaleReason(serviceType).then((res) => {
    if (res.data.success) {
      reasonList.value = res.data.result.map((item: any) => ({
        value: item.id,
        label: item.reason,
      }))
    }
  })
  hideLoadingIfNeeded()
}

function init(orderItemSn: string) {
  getAfterSaleInfo(orderItemSn).then((response) => {
    if (response.data.code == 400) {
      uni.showToast({
        title: response.data.message,
        duration: 2000,
        icon: 'none',
      })
    } else {
      const result = response.data.result
      applyInfo.value = {
        ...result,
        totalNum: result.orderItemNum || sku.value?.num,
      }
      form.accountType = result.accountType
    }
  })
}

function openReasonPicker() {
  if (!reasonList.value.length) {
    uni.showToast({ title: '暂无可选原因', icon: 'none' })
    return
  }
  reasonSelectShow.value = true
}

function reasonSelectConfirm(val: any) {
  const selected = val?.value?.[0] || val?.[0]
  if (selected) {
    form.reason = selected.label || selected.text || ''
  }
}

function valChange(e: { value: number }) {
  form.num = e.value
  if (isAppointmentAfterSale.value) {
    applyInfo.value = {
      ...applyInfo.value,
      applyRefundPrice: computePartialRefundPrice(applyInfo.value, form.num),
    }
  }
}

function onUploadAfterRead(event: any) {
  handleUploadAfterRead(event, fileList.value, (urls) => {
    form.images = urls
  })
}

function showToast(message: string, type = 'error') {
  const text = message || (type === 'success' ? '操作成功' : '操作失败')
  if (toastRef.value) {
    toastRef.value.show({ message: text, type })
    return
  }
  uni.showToast({
    title: text,
    icon: type === 'success' ? 'success' : 'none',
  })
}

function onSubmit() {
  if (!validateFormParams()) return

  uni.showLoading({ title: '加载中' })
  form.accountType = applyInfo.value.accountType
  form.refundWay = applyInfo.value.refundWay
  form.applyRefundPrice = isAppointmentAfterSale.value
    ? computePartialRefundPrice(applyInfo.value, form.num)
    : applyInfo.value.applyRefundPrice

  applyReturn(sn.value, form).then((resp) => {
    hideLoadingIfNeeded()
    if (resp.data.success) {
      showToast('提交成功', 'success')
      uni.redirectTo({ url: '/pages/order/afterSales/applySuccess' })
    } else {
      showToast(resp.data.message || '提交失败', 'error')
    }
  })
}

function validateFormParams() {
  if ($u.test.isEmpty(form.reason)) {
    showToast('请选择退款原因')
    return false
  }
  if ($u.test.isEmpty(form.problemDesc)) {
    showToast('请输入退款说明')
    return false
  }

  if (
    applyInfo.value.accountType === 'BANK_TRANSFER' &&
    applyInfo.value.applyRefundPrice != 0
  ) {
    if ($u.test.isEmpty(form.bankDepositName)) {
      showToast('请输入银行开户行')
      return false
    }
    if ($u.test.isEmpty(form.bankAccountName)) {
      showToast('请输入银行开户名')
      return false
    }
    if ($u.test.isEmpty(form.bankAccountNumber)) {
      showToast('请输入银行账号')
      return false
    }
    if ($u.test.chinese(form.bankAccountName) === false) {
      showToast('银行开户名需为中文')
      return false
    }
    if ($u.test.chinese(form.bankDepositName) === false) {
      showToast('银行开户行需为中文')
      return false
    }
  }

  return true
}
</script>

<style lang="scss" scoped>
page {
  background: $page-color-base;
  height: 100%;
}

.page-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: $page-color-base;
}

.page-scroll {
  flex: 1;
  height: 0;
  box-sizing: border-box;
}

.body-view {
  padding-bottom: 24rpx;
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

    .goods-info {
      flex: 1;
      min-width: 0;
      padding-left: 24rpx;

      .goods-title {
        margin-bottom: 12rpx;
        color: $font-color-dark;
        font-size: 26rpx;
        line-height: 1.4;
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
        font-size: 28rpx;
        color: $light-color;

        .num {
          flex-shrink: 0;
          margin-left: 16rpx;
          font-size: 24rpx;
          color: #999999;
        }
      }
    }
  }
}

.after-num {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 30rpx;
  padding: 24rpx 0;
  border-top: 1px solid #f0f0f0;

  .after-num-label {
    font-size: 30rpx;
    color: #333;
  }
}

.opt-tip {
  margin-top: 20rpx;
  padding: 10rpx 30rpx 30rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.6;
}

.opt-view {
  background-color: #fff;
  margin-top: 20rpx;
}

.form-block {
  padding: 0;

  .form-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 100rpx;
    padding: 0 30rpx;
    border-bottom: 1px solid #f0f0f0;

    .form-row-label {
      flex-shrink: 0;
      width: 150rpx;
      font-size: 30rpx;
      color: #333;
    }

    .form-row-value {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 8rpx;
    }
  }

  :deep(.u-form-item) {
    padding: 0 30rpx;
    min-height: 100rpx;
  }

  :deep(.u-form-item__body) {
    min-height: 100rpx;
    align-items: center;
  }

  :deep(.u-form-item__body__left__content__label) {
    font-size: 30rpx;
    color: #333;
  }

  :deep(.u-form-item__body__right__content__slot) {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  :deep(.u-input) {
    padding: 0 !important;
  }

  :deep(.u-input__content) {
    background: transparent !important;
  }

  :deep(.u-input__content__field-wrapper__field) {
    font-size: 28rpx !important;
    color: #666 !important;
  }
}

.upload-block {
  padding: 24rpx 30rpx 30rpx;

  .img-title {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 20rpx;
  }

  .images-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}

.form-value {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #666;

  &.placeholder {
    color: #c0c4cc;
  }
}

.desc-item {
  :deep(.u-form-item__body) {
    align-items: flex-start;
    padding-top: 24rpx;
    padding-bottom: 24rpx;
    min-height: auto;
  }

  :deep(.u-form-item__body__left) {
    padding-top: 8rpx;
  }

  :deep(.u-form-item__body__right__content__slot) {
    justify-content: flex-end;
    align-items: flex-start;
  }

  :deep(.u-input__content__field-wrapper__field) {
    text-align: right !important;
  }

  :deep(.u-input__content__field-wrapper__field--placeholder) {
    text-align: right !important;
  }
}

.submit-view {
  flex-shrink: 0;
  z-index: 999;
  box-sizing: border-box;
  padding: 16rpx 32rpx calc(16rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  border-top: 1px solid #f2f2f2;
}
</style>
