<template>
  <view class="experience-page">
    <view class="summary-card">
      <text class="summary-label">当前经验值</text><text class="summary-number">{{ summaryLoaded ? formatNumber(experience) : '—' }}</text>
      <text class="summary-grade">{{ gradeName || '经验积累，解锁更多等级权益' }}</text>
      <text v-if="logError && !summaryLoaded" class="summary-retry" @click="loadLogs(true)">经验值加载失败，点击重试</text>
    </view>
    <view class="tabs"><view class="tab" :class="{ active: activeTab === 'tasks' }" @click="activeTab = 'tasks'">经验值任务</view><view class="tab" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">经验值明细</view></view>
    <view v-if="activeTab === 'tasks'">
      <view class="section-heading"><text>做任务，积累经验</text></view>
      <view v-if="taskLoading && !tasksLoaded" class="state">正在加载任务…</view>
      <view v-else-if="taskError" class="state"><text>任务加载失败</text><button class="retry" @click="loadTasks">点击重试</button></view>
      <template v-else>
        <view v-for="item in tasks" :key="item.ruleKey" class="task-card">
          <view class="task-main"><view class="task-title-row"><text class="task-title">{{ taskName(item) }}</text><text class="reward">{{ rewardText(item) }}</text></view>
            <text class="task-description">{{ taskDescription(item) }}</text>
            <text class="task-progress">累计获得 {{ formatNumber(item.gainedExperience) }} 经验<text v-if="hasLimit(item)"> · 上限 {{ formatNumber(item.maxValue) }}</text></text>
          </view>
          <view class="task-footer"><text class="task-status">{{ statusText(item) }}</text><button class="task-button" :class="{ finished: isFinished(item) }" :disabled="isFinished(item)" @click="doTask(item)">{{ actionText(item) }}</button></view>
        </view>
        <view v-if="tasksLoaded && !tasks.length" class="state"><u-icon name="list" size="36" color="#bec4ce" /><text>暂无已开启的经验值任务</text></view>
        <view v-if="description" class="rules-note"><text class="note-title">经验值说明</text><text>{{ description }}</text></view>
        <text class="page-note">完成相应行为并满足规则后，由系统自动发放经验值，无需手动领取。</text>
      </template>
    </view>
    <view v-else>
      <view class="section-heading"><text>经验值变动记录</text><text class="section-caption">按时间倒序展示</text></view>
      <view v-if="logsLoading && !records.length" class="state">正在加载明细…</view>
      <view v-else-if="!records.length && logError" class="state"><text>明细加载失败</text><button class="retry" @click="retryLogs">点击重试</button></view>
      <view v-else-if="!records.length" class="state"><u-icon name="list" size="36" color="#bec4ce" /><text>暂无经验值明细</text><text class="state-hint">完成已开启的任务后，可在这里查看</text></view>
      <view v-else class="record-list">
        <view v-for="item in records" :key="item.id" class="record-row"><view class="record-content"><text class="record-title">{{ item.content || ruleNames[item.ruleKey] || '经验值变动' }}</text><text class="record-time">{{ item.createTime || '—' }}</text><text class="record-balance">变动后经验：{{ formatNumber(item.experience) }}</text></view><text class="record-change" :class="{ negative: Number(item.variableExperience) < 0 }">{{ changeText(item.variableExperience) }}</text></view>
      </view>
      <view v-if="records.length" class="load-more" @click="retryLogs">{{ logsLoading ? '加载中…' : logError ? '加载失败，点击重试' : hasMore ? '点击或上拉加载更多' : '已显示全部明细' }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow, onReachBottom, onPullDownRefresh, onUnload } from '@dcloudio/uni-app'
import { getExperienceTasks, getExperienceRecords } from '@/api/members'
import { isLogin, navigateToLogin } from '@/utils/filters'

const activeTab = ref('tasks'), experience = ref(0), gradeName = ref(''), summaryLoaded = ref(false)
const tasks = ref([]), description = ref(''), taskLoading = ref(false), tasksLoaded = ref(false), taskError = ref(false)
const records = ref([]), logsLoading = ref(false), logError = ref(false), hasMore = ref(true)
let ownerId = '', taskRequest = 0, logRequest = 0, nextPage = 1, retryReset = true
const pageSize = 20
const ruleNames = { CONSUME: '购物消费', REGISTER: '注册会员', SIGN_IN: '每日签到', COMMENT: '商品评价', SHARE: '分享商城', PROFILE: '完善个人信息', FOLLOW_STORE: '关注店铺', BIND_WECHAT: '绑定微信', ADD_ADDRESS: '添加收货地址', SHARE_REGISTER: '邀请注册', SHARE_BUY: '邀请购买' }
const onceRules = new Set(['REGISTER', 'PROFILE', 'BIND_WECHAT', 'ADD_ADDRESS'])
const taskDescriptions = { CONSUME: '订单完成后，按实际消费金额向下取整计算经验。', REGISTER: '注册成功后获得一次经验奖励。', SIGN_IN: '每天签到可获得一次经验奖励。', COMMENT: '对已购买商品提交超过30字的评价，满足条件后获得经验。', SHARE: '通过商城的分享入口分享页面，满足条件后获得经验。', PROFILE: '完善个人信息，满足条件后获得一次经验奖励。', FOLLOW_STORE: '关注店铺可获得经验，同一店铺不重复发放。', BIND_WECHAT: '成功绑定微信，满足条件后获得一次经验奖励。', ADD_ADDRESS: '添加收货地址后获得一次经验奖励。', SHARE_REGISTER: '通过分享邀请新用户注册成功后获得经验。', SHARE_BUY: '通过分享邀请用户购买并满足奖励条件后获得经验。' }
function formatNumber(value) { return Math.max(0, Number(value) || 0).toLocaleString('en-US') }
function changeText(value) { const n = Number(value) || 0; return `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toLocaleString('en-US')}` }
function taskName(item) { return item.ruleName || ruleNames[item.ruleKey] || '经验值任务' }
function taskDescription(item) { return taskDescriptions[item.ruleKey] || '按商城配置的规则完成相应行为后获得经验。' }
function rewardText(item) { return item.ruleKey === 'CONSUME' ? `每1元 +${formatNumber(item.value)}` : `+${formatNumber(item.value)} 经验` }
function hasLimit(item) { return item.ruleKey !== 'CONSUME' && item.maxValue != null && Number(item.maxValue) > 0 }
function reachedLimit(item) { return hasLimit(item) && Number(item.gainedExperience) >= Number(item.maxValue) }
function isFinished(item) { return reachedLimit(item) || (onceRules.has(item.ruleKey) && Boolean(item.completed)) }
function statusText(item) { return reachedLimit(item) ? '已达经验上限' : isFinished(item) ? '已完成' : item.ruleKey === 'SIGN_IN' ? '每日可参与' : onceRules.has(item.ruleKey) ? '仅限一次' : '满足条件可获得' }
function actionText(item) { return isFinished(item) ? '已完成' : item.ruleKey === 'SIGN_IN' ? '去签到' : item.ruleKey === 'PROFILE' ? '去完善' : item.ruleKey === 'ADD_ADDRESS' ? '去添加' : item.ruleKey === 'COMMENT' ? '去评价' : item.ruleKey === 'CONSUME' || item.ruleKey === 'FOLLOW_STORE' || item.ruleKey.startsWith('SHARE') ? '去逛逛' : '查看规则' }
function doTask(item) {
  if (isFinished(item)) return
  const routes = { SIGN_IN: '/pages/mine/signIn', PROFILE: '/pages/mine/set/personMsg', ADD_ADDRESS: '/pages/mine/address/addressManage', COMMENT: '/pages/order/myOrder?status=4' }
  if (routes[item.ruleKey]) uni.navigateTo({ url: routes[item.ruleKey] })
  else if (item.ruleKey === 'CONSUME' || item.ruleKey === 'FOLLOW_STORE' || item.ruleKey.startsWith('SHARE')) uni.switchTab({ url: '/pages/tabbar/home/index' })
  else uni.showModal({ title: taskName(item), content: taskDescription(item), showCancel: false })
}
function stillOwner(memberId) { return ownerId === memberId && String(isLogin()?.id || '') === memberId }
function reset() {
  taskRequest++; logRequest++; ownerId = ''
  tasks.value = []; records.value = []; description.value = ''; experience.value = 0; gradeName.value = ''
  summaryLoaded.value = false; tasksLoaded.value = false; taskLoading.value = false; logsLoading.value = false
  taskError.value = false; logError.value = false; hasMore.value = true; nextPage = 1; retryReset = true
}
async function loadTasks() {
  if (!ownerId) return
  const memberId = ownerId, id = ++taskRequest
  taskLoading.value = true; taskError.value = false
  try {
    const response = await getExperienceTasks()
    if (id !== taskRequest || !stillOwner(memberId)) return
    if (!response.data?.success) throw new Error('tasks')
    const data = response.data.result || {}
    // 服务端 /rules 仅返回开启的任务；兼容接口未来增加 enabled 字段。
    tasks.value = (data.items || []).filter(item => item && item.ruleKey && item.enabled !== false)
    description.value = data.description || ''; tasksLoaded.value = true
  } catch { if (id === taskRequest && stillOwner(memberId)) taskError.value = true }
  finally { if (id === taskRequest) taskLoading.value = false }
}
async function loadLogs(refresh = false) {
  if (!ownerId || (!refresh && (logsLoading.value || !hasMore.value))) return
  const memberId = ownerId, id = ++logRequest, page = refresh ? 1 : nextPage
  retryReset = refresh; logsLoading.value = true; logError.value = false
  try {
    const response = await getExperienceRecords({ pageNumber: page, pageSize })
    if (id !== logRequest || !stillOwner(memberId)) return
    if (!response.data?.success) throw new Error('logs')
    const data = response.data.result || {}, pageData = data.experienceLogs || {}, rows = pageData.records || []
    experience.value = data.experience || 0; gradeName.value = data.grade?.gradeName || ''; summaryLoaded.value = true
    const previous = refresh ? [] : records.value
    const ids = new Set(previous.map(item => String(item.id)))
    records.value = previous.concat(rows.filter(item => !ids.has(String(item.id))))
    hasMore.value = pageData.total != null ? page * pageSize < Number(pageData.total) : rows.length === pageSize
    nextPage = page + 1; retryReset = false
  } catch { if (id === logRequest && stillOwner(memberId)) logError.value = true }
  finally { if (id === logRequest) logsLoading.value = false }
}
function retryLogs() { if (!logsLoading.value) loadLogs(retryReset) }
async function refresh() {
  const memberId = String(isLogin()?.id || '')
  if (!memberId) { reset(); uni.stopPullDownRefresh(); navigateToLogin(); return }
  if (ownerId !== memberId) { reset(); ownerId = memberId }
  await Promise.all([loadTasks(), loadLogs(true)])
  uni.stopPullDownRefresh()
}
onLoad(options => { activeTab.value = options?.tab === 'logs' ? 'logs' : 'tasks' })
onShow(refresh)
onPullDownRefresh(refresh)
onReachBottom(() => { if (activeTab.value === 'logs' && !logError.value) loadLogs(false) })
onUnload(() => { taskRequest++; logRequest++ })
</script>

<style scoped lang="scss">
.experience-page { min-height: 100vh; box-sizing: border-box; padding: 24rpx 28rpx calc(36rpx + env(safe-area-inset-bottom)); background: #f5f6f9; color: #292f39; }
.summary-card { background: linear-gradient(115deg, #51443b, #8e7351); border-radius: 24rpx; padding: 32rpx; color: #fff1d8; display: flex; flex-direction: column; align-items: flex-start; }
.summary-label { font-size: 24rpx; opacity: .8; }
.summary-number { font-size: 58rpx; font-weight: 600; line-height: 1.5; }
.summary-grade { margin-top: 4rpx; font-size: 23rpx; opacity: .8; }
.summary-retry { margin-top: 16rpx; font-size: 23rpx; text-decoration: underline; }
.tabs { display: flex; margin: 24rpx 0 32rpx; padding: 8rpx; background: #eceef2; border-radius: 18rpx; }
.tab { flex: 1; padding: 18rpx 0; text-align: center; font-size: 27rpx; color: #858c97; border-radius: 14rpx; }
.tab.active { color: #896337; background: #fff; font-weight: 600; }
.section-heading { display: flex; justify-content: space-between; align-items: center; font-size: 28rpx; font-weight: 600; margin-bottom: 20rpx; }
.section-caption { color: #9ba2ad; font-size: 21rpx; font-weight: 400; }
.task-card { padding: 26rpx; margin-bottom: 20rpx; background: #fff; border-radius: 20rpx; }
.task-title-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 10rpx; }
.task-title { font-size: 29rpx; font-weight: 600; }
.reward { font-size: 25rpx; color: #aa7a3c; }
.task-description { display: block; font-size: 24rpx; color: #89919d; margin-top: 14rpx; line-height: 1.7; }
.task-progress { display: block; font-size: 22rpx; color: #a1a8b2; margin-top: 12rpx; }
.task-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20rpx; padding-top: 18rpx; border-top: 1rpx solid #f2f3f6; }
.task-status { color: #929aa5; font-size: 22rpx; }
.task-button { padding: 0 28rpx; margin: 0; line-height: 58rpx; font-size: 24rpx; border-radius: 32rpx; color: #886135; background: #f5ead8; }
.task-button.finished { background: #f2f3f5; color: #a2a8b0; }
button::after { border: none; }
.state { padding: 80rpx 20rpx; display: flex; flex-direction: column; align-items: center; gap: 20rpx; text-align: center; font-size: 26rpx; color: #949ca8; }
.state-hint { font-size: 23rpx; }
.retry { margin: 0; padding: 0 30rpx; line-height: 64rpx; background: #f4e8d5; color: #927043; font-size: 25rpx; border-radius: 32rpx; }
.rules-note { padding: 24rpx; background: #fff; border-radius: 18rpx; font-size: 24rpx; color: #8b939f; line-height: 1.8; white-space: pre-wrap; overflow-wrap: anywhere; }
.rules-note text { display: block; }
.note-title { color: #737d8b; font-weight: 500; margin-bottom: 8rpx; }
.page-note { display: block; margin-top: 24rpx; color: #a0a7b1; font-size: 22rpx; line-height: 1.8; }
.record-list { background: #fff; padding: 0 26rpx; border-radius: 20rpx; }
.record-row { display: flex; align-items: center; gap: 24rpx; padding: 26rpx 0; border-bottom: 1rpx solid #f0f2f5; }
.record-row:last-child { border-bottom: none; }
.record-content { flex: 1; min-width: 0; }
.record-title { display: block; font-size: 27rpx; line-height: 1.6; overflow-wrap: anywhere; }
.record-time, .record-balance { display: block; margin-top: 8rpx; color: #a0a7b1; font-size: 22rpx; }
.record-change { flex-shrink: 0; color: #b28449; font-size: 34rpx; font-weight: 600; }
.record-change.negative { color: #798694; }
.load-more { padding: 30rpx 0; text-align: center; color: #a0a7b1; font-size: 23rpx; }
</style>
