<template>
  <view class="wrapper" :style="themeStyle">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="isDistributionClosed" class="empty">{{ DISTRIBUTION_CLOSE_MESSAGE }}</view>
    <view v-else-if="isRetreated" class="page-body">
      <view class="section result-section">
        <view class="result-icon retreated">!</view>
        <view class="result-title">分销资格已清退</view>
        <view class="result-desc">{{ DISTRIBUTION_RETREAT_MESSAGE }}</view>
      </view>
    </view>
    <view v-else-if="isApplyApproved" class="page-body">
      <view class="section result-section">
        <view class="result-icon approved">✓</view>
        <view class="result-title">已成为分销员</view>
        <view class="result-desc">恭喜您已通过审核，可进入分销员中心开始推广</view>
        <view class="submit" @click="goDistributionHome">进入分销员中心</view>
      </view>
    </view>
    <view v-else-if="isApplyPending" class="page-body">
      <view class="section result-section">
        <view class="result-icon pending">!</view>
        <view class="result-title">等待审核</view>
        <view class="result-desc">{{ DISTRIBUTION_APPLY_MESSAGE }}</view>
      </view>
    </view>
    <view v-else-if="onlineEntryClosed || !plan">
      <view class="empty">{{ DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE }}</view>
    </view>
    <view v-else class="page-body" :class="{ 'with-footer': showLoginFooter || showManualApply }">
      <!-- 邀请人信息（来自图文邀请卡） -->
      <view class="inviter-header" v-if="showInviterHeader">
        <image class="inviter-avatar" :src="inviterAvatar" mode="aspectFill" />
        <view class="inviter-meta">
          <view class="inviter-label">邀请您加入</view>
          <view class="inviter-name">{{ inviterName }}</view>
        </view>
      </view>

      <!-- 招募海报 -->
      <view class="section poster-section" v-if="showPoster">
        <image
          class="poster-image"
          :src="plan.posterBackground"
          mode="widthFix"
          @click="previewPoster"
        />
        <view class="poster-text" v-if="posterTitle">{{ posterTitle }}</view>
        <view class="poster-benefit" v-if="posterBenefitText">{{ posterBenefitText }}</view>
        <view class="poster-rule" v-if="posterRuleText">{{ posterRuleText }}</view>
        <view class="poster-contact" v-if="posterContact">联系方式：{{ posterContact }}</view>
      </view>

      <!-- 加入条件 -->
      <view class="section" v-if="hasJoinCondition">
        <view class="title">加入条件</view>
        <view class="condition-tip">
          {{ isUserLoggedIn ? '满足以下条件后可申请成为分销员' : '登录后可查看您的达标进度并申请成为分销员' }}
        </view>

        <view class="condition-item" v-if="plan.requireSelfPurchaseAmount">
          <view class="condition-head">
            <text class="condition-label">自购金额</text>
            <text class="condition-status" :class="selfPurchaseOk ? 'ok' : 'pending'">
              {{ selfPurchaseOk ? '已达标' : '未达标' }}
            </text>
          </view>
          <view class="condition-value">
            {{ formatMoney(progress?.currentSelfPurchaseAmount) }} / {{ formatMoney(plan.minSelfPurchaseAmount) }} 元
          </view>
        </view>

        <view class="condition-item" v-if="plan.requireConsumeCount">
          <view class="condition-head">
            <text class="condition-label">消费笔数</text>
            <text class="condition-status" :class="consumeCountOk ? 'ok' : 'pending'">
              {{ consumeCountOk ? '已达标' : '未达标' }}
            </text>
          </view>
          <view class="condition-value">
            {{ progress?.currentConsumeCount || 0 }} / {{ plan.minConsumeCount || 0 }} 笔
          </view>
        </view>

        <view class="condition-item" v-if="plan.requirePurchaseGoods">
          <view class="condition-head">
            <text class="condition-label">购买指定商品</text>
            <text class="condition-status" :class="progress?.purchaseGoodsSatisfied ? 'ok' : 'pending'">
              {{ progress?.purchaseGoodsSatisfied ? '已达标' : '未达标' }}
            </text>
          </view>
          <view class="goods-list" v-if="recruitGoods.length">
            <view class="goods-item" v-for="item in recruitGoods" :key="item.skuId || item.goodsId">
              <image class="goods-thumb" :src="item.thumbnail" mode="aspectFill" />
              <view class="goods-meta">
                <view class="goods-name">{{ item.goodsName }}</view>
                <view class="goods-spec" v-if="item.simpleSpecs">{{ item.simpleSpecs }}</view>
                <view class="goods-price" v-if="item.price != null">¥{{ formatMoney(item.price) }}</view>
              </view>
            </view>
          </view>
          <view class="condition-value" v-else>需购买指定商品中的任意一件</view>
        </view>

        <view class="summary-status" :class="progress?.satisfied ? 'ok' : 'pending'">
          {{ progress?.satisfied ? '已满足全部加入条件' : '未满足加入条件' }}
        </view>
      </view>

      <!-- 自动申请提示 -->
      <view class="section auto-tip" v-if="showAutoApplyTip">
        <view class="auto-tip-text">您已满足加入条件，系统将自动为您申请成为分销员</view>
      </view>
    </view>

    <view class="apply-footer-fixed" v-if="showLoginFooter">
      <view class="apply-footer-card">
        <view class="login-tip">登录后即可查看加入条件并申请成为分销员</view>
        <view class="submit" @click="goLogin">立即登录</view>
      </view>
    </view>

    <view class="apply-footer-fixed" v-else-if="showManualApply">
      <view class="apply-footer-card">
        <view class="agree" v-if="conditionsMet" @click="agreed = !agreed">
          <checkbox :checked="agreed" @click.stop="agreed = !agreed" />
          <text>我已阅读并同意</text>
          <text class="agreement-link" @click.stop="openAgreement">《分销员推广服务协议》</text>
        </view>
        <view
          class="submit"
          :class="{ disabled: !canApply }"
          @click="submit"
        >
          申请成为分销员
        </view>
      </view>
    </view>

    <u-popup v-model:show="applyFormVisible" mode="bottom" round="16" :closeable="true">
      <view class="apply-form-popup">
        <view class="apply-form-header">
          <view class="apply-form-title">填写审核信息</view>
          <view class="apply-form-subtitle">商家设置了信息审核，请填写真实信息</view>
        </view>
        <view
          v-for="field in fields"
          :key="field.id"
          class="popup-field"
        >
          <view class="popup-label">
            <text v-if="field.required" class="required">*</text>
            <text>{{ field.fieldName }}</text>
          </view>
          <input
            v-model="formItems[field.id]"
            class="popup-input"
            :placeholder="field.placeholder || `请输入${field.fieldName}`"
            @input="clearFieldError(field.id)"
          />
          <view v-if="fieldErrors[field.id]" class="field-error">{{ fieldErrors[field.id] }}</view>
        </view>
        <view class="popup-next-btn" @click="confirmApplyForm">下一步</view>
      </view>
    </u-popup>

    <u-popup v-model:show="agreementVisible" mode="bottom" round="16" :closeable="true">
      <view class="agreement-popup">
        <view class="agreement-popup-title">分销员推广服务协议</view>
        <scroll-view scroll-y class="agreement-popup-body">
          <rich-text v-if="agreementContent" :nodes="agreementContent" />
          <view v-else class="agreement-empty">暂无协议内容</view>
        </scroll-view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import storage from '@/utils/storage.js'
import config from '@/config/config'
import { parseGoodsImageUrl, tipsToLogin } from '@/utils/filters.js'
import { resolveRecruitDistributionIdFromScene } from '@/utils/distributionBind.js'
import { getRecruitPage, getRecruitProgress, getRecruitInviter, submitRecruitApplication, savePendingRecruitToken } from '@/api/distribution'
import {
  DISTRIBUTION_APPLY_MESSAGE,
  DISTRIBUTION_CLOSE_MESSAGE,
  DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE,
  DISTRIBUTION_RETREAT_MESSAGE,
  DISTRIBUTION_STATUS,
} from '@/utils/distributionStatus'

const defaultAvatar = config.defaultUserPhoto

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const loading = ref(true)
const isDistributionClosed = ref(false)
const pageInfo = ref<any>({})
const progress = ref<any>(null)
const formItems = reactive<Record<string, string>>({})
const agreed = ref(false)
const recruitToken = ref('')
const applySubmitted = ref(false)
const submitAuditMode = ref('')
const submitApplicationStatus = ref('')
const agreementVisible = ref(false)
const applyFormVisible = ref(false)
const formInfoCompleted = ref(false)
const fieldErrors = reactive<Record<string, string>>({})
const inviterInfo = ref<any>(null)

const isUserLoggedIn = ref(!!storage.getAccessToken())

const plan = computed(() => pageInfo.value.plan || null)
const fields = computed(() => pageInfo.value.fields || [])
const recruitGoods = computed(() => plan.value?.recruitGoods || [])
const agreementContent = computed(() => plan.value?.agreementContent || '')

const distributionStatus = computed(() => pageInfo.value.distributionStatus || '')
const currentApplication = computed(() => pageInfo.value.currentApplication || null)
const isRetreated = computed(() => distributionStatus.value === DISTRIBUTION_STATUS.RETREAT)

const hasRecruitToken = computed(() => !!recruitToken.value)
const onlineEntryClosed = computed(() =>
  pageInfo.value.onlineEntryVisible !== true && !hasRecruitToken.value
)

const showPoster = computed(() => {
  if (isRetreated.value) return false
  const p = plan.value
  if (!p) return false
  if (p.posterEnabled === false) return false
  return !!(p.posterBackground && String(p.posterBackground).trim())
})

const posterTitle = computed(() => plan.value?.posterTitle || '')
const posterBenefitText = computed(() => plan.value?.posterBenefitText || '')
const posterRuleText = computed(() => plan.value?.posterRuleText || '')
const posterContact = computed(() => plan.value?.posterContact || '')

const hasJoinCondition = computed(() => {
  if (isRetreated.value) return false
  const p = plan.value
  if (!p || p.joinConditionType !== 'CONDITIONAL') return false
  return !!(p.requireSelfPurchaseAmount || p.requireConsumeCount || p.requirePurchaseGoods)
})

const conditionsMet = computed(() => {
  if (isRetreated.value) return false
  if (!hasJoinCondition.value) return true
  return !!progress.value?.satisfied
})

const isApplyApproved = computed(() => {
  if (isRetreated.value) return false
  if (distributionStatus.value === DISTRIBUTION_STATUS.PASS) return true
  if (submitApplicationStatus.value === 'APPROVED') return true
  if (applySubmitted.value && submitAuditMode.value === 'AUTO_PASS') return true
  return false
})

const isApplyPending = computed(() => {
  if (isRetreated.value) return false
  if (isApplyApproved.value) return false
  if (distributionStatus.value === DISTRIBUTION_STATUS.APPLY) return true
  if (submitApplicationStatus.value === 'PENDING') return true
  if (applySubmitted.value && submitAuditMode.value === 'MANUAL') return true
  return currentApplication.value?.applicationStatus === 'PENDING'
})

const showApplyResult = computed(() => {
  if (isRetreated.value) return false
  return isApplyApproved.value || isApplyPending.value
})

const isManualApply = computed(() => {
  return (plan.value?.applyMode || 'MANUAL') === 'MANUAL'
})

const showLoginFooter = computed(() => {
  return !isDistributionClosed.value && !onlineEntryClosed.value && !isRetreated.value && !!plan.value && !isUserLoggedIn.value && !loading.value
})

const showInviterHeader = computed(() => {
  if (isRetreated.value) return false
  if (!recruitToken.value) return false
  const info = inviterInfo.value
  return !!(info?.memberName || info?.memberAvatar)
})

const inviterName = computed(() => inviterInfo.value?.memberName || '分销员')
const inviterAvatar = computed(() => parseGoodsImageUrl(inviterInfo.value?.memberAvatar) || defaultAvatar)

const showManualApply = computed(() => {
  return !isDistributionClosed.value && !onlineEntryClosed.value && !isRetreated.value && isUserLoggedIn.value && !showApplyResult.value && isManualApply.value
})

const showAutoApplyTip = computed(() => {
  return !isDistributionClosed.value && !onlineEntryClosed.value && !isRetreated.value && isUserLoggedIn.value && !showApplyResult.value && conditionsMet.value && plan.value?.applyMode === 'AUTO'
})

const showApplyForm = computed(() => {
  return !isDistributionClosed.value && !onlineEntryClosed.value && !isRetreated.value && !!plan.value?.requireApplyInfo && fields.value.length > 0
})

const canApply = computed(() => {
  return showManualApply.value && conditionsMet.value && agreed.value
})

const selfPurchaseOk = computed(() => {
  if (!plan.value?.requireSelfPurchaseAmount) return true
  const current = Number(progress.value?.currentSelfPurchaseAmount || 0)
  const min = Number(plan.value?.minSelfPurchaseAmount || 0)
  return current >= min
})

const consumeCountOk = computed(() => {
  if (!plan.value?.requireConsumeCount) return true
  const current = Number(progress.value?.currentConsumeCount || 0)
  const min = Number(plan.value?.minConsumeCount || 0)
  return current >= min
})


onLoad(async (query) => {
  let token = query?.token || query?.distributionId || ''
  if (!token && query?.scene) {
    token = await resolveRecruitDistributionIdFromScene(query.scene)
  }
  recruitToken.value = token ? String(token) : ''
  if (recruitToken.value) {
    loadInviterInfo(recruitToken.value)
  }
})

function loadInviterInfo(distributionId: string) {
  getRecruitInviter(distributionId).then((res) => {
    if (res.data?.success) {
      inviterInfo.value = res.data.result || null
    }
  })
}

function emptyProgress() {
  return {
    satisfied: false,
    currentSelfPurchaseAmount: 0,
    currentConsumeCount: 0,
    purchaseGoodsSatisfied: false,
  }
}

function hasConditionalJoin(planData: any) {
  if (!planData || planData.joinConditionType !== 'CONDITIONAL') return false
  return !!(planData.requireSelfPurchaseAmount || planData.requireConsumeCount || planData.requirePurchaseGoods)
}

function goLogin() {
  // #ifdef MP-WEIXIN
  uni.navigateTo({ url: '/pages/passport/wechatMPLogin' })
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({ url: '/pages/passport/login' })
  // #endif
}

onShow(() => {
  loadPageData()
})

function syncLoginState() {
  isUserLoggedIn.value = !!storage.getAccessToken()
}

function loadPageData() {
  syncLoginState()
  loading.value = true
  isDistributionClosed.value = false
  applySubmitted.value = false
  submitAuditMode.value = ''
  submitApplicationStatus.value = ''
  formInfoCompleted.value = false
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])

  const load = async () => {
    if (isUserLoggedIn.value) {
      if (recruitToken.value) {
        try {
          await savePendingRecruitToken(recruitToken.value)
        } catch (e) {
          // 上报失败不阻断加入页
        }
      }
      try {
        const progressRes = await getRecruitProgress()
        progress.value = progressRes.data?.result || emptyProgress()
      } catch (e) {
        progress.value = emptyProgress()
      }
    }
    const pageRes = await getRecruitPage()
    const pageData = pageRes.data || {}
    if (pageData.code == 22000) {
      isDistributionClosed.value = true
      pageInfo.value = {}
      progress.value = emptyProgress()
      return
    }
    const pageResult = pageData.result || {}
    pageInfo.value = pageResult
    if (!isUserLoggedIn.value) {
      progress.value = hasConditionalJoin(pageResult.plan) ? emptyProgress() : { satisfied: true }
    }
  }

  Promise.resolve(load())
    .catch(() => {})
    .finally(() => {
      loading.value = false
    })
}

function formatMoney(val: number | string | undefined) {
  return Number(val || 0).toFixed(2)
}

function previewPoster() {
  if (!plan.value?.posterBackground) return
  uni.previewImage({
    urls: [plan.value.posterBackground],
    current: plan.value.posterBackground,
  })
}

function goDistributionHome() {
  uni.redirectTo({
    url: '/pages/mine/distribution/home',
  })
}

function openAgreement() {
  agreementVisible.value = true
}

function clearFieldError(fieldId: string) {
  if (fieldErrors[fieldId]) {
    delete fieldErrors[fieldId]
  }
}

function validateFormFields() {
  let valid = true
  Object.keys(fieldErrors).forEach((key) => delete fieldErrors[key])
  fields.value.forEach((field: any) => {
    if (!field.required) return
    const value = formItems[field.id]
    if (value == null || String(value).trim() === '') {
      fieldErrors[field.id] = `请填写${field.fieldName}`
      valid = false
    }
  })
  return valid
}

function confirmApplyForm() {
  if (!validateFormFields()) {
    return
  }
  formInfoCompleted.value = true
  applyFormVisible.value = false
  uni.showToast({ title: '请点击申请成为分销员', icon: 'none' })
}

function doSubmit() {
  const formItemList = showApplyForm.value
    ? fields.value.map((field: any) => ({
        fieldId: field.id,
        fieldValue: formItems[field.id] || '',
      }))
    : []
  submitRecruitApplication({
    recruitToken: recruitToken.value,
    agreementAccepted: agreed.value,
    formItems: formItemList,
  }).then((res) => {
    if (res.data?.success) {
      handleApplySuccess(res.data.result)
      if (isApplyApproved.value) {
        uni.showToast({ title: '申请成功', icon: 'success' })
      } else {
        uni.showToast({ title: '已提交，等待审核', icon: 'none' })
      }
    } else {
      uni.showToast({ title: res.data?.message || '提交失败', icon: 'none' })
    }
  })
}

function handleApplySuccess(application: any) {
  const auditMode = application?.auditMode || plan.value?.auditMode || 'MANUAL'
  const status = application?.applicationStatus || 'PENDING'
  applySubmitted.value = true
  submitAuditMode.value = auditMode
  submitApplicationStatus.value = status
  if (auditMode === 'AUTO_PASS' || status === 'APPROVED') {
    pageInfo.value.distributionStatus = DISTRIBUTION_STATUS.PASS
    if (pageInfo.value.currentApplication) {
      pageInfo.value.currentApplication.applicationStatus = 'APPROVED'
    }
  } else if (pageInfo.value.currentApplication) {
    pageInfo.value.currentApplication.applicationStatus = 'PENDING'
  }
}

function submit() {
  if (!tipsToLogin('normal')) {
    return
  }
  if (isRetreated.value) {
    uni.showToast({ title: DISTRIBUTION_RETREAT_MESSAGE, icon: 'none' })
    return
  }
  if (!showManualApply.value) {
    return
  }
  if (!conditionsMet.value) {
    uni.showToast({ title: '请先满足加入条件', icon: 'none' })
    return
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先同意分销推广服务协议', icon: 'none' })
    return
  }
  if (showApplyForm.value && !formInfoCompleted.value) {
    applyFormVisible.value = true
    return
  }
  doSubmit()
}
</script>

<style lang="scss" scoped>
.wrapper {
  min-height: 100vh;
  padding: 24rpx;
  background: #f5f6f8;
}

.loading,
.empty {
  text-align: center;
  color: #999;
  padding: 80rpx 0;
  font-size: 28rpx;
}

.inviter-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.inviter-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #f5f5f5;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.inviter-meta {
  flex: 1;
  min-width: 0;
}

.inviter-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.inviter-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
}

.login-tip {
  font-size: 26rpx;
  color: #666;
  text-align: center;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.poster-section {
  padding: 0;
  overflow: hidden;
}

.poster-image {
  display: block;
  width: 100%;
  border-radius: 16rpx 16rpx 0 0;
  background: #f5f5f5;
}

.poster-text {
  padding: 24rpx 28rpx 0;
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.4;
}

.poster-benefit {
  padding: 12rpx 28rpx 0;
  font-size: 28rpx;
  color: #ff6b35;
  line-height: 1.5;
}

.poster-rule {
  padding: 12rpx 28rpx 0;
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
}

.poster-contact {
  padding: 12rpx 28rpx 24rpx;
  font-size: 24rpx;
  color: #999;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
  color: #222;
}

.condition-tip {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.condition-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f2f2f2;
}

.condition-item:last-of-type {
  border-bottom: none;
}

.condition-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.condition-label {
  font-size: 28rpx;
  color: #333;
}

.condition-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.condition-status.ok {
  color: #52c41a;
  background: #f6ffed;
}

.condition-status.pending {
  color: #999;
  background: #f5f5f5;
}

.condition-value {
  font-size: 26rpx;
  color: #666;
}

.summary-status {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  text-align: center;
}

.summary-status.ok {
  color: #52c41a;
  background: #f6ffed;
}

.summary-status.pending {
  color: #ff6b35;
  background: #fff7f0;
}

.goods-list {
  margin-top: 12rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.goods-thumb {
  width: 96rpx;
  height: 96rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  margin-right: 16rpx;
}

.goods-meta {
  flex: 1;
  min-width: 0;
}

.goods-name {
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
}

.goods-spec,
.goods-price {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #999;
}

.field {
  margin-bottom: 20rpx;
}

.label {
  font-size: 26rpx;
  margin-bottom: 8rpx;
  color: #333;
}

.required {
  color: #ff4d4f;
  margin-left: 4rpx;
}

.auto-tip {
  text-align: center;
}

.auto-tip-text {
  font-size: 28rpx;
  color: #52c41a;
  line-height: 1.6;
}

.result-section {
  text-align: center;
  padding: 48rpx 28rpx;
}

.result-icon {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 24rpx;
  border-radius: 50%;
  font-size: 48rpx;
  line-height: 96rpx;
}

.result-icon.approved {
  background: #f6ffed;
  color: #52c41a;
}

.result-icon.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.result-icon.retreated {
  background: #fff2f0;
  color: #ff4d4f;
}

.result-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 16rpx;
}

.result-desc {
  font-size: 26rpx;
  color: #999;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.result-section .submit {
  margin-top: 0;
}

.page-body.with-footer {
  padding-bottom: calc(260rpx + env(safe-area-inset-bottom));
}

.apply-footer-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.apply-footer-card {
  background: #fff;
  border-radius: 16rpx 16rpx 0 0;
  padding: 24rpx 28rpx calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.apply-form-popup {
  padding: 32rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
}

.apply-form-header {
  margin-bottom: 32rpx;
}

.apply-form-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 12rpx;
}

.apply-form-subtitle {
  font-size: 24rpx;
  color: #999;
  line-height: 1.5;
}

.popup-field {
  margin-bottom: 28rpx;
}

.popup-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.popup-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  background: #f7f7f7;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.field-error {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #ff4d4f;
}

.popup-next-btn {
  margin-top: 16rpx;
  background: linear-gradient(90deg, #ff8f3f 0%, #ff6b35 100%);
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.agree {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 24rpx;
  font-size: 24rpx;
  color: #666;
}

.agreement-link {
  color: $light-color;
}

.agreement-popup {
  padding: 32rpx 28rpx 48rpx;
  max-height: 70vh;
}

.agreement-popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin-bottom: 24rpx;
  text-align: center;
}

.agreement-popup-body {
  max-height: 56vh;
}

.agreement-empty {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 40rpx 0;
}

.submit {
  background: $light-color;
  color: #fff;
  text-align: center;
  padding: 24rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
}

.submit.disabled {
  opacity: 0.5;
}
</style>
