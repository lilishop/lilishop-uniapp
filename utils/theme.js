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

const TAB_BAR_ROUTES = [
  "pages/tabbar/home/index",
  "pages/tabbar/category/category",
  "pages/tabbar/cart/cartList",
  "pages/tabbar/user/my",
];

function normalizeRoute(route = "") {
  return String(route).replace(/^\//, "").split("?")[0];
}

function currentRoute() {
  const pages = typeof getCurrentPages === "function" ? getCurrentPages() : [];
  const page = pages[pages.length - 1];
  return (page && page.route) || "";
}

export function isTabBarRoute(route) {
  return TAB_BAR_ROUTES.includes(normalizeRoute(route || currentRoute()));
}

export function applyTabBarStyle(mainColor, route) {
  if (!mainColor || !isTabBarRoute(route)) return;
  const task = uni.setTabBarStyle({
    selectedColor: mainColor,
    fail() {},
  });
  if (task && typeof task.catch === "function") {
    task.catch(() => {});
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

export function getThemeStyle(theme = DEFAULT_THEME) {
  const safeTheme = theme || DEFAULT_THEME;
  const primary = safeTheme.mainColor || DEFAULT_THEME.mainColor;
  const light = safeTheme.lightColor || DEFAULT_THEME.lightColor;
  const primarySoft = hexToRgba(primary, 0.1);
  return {
    "--theme-primary": primary,
    "--theme-light": light,
    "--theme-aider": safeTheme.aiderLightColor || DEFAULT_THEME.aiderLightColor,
    "--theme-primary-10": primarySoft,
    "--theme-primary-20": hexToRgba(primary, 0.2),
    "--theme-primary-30": hexToRgba(primary, 0.3),
    "--theme-primary-70": hexToRgba(primary, 0.7),
    "--theme-light-10": hexToRgba(light, 0.1),
    "--theme-light-80": hexToRgba(light, 0.8),
    "--u-primary": primary,
    "--up-primary": primary,
    "--u-primary-light": primarySoft,
    "--up-primary-light": primarySoft,
  };
}
