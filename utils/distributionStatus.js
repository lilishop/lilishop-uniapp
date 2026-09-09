/**
 * 分销员资格状态（与后端 DistributionStatusEnum 对齐）。
 *
 * 入口按 distributionStatus 分支；能力页只有 PASS 才渲染业务。
 * 有返回 ≠ 有效分销员。
 * 
 * @author Mike
 * @date 2026-09-09
 */

import { distribution } from '@/api/distribution'

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
    goRecruitJoin()
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
