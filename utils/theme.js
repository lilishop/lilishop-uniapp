import config from "@/config/config";

export const DEFAULT_THEME = {
  mainColor: config.mainColor,
  lightColor: config.lightColor,
  aiderLightColor: config.aiderLightColor,
};

const STORAGE_KEY = "theme_setting";
const EXPIRATION_KEY = "theme_setting_expiration_time";

export function normalizeTheme(data = {}) {
  return {
    mainColor: data.themeColor || DEFAULT_THEME.mainColor,
    lightColor: data.lightColor || DEFAULT_THEME.lightColor,
    aiderLightColor: data.aiderLightColor || DEFAULT_THEME.aiderLightColor,
  };
}

export function cacheTheme(theme) {
  const expirationTime = new Date().setHours(new Date().getHours() + 1);
  uni.setStorageSync(EXPIRATION_KEY, expirationTime);
  uni.setStorageSync(STORAGE_KEY, theme);
}

export function loadCachedTheme() {
  const expirationTime = uni.getStorageSync(EXPIRATION_KEY);
  const cacheValid =
    expirationTime && new Date() <= new Date(Number(expirationTime));
  if (!cacheValid) return null;
  try {
    return uni.getStorageSync(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function applyTabBarStyle(mainColor) {
  if (!mainColor) return;
  try {
    uni.setTabBarStyle({
      selectedColor: mainColor,
    });
  } catch (e) {
    // 非 tabBar 页面可能报错，忽略
  }
}

function hexToRgba(hex, alpha) {
  if (!hex) return `rgba(255, 60, 42, ${alpha})`;
  const normalized = String(hex).replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (full.length !== 6) return `rgba(255, 60, 42, ${alpha})`;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getThemeStyle(theme) {
  const primary = theme.mainColor || DEFAULT_THEME.mainColor;
  return {
    "--theme-primary": primary,
    "--theme-light": theme.lightColor || DEFAULT_THEME.lightColor,
    "--theme-aider": theme.aiderLightColor || DEFAULT_THEME.aiderLightColor,
    "--theme-primary-10": hexToRgba(primary, 0.1),
    "--theme-primary-20": hexToRgba(primary, 0.2),
    "--theme-primary-30": hexToRgba(primary, 0.3),
    "--theme-primary-70": hexToRgba(primary, 0.7),
  };
}
