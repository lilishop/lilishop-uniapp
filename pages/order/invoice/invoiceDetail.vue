<template>
  <view :style="themeStyle" class="invoice-detail">
    <view class="block-item flex-center">
      <view>
        <view>
          {{order.receiptType || "-"}}
          <view class="circle">
            <view></view>
          </view>
        </view>
        <view>{{unitPrice(order.receiptPrice, '￥')}}</view>
      </view>
    </view>
    <view class="common-msg flex-center">
      <view>
        <view>发票抬头</view>
        <view>{{order.receiptTitle || "-"}}</view>
      </view>
      <view>
        <view>发票状态</view>
        <view class="invoice_status">
          {{order.receiptStatus === 1 ? "已开具" : "暂未开具"}}
          <text
            v-if="order.receiptStatus === 1"
            class="invoice-link"
            @click="viewInvoice"
          >查看发票</text>
        </view>
      </view>
    </view>
    <u-cell-group :border="false">
      <u-cell title="发票类型" :border-top="false" :value="order.receiptType || '-'" :isLink="false"></u-cell>
      <u-cell title="发票内容" :value="order.receiptContent" :isLink="false"></u-cell>
      <u-cell :title="title_type + '名称'" :value="getTitleNameValue()" :isLink="false"></u-cell>
      <u-cell title="纳税人识别号" v-if="order.taxpayerId" :value="order.taxpayerId" :isLink="false"></u-cell>
      <u-cell title="单位地址" v-if="order.companyAddress" :value="order.companyAddress" :isLink="false"></u-cell>
      <u-cell title="单位电话" v-if="order.companyPhone" :value="order.companyPhone" :isLink="false"></u-cell>
      <u-cell title="开户银行" v-if="order.bankName" :value="order.bankName" :isLink="false"></u-cell>
      <u-cell title="银行账号" v-if="order.bankAccount" :value="order.bankAccount" :isLink="false"></u-cell>
      <u-cell title="收票人手机" :value="order.receiptPhone" :isLink="false"></u-cell>
      <u-cell title="收票人邮箱" v-if="order.receiptEmail" :value="order.receiptEmail" :isLink="false"></u-cell>
    </u-cell-group>
    <u-popup
      v-model:show="showInvoicePopup"
      mode="center"
      width="90%"
      border-radius="20"
    >
      <view class="invoice-popup">
        <u-image
          width="100%"
          height="800rpx"
          mode="aspectFit"
          :src="order.invoiceAddress"
          @click="previewImageInvoice"
        ></u-image>
        <view class="invoice-popup-actions">
          <view class="invoice-popup-btn" @click="downloadImageInvoice">下载发票</view>
        </view>
      </view>
    </u-popup>
    <!-- <u-cell-group :border="false" style="margin-top: 20rpx;">
      <u-cell title="订单状态" :border-top="false" :value="order.order_status_text" :isLink="false"></u-cell>
      <u-cell title="订单编号" :value="order.sn" :isLink="false"></u-cell>
    </u-cell-group> -->
    <!-- <view class="show-pic" @click="preview">

      <text>点击预览发票</text>
    </view>
    <button class="btn" @click="download">下载电子发票</button>
    <view class="block-2-view" v-for="(item,index) in order.elec_file_list" :key="index">
      <u-image width="300" height="150" :src="item"></u-image>
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getReceiptDetail } from '@/api/order.js'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const order = ref<Record<string, any>>({})
const title_type = ref('')
const showInvoicePopup = ref(false)

onLoad((options) => {
  loadData(options.id)
})

function loadData(id: string) {
  getReceiptDetail(id).then((res) => {
    const result = res.data.result
    order.value = result
    title_type.value = result.companyName || result.taxpayerId ? '单位' : '个人'
  })
}

function getTitleNameValue() {
  return title_type.value === '单位'
    ? order.value.companyName || '-'
    : order.value.personalName || '-'
}

function viewInvoice() {
  if (!order.value.invoiceAddress) {
    uni.showToast({
      title: '暂无发票地址',
      duration: 2000,
      icon: 'none',
    })
    return
  }
  if (isImageInvoice()) {
    showInvoicePopup.value = true
    return
  }
  // #ifdef APP-PLUS
  plus.runtime.openURL(order.value.invoiceAddress)
  // #endif
  // #ifndef APP-PLUS
  uni.navigateTo({
    url: '/pages/tabbar/home/web-view?src=' + encodeURIComponent(order.value.invoiceAddress),
  })
  // #endif
}

function isImageInvoice() {
  const url = (order.value.invoiceAddress || '').split('?')[0].toLowerCase()
  return /\.(png|jpe?g|gif|bmp|webp)$/.test(url)
}

function previewImageInvoice() {
  if (!order.value.invoiceAddress) return
  uni.previewImage({
    current: 0,
    urls: [order.value.invoiceAddress],
  })
}

function downloadImageInvoice() {
  if (!order.value.invoiceAddress) {
    uni.showToast({
      title: '暂无发票可下载',
      duration: 2000,
      icon: 'none',
    })
    return
  }
  uni.downloadFile({
    url: order.value.invoiceAddress,
    success: (res) => {
      if (res.statusCode !== 200) {
        uni.showToast({
          title: '下载失败',
          duration: 2000,
          icon: 'none',
        })
        return
      }
      const tempFilePath = res.tempFilePath
      // #ifdef H5
      const link = document.createElement('a')
      link.href = tempFilePath || order.value.invoiceAddress
      link.download = 'invoice'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // #endif
      // #ifndef H5
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
          uni.showToast({
            title: '发票已保存到相册',
            duration: 2000,
            icon: 'none',
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            duration: 2000,
            icon: 'none',
          })
        },
      })
      // #endif
    },
    fail: () => {
      uni.showToast({
        title: '下载失败',
        duration: 2000,
        icon: 'none',
      })
    },
  })
}
</script>

<style lang="scss" scoped>
.block-item {
  height: 217rpx;
  width: 100%;
  position: relative;
  > view {
    color: #ff6262;
  }
  > view:first-child {
    text-align: center;
    line-height: 3em;
    > view:first-child {
      position: relative;
      .circle {
        width: 166rpx;
        height: 65rpx;
        border: 1px solid #ff6262;
        border-radius: 100%;
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        margin: auto;
        view {
          width: 130rpx;
          height: 40rpx;
          border: 1px solid #ff6262;
          border-radius: 100%;
          top: 0;
          right: 0;
          left: 0;
          bottom: 0;
          margin: auto;
          position: absolute;
        }
      }
    }
    > view:last-child {
      font-size: 40rpx;
    }
  }
}

.common-msg {
  flex-direction: row;
  padding: 20rpx;
  height: 118rpx;
  background-color: #ffffff;
  margin-bottom: 20rpx;

  > view {
    width: 50%;
    text-align: center;
    color: #666666;
    line-height: 1.5em;
    view {
      font-size: 24rpx;
    }
    .invoice_status {
      color: #ff6262;
      .invoice-link {
        margin-left: 12rpx;
        color: $main-color;
      }
    }
  }

  > view:first-child {
    border-right: 1px solid #eee;
  }
}
.show-pic {
  text-align: center;
  margin-top: 40rpx;
  image {
    width: 27rpx;
    height: 27rpx;
    margin-right: 10rpx;
    vertical-align: middle;
  }
  text {
    color: $main-color;
    font-size: $font-sm;
  }
}

.invoice-popup {
  padding: 30rpx;
  background: #f2f3f5;
}

.invoice-popup-actions {
  margin-top: 30rpx;
  background: #f2f3f5;
}

.invoice-popup-btn {
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  background: $main-color;
  color:rgb(255, 255, 255);
}

.u-cell {
  padding: 35rpx 20rpx;
  min-height: 110rpx;
  height: auto;
  color: #333333;
}

::v-deep .u-cell__value {
  flex: 1.6;
  overflow: visible;
}

::v-deep .u-cell__value-text {
  white-space: normal;
  word-break: break-all;
}
</style>
