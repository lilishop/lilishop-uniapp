<template>
  <view :style="themeStyle" class="wap">
    <u-navbar
      title="提现记录"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="true"
    ></u-navbar>
    <scroll-view class="scroll-v view-wrapper" enableBackToTop="true" scroll-with-animation scroll-y @scrolltolower="loadMore">
      <view v-if="records.length != 0" class="view-item" v-for="(item, index) in records" :key="index">
        <view class="view-item-detail">
          <view class="-title">{{ withdrawStatusText(item.applyStatus) }}</view>
          <view class="-number" v-if="item.inspectRemark || item.errorMessage">{{ item.inspectRemark || item.errorMessage }}</view>
        </view>
        <view class="view-item-change">
          <view class="-money">-{{unitPrice(item.applyMoney) }}</view>
          <view class="-time">{{ item.createTime || item.inspectTime || "" }}</view>
          <view v-if="item.applyStatus === 'WAIT_USER_CONFIRM'" class="confirm-btn" @click.stop="confirmWechatReceive(item)">确认收款</view>
        </view>
      </view>

      <u-empty v-if="loaded && records.length == 0" mode="history" text="暂无记录" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getWithdrawApplyPage, getWithdrawApplyWechatTransferInfo } from '@/api/members'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const loaded = ref(false)
const params = ref({
  pageNumber: 1,
  pageSize: 10,
  order: 'desc',
})
const records = ref<any[]>([])

onShow(() => {
  params.value.pageNumber = 1
  records.value = []
  loaded.value = false
  getData()
})

function withdrawStatusText(applyStatus: string) {
  switch (applyStatus) {
    case 'APPLY':
      return '申请中'
    case 'VIA_AUDITING':
      return '审核通过'
    case 'D_VIA_AUDITING':
      return '分销提现审核通过'
    case 'FAIL_AUDITING':
      return '审核未通过'
    case 'D_FAIL_AUDITING':
      return '分销提现审核未通过'
    case 'WAIT_USER_CONFIRM':
      return '等待用户确认'
    case 'SUCCESS':
      return '提现成功'
    case 'ERROR':
      return '提现失败'
    default:
      return applyStatus || ''
  }
}

function getData() {
  getWithdrawApplyPage(params.value).then((res) => {
    loaded.value = true
    if (res.data.success && res.data.result.records.length != 0) {
      records.value.push(...res.data.result.records)
    }
  })
}

function loadMore() {
  params.value.pageNumber++
  getData()
}

function confirmWechatReceive(item: any) {
  const id = item && item.id
  if (!id) {
    uni.showToast({ title: '缺少提现记录ID', duration: 2000, icon: 'none' })
    return
  }

  uni.showLoading({ title: '加载中' })
  getWithdrawApplyWechatTransferInfo(id)
    .then((res) => {
      if (!res.data || !res.data.success) return

      const info = res.data.result || {}
      const mchId = info.mchId
      const wechatPackage = info.wechatPackage
      let appId = info.appId

      if (typeof wx !== 'undefined' && wx.getAccountInfoSync) {
        try {
          const accountInfo = wx.getAccountInfoSync()
          const mpAppId = accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.appId
          if (mpAppId) appId = mpAppId
        } catch (e) {}
      }

      if (!mchId || !appId || !wechatPackage) {
        uni.showToast({ title: '微信确认参数缺失', duration: 2000, icon: 'none' })
        return
      }

      const openResultToast = (errMsg?: string) => {
        if (errMsg === 'requestMerchantTransfer:ok') {
          uni.showToast({ title: '已唤起确认页面', duration: 2000, icon: 'none' })
          return
        }
        if (errMsg === 'requestMerchantTransfer:cancel') {
          uni.showToast({ title: '已取消', duration: 2000, icon: 'none' })
          return
        }
        uni.showToast({
          title: errMsg ? `唤起失败：${errMsg}` : '唤起失败',
          duration: 2500,
          icon: 'none',
        })
      }

      if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
        try {
          const sys = wx.getSystemInfoSync()
          if (sys && sys.platform === 'devtools') {
            uni.showToast({
              title: '开发者工具可能不支持，请真机测试',
              duration: 2500,
              icon: 'none',
            })
          }
        } catch (e) {}
      }

      if (typeof wx !== 'undefined' && wx.canIUse && wx.canIUse('requestMerchantTransfer')) {
        wx.requestMerchantTransfer({
          mchId,
          appId,
          package: wechatPackage,
          success: (r: any) => openResultToast(r && (r.errMsg || r.err_msg)),
          fail: (r: any) => openResultToast(r && (r.errMsg || r.err_msg)),
        })
        return
      }

      if (typeof WeixinJSBridge !== 'undefined' && WeixinJSBridge.invoke) {
        WeixinJSBridge.invoke(
          'requestMerchantTransfer',
          { mchId, appId, package: wechatPackage },
          (r: any) => openResultToast(r && (r.errMsg || r.err_msg))
        )
        return
      }

      uni.showToast({ title: '请在微信内打开确认收款', duration: 2000, icon: 'none' })
    })
    .finally(() => {
      uni.hideLoading()
    })
}
</script>

<style lang="scss" scoped>
.view-item {
  padding: 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.view-item-change {
  text-align: right;
  > .-money {
    font-size: 36rpx;
    color: $main-color;
    font-weight: bold;
  }
  > .-time {
    font-size: 22rpx;
    color: #999;
  }
  > .confirm-btn {
    display: inline-block;
    margin-top: 12rpx;
    padding: 12rpx 20rpx;
    font-size: 24rpx;
    border-radius: 8rpx;
    background: $main-color;
    color: #fff;
  }
}
.view-item-detail {
  line-height: 1.75;
  flex: 1;
  overflow: hidden;
  > .-title {
    font-size: 28rpx;
  }
  > .-number {
    font-size: 22rpx;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.wap {
  width: 100%;
  height: calc(100vh - 44px);
}

.scroll-v {
  height: calc(100vh - 88rpx);
}
</style>
