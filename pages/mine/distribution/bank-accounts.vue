<template>
  <view class="page" :style="themeStyle">
    <view class="content">
      <!-- 加载中 -->
      <view v-if="loading" class="state-wrap">
        <text class="state-text">加载中...</text>
      </view>

      <!-- 账户列表 -->
      <view v-else-if="pageReady && accounts.length" class="account-list">
        <view
          class="account-item"
          v-for="item in accounts"
          :key="item.id"
          @click="handleSelect(item)"
        >
          <view class="item-left">
            <view v-if="isSelectMode" class="radio-circle" :class="{ active: item.id === selectedId }">
              <view class="radio-dot" v-if="item.id === selectedId" />
            </view>
            <view class="item-info">
              <text class="item-name">{{ item.holderName }}</text>
              <view class="item-meta">
                <text class="item-bank">{{ item.bankName }}</text>
                <text class="item-card">{{ maskCard(item.cardNo) }}</text>
              </view>
            </view>
            <view v-if="!isSelectMode && item.isDefault" class="default-tag">默认</view>
          </view>
          <view class="item-actions">
            <view v-if="!isSelectMode && !item.isDefault" class="set-default-btn" @click.stop="handleSetDefault(item.id)">
              <text class="set-default-text">设为默认</text>
            </view>
            <view class="item-delete" @click.stop="handleDelete(item.id)">
              <u-icon name="trash" color="#ccc" size="18" />
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="pageReady" class="empty-wrap">
        <text class="empty-text">暂无银行卡，请添加</text>
      </view>

      <!-- 添加账户按钮 -->
      <view v-if="pageReady" class="add-btn-wrap">
        <view class="add-btn" @click="openAddPopup">+ 添加账户</view>
      </view>
    </view>

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
          <view class="popup-btn primary" :class="{ disabled: saveLoading }" @click="saveAccount">
            {{ saveLoading ? '保存中...' : '保存' }}
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import { getBankCards, addBankCard, deleteBankCard, setDefaultBankCard } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))

// 从 getStorageSync 读取上次选择的默认卡 id（仅选择模式使用）
const SELECTED_KEY = 'dist_selected_account_id'

const isSelectMode = ref(false)

const accounts = ref<any[]>([])
const selectedId = ref('')
const pageReady = ref(false)
const loading = ref(true)
const addPopupVisible = ref(false)
const saveLoading = ref(false)
const form = ref({ holderName: '', bankName: '', cardNo: '' })

onLoad((options: any) => {
  isSelectMode.value = options?.mode === 'select'
  uni.setNavigationBarTitle({ title: isSelectMode.value ? '选择账户' : '到账账户' })
  if (isSelectMode.value) {
    selectedId.value = uni.getStorageSync(SELECTED_KEY) || ''
  }
})

onShow(() => {
  loading.value = true
  assertActiveDistributor().then((d) => {
    if (!d) {
      return
    }
    pageReady.value = true
    loadAccounts()
  })
})

function loadAccounts() {
  loading.value = true
  getBankCards()
    .then((res: any) => {
      accounts.value = res?.data?.result || []
      // 如果选择模式没有已选卡，默认选中 isDefault=true 的卡
      if (isSelectMode.value && !selectedId.value && accounts.value.length) {
        const def = accounts.value.find((a: any) => a.isDefault)
        selectedId.value = def ? def.id : accounts.value[0].id
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function handleSelect(item: any) {
  if (!isSelectMode.value) return
  selectedId.value = item.id
  uni.setStorageSync(SELECTED_KEY, item.id)
  uni.navigateBack()
}

function handleDelete(id: string) {
  uni.showModal({
    title: '删除账户',
    content: '确认删除该银行卡？',
    success: (res) => {
      if (res.confirm) {
        deleteBankCard(id)
          .then(() => {
            uni.showToast({ title: '已删除', icon: 'success' })
            loadAccounts()
          })
          .catch((err: any) => {
            const msg = err?.data?.message || '删除失败'
            uni.showToast({ title: msg, icon: 'none' })
          })
      }
    },
  })
}

function handleSetDefault(id: string) {
  setDefaultBankCard(id)
    .then(() => {
      uni.showToast({ title: '已设为默认', icon: 'success' })
      loadAccounts()
    })
    .catch((err: any) => {
      const msg = err?.data?.message || '操作失败'
      uni.showToast({ title: msg, icon: 'none' })
    })
}

function openAddPopup() {
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
  if (form.value.cardNo.trim().length === 0) {
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
      loadAccounts()
      // 如果是选择模式，自动选中刚添加的卡
      if (isSelectMode.value && newCard?.id) {
        selectedId.value = newCard.id
        uni.setStorageSync(SELECTED_KEY, newCard.id)
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

/* ── 状态 ──────────────────────────────────── */
.state-wrap {
  padding: 120rpx 0;
  text-align: center;
}
.state-text { color: #999; font-size: 26rpx; }

/* ── 账户列表 ──────────────────────────────── */
.account-list { margin-bottom: 24rpx; }

.account-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
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

.item-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.item-name { font-size: 28rpx; font-weight: 500; color: #333; }

.item-meta { display: flex; align-items: center; gap: 12rpx; }

.item-bank { font-size: 24rpx; color: #666; }
.item-card { font-size: 24rpx; color: #999; }

.default-tag {
  font-size: 20rpx;
  color: var(--theme-primary);
  border: 1rpx solid var(--theme-primary);
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
  flex-shrink: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.set-default-btn { padding: 4rpx 0; }
.set-default-text { font-size: 22rpx; color: #999; }

.item-delete { padding: 10rpx; }

/* ── 空状态 ────────────────────────────────── */
.empty-wrap { padding: 120rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #ccc; }

/* ── 添加按钮 ──────────────────────────────── */
.add-btn-wrap { padding-bottom: 40rpx; }

.add-btn {
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 16rpx;
  border: 2rpx solid var(--theme-primary);
  color: var(--theme-primary);
  font-size: 30rpx;
  font-weight: 500;
}

/* ── 弹窗 ──────────────────────────────────── */
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
