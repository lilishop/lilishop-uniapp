import { getLiveRoomById } from "@/api/live.js";

const cachedSettings = {};
const fetchingPromises = {};

export function seedLiveSetting(liveId, setting) {
  if (liveId && setting) {
    cachedSettings[liveId] = setting;
  }
}

export async function fetchLiveSetting(liveId, force = false) {
  if (!liveId) return null;
  if (!force && cachedSettings[liveId]) return cachedSettings[liveId];
  if (!force && fetchingPromises[liveId]) return fetchingPromises[liveId];

  fetchingPromises[liveId] = (async () => {
    try {
      const res = await getLiveRoomById(liveId);
      if (res.data?.success && res.data?.result) {
        cachedSettings[liveId] = res.data.result;
        return cachedSettings[liveId];
      }
      console.warn("获取直播配置失败", res.data);
      return null;
    } catch (error) {
      console.error("获取直播配置异常:", error);
      return null;
    } finally {
      fetchingPromises[liveId] = null;
    }
  })();

  return fetchingPromises[liveId];
}

export function resolveSdkAppId(setting) {
  if (!setting?.imSdkAppid) return 0;
  const id = Number(setting.imSdkAppid);
  return Number.isNaN(id) ? 0 : id;
}
