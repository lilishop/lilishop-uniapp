/**
 * 分销员资格状态（与后端 DistributionStatusEnum 对齐）。
 *
 * 入口按 distributionStatus 分支；能力页只有 PASS 才渲染业务。
 * 有返回 ≠ 有效分销员。
 * 
 * @author Mike
 * @date 2026-09-09
 */

import { distribution, getRecruitPage } from '@/api/distribution'

export const DISTRIBUTION_STATUS = {
  PASS: 'PASS',
  APPLY: 'APPLY',
  REFUSE: 'REFUSE',
  RETREAT: 'RETREAT',
}

/** 全端统一清退文案 */
export const DISTRIBUTION_RETREAT_MESSAGE = '您的分销资格已被清退。请联系管理员！'

export const DISTRIBUTION_APPLY_MESSAGE = '您的信息正在审核'

export const DISTRIBUTION_NOT_MEMBER_MESSAGE = '您还不是分销员'

/** 线上自助招募入口关闭（22009） */
export const DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE = '暂未开放线上招募'

/** 邀请 token 无效或已失效（22010） */
export const DISTRIBUTION_RECRUIT_INVITE_INVALID_MESSAGE = '邀请无效或已失效'

/** 分销总闸关闭时的前端展示文案（接口码 22000） */
export const DISTRIBUTION_CLOSE_MESSAGE = '分销功能暂未开启'

const DISTRIBUTION_CLOSE_CODE = 22000

const JOIN_PATH = '/pages/mine/distribution/join'
const MINE_TAB = '/pages/tabbar/user/my'
const TOAST_DURATION = 2000

export function getDistributionStatus(distribution) {
  return distribution && distribution.distributionStatus ? distribution.distributionStatus : null
}

/** 能力页：仅在职分销员可看业绩 / 提现 / 等级等 */
export function isActiveDistributor(distribution) {
  return getDistributionStatus(distribution) === DISTRIBUTION_STATUS.PASS
}

function showStatusToast(title) {
  uni.showToast({ title, duration: TOAST_DURATION, icon: 'none' })
}

function leaveCapabilityPage() {
  setTimeout(() => {
    const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
    if (pages.length > 1) {
      uni.navigateBack({ delta: 1 })
    } else {
      uni.switchTab({ url: MINE_TAB })
    }
  }, TOAST_DURATION)
}

function goRecruitJoin() {
  uni.redirectTo({
    url: JOIN_PATH,
    fail: () => {
      uni.navigateTo({ url: JOIN_PATH })
    },
  })
}

/**
 * 关闭判断与后端一致：onlineEntryVisible !== true（含 false / null / 缺字段）。
 */
export function isOnlineEntryVisible(page) {
  return !!(page && page.onlineEntryVisible === true)
}

/**
 * 解析招募页响应，决定自助入口是否可进。
 * 22000 不算 fail-open；其它非 success 或网络失败为 fail-open。
 * @returns {'open'|'entry_closed'|'distribution_closed'|'fail_open'}
 */
export function resolveRecruitPageGate(res) {
  const data = res && res.data ? res.data : res
  if (!data) {
    return 'fail_open'
  }
  if (data.code == DISTRIBUTION_CLOSE_CODE) {
    return 'distribution_closed'
  }
  if (data.success) {
    return isOnlineEntryVisible(data.result) ? 'open' : 'entry_closed'
  }
  return 'fail_open'
}

/**
 * 拉招募页判断自助入口。仅成功且入口关闭时拦截；22000 走总闸；失败 fail-open。
 * @returns {Promise<'open'|'entry_closed'|'distribution_closed'|'fail_open'>}
 */
export function checkSelfRecruitEntry() {
  return getRecruitPage()
    .then((res) => resolveRecruitPageGate(res))
    .catch((err) => resolveRecruitPageGate(err && err.data ? err : null))
}

/**
 * 能力页非 PASS 提示并退出。RETREAT 用统一清退文案；APPLY / REFUSE 与入口一致。
 */
export function leaveInactiveDistributor(member) {
  const status = getDistributionStatus(member)
  if (status === DISTRIBUTION_STATUS.RETREAT) {
    showStatusToast(DISTRIBUTION_RETREAT_MESSAGE)
    leaveCapabilityPage()
    return
  }
  if (status === DISTRIBUTION_STATUS.REFUSE) {
    checkSelfRecruitEntry().then((gate) => {
      if (gate === 'distribution_closed') {
        showStatusToast(DISTRIBUTION_CLOSE_MESSAGE)
        leaveCapabilityPage()
        return
      }
      if (gate === 'entry_closed') {
        showStatusToast(DISTRIBUTION_ONLINE_ENTRY_CLOSED_MESSAGE)
        leaveCapabilityPage()
        return
      }
      goRecruitJoin()
    })
    return
  }
  if (status === DISTRIBUTION_STATUS.APPLY) {
    showStatusToast(DISTRIBUTION_APPLY_MESSAGE)
    leaveCapabilityPage()
    return
  }
  showStatusToast(DISTRIBUTION_NOT_MEMBER_MESSAGE)
  leaveCapabilityPage()
}

/**
 * 能力页守卫：请求 GET /distribution，仅 PASS 返回对象，否则提示并退出。
 * @returns {Promise<object|null>}
 */
export function assertActiveDistributor() {
  return distribution().then((res) => {
    const result = res && res.data ? res.data.result : null
    if (isActiveDistributor(result)) {
      return result
    }
    leaveInactiveDistributor(result)
    return null
  })
}
