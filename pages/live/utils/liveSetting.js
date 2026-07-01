import { getLiveSetting } from "@/api/live.js";

let cachedSetting = null;
let fetchingPromise = null;

export async function fetchLiveSetting(force = false) {
  if (!force && cachedSetting) return cachedSetting;
  if (!force && fetchingPromise) return fetchingPromise;

  fetchingPromise = (async () => {
    try {
      const res = await getLiveSetting();
      if (res.data?.success && res.data?.result) {
        cachedSetting = res.data.result;
        return cachedSetting;
      }
      console.warn("获取直播配置失败", res.data);
      return null;
    } catch (error) {
      console.error("获取直播配置异常:", error);
      return null;
    } finally {
      fetchingPromise = null;
    }
  })();

  return fetchingPromise;
}

export function resolveSdkAppId(setting) {
  if (!setting?.imSdkAppid) return 0;
  const id = Number(setting.imSdkAppid);
  return Number.isNaN(id) ? 0 : id;
}
