export function getWechatAddressErrorType(error) {
  const message = String(error?.errMsg || error?.message || '')
  if (/cancel/i.test(message)) return 'cancel'
  if (/requiredPrivateInfos/i.test(message)) return 'configuration'
  if (/privacy|隐私/i.test(message)) return 'privacy'
  if (/auth deny|auth denied|authorize no response|auth reject/i.test(message)) return 'auth'
  if (/not support|not supported|not available|not a function/i.test(message)) return 'unsupported'
  return 'unknown'
}

// Match each name under its parent; never guess an ID from a similarly named region.
export async function resolveWechatRegion(address, fetchRegions) {
  const names = [address.provinceName, address.cityName, address.countyName, address.streetName]
  const selected = []
  let parentId = 0
  for (let level = 0; level < 4; level++) {
    const response = await fetchRegions(parentId)
    if (!response?.data?.success || !Array.isArray(response.data.result)) {
      throw new Error('地区加载失败')
    }
    const children = response.data.result
    if (!children.length) return selected.length >= 3 ? selected : null
    const name = String(names[level] || '').trim()
    if (!name) return null
    const matches = children.filter(item => String(item.name || item.localName || '').trim() === name)
    if (matches.length !== 1 || !matches[0].id) return null
    selected.push(matches[0])
    parentId = matches[0].id
  }
  return selected
}
