<template>
  <view class="benefits-page">
    <view v-if="loading && !loaded" class="page-skeleton" aria-label="正在加载会员权益">
      <view class="skeleton skeleton-card" /><view class="skeleton skeleton-growth" />
      <view class="skeleton-grid"><view v-for="n in 4" :key="n" class="skeleton skeleton-benefit" /></view>
    </view>
    <view v-else-if="error && !loaded" class="page-state">
      <u-icon name="info-circle" size="40" color="#b4bac4" /><text class="state-title">权益加载失败</text>
      <text class="state-description">请检查网络后重试</text><button class="retry-button" @click="load">重新加载</button>
    </view>
    <template v-else-if="loaded">
      <view v-if="error" class="refresh-error" @click="load">刷新失败，点击重试</view>
      <view v-if="grades.length">
        <swiper class="grade-swiper" :current="selectedIndex" :duration="250" :disable-touch="grades.length < 2" @change="onGradeSwipe">
          <swiper-item v-for="item in grades" :key="item.grade.id">
            <MemberGradeCard :grade="item.grade" :benefit-count="item.benefits?.length || 0" :is-current="sameId(current.gradeId, item.grade.id)" />
          </swiper-item>
        </swiper>
        <view v-if="grades.length > 1" class="swipe-hint"><text>左右滑动查看等级</text><text>{{ selectedIndex + 1 }} / {{ grades.length }}</text></view>
        <view class="growth-card">
          <view class="section-heading"><text class="section-title">我的成长</text><text class="section-caption">{{ current.grade?.gradeName || '暂无等级' }}</text></view>
          <view class="experience-row"><text class="experience-number">{{ number(current.experience) }}</text><text class="experience-label">当前经验值</text></view>
          <template v-if="current.nextGrade">
            <view class="growth-track"><view class="growth-fill" :style="{ width: progress + '%' }" /></view>
            <view class="growth-labels"><text>{{ number(growthBaseline) }}</text><text>{{ number(current.nextGrade.requiredExperience) }}</text></view>
            <text v-if="Number(current.remainingExperience) > 0" class="growth-description">再获得 <text class="accent">{{ number(current.remainingExperience) }}</text> 经验值，即可升级为{{ current.nextGrade.gradeName }}</text>
            <text v-else class="growth-description">已达到{{ current.nextGrade.gradeName }}的经验门槛，等级以系统更新结果为准</text>
          </template>
          <view v-else-if="current.highestGrade" class="highest-grade"><u-icon name="checkmark-circle" size="16" color="#a47a3b" /><text>已达到最高等级，尽享专属权益</text></view>
          <text v-else class="growth-description">暂无升级信息</text>
          <view class="growth-actions">
            <view class="growth-action" @click="openExperience('tasks')"><u-icon name="level" size="17" color="#9a7545" /><text>经验值任务</text><u-icon name="arrow-right" size="11" color="#b4bac4" /></view>
            <view class="growth-action" @click="openExperience('logs')"><u-icon name="list" size="17" color="#9a7545" /><text>经验值明细</text><u-icon name="arrow-right" size="11" color="#b4bac4" /></view>
          </view>
        </view>
        <view class="benefits-section">
          <view class="section-heading"><text class="section-title">专属权益 <text class="benefit-count">{{ selected.benefits?.length || 0 }}项</text></text><text class="section-caption">点击查看详情</text></view>
          <view v-if="selected.benefits?.length" class="benefit-grid">
            <view v-for="benefit in selected.benefits" :key="benefit.id" class="benefit-card" @click="detail = benefit">
              <view class="benefit-topline"><view class="benefit-icon-wrap">
                <image v-if="benefit.benefitLogo && !failedBenefitIcons[benefit.id]" class="benefit-icon" :src="benefit.benefitLogo" mode="aspectFit" @error="failedBenefitIcons[benefit.id] = true" />
                <u-icon v-else name="gift" size="28" color="#ac844e" />
              </view><u-icon name="arrow-right" size="12" color="#c4c8ce" /></view>
              <text class="benefit-name">{{ benefit.benefitName }}</text><text class="benefit-summary">{{ summary(benefit) }}</text>
              <text class="benefit-state" :class="{ owned: owned(benefit) }">{{ benefitState(benefit) }}</text>
            </view>
          </view>
          <view v-else class="empty-benefits"><u-icon name="gift" size="36" color="#c1c6ce" /><text>该等级暂未配置权益</text><text class="state-description">可以切换其他等级查看</text></view>
        </view>
        <view class="page-notice"><text>权益说明</text><text>各等级权益独立配置，以当前等级实际享有的权益为准。具体适用条件与发放规则请查看权益详情。</text></view>
      </view>
      <view v-else class="page-state"><u-icon name="gift" size="40" color="#b4bac4" /><text class="state-title">暂无会员等级</text><text class="state-description">等级权益配置后将在这里展示</text></view>
    </template>
    <view v-if="detail" class="detail-overlay">
      <view class="detail-backdrop" @click="detail = null" @touchmove.stop.prevent />
      <view class="detail-sheet">
        <view class="sheet-handle" /><view class="detail-header"><text>权益详情</text><view class="close-icon" aria-label="关闭权益详情" @click="detail = null"><u-icon name="close" size="20" color="#707783" /></view></view>
        <scroll-view scroll-y class="detail-scroll">
          <view class="detail-content">
            <view class="detail-identity">
              <image v-if="detail.benefitLogo && !failedBenefitIcons[detail.id]" class="detail-icon" :src="detail.benefitLogo" mode="aspectFit" @error="failedBenefitIcons[detail.id] = true" />
              <u-icon v-else name="gift" size="36" color="#ac844e" /><text class="detail-title">{{ detail.benefitName }}</text>
              <text class="benefit-state" :class="{ owned: owned(detail) }">{{ benefitState(detail) }}</text>
            </view>
            <view class="detail-rule"><text class="rule-label">权益规则</text><text>{{ rule(detail) }}</text></view>
            <text class="description-title">使用说明</text><rich-text v-if="detail.benefitDesc" class="rich-description" :nodes="detailDescription" />
            <text v-else class="state-description">暂无详细说明</text>
          </view>
        </scroll-view>
        <view class="sheet-footer"><button class="confirm-button" @click="detail = null">我知道了</button></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onPullDownRefresh, onUnload } from '@dcloudio/uni-app'
import { getCurrentMemberBenefits, getMemberGradeBenefits } from '@/api/members'
import { isLogin, navigateToLogin } from '@/utils/filters'
import MemberGradeCard from './components/MemberGradeCard.vue'

const loading = ref(false), loaded = ref(false), error = ref(false)
const current = ref({}), grades = ref([]), selectedId = ref(''), detail = ref(null)
const failedBenefitIcons = ref({})
let requestId = 0, ownerId = ''
const sameId = (a, b) => a != null && b != null && String(a) === String(b)
const selected = computed(() => grades.value.find(item => sameId(item.grade.id, selectedId.value)) || {})
const selectedIndex = computed(() => Math.max(0, grades.value.findIndex(item => sameId(item.grade.id, selectedId.value))))
const progress = computed(() => Math.max(0, Math.min(100, Number(current.value.upgradeProgress) || 0)))
const growthBaseline = computed(() => current.value.grade?.isDefault ? 0 : current.value.grade?.requiredExperience || 0)
const owned = benefit => (current.value.benefits || []).some(item => sameId(item.id, benefit.id))
function number(value) { return Math.max(0, Number(value) || 0).toLocaleString('en-US') }
function config(benefit) {
  try { const value = typeof benefit.benefitConfig === 'string' ? JSON.parse(benefit.benefitConfig) : benefit.benefitConfig; return value && typeof value === 'object' ? value : {} } catch { return {} }
}
function summary(benefit) {
  const value = config(benefit)
  switch (benefit.benefitType) {
    case 'POINT_MULTIPLIER': return `购物积分按 ${value.multiplier || 1} 倍计算`
    case 'GIFT_POINT': return `首次达到等级赠送 ${number(value.giftPoint)} 积分`
    case 'COUPON_PACKAGE': return value.grantRule === 'MONTHLY' ? `每月 ${value.grantDay || 1} 号发放优惠券` : value.grantRule === 'PERIOD' ? `每 ${value.periodMonths || 1} 个月发放优惠券` : '首次达到等级赠送优惠券'
    case 'GRADE_BADGE': return '展示你的专属等级身份'
    case 'EXCLUSIVE_CUSTOMER_SERVICE': return '享受会员专属客服服务'
    default: return '查看权益介绍与适用说明'
  }
}
function rule(benefit) {
  const text = summary(benefit)
  switch (benefit.benefitType) {
    case 'POINT_MULTIPLIER': return `${text}，同类权益取最高倍率，不叠加。`
    case 'GIFT_POINT': return `${text}，同一等级的该权益仅赠送一次。`
    case 'COUPON_PACKAGE': return `${text}。每月不存在指定日期时取当月最后一天；按周期发放时首期立即发放，暂停期间未生成的历史周期不追发。具体券种和数量以实际发放为准。`
    case 'CUSTOM': return '适用条件、参与方式及服务内容以以下权益介绍为准。'
    default: return `${text}，具体服务内容请查看以下说明。`
  }
}
function benefitState(benefit) {
  if (owned(benefit)) return '已享有'
  return Number(selected.value.grade?.requiredExperience) > Number(current.value.grade?.requiredExperience || 0) ? '达到该等级可享' : '当前等级未包含'
}
const detailDescription = computed(() => String(detail.value?.benefitDesc || '').replace(/<img\b[^>]*>/gi, tag =>
  tag.replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '').replace(/<img\b/i, '<img style="max-width:100%;height:auto;display:block;"')))
function selectGrade(id) { selectedId.value = id; detail.value = null }
function openExperience(tab) { uni.navigateTo({ url: `/pages/mine/experience?tab=${tab}` }) }
function onGradeSwipe(event) {
  // 初始化和刷新引发的程序切换无需回写，避免旧事件覆盖最新选择。
  if (event.detail?.source !== 'touch') return
  const item = grades.value[event.detail.current]
  if (item) selectGrade(item.grade.id)
}

function resetMembership() {
  requestId++; ownerId = ''; loaded.value = false; loading.value = false; error.value = false
  current.value = {}; grades.value = []; selectedId.value = ''; detail.value = null; failedBenefitIcons.value = {}
}

async function load() {
  const memberId = String(isLogin()?.id || '')
  if (!memberId) { resetMembership(); navigateToLogin(); uni.stopPullDownRefresh(); return }
  if (ownerId !== memberId) {
    ownerId = memberId; loaded.value = false
    current.value = {}; grades.value = []; selectedId.value = ''; detail.value = null; failedBenefitIcons.value = {}
  }
  const id = ++requestId
  const stillCurrent = () => id === requestId && String(isLogin()?.id || '') === memberId
  loading.value = true; error.value = false
  try {
    const [a, b] = await Promise.all([getCurrentMemberBenefits(), getMemberGradeBenefits()])
    if (!stillCurrent()) return
    if (!a.data?.success || !b.data?.success) throw new Error('load')
    current.value = a.data.result || {}
    grades.value = (b.data.result || []).filter(item => item.grade?.gradeState === 'OPEN')
    const requested = selectedId.value || current.value.gradeId
    selectedId.value = grades.value.find(item => sameId(item.grade.id, requested))?.grade.id || grades.value[0]?.grade.id || ''
    detail.value = null; failedBenefitIcons.value = {}; loaded.value = true
  } catch { if (stillCurrent()) error.value = true }
  finally { if (id === requestId) { loading.value = false; uni.stopPullDownRefresh() } }
}
onShow(load)
onPullDownRefresh(load)
onUnload(() => { requestId++ })
</script>

<style scoped lang="scss">
.benefits-page { min-height: 100vh; box-sizing: border-box; background: #f5f6f9; padding: 24rpx 28rpx calc(36rpx + env(safe-area-inset-bottom)); color: #252b35; }
.grade-swiper { width: 100%; height: 299rpx; border-radius: 24rpx; overflow: hidden; }
.swipe-hint { display: flex; justify-content: space-between; margin-top: 14rpx; color: #a0a5af; font-size: 21rpx; }
.growth-card { margin-top: 24rpx; padding: 28rpx; background: #fff; border-radius: 20rpx; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; }
.section-caption { font-size: 22rpx; color: #959ba5; }
.experience-row { display: flex; align-items: baseline; gap: 12rpx; margin-top: 20rpx; }
.experience-number { font-size: 42rpx; font-weight: 600; }
.experience-label { font-size: 22rpx; color: #959ba5; }
.growth-track { margin-top: 20rpx; height: 10rpx; overflow: hidden; background: #f2eee8; border-radius: 8rpx; }
.growth-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #dfc59b, #ae8245); transition: width .25s; }
.growth-labels { display: flex; justify-content: space-between; font-size: 20rpx; color: #a0a5af; margin-top: 8rpx; }
.growth-description { display: block; margin-top: 16rpx; color: #777e88; font-size: 24rpx; line-height: 1.7; }
.accent { color: #a47a3b; font-weight: 600; }
.highest-grade { display: flex; align-items: center; gap: 10rpx; margin-top: 18rpx; color: #987343; font-size: 24rpx; }
.growth-actions { display: flex; margin-top: 24rpx; padding-top: 22rpx; border-top: 1rpx solid #f0f1f4; }
.growth-action { flex: 1; display: flex; justify-content: center; align-items: center; gap: 10rpx; padding: 8rpx 0; font-size: 24rpx; color: #777e88; }
.growth-action + .growth-action { border-left: 1rpx solid #eceef2; }
.benefits-section { margin-top: 36rpx; }
.benefit-count { color: #9a7b50; font-size: 24rpx; font-weight: 400; margin-left: 10rpx; }
.benefit-grid { margin-top: 20rpx; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20rpx; }
.benefit-card { background: #fff; padding: 24rpx; border-radius: 20rpx; display: flex; flex-direction: column; align-items: flex-start; }
.benefit-card:active { background: #fcfaf6; }
.benefit-topline { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.benefit-icon-wrap { width: 84rpx; height: 84rpx; background: #faf6ee; border-radius: 22rpx; display: flex; align-items: center; justify-content: center; }
.benefit-icon { width: 64rpx; height: 64rpx; }
.benefit-name { font-size: 27rpx; font-weight: 600; line-height: 1.5; margin-top: 18rpx; overflow-wrap: anywhere; }
.benefit-summary { margin: 8rpx 0 20rpx; color: #9298a2; font-size: 22rpx; line-height: 1.6; flex: 1; }
.benefit-state { display: inline-block; border-radius: 8rpx; padding: 5rpx 10rpx; background: #f4f5f7; color: #9298a2; font-size: 20rpx; line-height: 1.5; }
.benefit-state.owned { background: #f6eedf; color: #97713c; }
.empty-benefits { margin-top: 20rpx; padding: 48rpx 20rpx; background: #fff; border-radius: 20rpx; display: flex; align-items: center; flex-direction: column; gap: 16rpx; font-size: 26rpx; color: #777e88; }
.page-notice { margin-top: 32rpx; color: #a0a5ae; font-size: 22rpx; line-height: 1.8; }
.page-notice text { display: block; }
.page-notice text:first-child { margin-bottom: 8rpx; color: #858c97; font-weight: 500; }
.page-state { min-height: 65vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 22rpx; }
.state-title { font-size: 30rpx; color: #727985; }
.state-description { font-size: 24rpx; color: #a0a6af; }
.retry-button { font-size: 26rpx; color: #8d6836; background: #f1e6d4; padding: 0 36rpx; margin-top: 10rpx; border-radius: 40rpx; }
button::after { border: none; }
.refresh-error { padding: 16rpx; margin-bottom: 20rpx; background: #fff3df; color: #a27a42; font-size: 24rpx; border-radius: 12rpx; text-align: center; }
.skeleton { background: #e8ebef; border-radius: 20rpx; }
.skeleton-card { height: 299rpx; }
.skeleton-growth { height: 160rpx; margin: 24rpx 0; }
.skeleton-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20rpx; }
.skeleton-benefit { height: 270rpx; }
.detail-overlay { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; }
.detail-backdrop { position: absolute; inset: 0; background: rgba(20, 25, 34, .45); }
.detail-sheet { position: relative; width: 100%; background: #fff; border-radius: 32rpx 32rpx 0 0; overflow: hidden; }
.sheet-handle { width: 64rpx; height: 7rpx; margin: 16rpx auto 8rpx; background: #e1e4e9; border-radius: 8rpx; }
.detail-header { display: flex; justify-content: space-between; align-items: center; padding: 8rpx 20rpx 16rpx 32rpx; font-size: 28rpx; font-weight: 500; }
.close-icon { padding: 16rpx; }
.detail-scroll { height: 48vh; }
.detail-content { padding: 8rpx 32rpx 32rpx; }
.detail-identity { display: flex; flex-direction: column; align-items: center; gap: 16rpx; padding: 12rpx 0 28rpx; }
.detail-icon { width: 96rpx; height: 96rpx; }
.detail-title { font-size: 34rpx; font-weight: 600; text-align: center; }
.detail-rule { background: #faf6ef; border-radius: 16rpx; padding: 24rpx; font-size: 25rpx; color: #987445; line-height: 1.8; }
.detail-rule text { display: block; }
.rule-label { font-weight: 600; margin-bottom: 8rpx; }
.description-title { display: block; font-size: 28rpx; font-weight: 600; margin: 28rpx 0 20rpx; }
.rich-description { display: block; font-size: 26rpx; line-height: 1.8; color: #737a85; overflow-wrap: anywhere; }
.sheet-footer { padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom)); border-top: 1rpx solid #f2f3f5; }
.confirm-button { background: #f2e5cf; color: #805d2d; font-size: 28rpx; border-radius: 40rpx; line-height: 80rpx; }
</style>
