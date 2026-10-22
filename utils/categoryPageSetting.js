export const DEFAULT_CATEGORY_PAGE_SETTING = {
  template: 1,
  showFields: {
    subTitle: true,
    spec: true,
    tags: true,
    selfTag: true,
    price: true,
    linePrice: false,
    sales: true,
    cart: true,
  },
};

const STORAGE_KEY = "category_page_setting";
const EXPIRATION_KEY = "category_page_setting_expiration_time";

function fallback() {
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORY_PAGE_SETTING));
}

/** 对已解析的配置对象做字段级清洗(缺键补默认、非法值回退)。 */
function sanitize(raw) {
  if (!raw || typeof raw !== "object") return fallback();
  const result = fallback();
  if ([1, 2, 3, 4].includes(raw.template)) {
    result.template = raw.template;
  }
  if (raw.showFields && typeof raw.showFields === "object") {
    for (const key of Object.keys(result.showFields)) {
      if (typeof raw.showFields[key] === "boolean") {
        result.showFields[key] = raw.showFields[key];
      }
    }
  }
  return result;
}

/**
 * 归一化分类页设置。入参为 buyer 接口 result(Setting 实体或 null),
 * null / 解析失败 / 缺键 / template 非 1-4 一律回退默认值。
 */
export function normalizeCategoryPageSetting(setting = null) {
  if (!setting || !setting.settingValue) return fallback();
  try {
    return sanitize(JSON.parse(setting.settingValue));
  } catch {
    return fallback();
  }
}

export function cacheCategoryPageSetting(data) {
  const expirationTime = new Date().setHours(new Date().getHours() + 1);
  uni.setStorageSync(EXPIRATION_KEY, expirationTime);
  uni.setStorageSync(STORAGE_KEY, data);
}

export function loadCachedCategoryPageSetting() {
  const expirationTime = uni.getStorageSync(EXPIRATION_KEY);
  const cacheValid =
    expirationTime && new Date() <= new Date(Number(expirationTime));
  if (!cacheValid) return null;
  try {
    const cached = uni.getStorageSync(STORAGE_KEY);
    // 缓存可能被篡改/来自旧版本,读出后同样过清洗
    return cached ? sanitize(cached) : null;
  } catch {
    return null;
  }
}
