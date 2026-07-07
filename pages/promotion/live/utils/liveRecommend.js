/**
 * 直播 MQTT 推荐消息解析（商品 / 优惠券）
 */

export function toBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

export function parseRecommendMessageArray(message) {
  try {
    const parsed = JSON.parse(message);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("MQTT 消息解析失败:", error);
    return [];
  }
}

export function findRecommendPayload(list) {
  return list.find((item) => toBoolean(item.recommend) && !toBoolean(item.hideFlag));
}
