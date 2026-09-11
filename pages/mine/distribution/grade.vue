<template>
  <view class="page" :style="themeStyle">
    <view v-if="loading" class="loading-wrap">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="!gradeList.length" class="empty-wrap">
      <text class="empty-text">暂无等级信息</text>
    </view>

    <view v-else class="content">
      <!-- 当前等级头部 -->
      <view class="hero-card">
        <view class="hero-top">
          <view class="hero-user">
            <image class="hero-avatar" :src="userInfo.face || defaultAvatar" mode="aspectFill" />
            <view class="hero-name">{{ currentGradeName }}</view>
          </view>
        </view>
        <view class="progress-wrap">
          <view class="progress-line" v-if="gradeList.length > 1"></view>
          <view class="progress-steps">
            <view
              v-for="grade in gradeList"
              :key="grade.id || grade.sortOrder"
              class="progress-step"
              :class="{ active: Number(grade.sortOrder) === currentGradeValue }"
            >
              <view class="step-dot"></view>
              <view class="step-name">V{{ grade.sortOrder }}</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 佣金比例 -->
      <view class="card commission-card" v-if="currentGrade">
        <view class="commission-row">
          <view class="commission-item">
            <view class="commission-icon">推</view>
            <view class="commission-text">
              <text class="commission-rate">{{ formatRate(currentGrade.goodsCommissionRate) }}%</text>
              <text class="commission-label">商品佣金比</text>
            </view>
          </view>
          <view class="commission-divider"></view>
          <view class="commission-item">
            <view class="commission-icon">邀</view>
            <view class="commission-text">
              <text class="commission-rate">{{ formatRate(currentGrade.inviteCommissionRate) }}%</text>
              <text class="commission-label">邀请佣金比</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 下一等级升级要求 -->
      <view class="card upgrade-card" v-if="distributionData.id && nextGrade">
        <view class="upgrade-title">
          满足以下规则可升级为<text class="upgrade-target">{{ nextGrade.gradeName }}</text>
        </view>
        <view class="upgrade-list" v-if="upgradeConditions.length">
          <view
            v-for="(item, index) in upgradeConditions"
            :key="index"
            class="upgrade-item"
          >
            <view class="upgrade-status" :class="item.achieved ? 'achieved' : 'pending'">
              {{ item.achieved ? '已达标' : '未达标' }}
            </view>
            <view class="upgrade-text">
              <text>{{ item.label }}</text>
              <text v-if="!item.achieved && item.gapText" class="upgrade-gap">{{ item.gapText }}</text>
            </view>
          </view>
        </view>
        <view v-else class="upgrade-empty">暂无升级条件配置</view>
      </view>

      <view class="card upgrade-card" v-else-if="distributionData.id">
        <view class="upgrade-title">当前已是最高等级</view>
        <view class="upgrade-empty">继续保持优秀业绩吧</view>
      </view>

      <!-- 等级规则 -->
      <view class="card rules-card" v-if="upgradeConditionVisible !== false">
        <view class="rules-title">等级规则</view>
        <view class="rules-timeline">
          <view
            v-for="(grade, index) in gradeList"
            :key="'rule-' + (grade.id || grade.sortOrder)"
            class="timeline-item"
          >
            <view class="timeline-axis">
              <view class="timeline-dot"></view>
              <view v-if="index < gradeList.length - 1" class="timeline-line"></view>
            </view>
            <view class="timeline-content">
              <view class="grade-tag">{{ grade.gradeName }}</view>
              <view class="rule-section">
                <view class="rule-section-title">规则介绍</view>
                <view class="rule-section-text">{{ buildGradeRule(grade) }}</view>
              </view>
              <view class="rule-section">
                <view class="rule-section-title">权益介绍</view>
                <view class="rule-section-text">{{ buildGradeBenefit(grade) }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useStore } from '@/store'
import { getThemeStyle } from '@/utils/theme'
import config from '@/config/config'
import { getDistributionGrades } from '@/api/distribution'
import { assertActiveDistributor } from '@/utils/distributionStatus'
import { getUserInfo } from '@/api/members'

const store = useStore()
const themeStyle = computed(() => getThemeStyle(store.state.theme))
const defaultAvatar = config.defaultUserPhoto
const loading = ref(true)
const distributionData = ref<Record<string, any>>({})
const gradeList = ref<any[]>([])
const upgradeConditionVisible = ref<boolean | undefined>(true)

const userInfo = computed(() => store.state.userInfo || {})

const currentGradeValue = computed(() => {
  const val = Number(distributionData.value.gradeId)
  return Number.isFinite(val) && val > 0 ? val : 1
})

const currentGrade = computed(() => {
  return gradeList.value.find((g) => Number(g.sortOrder) === currentGradeValue.value) || null
})

const currentGradeName = computed(() => currentGrade.value?.gradeName || '普通分销员')

const nextGrade = computed(() => {
  return gradeList.value.find((g) => Number(g.sortOrder) === currentGradeValue.value + 1) || null
})

const upgradeConditions = computed(() => {
  if (!nextGrade.value) return []
  return buildUpgradeConditions(nextGrade.value, distributionData.value)
})

onShow(() => {
  refreshUserInfo()
  loadPageData()
})

function refreshUserInfo() {
  getUserInfo().then((res) => {
    if (res.data?.result) {
      store.commit('login', res.data.result)
    }
  })
}

function loadPageData() {
  loading.value = true
  let allowed = false
  assertActiveDistributor()
    .then((result) => {
      if (!result) {
        return
      }
      allowed = true
      distributionData.value = result
      return fetchGrades()
    })
    .finally(() => {
      if (allowed) {
        loading.value = false
      }
    })
}

function fetchGrades() {
  return getDistributionGrades()
    .then((res) => {
      const result = res.data?.result
      upgradeConditionVisible.value = result?.upgradeConditionVisible
      const grades = result?.grades
      gradeList.value = (Array.isArray(grades) ? grades : []).sort(
        (a: any, b: any) => Number(a.sortOrder) - Number(b.sortOrder)
      )
    })
    .catch(() => {
      gradeList.value = []
    })
}

function formatMoney(val: number | string) {
  return Number(val || 0).toFixed(2)
}

function formatRate(val: number | string | undefined) {
  const num = Number(val || 0)
  if (!Number.isFinite(num)) {
    return '0'
  }
  return (num * 100).toFixed(2).replace(/\.?0+$/, '') || '0'
}

function buildGradeRule(grade: any) {
  if (Number(grade.sortOrder) === 1) {
    return '成为分销员后即是该等级'
  }
  const parts: string[] = []
  if (grade.enableSalesCondition && Number(grade.salesThreshold || 0) > 0) {
    parts.push(`推广金额达 ${formatMoney(grade.salesThreshold)} 元`)
  }
  if (grade.enableCommissionCondition && Number(grade.commissionThreshold || 0) > 0) {
    parts.push(`收益额达 ${formatMoney(grade.commissionThreshold)} 元`)
  }
  if (grade.enableInviteCondition && Number(grade.inviteThreshold || 0) > 0) {
    parts.push(`邀请人数达 ${grade.inviteThreshold} 人`)
  }
  if (!parts.length) return '达到指定条件即可升级'
  return parts.join('，且')
}

function buildGradeBenefit(grade: any) {
  const parts: string[] = []
  const goods = Number(grade.goodsCommissionRate || 0)
  const invite = Number(grade.inviteCommissionRate || 0)
  if (goods > 0) parts.push(`商品佣金比为 ${formatRate(goods)}%`)
  if (invite > 0) parts.push(`邀请佣金比为 ${formatRate(invite)}%`)
  return parts.length ? parts.join('；') : '暂无权益说明'
}

function buildUpgradeConditions(grade: any, data: Record<string, any>) {
  const conditions: Array<{ label: string; achieved: boolean; gapText?: string }> = []
  const sales = Number(data.validSalesAmount || 0)
  const commission = Number(data.validCommissionAmount || data.rebateTotal || 0)
  const invites = Number(data.inviteCount || 0)

  if (grade.enableSalesCondition) {
    const threshold = Number(grade.salesThreshold || 0)
    const achieved = sales >= threshold
    conditions.push({
      label: `推广金额达${formatMoney(threshold)}元`,
      achieved,
      gapText: achieved ? undefined : `（还差 ${formatMoney(Math.max(threshold - sales, 0))} 元）`,
    })
  }

  if (grade.enableCommissionCondition) {
    const threshold = Number(grade.commissionThreshold || 0)
    const achieved = commission >= threshold
    conditions.push({
      label: `收益额达${formatMoney(threshold)}元`,
      achieved,
      gapText: achieved ? undefined : `（还差 ${formatMoney(Math.max(threshold - commission, 0))} 元）`,
    })
  }

  if (grade.enableInviteCondition) {
    const threshold = Number(grade.inviteThreshold || 0)
    const achieved = invites >= threshold
    conditions.push({
      label: `邀请人数达${threshold}人`,
      achieved,
      gapText: achieved ? undefined : `（还差 ${Math.max(threshold - invites, 0)} 人）`,
    })
  }

  return conditions
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f6f8;
}

.loading-wrap,
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-text,
.empty-text {
  color: #999;
  font-size: 28rpx;
}

.content {
  padding: 24rpx;
}

.hero-card {
  margin-bottom: 24rpx;
  padding: 40rpx 32rpx 48rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #d4a574 0%, #c9956a 45%, #b8845a 100%);
  box-shadow: 0 12rpx 32rpx rgba(184, 132, 90, 0.25);
}

.hero-top {
  margin-bottom: 40rpx;
}

.hero-user {
  display: flex;
  align-items: center;
}

.hero-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
  margin-right: 24rpx;
  background: #eee;
}

.hero-name {
  color: #fff;
  font-size: 40rpx;
  font-weight: 700;
}

.progress-wrap {
  position: relative;
}

.progress-line {
  position: absolute;
  left: 12rpx;
  right: 12rpx;
  top: 12rpx;
  height: 4rpx;
  background: rgba(255, 255, 255, 0.35);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

.progress-step {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  align-items: center;
  min-width: 0;
}

.progress-step:first-child {
  align-items: flex-start;
}

.progress-step:last-child {
  align-items: flex-end;
}

.progress-step:first-child:last-child {
  align-items: center;
  width: 100%;
}

.step-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.45);
  margin-bottom: 16rpx;
}

.progress-step.active .step-dot {
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(255, 255, 255, 0.25);
}

.step-name {
  color: rgba(255, 255, 255, 0.75);
  font-size: 22rpx;
  text-align: center;
  line-height: 1.4;
  padding: 0 6rpx;
}

.progress-step.active .step-name {
  color: #fff;
  font-weight: 600;
}

.card {
  margin-bottom: 24rpx;
  padding: 32rpx 28rpx;
  border-radius: 20rpx;
  background: #fff;
}

.card:last-child {
  margin-bottom: 0;
}

.commission-card {
  padding: 36rpx 28rpx 28rpx;
}

.commission-row {
  display: flex;
  align-items: center;
}

.commission-item {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.commission-divider {
  flex-shrink: 0;
  width: 1rpx;
  height: 72rpx;
  margin: 0 16rpx;
  background: #f0f0f0;
}

.commission-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #f8efe6;
  color: #b8845a;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.commission-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.commission-rate {
  color: #222;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1.2;
}

.commission-label {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
}

.upgrade-title {
  color: #5c3b00;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1.6;
}

.upgrade-target {
  color: #ff6b35;
  font-weight: 700;
}

.upgrade-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}

.upgrade-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.upgrade-status {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  line-height: 1.4;
}

.upgrade-status.achieved {
  color: #52c41a;
  background: #f6ffed;
}

.upgrade-status.pending {
  color: #999;
  background: #f5f5f5;
}

.upgrade-text {
  flex: 1;
  color: #333;
  font-size: 28rpx;
  line-height: 1.6;
}

.upgrade-gap {
  color: #ff6b35;
}

.upgrade-empty {
  margin-top: 16rpx;
  color: #999;
  font-size: 26rpx;
}

.rules-title {
  margin-bottom: 28rpx;
  color: #5c3b00;
  font-size: 32rpx;
  font-weight: 600;
}

.rules-timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  align-items: stretch;
}

.timeline-axis {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 32rpx;
  margin-right: 20rpx;
}

.timeline-dot {
  flex-shrink: 0;
  width: 16rpx;
  height: 16rpx;
  margin-top: 18rpx;
  border-radius: 50%;
  background: #ff8f3f;
}

.timeline-line {
  flex: 1;
  width: 2rpx;
  min-height: 40rpx;
  margin: 8rpx 0;
  background: #f0d4b8;
}

.timeline-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 36rpx;
}

.timeline-item:last-child .timeline-content {
  padding-bottom: 0;
}

.grade-tag {
  display: inline-block;
  margin-bottom: 20rpx;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  background: #f8efe6;
  color: #5c3b00;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.3;
}

.rule-section {
  margin-bottom: 20rpx;
}

.rule-section:last-child {
  margin-bottom: 0;
}

.rule-section-title {
  margin-bottom: 8rpx;
  color: #5c3b00;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
}

.rule-section-text {
  color: #666;
  font-size: 26rpx;
  line-height: 1.6;
}
</style>
