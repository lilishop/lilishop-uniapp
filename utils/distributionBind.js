/**
 * 分销海报 / 商品分享扫码绑客（统一入口）
 */
import storage from '@/utils/storage.js'
import store from '@/store'
import { getGoodsDistribution } from '@/api/distribution.js'
import { getMpScene } from '@/api/goods.js'

const PENDING_KEY = 'pending_distribution_id'

/** 本次冷启动内已尝试绑定的分销员 ID，避免重复请求 */
const launchBoundIds = new Set()

let flushing = false

export function clearPendingDistributionId() {
  try {
    uni.removeStorageSync(PENDING_KEY)
  } catch (e) {
    // ignore
  }
}

export function setPendingDistributionId(distributionId) {
  if (!distributionId) return
  try {
    uni.setStorageSync(PENDING_KEY, String(distributionId))
  } catch (e) {
    console.warn('set pending distributionId failed', e)
  }
}

export function getPendingDistributionId() {
  try {
    return uni.getStorageSync(PENDING_KEY) || ''
  } catch (e) {
    return ''
  }
}

export function resetLaunchBindCache() {
  launchBoundIds.clear()
}

/**
 * 解析葵花码 scene：支持 shortLinkId 或明文 bind,{distributionId}
 */
export async function resolveDistributionIdFromScene(scene) {
  if (!scene) return ''
  const raw = decodeURIComponent(String(scene)).trim()
  if (!raw) return ''

  if (raw.startsWith('bind,')) {
    const id = raw.split(',')[1]
    return id ? String(id).trim() : ''
  }

  try {
    const res = await getMpScene(raw)
    const params = res?.data?.success ? String(res.data.result || '').trim() : ''
    if (params.startsWith('bind,')) {
      const id = params.split(',')[1]
      return id ? String(id).trim() : ''
    }
  } catch (error) {
    console.warn('resolve distribution scene failed', error)
  }
  return ''
}

function parseRecruitIdFromParams(params) {
  if (!params) return ''
  const text = String(params).trim()
  if (text.startsWith('recruit_')) {
    const id = text.substring('recruit_'.length)
    return id ? String(id).trim() : ''
  }
  return ''
}

/**
 * 解析图文邀请卡 scene：支持 shortLinkId 或明文 recruit_{distributionId}
 */
export async function resolveRecruitDistributionIdFromScene(scene) {
  if (!scene) return ''
  const raw = decodeURIComponent(String(scene)).trim()
  if (!raw) return ''

  const direct = parseRecruitIdFromParams(raw)
  if (direct) return direct

  try {
    const res = await getMpScene(raw)
    const params = res?.data?.success ? String(res.data.result || '').trim() : ''
    return parseRecruitIdFromParams(params)
  } catch (error) {
    console.warn('resolve recruit scene failed', error)
  }
  return ''
}

const CLEAR_PENDING_CODES = new Set([22000, 22001])

function shouldClearPendingOnFailure(res) {
  const code = res?.data?.code
  if (code != null && CLEAR_PENDING_CODES.has(Number(code))) {
    return true
  }
  const message = String(res?.data?.message || '')
  if (message.includes('分销员不存在') || message.includes('分销功能关闭')) {
    return true
  }
  return false
}

/**
 * 尝试绑定分销员：已登录直接请求；未登录写入 pending
 */
export async function tryBindDistribution(distributionId, options = {}) {
  const id = String(distributionId || '').trim()
  if (!id) return

  const force = options.force === true
  if (!force && launchBoundIds.has(id)) {
    return
  }
  launchBoundIds.add(id)

  if (!storage.getAccessToken()) {
    setPendingDistributionId(id)
    store.state.distributionId = id
    return
  }

  try {
    const res = await getGoodsDistribution(id)
    if (res?.data?.success) {
      clearPendingDistributionId()
      store.state.distributionId = id
      return
    }
    if (shouldClearPendingOnFailure(res)) {
      clearPendingDistributionId()
    }
  } catch (error) {
    console.warn('bind distribution failed', error)
    const res = error?.data ? error : error?.response?.data ? { data: error.response.data } : null
    if (res && shouldClearPendingOnFailure(res)) {
      clearPendingDistributionId()
    }
  }
}

/**
 * 登录成功后补绑 pending
 */
export async function flushPendingBind() {
  if (flushing) return
  const pendingId = getPendingDistributionId()
  if (!pendingId || !storage.getAccessToken()) {
    return
  }
  flushing = true
  try {
    launchBoundIds.delete(pendingId)
    await tryBindDistribution(pendingId, { force: true })
  } finally {
    flushing = false
  }
}

/**
 * App onLaunch：有 scene 则解析绑客；无 scene 清除 pending
 */
export async function handleAppLaunchScene(options) {
  resetLaunchBindCache()

  const scene = options?.query?.scene
  if (!scene) {
    clearPendingDistributionId()
    return
  }

  const distributionId = await resolveDistributionIdFromScene(scene)
  if (!distributionId) {
    return
  }

  await tryBindDistribution(distributionId)
}
