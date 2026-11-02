<template>
  <view :style="themeStyle" class="withdraw-log-page">
    <u-navbar
      title="提现记录"
      :fixed="true"
      :placeholder="true"
      :border="false"
      :auto-back="false"
      @leftClick="back"
    ></u-navbar>

    <!-- 状态筛选胶囊栏 -->
    <view class="filter-bar">
      <view
        v-for="(tab, idx) in filterTabs"
        :key="tab.key"
        class="filter-pill"
        :class="{ active: activeFilter === idx }"
        @click="activeFilter = idx"
      >
        {{ tab.name }}
      </view>
    </view>

    <!-- 提现记录列表 -->
    <view class="list-container">
      <view v-if="filteredRecords.length > 0" class="list-card">
        <view
          class="record-card"
          v-for="(item, index) in filteredRecords"
          :key="item.id || index"
        >
          <!-- 第一行：状态标签 + 标题 | 提现金额 -->
          <view class="card-row-main">
            <view class="title-wrap">
              <text class="status-tag" :class="item.parsed.statusClass">
                {{ item.parsed.statusText }}
              </text>
              <text class="card-title">余额提现</text>
            </view>
            <view class="amount-wrap">
              <text class="amount-symbol">¥</text>
              <text class="amount-val">{{ unitPrice(item.applyMoney) }}</text>
            </view>
          </view>

          <!-- 第二行：单号、审核备注或失败原因 -->
          <view
            v-if="item.sn || item.inspectRemark || item.errorMessage || item.inspectTime"
            class="meta-box"
          >
            <view v-if="item.sn" class="meta-line">
              <text class="meta-label">提现单号：</text>
              <text class="meta-val mono">{{ item.sn }}</text>
            </view>
            <view v-if="item.inspectTime" class="meta-line">
              <text class="meta-label">审核时间：</text>
              <text class="meta-val">{{ item.inspectTime }}</text>
            </view>
            <view v-if="item.inspectRemark || item.errorMessage" class="meta-line">
              <text class="meta-label">备注说明：</text>
              <text class="meta-val remark-text">{{ item.inspectRemark || item.errorMessage }}</text>
            </view>
          </view>

          <!-- 第三行：申请时间 + 确认收款按钮 -->
          <view class="card-row-foot">
            <text class="apply-time">申请时间：{{ item.createTime || item.inspectTime || '-' }}</text>
            <view
              v-if="item.applyStatus === 'WAIT_USER_CONFIRM'"
              class="confirm-btn"
              @click.stop="confirmWechatReceive(item)"
            >
              确认收款
            </view>
          </view>
        </view>
      </view>

      <view v-else-if="loaded" class="empty-box">
        <u-empty mode="history" text="暂无提现记录" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onReachBottom } from '@dcloudio/uni-app'
import { getWithdrawApplyPage, getWithdrawApplyWechatTransferInfo } from '@/api/members'
import { unitPrice } from '@/utils/filters.js'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import {
  prefetchMpMessageTemplates,
  subscribeMpMessageByScenes,
} from '@/js_sdk/lili-pay/wx-pay.js'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const loaded = ref(false)
const hasMore = ref(true)
const activeFilter = ref(0)
const filterTabs = [
  { key: 'ALL', name: '全部' },
  { key: 'PENDING', name: '处理中' },
  { key: 'SUCCESS', name: '已到账' },
  { key: 'FAIL', name: '未通过/失败' },
]

const params = ref({
  pageNumber: 1,
  pageSize: 10,
  order: 'desc',
})
const records = ref<any[]>([])

onShow(() => {
  // #ifdef MP-WEIXIN
  // 预拉取订阅模板，保证点击左上角返回时可同步拉起微信订阅弹窗
  prefetchMpMessageTemplates()
  // #endif
  reloadData()
})

// 左上角返回：提示订阅「提现结果通知」后再返回
function back() {
  const doBack = () => {
    if (getCurrentPages().length > 1) {
      uni.navigateBack({ delta: 1 })
    } else {
      uni.redirectTo({ url: '/pages/mine/deposit/operation' })
    }
  }
  // #ifdef MP-WEIXIN
  subscribeMpMessageByScenes(['WALLET_WITHDRAWAL_AUDIT_ERROR'], doBack)
  // #endif
  // #ifndef MP-WEIXIN
  doBack()
  // #endif
}

onReachBottom(() => {
  if (!hasMore.value) return
  loadMore()
})

function reloadData() {
  params.value.pageNumber = 1
  hasMore.value = true
  records.value = []
  loaded.value = false
  getData()
}

function parseWithdrawStatus(applyStatus: string) {
  switch (applyStatus) {
    case 'APPLY':
      return { statusText: '申请中', statusClass: 'tag-pending', group: 'PENDING' }
    case 'VIA_AUDITING':
      return { statusText: '审核通过', statusClass: 'tag-pending', group: 'PENDING' }
    case 'D_VIA_AUDITING':
      return { statusText: '分销审核通过', statusClass: 'tag-pending', group: 'PENDING' }
    case 'WAIT_USER_CONFIRM':
      return { statusText: '待确认收款', statusClass: 'tag-action', group: 'PENDING' }
    case 'SUCCESS':
      return { statusText: '提现成功', statusClass: 'tag-success', group: 'SUCCESS' }
    case 'FAIL_AUDITING':
      return { statusText: '审核未通过', statusClass: 'tag-fail', group: 'FAIL' }
    case 'D_FAIL_AUDITING':
      return { statusText: '分销审核未通过', statusClass: 'tag-fail', group: 'FAIL' }
    case 'ERROR':
      return { statusText: '提现失败', statusClass: 'tag-fail', group: 'FAIL' }
    default:
      return { statusText: applyStatus || '处理中', statusClass: 'tag-pending', group: 'PENDING' }
  }
}

const decoratedRecords = computed(() =>
  records.value.map((item) => ({
    ...item,
    parsed: parseWithdrawStatus(item.applyStatus),
  }))
)

const filteredRecords = computed(() => {
  const targetKey = filterTabs[activeFilter.value]?.key || 'ALL'
  if (targetKey === 'ALL') return decoratedRecords.value
  return decoratedRecords.value.filter((item) => item.parsed.group === targetKey)
})

function getData() {
  getWithdrawApplyPage(params.value).then((res) => {
    loaded.value = true
    const list = (res.data?.success && res.data?.result?.records) || []
    if (list.length > 0) {
      records.value.push(...list)
    }
    if (list.length < params.value.pageSize) {
      hasMore.value = false
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
          uni.showToast({ title: '已确认收款', duration: 2000, icon: 'none' })
          setTimeout(() => reloadData(), 800)
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
.withdraw-log-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 48rpx;
  box-sizing: border-box;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx 8rpx;
  overflow-x: auto;
}

.filter-pill {
  flex-shrink: 0;
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  font-size: 25rpx;
  color: #666666;
  background: #ffffff;
  font-weight: 500;
  transition: all 0.2s;

  &.active {
    background: $main-color;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 4rpx 12rpx rgba(229, 50, 56, 0.2);
  }
}

.list-container {
  padding: 16rpx 24rpx 0;
}

.list-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.record-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(17, 30, 79, 0.03);
}

.card-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  min-width: 0;
  flex: 1;
}

.status-tag {
  flex-shrink: 0;
  font-size: 21rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  line-height: 1.35;

  &.tag-pending {
    color: #ff7d00;
    background: rgba(255, 125, 0, 0.1);
  }

  &.tag-action {
    color: $main-color;
    background: rgba(229, 50, 56, 0.1);
  }

  &.tag-success {
    color: #00a870;
    background: rgba(0, 168, 112, 0.1);
  }

  &.tag-fail {
    color: #f53f3f;
    background: rgba(245, 63, 63, 0.1);
  }
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.35;
}

.amount-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  color: #1d2129;
}

.amount-symbol {
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 4rpx;
}

.amount-val {
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.meta-box {
  margin-top: 16rpx;
  padding: 14rpx 18rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.meta-line {
  display: flex;
  align-items: flex-start;
  font-size: 23rpx;
  line-height: 1.45;
  color: #4e5969;
}

.meta-label {
  flex-shrink: 0;
  color: #86909c;
}

.meta-val {
  flex: 1;
  min-width: 0;
  color: #4e5969;
  word-break: break-all;

  &.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  &.remark-text {
    color: #f53f3f;
  }
}

.card-row-foot {
  margin-top: 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.apply-time {
  font-size: 22rpx;
  color: #999999;
  line-height: 1.2;
}

.confirm-btn {
  flex-shrink: 0;
  padding: 10rpx 28rpx;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 999rpx;
  background: linear-gradient(135deg, $main-color 0%, $light-color 100%);
  color: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(229, 50, 56, 0.22);
}

.empty-box {
  padding-top: 140rpx;
}
</style>
