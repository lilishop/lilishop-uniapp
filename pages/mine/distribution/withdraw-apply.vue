<template>
  <view class="page" :style="themeStyle">
    <view v-if="!pageReady" class="state-wrap">
      <text class="state-text">加载中...</text>
    </view>
    <view v-else class="content">
      <!-- 到账账户 -->
      <view class="section-card">
        <view class="account-row" @click="openAccountDrawer">
          <text class="account-label">到账账户</text>
          <view class="account-right">
            <view v-if="selectedAccount" class="account-info">
              <text class="account-bank">{{ selectedAccount.bankName }}</text>
              <text class="account-card">{{ maskCard(selectedAccount.cardNo) }}</text>
            </view>
            <text v-else class="account-add-text">请添加</text>
            <u-icon name="arrow-right" color="#bbb" size="14" />
          </view>
        </view>
      </view>

      <!-- 提现金额 -->
      <view class="section-card amount-card">
        <text class="amount-label">提现金额</text>
        <view class="amount-input-wrap">
          <text class="amount-symbol">¥</text>
          <input
            class="amount-input"
            type="digit"
            v-model="amount"
            placeholder="0.00"
            placeholder-class="amount-placeholder"
          />
        </view>
        <view class="amount-divider" />
        <view class="amount-hint-row">
          <text class="amount-balance-hint">可提现余额 ¥{{ formatMoney(canRebate) }}</text>
          <text class="amount-all" @click="fillAll">全部提现</text>
        </view>
        <text v-if="errorMsg" class="amount-error">{{ errorMsg }}</text>
      </view>

      <!-- 提现按钮 -->
      <view
        class="submit-btn"
        :class="{ 'submit-btn--disabled': !canSubmit }"
        @click="submitWithdraw"
      >{{ submitLoading ? '提交中...' : '提现' }}</view>
    </view>

    <!-- 选择账户抽屉 -->
    <u-popup v-model:show="drawerVisible" mode="bottom" round="16">
      <view class="drawer-wrap">
        <view class="drawer-header">
          <text class="drawer-title">选择账户</text>
          <view class="drawer-close" @click="drawerVisible = false">
            <u-icon name="close" color="#999" size="18" />
          </view>
        </view>

        <view v-if="drawerLoading" class="drawer-state">
          <text class="drawer-state-text">加载中...</text>
        </view>
        <view v-else-if="allCards.length" class="drawer-list">
          <view
            class="drawer-item"
            v-for="item in allCards"
            :key="item.id"
            @click="selectAccount(item)"
          >
            <view class="radio-circle" :class="{ active: selectedAccount?.id === item.id }">
              <view class="radio-dot" v-if="selectedAccount?.id === item.id" />
            </view>
            <view class="drawer-item-info">
              <text class="drawer-item-name">{{ item.holderName }}</text>
              <view class="drawer-item-meta">
                <text class="drawer-item-bank">{{ item.bankName }}</text>
                <text class="drawer-item-card">{{ maskCard(item.cardNo) }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="drawer-state">
          <text class="drawer-state-text">暂无银行卡</text>
        </view>

        <view class="drawer-add-btn" @click="openAddForm">+ 添加账户</view>
      </view>
    </u-popup>

    <!-- 添加账户 Popup -->
    <u-popup v-model:show="addPopupVisible" mode="bottom" round="16">
      <view class="popup-wrap">
        <view class="popup-title">添加到账账户</view>

        <view class="form-item">
          <text class="form-label">姓名</text>
          <input
            class="form-input"
            v-model="form.holderName"
            placeholder="请输入收款人姓名"
            placeholder-class="form-placeholder"
          />
        </view>
        <view class="form-divider" />
        <view class="form-item">
          <text class="form-label">银行</text>
          <input
            class="form-input"
            v-model="form.bankName"
            placeholder="如：中国工商银行"
            placeholder-class="form-placeholder"
          />
        </view>
        <view class="form-divider" />
        <view class="form-item">
          <text class="form-label">卡号</text>
          <input
            class="form-input"
            v-model="form.cardNo"
            type="number"
            placeholder="请输入银行卡号"
            placeholder-class="form-placeholder"
          />
        </view>

        <view class="popup-actions">
          <view class="popup-btn ghost" @click="addPopupVisible = false">取消</view>
          <view
            class="popup-btn primary"
            :class="{ disabled: saveLoading }"
            @click="saveAccount"
          >{{ saveLoading ? '保存中...' : '保存' }}</view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { cash, getBankCards, addBankCard } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

const pageReady = ref(false)
const canRebate = ref(0)
const amount = ref('')
const submitLoading = ref(false)
const selectedAccount = ref<any>(null)
const allCards = ref<any[]>([])
const inited = ref(false)

// 抽屉
const drawerVisible = ref(false)
const drawerLoading = ref(false)

// 添加账户弹窗
const addPopupVisible = ref(false)
const saveLoading = ref(false)
const form = ref({ holderName: '', bankName: '', cardNo: '' })

function loadInfo() {
  return assertActiveDistributor().then((d) => {
    if (!d) {
      return null
    }
    canRebate.value = Number(d.canRebate || 0)
    if (!inited.value) {
      const prefill = Math.min(canRebate.value, 9999)
      amount.value = prefill > 0 ? prefill.toFixed(2) : ''
      inited.value = true
    }
    return d
  })
}

function loadCards() {
  drawerLoading.value = true
  getBankCards()
    .then((res: any) => {
      allCards.value = res?.data?.result || []
      if (!selectedAccount.value && allCards.value.length) {
        const def = allCards.value.find((a: any) => a.isDefault) || allCards.value[0]
        selectedAccount.value = def
      }
    })
    .finally(() => {
      drawerLoading.value = false
    })
}

onLoad(() => {
  loadInfo().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
    loadCards()
  })
})

function openAccountDrawer() {
  drawerVisible.value = true
  loadCards()
}

function selectAccount(item: any) {
  selectedAccount.value = item
  drawerVisible.value = false
}

function openAddForm() {
  form.value = { holderName: '', bankName: '', cardNo: '' }
  addPopupVisible.value = true
}

function saveAccount() {
  if (!form.value.holderName.trim()) {
    uni.showToast({ title: '请输入姓名', icon: 'none' })
    return
  }
  if (!form.value.bankName.trim()) {
    uni.showToast({ title: '请输入银行名称', icon: 'none' })
    return
  }
  if (!form.value.cardNo.trim()) {
    uni.showToast({ title: '请输入银行卡号', icon: 'none' })
    return
  }
  saveLoading.value = true
  addBankCard({
    holderName: form.value.holderName.trim(),
    bankName: form.value.bankName.trim(),
    cardNo: form.value.cardNo.trim(),
  })
    .then((res: any) => {
      const newCard = res?.data?.result
      addPopupVisible.value = false
      uni.showToast({ title: '添加成功', icon: 'success' })
      loadCards()
      if (newCard?.id) {
        selectedAccount.value = newCard
        drawerVisible.value = false
      }
    })
    .catch((err: any) => {
      const msg = err?.data?.message || '添加失败，请重试'
      uni.showToast({ title: msg, icon: 'none' })
    })
    .finally(() => {
      saveLoading.value = false
    })
}

function fillAll() {
  const max = Math.min(canRebate.value, 9999)
  amount.value = max.toFixed(2)
}

const errorMsg = computed(() => {
  if (!amount.value) return ''
  const price = Number(amount.value)
  if (price < 1) return '最小提现金额为1元'
  if (price > 9999) return '单次提现最多9999元'
  if (price > canRebate.value) return '提现金额不能超过可提现余额'
  return ''
})

const canSubmit = computed(() => {
  const price = Number(amount.value)
  return !submitLoading.value && price >= 1 && price <= 9999 && price <= canRebate.value
})

function submitWithdraw() {
  if (!selectedAccount.value) {
    uni.showToast({ title: '请先添加到账账户', icon: 'none' })
    return
  }
  if (!canSubmit.value) return
  const price = Number(amount.value)
  submitLoading.value = true
  cash({ price })
    .then(() => {
      uni.showToast({ title: '提现申请已提交', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 1500)
    })
    .catch((err: any) => {
      const msg = err?.data?.message || '提现失败，请重试'
      uni.showToast({ title: msg, icon: 'none' })
    })
    .finally(() => {
      submitLoading.value = false
    })
}

function formatMoney(val: number) {
  return Number(val || 0).toFixed(2)
}

function maskCard(cardNo: string) {
  if (!cardNo || cardNo.length < 4) return cardNo
  return '****' + cardNo.slice(-4)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.content { padding: 24rpx; }

.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}

.state-text {
  color: #999;
  font-size: 26rpx;
}

.section-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 0 32rpx;
  margin-bottom: 24rpx;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
}

.account-label { font-size: 28rpx; color: #333; font-weight: 500; }
.account-right { display: flex; align-items: center; gap: 8rpx; }
.account-info { display: flex; align-items: center; gap: 10rpx; }
.account-bank { font-size: 24rpx; color: #999; }
.account-card { font-size: 24rpx; color: #999; }
.account-add-text { font-size: 26rpx; color: var(--theme-primary); }

.amount-card { padding: 32rpx; }

.amount-label { font-size: 26rpx; color: #999; display: block; margin-bottom: 20rpx; }

.amount-input-wrap {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-bottom: 24rpx;
  height: 80rpx;
}

.amount-symbol {
  font-size: 36rpx;
  font-weight: 500;
  color: #333;
  line-height: 80rpx;
  flex-shrink: 0;
}

.amount-input {
  flex: 1;
  font-size: 60rpx;
  font-weight: 700;
  color: #333;
  height: 80rpx;
  line-height: 80rpx;
  background: transparent;
  min-width: 0;
}

.amount-placeholder { font-size: 60rpx; color: #ddd; font-weight: 300; }

.amount-divider { height: 1rpx; background: #f5f5f5; margin-bottom: 20rpx; }

.amount-hint-row { display: flex; align-items: center; justify-content: space-between; }

.amount-balance-hint { font-size: 24rpx; color: #999; }
.amount-all { font-size: 24rpx; color: var(--theme-primary); }

.amount-error { display: block; font-size: 24rpx; color: #f56c6c; margin-top: 16rpx; }

.submit-btn {
  margin-top: 16rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 16rpx;
  background: var(--theme-primary);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 4rpx;
  box-shadow: 0 8rpx 24rpx var(--theme-primary-30);
}

.submit-btn--disabled { opacity: 0.5; box-shadow: none; }

/* ── 选择账户抽屉 ──────────────────────────── */
.drawer-wrap { padding: 0 0 48rpx; }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.drawer-title { font-size: 30rpx; font-weight: 600; color: #333; }

.drawer-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-list { max-height: 600rpx; overflow-y: auto; }

.drawer-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f8f8f8;
}

.radio-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &.active { border-color: var(--theme-primary); }
}

.radio-dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: var(--theme-primary);
}

.drawer-item-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex: 1;
  min-width: 0;
}

.drawer-item-name { font-size: 28rpx; font-weight: 500; color: #333; }

.drawer-item-meta { display: flex; align-items: center; gap: 12rpx; }

.drawer-item-bank { font-size: 24rpx; color: #666; }
.drawer-item-card { font-size: 24rpx; color: #999; }

.drawer-state { padding: 60rpx 0; text-align: center; }
.drawer-state-text { font-size: 26rpx; color: #ccc; }

.drawer-add-btn {
  margin: 24rpx 32rpx 0;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 16rpx;
  border: 2rpx solid var(--theme-primary);
  color: var(--theme-primary);
  font-size: 30rpx;
  font-weight: 500;
}

/* ── 添加账户弹窗 ──────────────────────────── */
.popup-wrap { padding: 32rpx 28rpx 48rpx; }

.popup-title {
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
}

.form-item { display: flex; align-items: center; padding: 18rpx 0; }

.form-label { font-size: 28rpx; color: #333; width: 100rpx; flex-shrink: 0; }

.form-input { flex: 1; font-size: 28rpx; color: #333; height: 64rpx; }

.form-placeholder { color: #ccc; font-size: 26rpx; }

.form-divider { height: 1rpx; background: #f5f5f5; }

.popup-actions { display: flex; gap: 20rpx; margin-top: 32rpx; }

.popup-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.popup-btn.ghost { color: #666; background: #f5f5f5; }
.popup-btn.primary { color: #fff; background: var(--theme-primary); }
.popup-btn.disabled { opacity: 0.5; }
</style>
