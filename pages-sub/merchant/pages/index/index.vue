<template>
  <view class="workbench-page">
    <!-- 顶部商家信息栏 -->
    <view class="store-hero">
      <view class="store-info-row">
        <view class="store-avatar">
          <image
            class="avatar-img"
            :src="storeInfo.settings?.storeLogo || '/static/tabbar/home.png'"
            mode="aspectFill"
          ></image>
        </view>
        <view class="store-meta">
          <view class="name-row">
            <text class="store-name">{{ storeInfo.settings?.storeName || storeInfo.store?.storeName || '商家移动工作台' }}</text>
            <view class="badge" :class="isClerk ? 'clerk-badge' : 'owner-badge'">
              {{ isClerk ? '店员' : '店主' }}
            </view>
          </view>
          <text class="clerk-name">当前操作员：{{ operatorName }}</text>
        </view>
        <view class="logout-btn" @click="handleLogout">
          <text>退出</text>
        </view>
      </view>
    </view>

    <!-- 核心操作区（快速核销） -->
    <view class="core-actions-card">
      <view class="card-header">
        <text class="card-title">快速核销</text>
        <text class="card-subtitle">支持预约单、自提单与虚拟卡密</text>
      </view>

      <!-- 扫码主按钮 -->
      <view class="scan-hero-btn" @click="handleScanCode">
        <view class="scan-icon-circle">
          <u-icon name="scan" size="38" color="#ffffff"></u-icon>
        </view>
        <view class="scan-text-box">
          <text class="main-text">扫码快速核销</text>
          <text class="sub-text">扫描顾客出示的核销码/订单码</text>
        </view>
        <u-icon name="arrow-right" size="18" color="rgba(255,255,255,0.6)"></u-icon>
      </view>

      <!-- 手动输码 -->
      <view class="manual-input-box">
        <view class="input-wrap">
          <u-icon name="edit-pen" size="20" color="#9ca3af"></u-icon>
          <input
            class="code-input"
            type="number"
            maxlength="12"
            v-model="manualCode"
            placeholder="输入8位数字核销码"
            placeholder-class="placeholder"
            @confirm="handleManualVerify"
          />
          <view class="clear-icon" v-if="manualCode" @click="clearManualCode">
            <u-icon name="close-circle-fill" size="16" color="#d1d5db"></u-icon>
          </view>
        </view>
        <view
          class="verify-btn"
          :class="{ active: manualCode.trim().length >= 6 }"
          @click="handleManualVerify"
        >
          <text>核销</text>
        </view>
      </view>
    </view>

    <!-- 核心业务四大板块 -->
    <view class="business-grid-card">
      <view class="grid-card-header">
        <text class="grid-card-title">经营管理</text>
      </view>
      <view class="business-grid">
        <!-- 订单管理 -->
        <view class="biz-item" @click="navigateTo('/pages-sub/merchant/pages/order/list?tab=ALL')">
          <view class="biz-icon-box bg-blue">
            <u-icon name="order" size="26" color="#2563eb"></u-icon>
          </view>
          <text class="biz-title">订单管理</text>
        </view>

        <!-- 商品管理 -->
        <view class="biz-item" @click="navigateTo('/pages-sub/merchant/pages/goods/list')">
          <view class="biz-icon-box bg-emerald">
            <u-icon name="bag" size="26" color="#059669"></u-icon>
          </view>
          <text class="biz-title">商品管理</text>
        </view>

        <!-- 评价管理 -->
        <view class="biz-item" @click="navigateTo('/pages-sub/merchant/pages/evaluation/list')">
          <view class="biz-icon-box bg-amber">
            <u-icon name="chat" size="26" color="#d97706"></u-icon>
          </view>
          <text class="biz-title">评价管理</text>
        </view>

        <!-- 待核销专区 -->
        <view class="biz-item" @click="navigateTo('/pages-sub/merchant/pages/order/list?tab=TAKE')">
          <view class="biz-icon-box bg-orange">
            <u-icon name="checkmark-circle" size="26" color="#ea580c"></u-icon>
          </view>
          <text class="biz-title">待核销单</text>
        </view>
      </view>
    </view>



    <!-- 核销确认弹窗 -->
    <view class="modal-mask" v-if="showModal" @click.self="closeModal">
      <view class="modal-card">
        <view class="modal-header">
          <text class="modal-title">核销信息确认</text>
          <view class="close-btn" @click="closeModal">
            <u-icon name="close" size="18" color="#9ca3af"></u-icon>
          </view>
        </view>

        <!-- 订单概览 -->
        <view class="order-summary" v-if="verifyingOrder">
          <view class="summary-row">
            <text class="label">核销码：</text>
            <text class="value highlight-code">{{ currentCode }}</text>
          </view>
          <view class="summary-row">
            <text class="label">订单编号：</text>
            <text class="value">{{ verifyingOrder.sn || verifyingOrder.orderSn || '--' }}</text>
          </view>
          <view class="summary-row" v-if="verifyingOrder.consigneeMobile || verifyingOrder.memberPhone">
            <text class="label">顾客电话：</text>
            <text class="value">{{ maskPhone(verifyingOrder.consigneeMobile || verifyingOrder.memberPhone) }}</text>
          </view>
          <view class="summary-row" v-if="verifyingOrder.goodsName || verifyingOrder.orderItems?.[0]?.goodsName">
            <text class="label">商品名称：</text>
            <text class="value goods-text">
              {{ verifyingOrder.goodsName || verifyingOrder.orderItems?.[0]?.goodsName }}
            </text>
          </view>
          <view class="summary-row" v-if="verifyingOrder.num">
            <text class="label">购买数量：</text>
            <text class="value">{{ verifyingOrder.num }} 件</text>
          </view>

          <!-- 预约服务专属选项：选择服务人员 -->
          <view class="staff-picker-box" v-if="isAppointmentOrder">
            <text class="staff-label">指派/核销服务人员：</text>
            <picker
              class="picker-ctrl"
              mode="selector"
              :range="staffList"
              range-key="name"
              :value="selectedStaffIndex"
              @change="onStaffChange"
            >
              <view class="picker-display">
                <text>{{ currentStaffName }}</text>
                <u-icon name="arrow-down" size="14" color="#6b7280"></u-icon>
              </view>
            </picker>
          </view>
        </view>

        <!-- 弹窗操作 -->
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="closeModal">取消</view>
          <view
            class="modal-btn confirm"
            :class="{ loading: confirming }"
            @click="submitConfirmVerification"
          >
            {{ confirming ? '核销中...' : '确认核销' }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import storage from '@/utils/storage.js'
import {
  previewStoreVerification,
  storeOrderTake,
  confirmStoreVerification,
  getAppointmentOrderByCode,
  verifyAppointmentCode,
  getEnabledServiceStaff,
} from '../../api/order.js'
import { storeLogout } from '../../api/passport.js'

const storeInfo = ref({})

const operatorName = computed(() => {
  const u = storeInfo.value?.user
  return u?.nickName || u?.username || '当前操作员'
})

const isClerk = computed(() => {
  const u = storeInfo.value?.user
  if (u && (u.isSuper === false || u.shopkeeper === false)) return true
  return false
})
const manualCode = ref('')
const showModal = ref(false)
const confirming = ref(false)
const currentCode = ref('')
const verifyingOrder = ref(null)
const isAppointmentOrder = ref(false)

const staffList = ref([])
const selectedStaffIndex = ref(0)

const currentStaffName = computed(() => {
  if (staffList.value.length > 0 && staffList.value[selectedStaffIndex.value]) {
    return staffList.value[selectedStaffIndex.value].name
  }
  return '未指派 / 默认'
})

onMounted(() => {
  const token = storage.getStoreAccessToken()
  if (!token) {
    uni.redirectTo({ url: '/pages-sub/merchant/pages/login/index' })
    return
  }
  storeInfo.value = storage.getStoreInfo() || {}
  loadStaffList()
})

const loadStaffList = async () => {
  try {
    const res = await getEnabledServiceStaff()
    if (res.data && res.data.success && Array.isArray(res.data.result)) {
      staffList.value = res.data.result
    }
  } catch (e) {
    // 忽略加载异常
  }
}

const maskPhone = (phone) => {
  if (!phone || phone.length < 7) return phone || ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 扫码快速核销
const handleScanCode = () => {
  uni.scanCode({
    onlyFromCamera: true,
    scanType: ['qrCode', 'barCode'],
    success: (res) => {
      let code = res.result || ''
      if (code.includes('code=')) {
        const match = code.match(/code=([a-zA-Z0-9]+)/)
        if (match && match[1]) {
          code = match[1]
        }
      }
      if (code) {
        queryAndShowVerify(code.trim())
      } else {
        uni.showToast({ title: '未能识别核销码', icon: 'none' })
      }
    },
    fail: () => {},
  })
}

// 手动输码核销
const clearManualCode = () => {
  manualCode.value = ''
}

const handleManualVerify = () => {
  const code = manualCode.value.trim()
  if (!code || code.length < 6) {
    uni.showToast({ title: '请输入有效的核销码', icon: 'none' })
    return
  }
  queryAndShowVerify(code)
}

// 预检核销码并展示弹窗
const queryAndShowVerify = async (code) => {
  currentCode.value = code
  uni.showLoading({ title: '正在查询订单...' })

  try {
    let isAppoint = false
    let orderData = null

    try {
      const appointRes = await getAppointmentOrderByCode(code)
      if (appointRes.data && appointRes.data.success && appointRes.data.result) {
        isAppoint = true
        orderData = appointRes.data.result
      }
    } catch (e) {}

    if (!orderData) {
      const previewRes = await previewStoreVerification(code)
      if (previewRes.data && previewRes.data.success && previewRes.data.result) {
        orderData = previewRes.data.result
      }
    }

    uni.hideLoading()

    if (orderData) {
      verifyingOrder.value = orderData
      isAppointmentOrder.value = isAppoint
      showModal.value = true
    } else {
      verifyingOrder.value = { sn: '以提交核销为准' }
      isAppointmentOrder.value = false
      showModal.value = true
    }
  } catch (err) {
    uni.hideLoading()
    verifyingOrder.value = { sn: '以提交核销为准' }
    isAppointmentOrder.value = false
    showModal.value = true
  }
}

const onStaffChange = (e) => {
  selectedStaffIndex.value = e.detail.value
}

const closeModal = () => {
  showModal.value = false
  verifyingOrder.value = null
  manualCode.value = ''
}

// 确认核销提交
const submitConfirmVerification = async () => {
  if (confirming.value) return
  confirming.value = true
  uni.showLoading({ title: '核销中...' })

  try {
    let success = false
    let message = ''

    if (isAppointmentOrder.value) {
      const staff = staffList.value[selectedStaffIndex.value]
      const params = {
        orderSn: verifyingOrder.value?.orderSn || verifyingOrder.value?.sn,
        code: currentCode.value,
        serviceStaffId: staff ? staff.id : undefined,
      }
      const res = await verifyAppointmentCode(params)
      success = res.data && res.data.success
      message = res.data?.message
    } else {
      const sn = verifyingOrder.value?.orderSn || verifyingOrder.value?.sn
      if (sn && sn !== '以提交核销为准') {
        const res = await storeOrderTake(sn, currentCode.value)
        success = res.data && res.data.success
        message = res.data?.message
      } else {
        const res = await confirmStoreVerification(currentCode.value)
        success = res.data && res.data.success
        message = res.data?.message
      }
    }

    uni.hideLoading()
    confirming.value = false

    if (success) {
      try {
        uni.vibrateShort()
      } catch (e) {}
      uni.showToast({ title: '核销成功！', icon: 'success' })
      closeModal()
    } else {
      uni.showToast({
        title: message || '核销失败，请核对核销码',
        icon: 'none',
      })
    }
  } catch (e) {
    uni.hideLoading()
    confirming.value = false
    uni.showToast({ title: '请求失败，请稍后重试', icon: 'none' })
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '退出商家工作台',
    content: '退出后将清除本店登录凭证，确认退出？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await storeLogout()
        } catch (e) {}
        storage.clearStoreAuth()
        uni.redirectTo({
          url: '/pages-sub/merchant/pages/login/index',
        })
      }
    },
  })
}

const navigateTo = (url) => {
  uni.navigateTo({ url })
}


</script>

<style lang="scss" scoped>
.workbench-page {
  min-height: 100vh;
  background-color: #f3f4f6;
  padding-bottom: 60rpx;
}

.store-hero {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  padding: 60rpx 36rpx 100rpx 36rpx;
  color: #ffffff;

  .store-info-row {
    display: flex;
    align-items: center;

    .store-avatar {
      width: 96rpx;
      height: 96rpx;
      border-radius: 20rpx;
      overflow: hidden;
      background: #ffffff;
      border: 2rpx solid rgba(255, 255, 255, 0.2);

      .avatar-img {
        width: 100%;
        height: 100%;
      }
    }

    .store-meta {
      flex: 1;
      margin-left: 24rpx;

      .name-row {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .store-name {
          font-size: 34rpx;
          font-weight: 700;
          color: #ffffff;
        }

        .badge {
          font-size: 20rpx;
          padding: 4rpx 14rpx;
          border-radius: 8rpx;
          font-weight: 500;

          &.owner-badge {
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
          }

          &.clerk-badge {
            background: #ecfdf5;
            color: #059669;
          }
        }
      }

      .clerk-name {
        display: block;
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.65);
        margin-top: 8rpx;
      }
    }

    .logout-btn {
      padding: 10rpx 24rpx;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 12rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.85);
    }
  }
}

.core-actions-card {
  margin: -60rpx 32rpx 28rpx 32rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.06);

  .card-header {
    margin-bottom: 28rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #111827;
      display: block;
    }

    .card-subtitle {
      font-size: 22rpx;
      color: #9ca3af;
      margin-top: 6rpx;
      display: block;
    }
  }

  .scan-hero-btn {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 22rpx;
    padding: 32rpx 28rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 10rpx 24rpx rgba(16, 185, 129, 0.3);

    .scan-icon-circle {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scan-text-box {
      flex: 1;
      margin-left: 24rpx;

      .main-text {
        font-size: 34rpx;
        font-weight: 700;
        color: #ffffff;
        display: block;
      }

      .sub-text {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.8);
        margin-top: 6rpx;
        display: block;
      }
    }
  }

  .manual-input-box {
    display: flex;
    align-items: center;
    margin-top: 28rpx;
    gap: 16rpx;

    .input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f9fafb;
      border: 1rpx solid #e5e7eb;
      border-radius: 16rpx;
      padding: 18rpx 24rpx;

      .code-input {
        flex: 1;
        margin-left: 16rpx;
        font-size: 28rpx;
        color: #111827;
      }

      .placeholder {
        color: #9ca3af;
        font-size: 26rpx;
      }
    }

    .verify-btn {
      padding: 20rpx 36rpx;
      background: #e5e7eb;
      color: #9ca3af;
      border-radius: 16rpx;
      font-size: 28rpx;
      font-weight: 600;

      &.active {
        background: #111827;
        color: #ffffff;
      }
    }
  }
}

.business-grid-card {
  margin: 0 32rpx 24rpx 32rpx;
  background: #ffffff;
  border-radius: 28rpx;
  padding: 32rpx 24rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);

  .grid-card-header {
    margin-bottom: 24rpx;
    padding-left: 8rpx;

    .grid-card-title {
      font-size: 30rpx;
      font-weight: 700;
      color: #111827;
    }
  }

  .business-grid {
    display: flex;
    flex-wrap: wrap;

    .biz-item {
      width: 50%;
      box-sizing: border-box;
      padding: 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .biz-icon-box {
        width: 96rpx;
        height: 96rpx;
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;

        &.bg-blue {
          background: #eff6ff;
        }
        &.bg-emerald {
          background: #ecfdf5;
        }
        &.bg-amber {
          background: #fffbeb;
        }
        &.bg-orange {
          background: #fff7ed;
        }
      }

      .biz-title {
        font-size: 28rpx;
        font-weight: 700;
        color: #1f2937;
      }

      .biz-sub {
        font-size: 22rpx;
        color: #9ca3af;
        margin-top: 4rpx;
      }
    }
  }
}




/* 弹窗遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .modal-card {
    background: #ffffff;
    width: 100%;
    max-width: 620rpx;
    border-radius: 28rpx;
    padding: 36rpx;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28rpx;

      .modal-title {
        font-size: 32rpx;
        font-weight: 700;
        color: #111827;
      }
    }

    .order-summary {
      background: #f9fafb;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 32rpx;

      .summary-row {
        display: flex;
        font-size: 26rpx;
        margin-bottom: 14rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #6b7280;
          width: 150rpx;
        }

        .value {
          color: #111827;
          flex: 1;

          &.highlight-code {
            font-size: 32rpx;
            font-weight: 700;
            color: #10b981;
          }

          &.goods-text {
            word-break: break-all;
          }
        }
      }

      .staff-picker-box {
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1rpx dashed #e5e7eb;

        .staff-label {
          font-size: 24rpx;
          color: #6b7280;
          display: block;
          margin-bottom: 12rpx;
        }

        .picker-display {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 1rpx solid #d1d5db;
          border-radius: 12rpx;
          padding: 16rpx 20rpx;
          font-size: 26rpx;
          color: #111827;
        }
      }
    }

    .modal-footer {
      display: flex;
      gap: 20rpx;

      .modal-btn {
        flex: 1;
        height: 84rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30rpx;
        font-weight: 600;

        &.cancel {
          background: #f3f4f6;
          color: #4b5563;
        }

        &.confirm {
          background: #111827;
          color: #ffffff;

          &.loading {
            opacity: 0.7;
          }
        }
      }
    }
  }
}
</style>
